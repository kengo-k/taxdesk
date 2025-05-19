import { Connection } from '@/lib/types'

// 対象内訳レベル
// saimoku: 細目コードレベルで集約する
// kamoku: 科目コードレベルで集約する
// kamoku_bunrui: 科目分類レベルで集約する
type BreakdownLevel = 'saimoku' | 'kamoku' | 'kamoku_bunrui'

// 対象内訳タイプ
// net: 残高
// karikata: 借方のみ
// kasikata: 貸方のみ
type BreakdownType = 'net' | 'karikata' | 'kasikata'

// 時間単位
// month: 月別
// annual: 年合計
type TimeUnit = 'month' | 'annual'

export interface BreakdownRequest {
  // 対象年度
  fiscalYear: string
  // 対象科目分類コード
  kamokuBunruiCd: string
  // 対象細目分類
  breakdownLevel: BreakdownLevel
  // 対象細目分類の種類
  breakdownType: BreakdownType
  // 対象細目分類の時間単位
  timeUnit: TimeUnit
}

export interface MonthlyBreakdown {
  code: string
  name: string
  values: { month: string; value: number }[]
  custom_fields?: Record<string, any>
}

export interface AnnualBreakdown {
  code: string
  name: string
  value: number
  custom_fields?: Record<string, any>
}

export interface BreakdownResponse {
  monthly: { request: BreakdownRequest; response: MonthlyBreakdown[] }[]
  annual: { request: BreakdownRequest; response: AnnualBreakdown[] }[]
}

export interface BreakdownResult {
  code: string
  month?: string
  value: number
  name: string
  custom_fields?: string
}

