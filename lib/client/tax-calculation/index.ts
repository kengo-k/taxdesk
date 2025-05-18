/**
 * 税額計算サービスのエントリーポイント
 *
 * このモジュールは、税額計算に関連する機能をエクスポートします。
 */

// 型定義のエクスポート
export type {
  CalculationStep,
  TaxCalculationResult,
  TaxInputData,
} from './types'

// 計算ロジックのエクスポート
export {
  calculateTax,
  formatCurrency,
  getStepResult,
  getTotalTax,
  groupByCategory,
} from './calc'

// パラメータビルダーのエクスポート
export { buildParameterMappings, buildTaxParameters } from './parameters'
export type { ParameterBuilder, TaxParameters } from './parameters'
export { parameters2023Builder } from './parameters/parameters2023'
export { parameters2024Builder } from './parameters/parameters2024'

// 計算ステップのエクスポート
export { buildStepMappings, getSteps } from './steps'
export { steps2023 } from './steps/steps2023'
export { steps2024 } from './steps/steps2024'
