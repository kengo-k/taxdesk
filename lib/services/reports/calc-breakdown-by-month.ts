import {
  KAMOKU_BUNRUI_TYPE,
  KamokuBunruiType,
} from '@/lib/constants/kamoku-bunrui'
import { Connection } from '@/lib/types'

export interface BreakdownByMonthRequest {
  fiscalYear: string
  kamokuBunruiCd: string
  kamokuBunruiType: KamokuBunruiType
}

export interface BreakdownByMonthResponse {
  saimoku_cd: string
  month: string
  value: number
  saimoku_full_name: string
  saimoku_ryaku_name: string
}

export async function calcBreakdownByMonth(
  conn: Connection,
  input: BreakdownByMonthRequest,
): Promise<BreakdownByMonthResponse[]> {
  // 借方の集計を取得
  const karikata = await conn.$queryRaw<BreakdownByMonthResponse[]>`
    select j.karikata_cd as saimoku_cd,
          substring(j.date, 5, 2) as month,
          sum(karikata_value) as value,
          max(kari_sm.saimoku_full_name) as saimoku_full_name,
          max(kari_sm.saimoku_ryaku_name) as saimoku_ryaku_name
    from journals j
            join saimoku_masters kari_sm on kari_sm.saimoku_cd = j.karikata_cd
            join kamoku_masters kari_km on kari_km.kamoku_cd = kari_sm.kamoku_cd
            join kamoku_bunrui_masters kari_kbm on kari_kbm.kamoku_bunrui_cd = kari_km.kamoku_bunrui_cd
    where j.nendo = ${input.fiscalYear}
      and j.deleted = '0'
      and kari_kbm.kamoku_bunrui_cd = ${input.kamokuBunruiCd}
    group by j.karikata_cd,
            substring(j.date, 5, 2)
    order by j.karikata_cd, month`

  // 貸方の集計を取得
  const kasikata = await conn.$queryRaw<BreakdownByMonthResponse[]>`
    select j.kasikata_cd as saimoku_cd,
          substring(j.date, 5, 2) as month,
          sum(kasikata_value) as value,
          max(kasi_sm.saimoku_full_name) as saimoku_full_name,
          max(kasi_sm.saimoku_ryaku_name) as saimoku_ryaku_name
    from journals j
            join saimoku_masters kasi_sm on kasi_sm.saimoku_cd = j.kasikata_cd
            join kamoku_masters kasi_km on kasi_km.kamoku_cd = kasi_sm.kamoku_cd
            join kamoku_bunrui_masters kasi_kbm on kasi_kbm.kamoku_bunrui_cd = kasi_km.kamoku_bunrui_cd
    where j.nendo = ${input.fiscalYear}
      and j.deleted = '0'
      and kasi_kbm.kamoku_bunrui_cd = ${input.kamokuBunruiCd}
    group by j.kasikata_cd,
            substring(j.date, 5, 2)
    order by j.kasikata_cd, month`

  // 全ての月（1-12）を生成
  const allMonths = Array.from({ length: 12 }, (_, i) =>
    String(i + 1).padStart(2, '0'),
  )

  // 借方と貸方の結果をマージ
  const mergedResults = new Map<string, Map<string, number>>()

  // 借方の結果を処理
  karikata.forEach((item) => {
    if (!mergedResults.has(item.saimoku_cd)) {
      mergedResults.set(item.saimoku_cd, new Map())
    }
    const monthMap = mergedResults.get(item.saimoku_cd)!
    monthMap.set(
      item.month,
      (monthMap.get(item.month) || 0) + Number(item.value),
    )
  })

  // 貸方の結果を処理
  kasikata.forEach((item) => {
    if (!mergedResults.has(item.saimoku_cd)) {
      mergedResults.set(item.saimoku_cd, new Map())
    }
    const monthMap = mergedResults.get(item.saimoku_cd)!
    const currentValue = monthMap.get(item.month) || 0
    const kasikataValue = Number(item.value)

    // 科目分類に応じて計算方法を切り替え
    switch (input.kamokuBunruiType) {
      case KAMOKU_BUNRUI_TYPE.LEFT:
        monthMap.set(item.month, currentValue - kasikataValue)
        break
      case KAMOKU_BUNRUI_TYPE.RIGHT:
        monthMap.set(item.month, kasikataValue - currentValue)
        break
      default:
        throw new Error(`Invalid kamoku bunrui type: ${input.kamokuBunruiType}`)
    }
  })

  // 最終的な結果を生成
  const result: BreakdownByMonthResponse[] = []

  // 全ての細目コードと月の組み合わせを生成
  mergedResults.forEach((monthMap, saimoku_cd) => {
    // 細目マスタから名称を取得
    const saimokuInfo =
      karikata.find((k) => k.saimoku_cd === saimoku_cd) ||
      kasikata.find((k) => k.saimoku_cd === saimoku_cd)

    allMonths.forEach((month) => {
      result.push({
        saimoku_cd,
        month,
        value: monthMap.get(month) || 0,
        saimoku_full_name: saimokuInfo?.saimoku_full_name || '',
        saimoku_ryaku_name: saimokuInfo?.saimoku_ryaku_name || '',
      })
    })
  })

  // 細目コードと月でソート
  return result.sort((a, b) => {
    if (a.saimoku_cd !== b.saimoku_cd) {
      return a.saimoku_cd.localeCompare(b.saimoku_cd)
    }
    return a.month.localeCompare(b.month)
  })
}