export async function calculateBreakdown(
  conn: Connection,
  requests: BreakdownRequest[],
): Promise<BreakdownResponse> {
  const response: BreakdownResponse = {
    monthly: [],
    annual: [],
  }

  // リクエストごとの結果を一時的に保存するMap
  const monthlyResults = new Map<
    string,
    { request: BreakdownRequest; response: MonthlyBreakdown[] }
  >()
  const annualResults = new Map<
    string,
    { request: BreakdownRequest; response: AnnualBreakdown[] }
  >()

  for (const request of requests) {
    const kamokuBunrui = await conn.kamoku_bunrui_masters.findFirst({
      where: { kamoku_bunrui_cd: request.kamokuBunruiCd },
    })
    if (!kamokuBunrui) {
      throw new Error(`Kamoku bunrui not found: ${request.kamokuBunruiCd}`)
    }

    const kamokuBunruiType = kamokuBunrui.kamoku_bunrui_type
    const karikata: BreakdownResult[] | null = await getKariaktaBreakdown(
      conn,
      request,
    )
    const kasikata: BreakdownResult[] | null = await getKasikataBreakdown(
      conn,
      request,
    )

    // breakdownTypeに基づいて処理
    if (request.timeUnit === 'month') {
      // 月別データの処理

      // コードごとのデータを集計
      const codeMap = new Map<
        string,
        { code: string; name: string; monthValues: Map<string, number> }
      >()

      // breakdownTypeに基づいてデータを処理
      if (request.breakdownType === 'karikata' && karikata) {
        // 借方データのみを使用
        for (const item of karikata) {
          if (!item.month) continue

          if (!codeMap.has(item.code)) {
            codeMap.set(item.code, {
              code: item.code,
              name: item.name,
              monthValues: new Map<string, number>(),
            })
          }

          const codeData = codeMap.get(item.code)!
          codeData.monthValues.set(item.month, Number(item.value))
        }
      } else if (request.breakdownType === 'kasikata' && kasikata) {
        // 貸方データのみを使用
        for (const item of kasikata) {
          if (!item.month) continue

          if (!codeMap.has(item.code)) {
            codeMap.set(item.code, {
              code: item.code,
              name: item.name,
              monthValues: new Map<string, number>(),
            })
          }

          const codeData = codeMap.get(item.code)!
          codeData.monthValues.set(item.month, Number(item.value))
        }
      } else if (request.breakdownType === 'net') {
        // 残高を計算（kamokuBunruiTypeに基づく）
        const processedCodes = new Set<string>()

        // 借方データの処理
        if (karikata) {
          for (const item of karikata) {
            if (!item.month) continue

            if (!codeMap.has(item.code)) {
              codeMap.set(item.code, {
                code: item.code,
                name: item.name,
                monthValues: new Map<string, number>(),
              })
            }

            const codeData = codeMap.get(item.code)!
            codeData.monthValues.set(item.month, Number(item.value))
            processedCodes.add(item.code)
          }
        }

        // 貸方データの処理
        if (kasikata) {
          for (const item of kasikata) {
            if (!item.month) continue

            let codeData: {
              code: string
              name: string
              monthValues: Map<string, number>
            }

            if (!codeMap.has(item.code)) {
              codeMap.set(item.code, {
                code: item.code,
                name: item.name,
                monthValues: new Map<string, number>(),
              })
              codeData = codeMap.get(item.code)!
            } else {
              codeData = codeMap.get(item.code)!
              processedCodes.add(item.code)
            }

            const currentValue = codeData.monthValues.get(item.month) || 0

            // kamokuBunruiTypeに基づいて残高を計算
            if (kamokuBunruiType === 'L') {
              // L型（借方増加型）の場合: 借方 - 貸方
              codeData.monthValues.set(
                item.month,
                currentValue - Number(item.value),
              )
            } else {
              // R型（貸方増加型）の場合: 貸方 - 借方
              codeData.monthValues.set(
                item.month,
                Number(item.value) - currentValue,
              )
            }
          }
        }
      }

      // リクエストのキーを生成
      const requestKey = JSON.stringify(request)

      // 各コードのデータをMonthlyBreakdown形式に変換
      const monthlyItems: MonthlyBreakdown[] = []
      for (const [_, data] of codeMap) {
        // custom_fieldsを取得
        let custom_fields_str: string | undefined
        if (request.breakdownType === 'karikata' && karikata) {
          const item = karikata.find((item) => item.code === data.code)
          custom_fields_str = item?.custom_fields
        } else if (request.breakdownType === 'kasikata' && kasikata) {
          const item = kasikata.find((item) => item.code === data.code)
          custom_fields_str = item?.custom_fields
        } else if (request.breakdownType === 'net') {
          // netの場合は借方か貸方のどちらかから取得
          const kariItem = karikata?.find((item) => item.code === data.code)
          const kasiItem = kasikata?.find((item) => item.code === data.code)
          custom_fields_str = kariItem?.custom_fields || kasiItem?.custom_fields
        }

        // 文字列からJSONオブジェクトに変換
        let custom_fields: Record<string, any> | undefined
        if (custom_fields_str) {
          try {
            custom_fields = JSON.parse(custom_fields_str)
          } catch (e) {
            console.error(
              `Failed to parse custom_fields: ${custom_fields_str}`,
              e,
            )
          }
        }

        const monthlyItem: MonthlyBreakdown = {
          code: data.code,
          name: data.name,
          values: Array.from(data.monthValues.entries())
            .map(([month, value]) => ({
              month,
              value,
            }))
            .sort((a, b) => a.month.localeCompare(b.month)),
          custom_fields,
        }

        monthlyItems.push(monthlyItem)
      }

      // 結果をMapに保存
      monthlyResults.set(requestKey, {
        request,
        response: monthlyItems,
      })
    } else if (request.timeUnit === 'annual') {
      // 年間データの処理
      const codeMap = new Map<
        string,
        { code: string; name: string; value: number }
      >()

      // breakdownTypeに基づいてデータを処理
      if (request.breakdownType === 'karikata' && karikata) {
        // 借方データのみを使用
        for (const item of karikata) {
          codeMap.set(item.code, {
            code: item.code,
            name: item.name,
            value: Number(item.value),
          })
        }
      } else if (request.breakdownType === 'kasikata' && kasikata) {
        // 貸方データのみを使用
        for (const item of kasikata) {
          codeMap.set(item.code, {
            code: item.code,
            name: item.name,
            value: Number(item.value),
          })
        }
      } else if (request.breakdownType === 'net') {
        // 残高を計算（kamokuBunruiTypeに基づく）
        const processedCodes = new Set<string>()

        // 借方データの処理
        if (karikata) {
          for (const item of karikata) {
            codeMap.set(item.code, {
              code: item.code,
              name: item.name,
              value: Number(item.value),
            })
            processedCodes.add(item.code)
          }
        }

        // 貸方データの処理
        if (kasikata) {
          for (const item of kasikata) {
            let currentValue = 0

            if (codeMap.has(item.code)) {
              currentValue = codeMap.get(item.code)!.value
              processedCodes.add(item.code)
            } else {
              codeMap.set(item.code, {
                code: item.code,
                name: item.name,
                value: 0,
              })
            }

            // kamokuBunruiTypeに基づいて残高を計算
            if (kamokuBunruiType === 'L') {
              // L型（借方増加型）の場合: 借方 - 貸方
              codeMap.get(item.code)!.value = currentValue - Number(item.value)
            } else {
              // R型（貸方増加型）の場合: 貸方 - 借方
              codeMap.get(item.code)!.value = Number(item.value) - currentValue
            }
          }
        }
      }

      // リクエストのキーを生成
      const requestKey = JSON.stringify(request)

      // 各コードのデータをAnnualBreakdown形式に変換
      const annualItems: AnnualBreakdown[] = []
      for (const [_, data] of codeMap) {
        // custom_fieldsを取得
        let custom_fields_str: string | undefined
        if (request.breakdownType === 'karikata' && karikata) {
          const item = karikata.find((item) => item.code === data.code)
          custom_fields_str = item?.custom_fields
        } else if (request.breakdownType === 'kasikata' && kasikata) {
          const item = kasikata.find((item) => item.code === data.code)
          custom_fields_str = item?.custom_fields
        } else if (request.breakdownType === 'net') {
          // netの場合は借方か貸方のどちらかから取得
          const kariItem = karikata?.find((item) => item.code === data.code)
          const kasiItem = kasikata?.find((item) => item.code === data.code)
          custom_fields_str = kariItem?.custom_fields || kasiItem?.custom_fields
        }

        // 文字列からJSONオブジェクトに変換
        let custom_fields: Record<string, any> | undefined
        if (custom_fields_str) {
          try {
            custom_fields = JSON.parse(custom_fields_str)
          } catch (e) {
            console.error(
              `Failed to parse custom_fields: ${custom_fields_str}`,
              e,
            )
          }
        }

        const annualItem: AnnualBreakdown = {
          code: data.code,
          name: data.name,
          value: data.value,
          custom_fields,
        }

        annualItems.push(annualItem)
      }

      // 結果をMapに保存
      annualResults.set(requestKey, {
        request,
        response: annualItems,
      })
    }
  }

  // Mapの値を配列に変換
  response.monthly = Array.from(monthlyResults.values())
  response.annual = Array.from(annualResults.values())

  return response
}

