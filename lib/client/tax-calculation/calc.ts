import { CalculationStep } from '@/lib/client/tax-calculation/types'

/**
 * 税額計算を実行する
 * @param steps 計算ステップの配列
 * @param parameters 計算パラメータ
 * @returns 計算結果
 */
export function calculateTax(
  steps: CalculationStep<any>[],
  parameters: any,
): any {
  const context = { ...parameters }

  // 各ステップを順番に実行
  for (const step of steps) {
    let currentSubStepId: any = ''
    try {
      for (const subStep of step.subSteps) {
        currentSubStepId = subStep.id
        context[subStep.id] = subStep.calculate(context)
      }
    } catch (error) {
      console.error(`Error calculating step ${currentSubStepId}:`, error)
    }
  }

  return context
}

/**
 * 金額のフォーマット
 * @param amount 金額
 * @returns フォーマットされた金額文字列
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('ja-JP', {
    style: 'currency',
    currency: 'JPY',
    maximumFractionDigits: 0,
  }).format(amount)
}

// 1000円未満を切捨てる
export const roundDown1000 = (amount: number): number => {
  return Math.floor(amount / 1000) * 1000
}

// 100円未満を切捨てる
export const roundDown100 = (amount: number): number => {
  return Math.floor(amount / 100) * 100
}

// 小数点切り捨て
export const floor = (amount: number): number => {
  return Math.floor(amount)
}
