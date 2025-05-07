import { withTransactionForTest } from '../../framework/test-helpers'

import { countLedgers } from '@/lib/services/ledger/count-ledgers'
import { createLedger } from '@/lib/services/ledger/create-ledger'
import { listLedgers } from '@/lib/services/ledger/list-ledgers'

describe('listLedgers', () => {
  it(
    'should handle ledger entries with specific conditions',
    withTransactionForTest([], async (tx) => {
      // Create 5 sales transactions using accounts receivable
      for (let i = 0; i < 5; i++) {
        await createLedger(tx, {
          nendo: '2021',
          date: `202104${String(i + 1).padStart(2, '0')}`, // April 1st to 5th
          ledger_cd: 'A31', // Accounts Receivable
          karikata_value: 5000,
          counter_cd: 'D11', // Sales
          note: '売上',
          checked: '0',
        })
      }

      // Get list of accounts receivable entries
      const arResult = await listLedgers(
        tx,
        {
          fiscal_year: '2021',
          ledger_cd: 'A31', // Accounts Receivable
          month: null,
        },
        {
          page: 1,
          perPage: 10,
        },
      )

      // Verify the number of entries
      expect(arResult.length).toBe(5) // 5 accounts receivable transactions

      // Verify the balance progression (newest to oldest)
      expect(arResult[0].acc).toBe(5000 * 5) // 25,000 yen (all 5 transactions)
      expect(arResult[1].acc).toBe(5000 * 4) // 20,000 yen (4 transactions)
      expect(arResult[2].acc).toBe(5000 * 3) // 15,000 yen (3 transactions)
      expect(arResult[3].acc).toBe(5000 * 2) // 10,000 yen (2 transactions)
      expect(arResult[4].acc).toBe(5000 * 1) // 5,000 yen (1 transaction)
    }),
  )

  it(
    'should correctly handle ledger entries, balances, and pagination',
    withTransactionForTest([], async (tx) => {
      // Create sales and accounts receivable entries on the 25th of each month in 2021
      // prettier-ignore
      const months = ['04', '05', '06', '07', '08', '09', '10', '11', '12', '01', '02', '03']
      // prettier-ignore
      const years = ['2021', '2021', '2021', '2021', '2021', '2021', '2021', '2021', '2021', '2022', '2022', '2022']

      for (let i = 0; i < months.length; i++) {
        // Create sales and accounts receivable entry
        await createLedger(tx, {
          nendo: '2021',
          date: `${years[i]}${months[i]}05`,
          ledger_cd: 'A31', // Accounts Receivable
          karikata_value: 500000,
          counter_cd: 'D11', // Sales
          note: '売上',
          checked: '0',
        })

        // Leave March's accounts receivable unpaid
        if (i < months.length - 1) {
          // Transfer accounts receivable to cash on the 5th of the next month
          const nextMonth = i + 1
          await createLedger(tx, {
            nendo: '2021',
            date: `${years[nextMonth]}${months[nextMonth]}25`,
            ledger_cd: 'A11', // Cash
            karikata_value: 500000,
            counter_cd: 'A31', // Accounts Receivable
            note: '売掛金入金',
            checked: '0',
          })
        }
      }

      // Purchase supplies with cash on June 1st (3 items)
      for (let i = 0; i < 3; i++) {
        await createLedger(tx, {
          nendo: '2021',
          date: '20210601',
          ledger_cd: 'E61', // Supplies Expense
          karikata_value: 5000,
          counter_cd: 'A11', // Cash
          note: '消耗品購入',
          checked: '0',
        })
      }

      // Verify sales total (Page 1)
      const salesResult = await listLedgers(
        tx,
        {
          fiscal_year: '2021',
          ledger_cd: 'D11', // Sales
          month: null,
        },
        {
          page: 1,
          perPage: 10,
        },
      )
      expect(salesResult[0].acc).toBe(500000 * 12) // 500,000 yen × 12 months = 6 million yen
      expect(salesResult.length).toBe(10) // First page has 10 items

      // Verify sales total (Page 2)
      const salesResultPage2 = await listLedgers(
        tx,
        {
          fiscal_year: '2021',
          ledger_cd: 'D11', // Sales
          month: null,
        },
        {
          page: 2,
          perPage: 10,
        },
      )
      expect(salesResultPage2.length).toBe(2) // Second page has 2 items

      // Verify sales count
      const salesCount = await countLedgers(tx, {
        fiscal_year: '2021',
        ledger_cd: 'D11',
        month: null,
      })
      expect(salesCount).toBe(12) // 12 months of sales

      // Verify cash balance
      const cashResult = await listLedgers(
        tx,
        {
          fiscal_year: '2021',
          ledger_cd: 'A11', // Cash
          month: null,
        },
        {
          page: 1,
          perPage: 10,
        },
      )
      expect(cashResult[0].acc).toBe(500000 * 11 - 5000 * 3) // 500,000 yen × 11 months = 5.5 million yen (March unpaid)
      expect(cashResult.length).toBe(10) // First page has 10 items
      // Verify cash count
      const cashCount = await countLedgers(tx, {
        fiscal_year: '2021',
        ledger_cd: 'A11',
        month: null,
      })
      expect(cashCount).toBe(11 + 3) // 11 months of cash receipts (March unpaid)

      // Verify accounts receivable balance
      const arResult = await listLedgers(
        tx,
        {
          fiscal_year: '2021',
          ledger_cd: 'A31', // Accounts Receivable
          month: null,
        },
        {
          page: 1,
          perPage: 10,
        },
      )
      expect(arResult[0].acc).toBe(500000) // Only March's accounts receivable of 500,000 yen remains
      expect(arResult.length).toBe(10) // Only March's accounts receivable
      // Verify accounts receivable count
      const arCount = await countLedgers(tx, {
        fiscal_year: '2021',
        ledger_cd: 'A31',
        month: null,
      })
      expect(arCount).toBe(23) // Only March's accounts receivable

      // Verify supplies expense total
      const suppliesResult = await listLedgers(
        tx,
        {
          fiscal_year: '2021',
          ledger_cd: 'E61', // Supplies Expense
          month: null,
        },
        {
          page: 1,
          perPage: 10,
        },
      )
      expect(suppliesResult[0].acc).toBe(5000 * 3) // 5,000 yen × 3 items = 15,000 yen
      expect(suppliesResult.length).toBe(3) // 3 items of supplies purchased
      // Verify supplies expense count
      const suppliesCount = await countLedgers(tx, {
        fiscal_year: '2021',
        ledger_cd: 'E61',
        month: null,
      })
      expect(suppliesCount).toBe(3) // 3 items of supplies purchased

      // Verify cash transactions in June
      const juneCashResult = await listLedgers(
        tx,
        {
          fiscal_year: '2021',
          ledger_cd: 'A11', // Cash
          month: '06', // Search only June
        },
        {
          page: 1,
          perPage: 10,
        },
      )
      expect(juneCashResult.length).toBe(4) // 4 cash transactions in June (supplies purchases)
      // Verify cash transaction count in June
      const juneCashCount = await countLedgers(tx, {
        fiscal_year: '2021',
        ledger_cd: 'A11',
        month: '06',
      })
      expect(juneCashCount).toBe(4) // 4 cash transactions in June (supplies purchases)
    }),
  )
})
