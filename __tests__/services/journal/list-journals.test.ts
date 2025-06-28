import { withTransactionForTest } from '../../framework/test-helpers'

import {
  listJournals,
  ACCOUNT_SIDE,
  AMOUNT_CONDITION,
  CHECKED_STATUS,
  JournalListRequest,
} from '@/lib/backend/services/journal/list-journals'

describe('listJournals', () => {
  it(
    'should list all journals with basic conditions',
    withTransactionForTest(['list-journals'], async (tx) => {
      // 基本的な条件で仕訳一覧を取得
      const request: JournalListRequest = {
        fiscal_year: '2024',
        account: null,
        month: null,
        accountSide: null,
        note: null,
        amount: null,
        amountCondition: null,
        checked: null,
      }

      const result = await listJournals(tx, request, {
        pageNo: 1,
        pageSize: 10,
      })

      // 2024年度の仕訳が9件取得される
      expect(result.length).toBe(9)
      
      // 日付降順でソートされている
      expect(result[0].date).toBe('20240702')
      expect(result[1].date).toBe('20240701')
      expect(result[8].date).toBe('20240401')
    }),
  )

  it(
    'should filter by month',
    withTransactionForTest(['list-journals'], async (tx) => {
      // 4月の仕訳のみを取得
      const request: JournalListRequest = {
        fiscal_year: '2024',
        account: null,
        month: '04',
        accountSide: null,
        note: null,
        amount: null,
        amountCondition: null,
        checked: null,
      }

      const result = await listJournals(tx, request, {
        pageNo: 1,
        pageSize: 10,
      })

      // 4月の仕訳が3件取得される
      expect(result.length).toBe(3)
      expect(result.every(item => item.date.substring(4, 6) === '04')).toBe(true)
    }),
  )

  it(
    'should filter by account',
    withTransactionForTest(['list-journals'], async (tx) => {
      // A11（現金）の仕訳のみを取得
      const request: JournalListRequest = {
        fiscal_year: '2024',
        account: 'A11',
        month: null,
        accountSide: null,
        note: null,
        amount: null,
        amountCondition: null,
        checked: null,
      }

      const result = await listJournals(tx, request, {
        pageNo: 1,
        pageSize: 10,
      })

      // A11が借方または貸方に入っている仕訳が取得される
      expect(result.length).toBe(8)
      expect(result.every(item => 
        item.karikata_cd === 'A11' || item.kasikata_cd === 'A11'
      )).toBe(true)
    }),
  )

  it(
    'should filter by account side',
    withTransactionForTest(['list-journals'], async (tx) => {
      // A11の借方のみを取得
      const request: JournalListRequest = {
        fiscal_year: '2024',
        account: 'A11',
        month: null,
        accountSide: ACCOUNT_SIDE.KARIKATA,
        note: null,
        amount: null,
        amountCondition: null,
        checked: null,
      }

      const result = await listJournals(tx, request, {
        pageNo: 1,
        pageSize: 10,
      })

      // A11が借方に入っている仕訳のみ取得される
      expect(result.length).toBe(4)
      expect(result.every(item => item.karikata_cd === 'A11')).toBe(true)
    }),
  )

  it(
    'should filter by checked status',
    withTransactionForTest(['list-journals'], async (tx) => {
      // 確認済みの仕訳のみを取得
      const request: JournalListRequest = {
        fiscal_year: '2024',
        account: null,
        month: null,
        accountSide: null,
        note: null,
        amount: null,
        amountCondition: null,
        checked: CHECKED_STATUS.CHECKED,
      }

      const result = await listJournals(tx, request, {
        pageNo: 1,
        pageSize: 10,
      })

      // 確認済み（checked='1'）の仕訳のみ取得される
      expect(result.length).toBe(6)
      expect(result.every(item => item.checked === CHECKED_STATUS.CHECKED)).toBe(true)
    }),
  )

  it(
    'should filter by note',
    withTransactionForTest(['list-journals'], async (tx) => {
      // 摘要に「経費」が含まれる仕訳を取得
      const request: JournalListRequest = {
        fiscal_year: '2024',
        account: null,
        month: null,
        accountSide: null,
        note: '経費',
        amount: null,
        amountCondition: null,
        checked: null,
      }

      const result = await listJournals(tx, request, {
        pageNo: 1,
        pageSize: 10,
      })

      // 摘要に「経費」が含まれる仕訳が取得される
      expect(result.length).toBe(4)
      expect(result.every(item => item.note?.includes('経費'))).toBe(true)
    }),
  )

  it(
    'should filter by amount condition',
    withTransactionForTest(['list-journals'], async (tx) => {
      // 金額が100000以上の仕訳を取得
      const request: JournalListRequest = {
        fiscal_year: '2024',
        account: null,
        month: null,
        accountSide: null,
        note: null,
        amount: '100000',
        amountCondition: AMOUNT_CONDITION.GTE,
        checked: null,
      }

      const result = await listJournals(tx, request, {
        pageNo: 1,
        pageSize: 10,
      })

      // 金額が100000以上の仕訳が取得される
      expect(result.length).toBe(3)
      expect(result.every(item => 
        item.karikata_value >= 100000 || item.kasikata_value >= 100000
      )).toBe(true)
    }),
  )

  it(
    'should handle pagination',
    withTransactionForTest(['list-journals'], async (tx) => {
      // ページングテスト
      const request: JournalListRequest = {
        fiscal_year: '2024',
        account: null,
        month: null,
        accountSide: null,
        note: null,
        amount: null,
        amountCondition: null,
        checked: null,
      }

      // 1ページ目（3件ずつ）
      const page1 = await listJournals(tx, request, {
        pageNo: 1,
        pageSize: 3,
      })

      // 2ページ目
      const page2 = await listJournals(tx, request, {
        pageNo: 2,
        pageSize: 3,
      })

      expect(page1.length).toBe(3)
      expect(page2.length).toBe(3)
      
      // 異なるレコードが取得される
      expect(page1[0].id).not.toBe(page2[0].id)
    }),
  )

  it(
    'should return empty array for different fiscal year',
    withTransactionForTest(['list-journals'], async (tx) => {
      // 存在しない年度で検索
      const request: JournalListRequest = {
        fiscal_year: '2025',
        account: null,
        month: null,
        accountSide: null,
        note: null,
        amount: null,
        amountCondition: null,
        checked: null,
      }

      const result = await listJournals(tx, request, {
        pageNo: 1,
        pageSize: 10,
      })

      expect(result.length).toBe(0)
    }),
  )
})