async function getMonthlySaimokuKarikataBreakdown(
  conn: Connection,
  fiscalYear: string,
  kamokuBunruiCd: string,
): Promise<BreakdownResult[]> {
  return await conn.$queryRaw<BreakdownResult[]>`
    select j.karikata_cd as code,
          substring(j.date, 5, 2) as month,
          sum(karikata_value) as value,
          max(kari_sm.saimoku_ryaku_name) as name,
          max(kari_sm.custom_fields::text) as custom_fields
    from journals j
            join saimoku_masters kari_sm on kari_sm.saimoku_cd = j.karikata_cd
            join kamoku_masters kari_km on kari_km.kamoku_cd = kari_sm.kamoku_cd
            join kamoku_bunrui_masters kari_kbm on kari_kbm.kamoku_bunrui_cd = kari_km.kamoku_bunrui_cd
    where j.nendo = ${fiscalYear}
      and j.deleted = '0'
      and kari_kbm.kamoku_bunrui_cd = ${kamokuBunruiCd}
    group by j.karikata_cd,
            substring(j.date, 5, 2)
    order by j.karikata_cd, month`
}

async function getAnnualSaimokuKarikataBreakdown(
  conn: Connection,
  fiscalYear: string,
  kamokuBunruiCd: string,
): Promise<BreakdownResult[]> {
  return await conn.$queryRaw<BreakdownResult[]>`
    select j.karikata_cd as code,
          sum(karikata_value) as value,
          max(kari_sm.saimoku_ryaku_name) as name,
          max(kari_sm.custom_fields::text) as custom_fields
    from journals j
            join saimoku_masters kari_sm on kari_sm.saimoku_cd = j.karikata_cd
            join kamoku_masters kari_km on kari_km.kamoku_cd = kari_sm.kamoku_cd
            join kamoku_bunrui_masters kari_kbm on kari_kbm.kamoku_bunrui_cd = kari_km.kamoku_bunrui_cd
    where j.nendo = ${fiscalYear}
      and j.deleted = '0'
      and kari_kbm.kamoku_bunrui_cd = ${kamokuBunruiCd}
    group by j.karikata_cd
    order by j.karikata_cd`
}

