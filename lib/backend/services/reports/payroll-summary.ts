import { Connection } from '@/lib/types'

interface PayrollItem {
  code: string
  name: string
  amount: number
}

interface PayrollSummary {
  month: string
  payroll_base: number
  payroll_deduction: PayrollItem[]
  payroll_addition: PayrollItem[]
  net_payment: number
}

interface PayrollDetailRow {
  date: string
  karikata_cd: string
  kasikata_cd: string
  kari_custom_fields: string
  kasi_custom_fields: string
  amount: number
  payroll_type: string
  kari_saimoku_name: string
  kasi_saimoku_name: string
}

export async function getPayrollSummary(
  conn: Connection,
  fiscalYear: string,
): Promise<PayrollSummary[]> {
  const payrollData = await conn.$queryRaw<PayrollDetailRow[]>`
    select j.date,
           j.karikata_cd,
           j.kasikata_cd,
           kari_s.saimoku_full_name as kari_saimoku_name,
           kasi_s.saimoku_full_name as kasi_saimoku_name,
           kari_s.custom_fields::text as kari_custom_fields,
           kasi_s.custom_fields::text as kasi_custom_fields,
           j.karikata_value as amount,
           kasi_s.custom_fields ->> 'category' as payroll_type
    from journals j
             join saimoku_masters kari_s on j.karikata_cd = kari_s.saimoku_cd
             join saimoku_masters kasi_s on j.kasikata_cd = kasi_s.saimoku_cd
    where j.nendo = ${fiscalYear}
      and kasi_s.custom_fields ->> 'category' = 'payroll_base'
    union all
    select j.date,
           j.karikata_cd,
           j.kasikata_cd,
           kari_s.saimoku_full_name as kari_saimoku_name,
           kasi_s.saimoku_full_name as kasi_saimoku_name,
           kari_s.custom_fields::text as kari_custom_fields,
           kasi_s.custom_fields::text as kasi_custom_fields,
           j.karikata_value as amount,
           kasi_s.custom_fields ->> 'category' as payroll_type
    from journals j
             join saimoku_masters kari_s on j.karikata_cd = kari_s.saimoku_cd
             join saimoku_masters kasi_s on j.kasikata_cd = kasi_s.saimoku_cd
    where j.nendo = ${fiscalYear}
      and kasi_s.custom_fields ->> 'category' = 'payroll_deduction'
    union all
    select j.date,
           j.karikata_cd,
           j.kasikata_cd,
           kari_s.saimoku_full_name as kari_saimoku_name,
           kasi_s.saimoku_full_name as kasi_saimoku_name,
           kari_s.custom_fields::text as kari_custom_fields,
           kasi_s.custom_fields::text as kasi_custom_fields,
           j.karikata_value as amount,
           kasi_s.custom_fields ->> 'category' as payroll_type
    from journals j
             join saimoku_masters kari_s on j.karikata_cd = kari_s.saimoku_cd
             join saimoku_masters kasi_s on j.kasikata_cd = kasi_s.saimoku_cd
    where j.nendo = ${fiscalYear}
      and kasi_s.custom_fields ->> 'category' = 'payroll_addition'
    order by date`
  console.log(JSON.stringify(payrollData, null, 2))
  const monthlyGroups = new Map<string, PayrollDetailRow[]>()

  for (const row of payrollData) {
    const month = row.date.substring(0, 6)
    if (!monthlyGroups.has(month)) {
      monthlyGroups.set(month, [])
    }
    monthlyGroups.get(month)!.push(row)
  }

  const result: PayrollSummary[] = []

  for (const [month, rows] of monthlyGroups) {
    let payroll_base = 0
    const deductionMap = new Map<string, PayrollItem>()
    const additionMap = new Map<string, PayrollItem>()

    for (const row of rows) {
      const kariCustomFields = JSON.parse(row.kari_custom_fields || '{}')
      const isFiscalCarryover = kariCustomFields.category === 'fiscal_carryover'
      
      if (isFiscalCarryover) {
        continue
      }

      if (row.payroll_type === 'payroll_base') {
        const kariCustomFields = JSON.parse(row.kari_custom_fields || '{}')
        
        // 年末調整の場合（借方がpayroll_deduction、貸方がpayroll_base）
        if (kariCustomFields.category === 'payroll_deduction') {
          // 年末調整還付分として加算項目に分類
          const code = row.kasikata_cd
          const name = `年末調整還付 (${row.kasi_saimoku_name})`
          const amount = Number(row.amount)

          if (additionMap.has(code)) {
            additionMap.get(code)!.amount += amount
          } else {
            additionMap.set(code, { code, name, amount })
          }
        } else {
          // 通常の基本給与
          payroll_base += Number(row.amount)
        }
      } else if (row.payroll_type === 'payroll_deduction') {
        const code = row.kasikata_cd
        const name = row.kasi_saimoku_name
        const amount = Number(row.amount)

        if (deductionMap.has(code)) {
          deductionMap.get(code)!.amount += amount
        } else {
          deductionMap.set(code, { code, name, amount })
        }
      } else if (row.payroll_type === 'payroll_addition') {
        const code = row.kasikata_cd
        const name = row.kasi_saimoku_name
        const amount = Number(row.amount)

        if (additionMap.has(code)) {
          additionMap.get(code)!.amount += amount
        } else {
          additionMap.set(code, { code, name, amount })
        }
      }
    }

    const totalDeduction = Array.from(deductionMap.values()).reduce(
      (sum, item) => sum + item.amount,
      0,
    )
    const totalAddition = Array.from(additionMap.values()).reduce(
      (sum, item) => sum + item.amount,
      0,
    )
    const net_payment = payroll_base - totalDeduction + totalAddition

    result.push({
      month,
      payroll_base,
      payroll_deduction: Array.from(deductionMap.values()),
      payroll_addition: Array.from(additionMap.values()),
      net_payment,
    })
  }

  return result.sort((a, b) => a.month.localeCompare(b.month))
}
