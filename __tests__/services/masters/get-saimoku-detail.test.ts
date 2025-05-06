import { withTransactionForTest } from '../../framework/test-helpers'

import { KAMOKU_BUNRUI_TYPE } from '@/lib/constants/kamoku-bunrui'
import { getSaimokuDetail } from '@/lib/services/masters/get-saimoku-detail'

describe('getSaimokuDetail', () => {
  it(
    'should return one record for saimoku code(A11)',
    withTransactionForTest([], async (tx) => {
      const result = await getSaimokuDetail(tx, {
        saimoku_cd: 'A11', // 現金
      })

      expect(result).not.toBeNull()
      expect(result?.saimoku_cd).toBe('A11')
      expect(result?.kamoku_bunrui_type).toBe(KAMOKU_BUNRUI_TYPE.LEFT)
    }),
  )

  it(
    'should return null for non-existent saimoku code',
    withTransactionForTest([], async (tx) => {
      const result = await getSaimokuDetail(tx, {
        saimoku_cd: 'XXX', // 存在しない細目コード
      })

      expect(result).toBeNull()
    }),
  )
})