async function getMonthlyKamokuKarikataBreakdown(
  conn: Connection,
  fiscalYear: string,
  kamokuBunruiCd: string,
): Promise<BreakdownResult[]> {
  return await conn.$queryRaw<BreakdownResult[]>`
    select kari_km.kamoku_cd as code,
          substring(j.date, 5, 2) as month,
          sum(karikata_value) as value,
          max(kari_sm.saimoku_ryaku_name) as name,
          max(kari_km.custom_fields::text) as custom_fields
    from journals j
            join saimoku_masters kari_sm on kari_sm.saimoku_cd = j.karikata_cd
            join kamoku_masters kari_km on kari_km.kamoku_cd = kari_sm.kamoku_cd
            join kamoku_bunrui_masters kari_kbm on kari_kbm.kamoku_bunrui_cd = kari_km.kamoku_bunrui_cd
    where j.nendo = ${fiscalYear}
      and j.deleted = '0'
      and kari_kbm.kamoku_bunrui_cd = ${kamokuBunruiCd}
    group by kari_km.kamoku_cd,
            substring(j.date, 5, 2)
    order by kari_km.kamoku_cd, month`
}

async function getAnnualKamokuKarikataBreakdown(
  conn: Connection,
  fiscalYear: string,
  kamokuBunruiCd: string,
): Promise<BreakdownResult[]> {
  return await conn.$queryRaw<BreakdownResult[]>`
    select kari_km.kamoku_cd as code,
          sum(karikata_value) as value,
          max(kari_sm.saimoku_ryaku_name) as name,
          max(kari_km.custom_fields::text) as custom_fields
    from journals j
            join saimoku_masters kari_sm on kari_sm.saimoku_cd = j.karikata_cd
            join kamoku_masters kari_km on kari_km.kamoku_cd = kari_sm.kamoku_cd
            join kamoku_bunrui_masters kari_kbm on kari_kbm.kamoku_bunrui_cd = kari_km.kamoku_bunrui_cd
    where j.nendo = ${fiscalYear}
      and j.deleted = '0'
      and kari_kbm.kamoku_bunrui_cd = ${kamokuBunruiCd}
    group by kari_km.kamoku_cd
    order by kari_km.kamoku_cd`
}

async function getMonthlyKamokuBunruiKarikataBreakdown(
  conn: Connection,
  fiscalYear: string,
  kamokuBunruiCd: string,
): Promise<BreakdownResult[]> {
  return await conn.$queryRaw<BreakdownResult[]>`
    select kari_kbm.kamoku_bunrui_cd as code,
          substring(j.date, 5, 2) as month,
          sum(karikata_value) as value,
          max(kari_kbm.kamoku_bunrui_name) as name
    from journals j
            join saimoku_masters kari_sm on kari_sm.saimoku_cd = j.karikata_cd
            join kamoku_masters kari_km on kari_km.kamoku_cd = kari_sm.kamoku_cd
            join kamoku_bunrui_masters kari_kbm on kari_kbm.kamoku_bunrui_cd = kari_km.kamoku_bunrui_cd
    where j.nendo = ${fiscalYear}
      and j.deleted = '0'
      and kari_kbm.kamoku_bunrui_cd = ${kamokuBunruiCd}
    group by kari_kbm.kamoku_bunrui_cd,
            substring(j.date, 5, 2)
    order by kari_kbm.kamoku_bunrui_cd, month`
}

