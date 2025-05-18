/**
 * 税額計算サービスのエントリーポイント
 *
 * このモジュールは、税額計算に関連する機能をエクスポートします。
 */
// 計算ロジック
import {
  TaxCalculationResult,
  adaptStepsForYear,
  adaptToCalculationStep,
  calculateTax,
  getStepResult,
  getTotalTax,
} from './calc'
// パラメータビルダー
import {
  ParameterBuilder,
  TaxParameters,
  buildParameterMappings,
  buildTaxParameters,
} from './parameters'
// 計算ステップ
import {
  TaxCalculationContext,
  TaxCalculationStep,
  buildStepMappings,
  getSteps,
} from './steps'

// 計算ロジックのエクスポート
export {
  adaptStepsForYear,
  adaptToCalculationStep,
  calculateTax,
  getStepResult,
  getTotalTax,
}
export type { TaxCalculationResult }

// パラメータビルダーのエクスポート
export { buildParameterMappings, buildTaxParameters }
export type { ParameterBuilder, TaxParameters }

// 計算ステップのエクスポート
export { buildStepMappings, getSteps }
export type { TaxCalculationContext, TaxCalculationStep }
