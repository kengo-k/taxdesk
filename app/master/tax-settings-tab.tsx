'use client'

import type React from 'react'
import { useEffect, useState } from 'react'

import { AlertCircle, InfoIcon } from 'lucide-react'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

// 年度のモックデータ
const FISCAL_YEARS = [
  { id: '2024', name: '2024年度（現在）' },
  { id: '2023', name: '2023年度' },
  { id: '2022', name: '2022年度' },
  { id: '2021', name: '2021年度' },
  { id: '2020', name: '2020年度' },
]

interface TaxSettingsTabProps {
  onYearChange?: (year: string) => void
}

export function TaxSettingsTab({ onYearChange }: TaxSettingsTabProps) {
  // 状態管理
  const [selectedYear, setSelectedYear] = useState('2024')
  const [isReadOnly, setIsReadOnly] = useState(false)
  const [isTaxableEntity, setIsTaxableEntity] = useState(true)
  const [isSimplifiedTaxation, setIsSimplifiedTaxation] = useState(false)
  const [deemedPurchaseRate, setDeemedPurchaseRate] = useState('50')
  const [accountingMethod, setAccountingMethod] = useState('taxExcluded') // デフォルトは税抜経理

  // 年度変更時の処理
  useEffect(() => {
    // 現在年度以外は読み取り専用
    const isCurrentYear = selectedYear === '2024'
    setIsReadOnly(!isCurrentYear)

    // 親コンポーネントに年度変更を通知
    if (onYearChange) {
      onYearChange(selectedYear)
    }

    // 過去年度のデータをロード（実際はAPIから取得）
    if (!isCurrentYear) {
      // モック：過去年度のデータ（実際はAPIから取得）
      const mockHistoricalData = {
        '2023': {
          isTaxable: true,
          isSimplified: true,
          deemedRate: '50',
          accountingMethod: 'taxExcluded',
        },
        '2022': {
          isTaxable: true,
          isSimplified: false,
          deemedRate: '40',
          accountingMethod: 'taxIncluded',
        },
        '2021': {
          isTaxable: false,
          isSimplified: false,
          deemedRate: '50',
          accountingMethod: 'taxExcluded',
        },
        '2020': {
          isTaxable: false,
          isSimplified: false,
          deemedRate: '50',
          accountingMethod: 'taxExcluded',
        },
      }

      // 選択した年度のデータを設定
      const yearData =
        mockHistoricalData[selectedYear as keyof typeof mockHistoricalData]
      if (yearData) {
        setIsTaxableEntity(yearData.isTaxable)
        setIsSimplifiedTaxation(yearData.isSimplified)
        setDeemedPurchaseRate(yearData.deemedRate)
        setAccountingMethod(yearData.accountingMethod)
      }
    } else {
      // 現在年度の場合は最新の設定を表示（実際はAPIから取得）
      setIsTaxableEntity(true)
      setIsSimplifiedTaxation(false)
      setDeemedPurchaseRate('50')
      setAccountingMethod('taxExcluded')
    }
  }, [selectedYear, onYearChange])

  // 年度選択の変更ハンドラ
  const handleYearChange = (year: string) => {
    setSelectedYear(year)
  }

  // みなし仕入れ率の入力検証
  const validateDeemedPurchaseRate = (value: string) => {
    const numValue = Number.parseFloat(value)
    return !isNaN(numValue) && numValue >= 0 && numValue <= 100
  }

  // みなし仕入れ率の変更ハンドラ
  const handleDeemedPurchaseRateChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const value = e.target.value
    // 数値と小数点のみ許可
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setDeemedPurchaseRate(value)
    }
  }

  return (
    <div className="space-y-6">
      {isReadOnly && (
        <Alert
          variant="default"
          className="bg-amber-50 text-amber-800 border-amber-200"
        >
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {selectedYear}
            年度の設定を表示しています。過去年度の設定は変更できません。
          </AlertDescription>
        </Alert>
      )}

      <div className="flex justify-between items-center">
        <div className="w-64">
          <Select
            value={selectedYear}
            onValueChange={handleYearChange}
            disabled={false}
          >
            <SelectTrigger>
              <SelectValue placeholder="年度を選択" />
            </SelectTrigger>
            <SelectContent>
              {FISCAL_YEARS.map((year) => (
                <SelectItem key={year.id} value={year.id}>
                  {year.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="space-y-6">
            {/* 課税事業者かどうか */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label
                  htmlFor="taxable-entity"
                  className="text-base font-medium"
                >
                  課税事業者ですか？
                </Label>
                <Switch
                  id="taxable-entity"
                  checked={isTaxableEntity}
                  onCheckedChange={setIsTaxableEntity}
                  disabled={isReadOnly}
                />
              </div>

              <div className="text-sm text-muted-foreground pl-1 space-y-1">
                <p className="flex items-center gap-1">
                  <InfoIcon className="h-4 w-4 text-blue-500" />
                  前々期の売上が1000万円を超えている場合、課税事業者となります
                </p>
                <p className="flex items-center gap-1">
                  <InfoIcon className="h-4 w-4 text-blue-500" />
                  インボイス登録をしている場合は強制的に課税事業者となります
                </p>
              </div>
            </div>

            {/* 課税事業者の場合のみ表示 */}
            {isTaxableEntity && (
              <>
                {/* 簡易課税かどうか */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label
                      htmlFor="simplified-taxation"
                      className="text-base font-medium"
                    >
                      簡易課税制度を適用しますか？
                    </Label>
                    <Switch
                      id="simplified-taxation"
                      checked={isSimplifiedTaxation}
                      onCheckedChange={setIsSimplifiedTaxation}
                      disabled={isReadOnly}
                    />
                  </div>

                  <div className="text-sm text-muted-foreground pl-1">
                    <p className="flex items-center gap-1">
                      <InfoIcon className="h-4 w-4 text-blue-500" />
                      前々年の売上が5,000万円以下の場合に選択可能です
                    </p>
                  </div>
                </div>

                {/* 簡易課税の場合のみ表示 */}
                {isSimplifiedTaxation && (
                  <div className="space-y-2">
                    <Label
                      htmlFor="deemed-purchase-rate"
                      className="text-base font-medium"
                    >
                      みなし仕入れ率（%）
                    </Label>
                    <div className="flex items-center space-x-2">
                      <Input
                        id="deemed-purchase-rate"
                        type="text"
                        value={deemedPurchaseRate}
                        onChange={handleDeemedPurchaseRateChange}
                        className="w-24"
                        disabled={isReadOnly}
                      />
                      <span>%</span>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <InfoIcon className="h-4 w-4 text-gray-400 cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="w-80">
                              事業区分に応じたみなし仕入れ率を入力してください。
                              <br />
                              第一種事業（卸売業）：90%
                              <br />
                              第二種事業（小売業）：80%
                              <br />
                              第三種事業（製造業等）：70%
                              <br />
                              第四種事業（その他）：60%
                              <br />
                              第五種事業（サービス業等）：50%
                              <br />
                              第六種事業（不動産業等）：40%
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    {deemedPurchaseRate &&
                      !validateDeemedPurchaseRate(deemedPurchaseRate) && (
                        <p className="text-sm text-red-500">
                          0〜100の間の数値を入力してください
                        </p>
                      )}
                  </div>
                )}

                {/* 税抜き経理か税込み経理か */}
                <div className="space-y-2">
                  <Label className="text-base font-medium">経理処理方式</Label>
                  <RadioGroup
                    value={accountingMethod}
                    onValueChange={setAccountingMethod}
                    className="flex flex-col space-y-1"
                    disabled={isReadOnly}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem
                        value="taxExcluded"
                        id="tax-excluded"
                        disabled={isReadOnly}
                      />
                      <Label
                        htmlFor="tax-excluded"
                        className={`cursor-pointer ${isReadOnly ? 'text-gray-500' : ''}`}
                      >
                        税抜経理方式
                      </Label>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <InfoIcon className="h-4 w-4 text-gray-400 cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="w-80">
                              取引金額を「本体価格」と「消費税」に区分して記帳する方式です。
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem
                        value="taxIncluded"
                        id="tax-included"
                        disabled={isReadOnly}
                      />
                      <Label
                        htmlFor="tax-included"
                        className={`cursor-pointer ${isReadOnly ? 'text-gray-500' : ''}`}
                      >
                        税込経理方式
                      </Label>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <InfoIcon className="h-4 w-4 text-gray-400 cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="w-80">
                              取引金額を税込金額のまま記帳し、決算時に消費税額を計算する方式です。
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </RadioGroup>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