async function getAnnualKamokuBunruiKarikataBreakdown(
  conn: Connection,
  fiscalYear: string,
  kamokuBunruiCd: string,
): Promise<BreakdownResult[]> {
  return await conn.$queryRaw<BreakdownResult[]>`
    select kari_kbm.kamoku_bunrui_cd as code,
          sum(karikata_value) as value,
          max(kari_kbm.kamoku_bunrui_name) as name
    from journals j
            join saimoku_masters kari_sm on kari_sm.saimoku_cd = j.karikata_cd
            join kamoku_masters kari_km on kari_km.kamoku_cd = kari_sm.kamoku_cd
            join kamoku_bunrui_masters kari_kbm on kari_kbm.kamoku_bunrui_cd = kari_km.kamoku_bunrui_cd
    where j.nendo = ${fiscalYear}
      and j.deleted = '0'
      and kari_kbm.kamoku_bunrui_cd = ${kamokuBunruiCd}
    group by kari_kbm.kamoku_bunrui_cd
    order by kari_kbm.kamoku_bunrui_cd`
}

async function getMonthlySaimokuKasikataBreakdown(
  conn: Connection,
  fiscalYear: string,
  kamokuBunruiCd: string,
): Promise<BreakdownResult[]> {
  return await conn.$queryRaw<BreakdownResult[]>`
    select j.kasikata_cd as code,
          substring(j.date, 5, 2) as month,
          sum(kasikata_value) as value,
          max(kasi_sm.saimoku_ryaku_name) as name,
          max(kasi_sm.custom_fields::text) as custom_fields
    from journals j
            join saimoku_masters kasi_sm on kasi_sm.saimoku_cd = j.kasikata_cd
            join kamoku_masters kasi_km on kasi_km.kamoku_cd = kasi_sm.kamoku_cd
            join kamoku_bunrui_masters kasi_kbm on kasi_kbm.kamoku_bunrui_cd = kasi_km.kamoku_bunrui_cd
    where j.nendo = ${fiscalYear}
      and j.deleted = '0'
      and kasi_kbm.kamoku_bunrui_cd = ${kamokuBunruiCd}
    group by j.kasikata_cd,
            substring(j.date, 5, 2)
    order by j.kasikata_cd, month`
}

async function getAnnualSaimokuKasikataBreakdown(
  conn: Connection,
  fiscalYear: string,
  kamokuBunruiCd: string,
): Promise<BreakdownResult[]> {
  return await conn.$queryRaw<BreakdownResult[]>`
    select j.kasikata_cd as code,
          sum(kasikata_value) as value,
          max(kasi_sm.saimoku_ryaku_name) as name,
          max(kasi_sm.custom_fields::text) as custom_fields
    from journals j
            join saimoku_masters kasi_sm on kasi_sm.saimoku_cd = j.kasikata_cd
            join kamoku_masters kasi_km on kasi_km.kamoku_cd = kasi_sm.kamoku_cd
            join kamoku_bunrui_masters kasi_kbm on kasi_kbm.kamoku_bunrui_cd = kasi_km.kamoku_bunrui_cd
    where j.nendo = ${fiscalYear}
      and j.deleted = '0'
      and kasi_kbm.kamoku_bunrui_cd = ${kamokuBunruiCd}
    group by j.kasikata_cd
    order by j.kasikata_cd`
}

