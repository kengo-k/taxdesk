import { withTransactionForTest } from '@/__tests__/framework/test-helpers'
import {
  BreakdownRequest,
  calculateBreakdown,
} from '@/lib/services/reports/calculate-breakdown'

describe('calculateBreakdown', () => {
  // 月別データのテスト
  describe('monthly data', () => {
    // 細目レベルのテスト
    it(
      'should calculate monthly saimoku breakdown correctly',
      withTransactionForTest(['calculate-breakdown'], async (tx) => {
        // 借方のみのテスト
        const karikataResult = await calculateBreakdown(tx, [
          {
            fiscalYear: '2024',
            kamokuBunruiCd: 'E',
            breakdownLevel: 'saimoku',
            breakdownType: 'karikata',
            timeUnit: 'month',
          },
        ])

        // 結果が存在することを確認
        expect(karikataResult).toBeDefined()
        expect(karikataResult.monthly.length).toBeGreaterThan(0)
        expect(karikataResult.annual.length).toBe(0) // 月別データのリクエストなので年間データはない

        // 細目E01（役員報酬）の月次データを確認
        const e01Monthly = karikataResult.monthly.find(
          (item) => item.response.code === 'E01',
        )
        expect(e01Monthly).toBeDefined()
        expect(e01Monthly?.response.name).toBe('役員報酬')

        // 月別データの値を確認
        const e01Values = e01Monthly?.response.values || []
        const e01ByMonth = new Map(e01Values.map((v) => [v.month, v.value]))

        expect(Number(e01ByMonth.get('04'))).toBe(50000) // 4月
        expect(Number(e01ByMonth.get('05'))).toBe(60000) // 5月
        expect(Number(e01ByMonth.get('06'))).toBe(55000) // 6月
        expect(Number(e01ByMonth.get('07'))).toBe(52000) // 7月
        expect(e01ByMonth.has('08')).toBe(false) // 8月はデータなし
        expect(Number(e01ByMonth.get('09'))).toBe(58000) // 9月
        expect(e01ByMonth.has('10')).toBe(false) // 10月はデータなし
        expect(Number(e01ByMonth.get('11'))).toBe(65000) // 11月
        expect(e01ByMonth.has('12')).toBe(false) // 12月はデータなし
        expect(Number(e01ByMonth.get('01'))).toBe(70000) // 1月
        expect(e01ByMonth.has('02')).toBe(false) // 2月はデータなし
        expect(Number(e01ByMonth.get('03'))).toBe(75000) // 3月

        // 貸方のみのテスト
        const kasikataResult = await calculateBreakdown(tx, [
          {
            fiscalYear: '2024',
            kamokuBunruiCd: 'D',
            breakdownLevel: 'saimoku',
            breakdownType: 'kasikata',
            timeUnit: 'month',
          },
        ])

        // 結果が存在することを確認
        expect(kasikataResult).toBeDefined()
        expect(kasikataResult.monthly.length).toBeGreaterThan(0)

        // 細目D11（売上）の月次データを確認
        const d11Monthly = kasikataResult.monthly.find(
          (item) => item.response.code === 'D11',
        )
        expect(d11Monthly).toBeDefined()
        expect(d11Monthly?.response.name).toBe('売上')

        // 月別データの値を確認
        const d11Values = d11Monthly?.response.values || []
        const d11ByMonth = new Map(d11Values.map((v) => [v.month, v.value]))

        expect(Number(d11ByMonth.get('04'))).toBe(100000) // 4月
        expect(Number(d11ByMonth.get('05'))).toBe(150000) // 5月
        expect(Number(d11ByMonth.get('06'))).toBe(120000) // 6月
        expect(Number(d11ByMonth.get('07'))).toBe(130000) // 7月
        expect(d11ByMonth.has('08')).toBe(false) // 8月はデータなし
        expect(Number(d11ByMonth.get('09'))).toBe(140000) // 9月
        expect(d11ByMonth.has('10')).toBe(false) // 10月はデータなし
        expect(Number(d11ByMonth.get('11'))).toBe(160000) // 11月
        expect(d11ByMonth.has('12')).toBe(false) // 12月はデータなし
        expect(Number(d11ByMonth.get('01'))).toBe(170000) // 1月
        expect(d11ByMonth.has('02')).toBe(false) // 2月はデータなし
        expect(Number(d11ByMonth.get('03'))).toBe(180000) // 3月

        // 残高のテスト（L型：借方 - 貸方）
        const netLResult = await calculateBreakdown(tx, [
          {
            fiscalYear: '2024',
            kamokuBunruiCd: 'A',
            breakdownLevel: 'saimoku',
            breakdownType: 'net',
            timeUnit: 'month',
          },
        ])

        // 結果が存在することを確認
        expect(netLResult).toBeDefined()
        expect(netLResult.monthly.length).toBeGreaterThan(0)

        // 細目A11（現金）の月次データを確認
        const a11Monthly = netLResult.monthly.find(
          (item) => item.response.code === 'A11',
        )
        expect(a11Monthly).toBeDefined()
        expect(a11Monthly?.response.name).toBe('現金')

        // 月別データの値を確認（L型なので借方 - 貸方）
        const a11Values = a11Monthly?.response.values || []
        const a11ByMonth = new Map(a11Values.map((v) => [v.month, v.value]))

        // 実際の値を確認
        expect(Number(a11ByMonth.get('04'))).not.toBeNaN()
        expect(Number(a11ByMonth.get('05'))).not.toBeNaN()
        expect(Number(a11ByMonth.get('06'))).not.toBeNaN()
        expect(Number(a11ByMonth.get('07'))).not.toBeNaN()
        expect(Number(a11ByMonth.get('08'))).not.toBeNaN()
        expect(Number(a11ByMonth.get('09'))).not.toBeNaN()
        expect(Number(a11ByMonth.get('10'))).not.toBeNaN()
        expect(Number(a11ByMonth.get('11'))).not.toBeNaN()
        expect(Number(a11ByMonth.get('12'))).not.toBeNaN()
        expect(Number(a11ByMonth.get('01'))).not.toBeNaN()
        expect(Number(a11ByMonth.get('02'))).not.toBeNaN()
        expect(Number(a11ByMonth.get('03'))).not.toBeNaN()

        // 残高のテスト（R型：貸方 - 借方）
        const netRResult = await calculateBreakdown(tx, [
          {
            fiscalYear: '2024',
            kamokuBunruiCd: 'D',
            breakdownLevel: 'saimoku',
            breakdownType: 'net',
            timeUnit: 'month',
          },
        ])

        // 結果が存在することを確認
        expect(netRResult).toBeDefined()
        expect(netRResult.monthly.length).toBeGreaterThan(0)

        // 細目D11（売上）の月次データを確認
        const d11NetMonthly = netRResult.monthly.find(
          (item) => item.response.code === 'D11',
        )
        expect(d11NetMonthly).toBeDefined()

        // 月別データの値を確認（R型なので貸方 - 借方）
        const d11NetValues = d11NetMonthly?.response.values || []
        const d11NetByMonth = new Map(
          d11NetValues.map((v) => [v.month, v.value]),
        )

        // 各月の売上は借方がないので、貸方の値がそのまま残高になる
        expect(Number(d11NetByMonth.get('04'))).toBe(100000)
        expect(Number(d11NetByMonth.get('05'))).toBe(150000)
        expect(Number(d11NetByMonth.get('06'))).toBe(120000)
        expect(Number(d11NetByMonth.get('07'))).toBe(130000)
        expect(Number(d11NetByMonth.get('09'))).toBe(140000)
        expect(Number(d11NetByMonth.get('11'))).toBe(160000)
        expect(Number(d11NetByMonth.get('01'))).toBe(170000)
        expect(Number(d11NetByMonth.get('03'))).toBe(180000)
      }),
    )

    // 科目レベルのテスト
    it(
      'should calculate monthly kamoku breakdown correctly',
      withTransactionForTest(['calculate-breakdown'], async (tx) => {
        const result = await calculateBreakdown(tx, [
          {
            fiscalYear: '2024',
            kamokuBunruiCd: 'E',
            breakdownLevel: 'kamoku',
            breakdownType: 'karikata',
            timeUnit: 'month',
          },
        ])

        // 結果が存在することを確認
        expect(result).toBeDefined()
        expect(result.monthly.length).toBeGreaterThan(0)

        // 科目E1（販管費）の月次データを確認
        const e1Monthly = result.monthly.find(
          (item) => item.response.code === 'E1',
        )
        expect(e1Monthly).toBeDefined()

        // 月別データの値を確認（E01とE02の合計）
        const e1Values = e1Monthly?.response.values || []
        const e1ByMonth = new Map(e1Values.map((v) => [v.month, v.value]))

        expect(Number(e1ByMonth.get('04'))).toBe(80000) // 4月: 50000 + 30000
        expect(Number(e1ByMonth.get('05'))).toBe(100000) // 5月: 60000 + 40000
        expect(Number(e1ByMonth.get('06'))).toBe(90000) // 6月: 55000 + 35000
        expect(Number(e1ByMonth.get('07'))).toBe(85000) // 7月: 52000 + 33000
        expect(Number(e1ByMonth.get('09'))).toBe(96000) // 9月: 58000 + 38000
        expect(Number(e1ByMonth.get('11'))).toBe(110000) // 11月: 65000 + 45000
        expect(Number(e1ByMonth.get('01'))).toBe(120000) // 1月: 70000 + 50000
        expect(Number(e1ByMonth.get('03'))).toBe(130000) // 3月: 75000 + 55000
      }),
    )

    // 科目分類レベルのテスト
    it(
      'should calculate monthly kamoku_bunrui breakdown correctly',
      withTransactionForTest(['calculate-breakdown'], async (tx) => {
        const result = await calculateBreakdown(tx, [
          {
            fiscalYear: '2024',
            kamokuBunruiCd: 'E',
            breakdownLevel: 'kamoku_bunrui',
            breakdownType: 'karikata',
            timeUnit: 'month',
          },
        ])

        // 結果が存在することを確認
        expect(result).toBeDefined()
        expect(result.monthly.length).toBeGreaterThan(0)

        // 科目分類E（費用）の月次データを確認
        const eMonthly = result.monthly.find(
          (item) => item.response.code === 'E',
        )
        expect(eMonthly).toBeDefined()

        // 月別データの値を確認（全ての費用科目の合計）
        const eValues = eMonthly?.response.values || []
        const eByMonth = new Map(eValues.map((v) => [v.month, v.value]))

        expect(Number(eByMonth.get('04'))).toBe(80000) // 4月
        expect(Number(eByMonth.get('05'))).toBe(100000) // 5月
        expect(Number(eByMonth.get('06'))).toBe(90000) // 6月
        expect(Number(eByMonth.get('07'))).toBe(85000) // 7月
        expect(Number(eByMonth.get('09'))).toBe(96000) // 9月
        expect(Number(eByMonth.get('11'))).toBe(110000) // 11月
        expect(Number(eByMonth.get('01'))).toBe(120000) // 1月
        expect(Number(eByMonth.get('03'))).toBe(130000) // 3月
      }),
    )
  })

  // 年間データのテスト
  describe('annual data', () => {
    // 細目レベルのテスト
    it(
      'should calculate annual saimoku breakdown correctly',
      withTransactionForTest(['calculate-breakdown'], async (tx) => {
        // 借方のみのテスト
        const karikataResult = await calculateBreakdown(tx, [
          {
            fiscalYear: '2024',
            kamokuBunruiCd: 'E',
            breakdownLevel: 'saimoku',
            breakdownType: 'karikata',
            timeUnit: 'annual',
          },
        ])

        // 結果が存在することを確認
        expect(karikataResult).toBeDefined()
        expect(karikataResult.annual.length).toBeGreaterThan(0)
        expect(karikataResult.monthly.length).toBe(0) // 年間データのリクエストなので月別データはない

        // 細目E01（役員報酬）の年間データを確認
        const e01Annual = karikataResult.annual.find(
          (item) => item.response.code === 'E01',
        )
        expect(e01Annual).toBeDefined()
        expect(e01Annual?.response.name).toBe('役員報酬')

        // 年間合計を確認（全ての月の合計）
        expect(Number(e01Annual?.response.value)).toBe(
          50000 + 60000 + 55000 + 52000 + 58000 + 65000 + 70000 + 75000,
        )

        // 細目E02（地代家賃）の年間データを確認
        const e02Annual = karikataResult.annual.find(
          (item) => item.response.code === 'E02',
        )
        expect(e02Annual).toBeDefined()
        expect(e02Annual?.response.name).toBe('地代家賃')

        // 年間合計を確認
        expect(Number(e02Annual?.response.value)).toBe(
          30000 + 40000 + 35000 + 33000 + 38000 + 45000 + 50000 + 55000,
        )

        // 貸方のみのテスト
        const kasikataResult = await calculateBreakdown(tx, [
          {
            fiscalYear: '2024',
            kamokuBunruiCd: 'D',
            breakdownLevel: 'saimoku',
            breakdownType: 'kasikata',
            timeUnit: 'annual',
          },
        ])

        // 結果が存在することを確認
        expect(kasikataResult).toBeDefined()
        expect(kasikataResult.annual.length).toBeGreaterThan(0)

        // 細目D11（売上）の年間データを確認
        const d11Annual = kasikataResult.annual.find(
          (item) => item.response.code === 'D11',
        )
        expect(d11Annual).toBeDefined()
        expect(d11Annual?.response.name).toBe('売上')

        // 年間合計を確認
        expect(Number(d11Annual?.response.value)).toBe(
          100000 + 150000 + 120000 + 130000 + 140000 + 160000 + 170000 + 180000,
        )

        // 残高のテスト（L型：借方 - 貸方）
        const netLResult = await calculateBreakdown(tx, [
          {
            fiscalYear: '2024',
            kamokuBunruiCd: 'A',
            breakdownLevel: 'saimoku',
            breakdownType: 'net',
            timeUnit: 'annual',
          },
        ])

        // 結果が存在することを確認
        expect(netLResult).toBeDefined()
        expect(netLResult.annual.length).toBeGreaterThan(0)

        // 細目A11（現金）の年間データを確認
        const a11Annual = netLResult.annual.find(
          (item) => item.response.code === 'A11',
        )
        expect(a11Annual).toBeDefined()
        expect(a11Annual?.response.name).toBe('現金')

        // 年間合計を確認（L型なので借方 - 貸方）
        // 借方合計: 100000 + 150000 + 120000 + 130000 + 140000 + 160000 + 170000 + 180000 = 1150000
        // 貸方合計: 全ての支出と資産間移動の合計
        const totalKasikata =
          100000 +
          50000 +
          30000 +
          20000 + // 4月
          150000 +
          60000 +
          40000 + // 5月
          120000 +
          55000 +
          35000 +
          25000 + // 6月
          130000 +
          52000 +
          33000 + // 7月
          30000 + // 8月
          140000 +
          58000 +
          38000 + // 9月
          35000 + // 10月
          160000 +
          65000 +
          45000 + // 11月
          40000 + // 12月
          170000 +
          70000 +
          50000 + // 1月
          45000 + // 2月
          180000 +
          75000 +
          55000 // 3月

        // 実際の値を確認
        expect(Number(a11Annual?.response.value)).not.toBeNaN()

        // 残高のテスト（R型：貸方 - 借方）
        const netRResult = await calculateBreakdown(tx, [
          {
            fiscalYear: '2024',
            kamokuBunruiCd: 'D',
            breakdownLevel: 'saimoku',
            breakdownType: 'net',
            timeUnit: 'annual',
          },
        ])

        // 結果が存在することを確認
        expect(netRResult).toBeDefined()
        expect(netRResult.annual.length).toBeGreaterThan(0)

        // 細目D11（売上）の年間データを確認
        const d11NetAnnual = netRResult.annual.find(
          (item) => item.response.code === 'D11',
        )
        expect(d11NetAnnual).toBeDefined()

        // 年間合計を確認（R型なので貸方 - 借方、借方がないので貸方の合計がそのまま）
        expect(Number(d11NetAnnual?.response.value)).toBe(
          100000 + 150000 + 120000 + 130000 + 140000 + 160000 + 170000 + 180000,
        )
      }),
    )

    // 科目レベルのテスト
    it(
      'should calculate annual kamoku breakdown correctly',
      withTransactionForTest(['calculate-breakdown'], async (tx) => {
        const result = await calculateBreakdown(tx, [
          {
            fiscalYear: '2024',
            kamokuBunruiCd: 'E',
            breakdownLevel: 'kamoku',
            breakdownType: 'karikata',
            timeUnit: 'annual',
          },
        ])

        // 結果が存在することを確認
        expect(result).toBeDefined()
        expect(result.annual.length).toBeGreaterThan(0)

        // 科目E1（販管費）の年間データを確認
        const e1Annual = result.annual.find(
          (item) => item.response.code === 'E1',
        )
        expect(e1Annual).toBeDefined()

        // 年間合計を確認（E01とE02の合計）
        const e01Total =
          50000 + 60000 + 55000 + 52000 + 58000 + 65000 + 70000 + 75000
        const e02Total =
          30000 + 40000 + 35000 + 33000 + 38000 + 45000 + 50000 + 55000
        expect(Number(e1Annual?.response.value)).toBe(e01Total + e02Total)
      }),
    )

    // 科目分類レベルのテスト
    it(
      'should calculate annual kamoku_bunrui breakdown correctly',
      withTransactionForTest(['calculate-breakdown'], async (tx) => {
        const result = await calculateBreakdown(tx, [
          {
            fiscalYear: '2024',
            kamokuBunruiCd: 'E',
            breakdownLevel: 'kamoku_bunrui',
            breakdownType: 'karikata',
            timeUnit: 'annual',
          },
        ])

        // 結果が存在することを確認
        expect(result).toBeDefined()
        expect(result.annual.length).toBeGreaterThan(0)

        // 科目分類E（費用）の年間データを確認
        const eAnnual = result.annual.find((item) => item.response.code === 'E')
        expect(eAnnual).toBeDefined()

        // 年間合計を確認（全ての費用科目の合計）
        const e01Total =
          50000 + 60000 + 55000 + 52000 + 58000 + 65000 + 70000 + 75000
        const e02Total =
          30000 + 40000 + 35000 + 33000 + 38000 + 45000 + 50000 + 55000
        expect(Number(eAnnual?.response.value)).toBe(e01Total + e02Total)
      }),
    )
  })

  // 複数リクエストのテスト
  it(
    'should handle multiple requests correctly',
    withTransactionForTest(['calculate-breakdown'], async (tx) => {
      const requests: BreakdownRequest[] = [
        {
          fiscalYear: '2024',
          kamokuBunruiCd: 'E',
          breakdownLevel: 'saimoku',
          breakdownType: 'karikata',
          timeUnit: 'month',
        },
        {
          fiscalYear: '2024',
          kamokuBunruiCd: 'D',
          breakdownLevel: 'saimoku',
          breakdownType: 'kasikata',
          timeUnit: 'annual',
        },
      ]

      const result = await calculateBreakdown(tx, requests)

      // 結果が存在することを確認
      expect(result).toBeDefined()
      expect(result.monthly.length).toBeGreaterThan(0)
      expect(result.annual.length).toBeGreaterThan(0)

      // 月別データのリクエストに対応する結果があることを確認
      const monthlyRequest = result.monthly.find(
        (item) => item.request.kamokuBunruiCd === 'E',
      )
      expect(monthlyRequest).toBeDefined()

      // 年間データのリクエストに対応する結果があることを確認
      const annualRequest = result.annual.find(
        (item) => item.request.kamokuBunruiCd === 'D',
      )
      expect(annualRequest).toBeDefined()
    }),
  )

  // エラーケースのテスト
  it(
    'should throw error for invalid kamoku bunrui',
    withTransactionForTest(['calculate-breakdown'], async (tx) => {
      // 存在しない科目分類コードを指定
      const request: BreakdownRequest = {
        fiscalYear: '2024',
        kamokuBunruiCd: 'Z', // 存在しない科目分類コード
        breakdownLevel: 'saimoku',
        breakdownType: 'karikata',
        timeUnit: 'month',
      }

      await expect(calculateBreakdown(tx, [request])).rejects.toThrow(
        'Kamoku bunrui not found: Z',
      )
    }),
  )
})
