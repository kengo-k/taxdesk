import { withTransaction } from '@/lib/api-transaction'
import { getCashBalance } from '@/lib/services/reports/get-cash-balance'

export async function GET() {
  return withTransaction(async (tx) => {
    const cashBalance = await getCashBalance(tx, '2024')

    return cashBalance
  })
}