async function getMonthlyKamokuKasikataBreakdown(
  conn: Connection,
  fiscalYear: string,
  kamokuBunruiCd: string,
): Promise<BreakdownResult[]> {
  return await conn.$queryRaw<BreakdownResult[]>`
    select kasi_km.kamoku_cd as code,
          substring(j.date, 5, 2) as month,
          sum(kasikata_value) as value,
          max(kasi_sm.saimoku_ryaku_name) as name,
          max(kasi_km.custom_fields::text) as custom_fields
    from journals j
            join saimoku_masters kasi_sm on kasi_sm.saimoku_cd = j.kasikata_cd
            join kamoku_masters kasi_km on kasi_km.kamoku_cd = kasi_sm.kamoku_cd
            join kamoku_bunrui_masters kasi_kbm on kasi_kbm.kamoku_bunrui_cd = kasi_km.kamoku_bunrui_cd
    where j.nendo = ${fiscalYear}
      and j.deleted = '0'
      and kasi_kbm.kamoku_bunrui_cd = ${kamokuBunruiCd}
    group by kasi_km.kamoku_cd,
            substring(j.date, 5, 2)
    order by kasi_km.kamoku_cd, month`
}

async function getAnnualKamokuKasikataBreakdown(
  conn: Connection,
  fiscalYear: string,
  kamokuBunruiCd: string,
): Promise<BreakdownResult[]> {
  return await conn.$queryRaw<BreakdownResult[]>`
    select kasi_km.kamoku_cd as code,
          sum(kasikata_value) as value,
          max(kasi_sm.saimoku_ryaku_name) as name,
          max(kasi_km.custom_fields::text) as custom_fields
    from journals j
            join saimoku_masters kasi_sm on kasi_sm.saimoku_cd = j.kasikata_cd
            join kamoku_masters kasi_km on kasi_km.kamoku_cd = kasi_sm.kamoku_cd
            join kamoku_bunrui_masters kasi_kbm on kasi_kbm.kamoku_bunrui_cd = kasi_km.kamoku_bunrui_cd
    where j.nendo = ${fiscalYear}
      and j.deleted = '0'
      and kasi_kbm.kamoku_bunrui_cd = ${kamokuBunruiCd}
    group by kasi_km.kamoku_cd
    order by kasi_km.kamoku_cd`
}

async function getMonthlyKamokuBunruiKasikataBreakdown(
  conn: Connection,
  fiscalYear: string,
  kamokuBunruiCd: string,
): Promise<BreakdownResult[]> {
  return await conn.$queryRaw<BreakdownResult[]>`
    select kasi_kbm.kamoku_bunrui_cd as code,
          substring(j.date, 5, 2) as month,
          sum(kasikata_value) as value,
          max(kasi_kbm.kamoku_bunrui_name) as name
    from journals j
            join saimoku_masters kasi_sm on kasi_sm.saimoku_cd = j.kasikata_cd
            join kamoku_masters kasi_km on kasi_km.kamoku_cd = kasi_sm.kamoku_cd
            join kamoku_bunrui_masters kasi_kbm on kasi_kbm.kamoku_bunrui_cd = kasi_km.kamoku_bunrui_cd
    where j.nendo = ${fiscalYear}
      and j.deleted = '0'
      and kasi_kbm.kamoku_bunrui_cd = ${kamokuBunruiCd}
    group by kasi_kbm.kamoku_bunrui_cd,
            substring(j.date, 5, 2)
    order by kasi_kbm.kamoku_bunrui_cd, month`
}

async function getAnnualKamokuBunruiKasikataBreakdown(
  conn: Connection,
  fiscalYear: string,
  kamokuBunruiCd: string,
): Promise<BreakdownResult[]> {
  return await conn.$queryRaw<BreakdownResult[]>`
    select kasi_kbm.kamoku_bunrui_cd as code,
          sum(kasikata_value) as value,
          max(kasi_kbm.kamoku_bunrui_name) as name
    from journals j
            join saimoku_masters kasi_sm on kasi_sm.saimoku_cd = j.kasikata_cd
            join kamoku_masters kasi_km on kasi_km.kamoku_cd = kasi_sm.kamoku_cd
            join kamoku_bunrui_masters kasi_kbm on kasi_kbm.kamoku_bunrui_cd = kasi_km.kamoku_bunrui_cd
    where j.nendo = ${fiscalYear}
      and j.deleted = '0'
      and kasi_kbm.kamoku_bunrui_cd = ${kamokuBunruiCd}
    group by kasi_kbm.kamoku_bunrui_cd
    order by kasi_kbm.kamoku_bunrui_cd`
}

