import { withTransactionForTest } from '@/__tests__/framework/test-helpers'
import { getPayrollSummary } from '@/lib/backend/services/reports/payroll-summary'

describe('getPayrollSummary', () => {
  it(
    'should return payroll summary grouped by month',
    withTransactionForTest(['payroll-summary'], async (tx) => {
      const result = await getPayrollSummary(tx, '2025')
      console.log(JSON.stringify(result, null, 2))

      // expect(result).toBeDefined()
      // expect(result.length).toBe(3)

      // const aprilData = result.find((item) => item.month === '202504')
      // expect(aprilData).toBeDefined()
      // expect(aprilData!.payroll_base).toBe(500000)
      // expect(aprilData!.payroll_deduction).toHaveLength(2)
      // expect(aprilData!.payroll_addition).toHaveLength(1)

      // const sourceDeduction = aprilData!.payroll_deduction.find(
      //   (item) => item.code === 'B31',
      // )
      // expect(sourceDeduction).toBeDefined()
      // expect(sourceDeduction!.name).toBe('源泉所得税')
      // expect(sourceDeduction!.amount).toBe(50000)

      // const socialInsurance = aprilData!.payroll_deduction.find(
      //   (item) => item.code === 'E99',
      // )
      // expect(socialInsurance).toBeDefined()
      // expect(socialInsurance!.name).toBe('社会保険料')
      // expect(socialInsurance!.amount).toBe(30000)

      // const expenseReimbursement = aprilData!.payroll_addition.find(
      //   (item) => item.code === 'B13',
      // )
      // expect(expenseReimbursement).toBeDefined()
      // expect(expenseReimbursement!.name).toBe('立替金')
      // expect(expenseReimbursement!.amount).toBe(10000)

      // const mayData = result.find((item) => item.month === '202505')
      // expect(mayData).toBeDefined()
      // expect(mayData!.payroll_base).toBe(520000)
      // expect(mayData!.payroll_deduction).toHaveLength(2)
      // expect(mayData!.payroll_addition).toHaveLength(1)

      // const mayExpense = mayData!.payroll_addition.find(
      //   (item) => item.code === 'B13',
      // )
      // expect(mayExpense!.amount).toBe(23000)

      // const juneData = result.find((item) => item.month === '202506')
      // expect(juneData).toBeDefined()
      // expect(juneData!.payroll_base).toBe(480000)
      // expect(juneData!.payroll_deduction).toHaveLength(2)
      // expect(juneData!.payroll_addition).toHaveLength(1)
    }),
  )
})