async function getKariaktaBreakdown(
  conn: Connection,
  input: BreakdownRequest,
): Promise<BreakdownResult[] | null> {
  if (input.breakdownType === 'kasikata') {
    return null
  }

  if (input.breakdownLevel === 'saimoku' && input.timeUnit === 'month') {
    return await getMonthlySaimokuKarikataBreakdown(
      conn,
      input.fiscalYear,
      input.kamokuBunruiCd,
    )
  } else if (
    input.breakdownLevel === 'saimoku' &&
    input.timeUnit === 'annual'
  ) {
    return await getAnnualSaimokuKarikataBreakdown(
      conn,
      input.fiscalYear,
      input.kamokuBunruiCd,
    )
  } else if (input.breakdownLevel === 'kamoku' && input.timeUnit === 'month') {
    return await getMonthlyKamokuKarikataBreakdown(
      conn,
      input.fiscalYear,
      input.kamokuBunruiCd,
    )
  } else if (input.breakdownLevel === 'kamoku' && input.timeUnit === 'annual') {
    return await getAnnualKamokuKarikataBreakdown(
      conn,
      input.fiscalYear,
      input.kamokuBunruiCd,
    )
  } else if (
    input.breakdownLevel === 'kamoku_bunrui' &&
    input.timeUnit === 'month'
  ) {
    return await getMonthlyKamokuBunruiKarikataBreakdown(
      conn,
      input.fiscalYear,
      input.kamokuBunruiCd,
    )
  } else if (
    input.breakdownLevel === 'kamoku_bunrui' &&
    input.timeUnit === 'annual'
  ) {
    return await getAnnualKamokuBunruiKarikataBreakdown(
      conn,
      input.fiscalYear,
      input.kamokuBunruiCd,
    )
  } else {
    throw new Error('Invalid breakdown level or time unit')
  }
}

async function getKasikataBreakdown(
  conn: Connection,
  input: BreakdownRequest,
): Promise<BreakdownResult[] | null> {
  if (input.breakdownType === 'karikata') {
    return null
  }

  if (input.breakdownLevel === 'saimoku' && input.timeUnit === 'month') {
    return await getMonthlySaimokuKasikataBreakdown(
      conn,
      input.fiscalYear,
      input.kamokuBunruiCd,
    )
  } else if (
    input.breakdownLevel === 'saimoku' &&
    input.timeUnit === 'annual'
  ) {
    return await getAnnualSaimokuKasikataBreakdown(
      conn,
      input.fiscalYear,
      input.kamokuBunruiCd,
    )
  } else if (input.breakdownLevel === 'kamoku' && input.timeUnit === 'month') {
    return await getMonthlyKamokuKasikataBreakdown(
      conn,
      input.fiscalYear,
      input.kamokuBunruiCd,
    )
  } else if (input.breakdownLevel === 'kamoku' && input.timeUnit === 'annual') {
    return await getAnnualKamokuKasikataBreakdown(
      conn,
      input.fiscalYear,
      input.kamokuBunruiCd,
    )
  } else if (
    input.breakdownLevel === 'kamoku_bunrui' &&
    input.timeUnit === 'month'
  ) {
    return await getMonthlyKamokuBunruiKasikataBreakdown(
      conn,
      input.fiscalYear,
      input.kamokuBunruiCd,
    )
  } else if (
    input.breakdownLevel === 'kamoku_bunrui' &&
    input.timeUnit === 'annual'
  ) {
    return await getAnnualKamokuBunruiKasikataBreakdown(
      conn,
      input.fiscalYear,
      input.kamokuBunruiCd,
    )
  } else {
    throw new Error('Invalid breakdown level or time unit')
  }
}
