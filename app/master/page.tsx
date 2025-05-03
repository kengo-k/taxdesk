'use client'

import { useEffect, useState } from 'react'

import Link from 'next/link'

import { DeleteDialog } from './delete-dialog'
import { KamokuDialog } from './kamoku-dialog'
import { KamokuTab } from './kamoku-tab'
import { getMockData } from './mock-data'
import { SaimokuDialog } from './saimoku-dialog'
import { SaimokuTab } from './saimoku-tab'
import { TaxCategoryDialog } from './tax-category-dialog'
import { TaxCategoryTab } from './tax-category-tab'
import { TaxMappingDialog } from './tax-mapping-dialog'
import { TaxMappingTab } from './tax-mapping-tab'
import { TaxSettingsTab } from './tax-settings-tab'
import type {
  DeleteType,
  Kamoku,
  KamokuTaxMapping,
  Saimoku,
  TaxCategory,
} from './types'
import { ArrowLeft, Plus } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from '@/components/ui/use-toast'

export default function MasterManagementPage() {
  // 状態管理
  const [activeTab, setActiveTab] = useState('kamoku')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterBunrui, setFilterBunrui] = useState('all')
  const [kamokuList, setKamokuList] = useState<Kamoku[]>([])
  const [bunruiList, setBunruiList] = useState<any[]>([])
  const [saimokuList, setSaimokuList] = useState<Saimoku[]>([])
  const [taxCategories, setTaxCategories] = useState<TaxCategory[]>([])
  const [kamokuTaxMappings, setKamokuTaxMappings] = useState<
    KamokuTaxMapping[]
  >([])
  const [filteredKamokuList, setFilteredKamokuList] = useState<Kamoku[]>([])
  const [filteredSaimokuList, setFilteredSaimokuList] = useState<Saimoku[]>([])
  const [filteredTaxCategories, setFilteredTaxCategories] = useState<
    TaxCategory[]
  >([])
  const [filteredKamokuTaxMappings, setFilteredKamokuTaxMappings] = useState<
    KamokuTaxMapping[]
  >([])
  const [selectedTaxYear, setSelectedTaxYear] = useState('2024')
  const [isTaxSettingsReadOnly, setIsTaxSettingsReadOnly] = useState(false)

  // ダイアログの状態
  const [showKamokuDialog, setShowKamokuDialog] = useState(false)
  const [showSaimokuDialog, setShowSaimokuDialog] = useState(false)
  const [showTaxCategoryDialog, setShowTaxCategoryDialog] = useState(false)
  const [showMappingDialog, setShowMappingDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [currentKamoku, setCurrentKamoku] = useState<Kamoku | null>(null)
  const [currentSaimoku, setCurrentSaimoku] = useState<Saimoku | null>(null)
  const [currentTaxCategory, setCurrentTaxCategory] =
    useState<TaxCategory | null>(null)
  const [currentMapping, setCurrentMapping] = useState<KamokuTaxMapping | null>(
    null,
  )
  const [isEditing, setIsEditing] = useState(false)
  const [parentKamokuForSaimoku, setParentKamokuForSaimoku] =
    useState<Kamoku | null>(null)
  const [deleteType, setDeleteType] = useState<DeleteType>('kamoku')

  // 消費税設定の年度変更ハンドラ
  const handleTaxSettingsYearChange = (year: string) => {
    setSelectedTaxYear(year)
    setIsTaxSettingsReadOnly(year !== '2024')
  }

  // モックデータの読み込み
  useEffect(() => {
    const {
      bunruiList,
      kamokuList,
      saimokuList,
      taxCategories,
      kamokuTaxMappings,
    } = getMockData()

    setBunruiList(bunruiList)
    setKamokuList(kamokuList)
    setSaimokuList(saimokuList)
    setTaxCategories(taxCategories)
    setKamokuTaxMappings(kamokuTaxMappings)
    setFilteredKamokuList(kamokuList)
    setFilteredSaimokuList(saimokuList)
    setFilteredTaxCategories(taxCategories)
    setFilteredKamokuTaxMappings(kamokuTaxMappings)
  }, [])

  // 検索とフィルタリングの処理
  useEffect(() => {
    let filtered = kamokuList

    // 分類でフィルタリング
    if (filterBunrui && filterBunrui !== 'all') {
      filtered = filtered.filter(
        (kamoku) => kamoku.kamoku_bunrui_cd === filterBunrui,
      )
    }

    // 検索語でフィルタリング
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (kamoku) =>
          kamoku.kamoku_cd.toLowerCase().includes(term) ||
          kamoku.kamoku_full_name.toLowerCase().includes(term) ||
          kamoku.kamoku_ryaku_name.toLowerCase().includes(term) ||
          kamoku.kamoku_kana_name.toLowerCase().includes(term),
      )
    }

    setFilteredKamokuList(filtered)

    // 細目のフィルタリング
    let filteredSai = saimokuList
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filteredSai = filteredSai.filter(
        (saimoku) =>
          saimoku.saimoku_cd.toLowerCase().includes(term) ||
          saimoku.saimoku_full_name.toLowerCase().includes(term) ||
          saimoku.saimoku_ryaku_name.toLowerCase().includes(term) ||
          saimoku.saimoku_kana_name.toLowerCase().includes(term),
      )
    }
    setFilteredSaimokuList(filteredSai)

    // 消費税区分のフィルタリング
    let filteredTax = taxCategories
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filteredTax = filteredTax.filter(
        (category) =>
          category.code.toLowerCase().includes(term) ||
          category.name.toLowerCase().includes(term) ||
          category.description.toLowerCase().includes(term),
      )
    }
    setFilteredTaxCategories(filteredTax)

    // 関連付けのフィルタリング
    let filteredMapping = kamokuTaxMappings
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filteredMapping = filteredMapping.filter(
        (mapping) =>
          mapping.kamoku_cd.toLowerCase().includes(term) ||
          mapping.kamoku_name?.toLowerCase().includes(term) ||
          mapping.tax_category?.name.toLowerCase().includes(term),
      )
    }
    setFilteredKamokuTaxMappings(filteredMapping)
  }, [
    searchTerm,
    filterBunrui,
    kamokuList,
    saimokuList,
    taxCategories,
    kamokuTaxMappings,
  ])

  // 勘定科目の追加/編集ダイアログを開く
  const openKamokuDialog = (kamoku?: Kamoku) => {
    if (kamoku) {
      setCurrentKamoku(kamoku)
      setIsEditing(true)
    } else {
      setCurrentKamoku({
        id: '',
        kamoku_cd: '',
        kamoku_full_name: '',
        kamoku_ryaku_name: '',
        kamoku_kana_name: '',
        kamoku_bunrui_cd: '',
        description: '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      setIsEditing(false)
    }
    setShowKamokuDialog(true)
  }

  // 細目の追加/編集ダイアログを開く
  const openSaimokuDialog = (parentKamoku: Kamoku, saimoku?: Saimoku) => {
    setParentKamokuForSaimoku(parentKamoku)
    if (saimoku) {
      setCurrentSaimoku(saimoku)
      setIsEditing(true)
    } else {
      setCurrentSaimoku({
        id: '',
        kamoku_cd: parentKamoku.kamoku_cd,
        saimoku_cd: '',
        saimoku_full_name: '',
        saimoku_ryaku_name: '',
        saimoku_kana_name: '',
        description: '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        transaction: '["2000-01-01 00:00:00+00",)',
        valid_from: new Date().toISOString().split('T')[0], // 今日の日付を初期値に
        valid_to: '', // 終了日は空欄
      })
      setIsEditing(false)
    }
    setShowSaimokuDialog(true)
  }

  // 消費税区分の追加/編集ダイアログを開く
  const openTaxCategoryDialog = (category?: TaxCategory) => {
    if (category) {
      setCurrentTaxCategory(category)
      setIsEditing(true)
    } else {
      setCurrentTaxCategory({
        id: '',
        code: `TAX_${Date.now().toString().substring(8)}`,
        name: '',
        description: '',
        tax_rate: 0,
        is_reduced_tax: false,
        is_taxable: true,
        is_deductible: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        valid_from: new Date().toISOString().split('T')[0], // 今日の日付を初期値に
        valid_to: '', // 終了日は空欄
      })
      setIsEditing(false)
    }
    setShowTaxCategoryDialog(true)
  }

  // 関連付けの追加/編集ダイアログを開く
  const openMappingDialog = (mapping?: KamokuTaxMapping) => {
    if (mapping) {
      setCurrentMapping(mapping)
      setIsEditing(true)
    } else {
      setCurrentMapping({
        id: '',
        kamoku_cd: '',
        tax_category_id: '',
        is_default: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        valid_from: new Date().toISOString().split('T')[0], // 今日の日付を初期値に
        valid_to: '', // 終了日は空欄
      })
      setIsEditing(false)
    }
    setShowMappingDialog(true)
  }

  // 勘定科目の保存処理
  const saveKamoku = () => {
    if (!currentKamoku) return

    // バリデーション
    if (!currentKamoku.kamoku_full_name) {
      toast({
        title: '入力エラー',
        description: '科目名は必須項目です',
        variant: 'destructive',
      })
      return
    }

    // 新規追加の場合はIDを生成
    if (!isEditing) {
      currentKamoku.id = Date.now().toString()
    }

    // 更新日時を設定
    currentKamoku.updated_at = new Date().toISOString()

    // 分類情報を取得
    const bunrui = bunruiList.find(
      (b) => b.kamoku_bunrui_cd === currentKamoku.kamoku_bunrui_cd,
    )

    // 勘定科目リストを更新
    if (isEditing) {
      setKamokuList((prev) =>
        prev.map((k) =>
          k.id === currentKamoku?.id ? { ...currentKamoku, bunrui } : k,
        ),
      )
    } else {
      setKamokuList((prev) => [...prev, { ...currentKamoku, bunrui }])
    }

    toast({
      title: isEditing ? '勘定科目を更新しました' : '勘定科目を追加しました',
      description: `${currentKamoku.kamoku_full_name}（${currentKamoku.kamoku_cd}）`,
    })

    setShowKamokuDialog(false)
  }

  // 細目の保存処理
  const saveSaimoku = () => {
    if (!currentSaimoku || !parentKamokuForSaimoku) return

    // バリデーション
    if (
      !currentSaimoku.saimoku_cd ||
      !currentSaimoku.saimoku_full_name ||
      !currentSaimoku.valid_from
    ) {
      toast({
        title: '入力エラー',
        description: '必須項目を入力してください',
        variant: 'destructive',
      })
      return
    }

    // 新規追加の場合はIDを生成
    if (!isEditing) {
      currentSaimoku.id = Date.now().toString()
    }

    // 更新日時を設定
    currentSaimoku.updated_at = new Date().toISOString()

    // 細目リストを更新
    if (isEditing) {
      setSaimokuList((prev) =>
        prev.map((s) => (s.id === currentSaimoku?.id ? currentSaimoku : s)),
      )
    } else {
      setSaimokuList((prev) => [...prev, currentSaimoku])
    }

    // 勘定科目の細目リストも更新
    setKamokuList((prev) =>
      prev.map((k) => {
        if (k.id === parentKamokuForSaimoku.id) {
          const updatedSaimokuList = isEditing
            ? (k.saimokuList || []).map((s) =>
                s.id === currentSaimoku.id ? currentSaimoku : s,
              )
            : [...(k.saimokuList || []), currentSaimoku]
          return { ...k, saimokuList: updatedSaimokuList }
        }
        return k
      }),
    )

    toast({
      title: isEditing ? '細目を更新しました' : '細目を追加しました',
      description: `${currentSaimoku.saimoku_full_name}（${currentSaimoku.saimoku_cd}）`,
    })

    setShowSaimokuDialog(false)
  }

  // 消費税区分の保存処理
  const saveTaxCategory = () => {
    if (!currentTaxCategory) return

    // バリデーション
    if (!currentTaxCategory.name || !currentTaxCategory.valid_from) {
      toast({
        title: '入力エラー',
        description: '必須項目を入力してください',
        variant: 'destructive',
      })
      return
    }

    // コードが空の場合は自動生成
    if (!currentTaxCategory.code) {
      currentTaxCategory.code = `TAX_${Date.now().toString().substring(8)}`
    }

    // 新規追加の場合はIDを生成
    if (!isEditing) {
      currentTaxCategory.id = Date.now().toString()
    }

    // 更新日時を設定
    currentTaxCategory.updated_at = new Date().toISOString()

    // 消費税区分リストを更新
    if (isEditing) {
      setTaxCategories((prev) =>
        prev.map((c) =>
          c.id === currentTaxCategory?.id ? currentTaxCategory : c,
        ),
      )
    } else {
      setTaxCategories((prev) => [...prev, currentTaxCategory])
    }

    // 関連付けも更新
    if (isEditing) {
      setKamokuTaxMappings((prev) =>
        prev.map((mapping) => {
          if (mapping.tax_category_id === currentTaxCategory.id) {
            return { ...mapping, tax_category: currentTaxCategory }
          }
          return mapping
        }),
      )
    }

    toast({
      title: isEditing
        ? '消費税区分を更新しました'
        : '消費税区分を追加しました',
      description: `${currentTaxCategory.name}（${currentTaxCategory.code}）`,
    })

    setShowTaxCategoryDialog(false)
  }

  // 関連付けの保存処理
  const saveMapping = () => {
    if (!currentMapping) return

    // バリデーション
    if (
      !currentMapping.kamoku_cd ||
      !currentMapping.tax_category_id ||
      !currentMapping.valid_from
    ) {
      toast({
        title: '入力エラー',
        description: '必須項目を入力してください',
        variant: 'destructive',
      })
      return
    }

    // 新規追加の場合はIDを生成
    if (!isEditing) {
      currentMapping.id = Date.now().toString()
    }

    // 更新日時を設定
    currentMapping.updated_at = new Date().toISOString()

    // 関連情報を取得
    const kamoku = kamokuList.find(
      (k) => k.kamoku_cd === currentMapping.kamoku_cd,
    )
    const taxCategory = taxCategories.find(
      (t) => t.id === currentMapping.tax_category_id,
    )

    // 関連付けリストを更新
    const updatedMapping = {
      ...currentMapping,
      kamoku_name: kamoku?.kamoku_full_name,
      tax_category: taxCategory,
    }

    if (isEditing) {
      setKamokuTaxMappings((prev) =>
        prev.map((m) => (m.id === currentMapping.id ? updatedMapping : m)),
      )
    } else {
      setKamokuTaxMappings((prev) => [...prev, updatedMapping])
    }

    toast({
      title: isEditing ? '関連付けを更新しました' : '関連付けを追加しました',
      description: `${kamoku?.kamoku_full_name} - ${taxCategory?.name}`,
    })

    setShowMappingDialog(false)
  }

  // 削除確認ダイアログを開く
  const confirmDelete = (item: any, type: DeleteType) => {
    setDeleteType(type)
    if (type === 'kamoku') {
      setCurrentKamoku(item)
    } else if (type === 'saimoku') {
      setCurrentSaimoku(item)
      setParentKamokuForSaimoku(
        kamokuList.find((k) => k.kamoku_cd === item.kamoku_cd) || null,
      )
    } else if (type === 'tax-category') {
      setCurrentTaxCategory(item)
    } else if (type === 'mapping') {
      setCurrentMapping(item)
    }
    setShowDeleteDialog(true)
  }

  // 削除処理
  const handleDelete = () => {
    if (deleteType === 'kamoku' && currentKamoku) {
      // 勘定科目の削除
      setKamokuList((prev) => prev.filter((k) => k.id !== currentKamoku.id))
      // 関連する細目も削除
      setSaimokuList((prev) =>
        prev.filter((s) => s.kamoku_cd !== currentKamoku.kamoku_cd),
      )
      // 関連する消費税関連付けも削除
      setKamokuTaxMappings((prev) =>
        prev.filter((m) => m.kamoku_cd !== currentKamoku.kamoku_cd),
      )

      toast({
        title: '勘定科目を削除しました',
        description: `${currentKamoku.kamoku_full_name}（${currentKamoku.kamoku_cd}）`,
      })
    } else if (deleteType === 'saimoku' && currentSaimoku) {
      // 細目の削除
      setSaimokuList((prev) => prev.filter((s) => s.id !== currentSaimoku.id))

      // 勘定科目の細目リストも更新
      setKamokuList((prev) =>
        prev.map((k) => {
          if (k.kamoku_cd === currentSaimoku.kamoku_cd) {
            return {
              ...k,
              saimokuList: (k.saimokuList || []).filter(
                (s) => s.id !== currentSaimoku?.id,
              ),
            }
          }
          return k
        }),
      )

      toast({
        title: '細目を削除しました',
        description: `${currentSaimoku.saimoku_full_name}（${currentSaimoku.saimoku_cd}）`,
      })
    } else if (deleteType === 'tax-category' && currentTaxCategory) {
      // 消費税区分の削除
      setTaxCategories((prev) =>
        prev.filter((c) => c.id !== currentTaxCategory.id),
      )
      // 関連する関連付けも削除
      setKamokuTaxMappings((prev) =>
        prev.filter((m) => m.tax_category_id !== currentTaxCategory.id),
      )

      toast({
        title: '消費税区分を削除しました',
        description: `${currentTaxCategory.name}（${currentTaxCategory.code}）`,
      })
    } else if (deleteType === 'mapping' && currentMapping) {
      // 関連付けの削除
      setKamokuTaxMappings((prev) =>
        prev.filter((m) => m.id !== currentMapping.id),
      )

      toast({
        title: '関連付けを削除しました',
        description: `${currentMapping.kamoku_name} - ${currentMapping.tax_category?.name}`,
      })
    }

    setShowDeleteDialog(false)
  }

  // 勘定科目フィールド変更ハンドラ
  const handleKamokuChange = (field: keyof Kamoku, value: string) => {
    setCurrentKamoku((prev) => (prev ? { ...prev, [field]: value } : null))
  }

  // 細目フィールド変更ハンドラ
  const handleSaimokuChange = (field: keyof Saimoku, value: string) => {
    setCurrentSaimoku((prev) => (prev ? { ...prev, [field]: value } : null))
  }

  // 細目の勘定科目変更ハンドラ
  const handleSaimokuKamokuChange = (kamokuCd: string) => {
    setCurrentSaimoku((prev) =>
      prev ? { ...prev, kamoku_cd: kamokuCd } : null,
    )
    const selectedKamoku = kamokuList.find((k) => k.kamoku_cd === kamokuCd)
    if (selectedKamoku) {
      setParentKamokuForSaimoku(selectedKamoku)
    }
  }

  // 消費税区分フィールド変更ハンドラ
  const handleTaxCategoryChange = (
    field: keyof TaxCategory,
    value: string | number | boolean,
  ) => {
    setCurrentTaxCategory((prev) => (prev ? { ...prev, [field]: value } : null))
  }

  // 関連付けフィールド変更ハンドラ
  const handleMappingChange = (
    field: keyof KamokuTaxMapping,
    value: string | boolean,
  ) => {
    setCurrentMapping((prev) => (prev ? { ...prev, [field]: value } : null))
  }

  // 消費税設定の保存処理
  const saveTaxSettings = () => {
    toast({
      title: '消費税設定を保存しました',
      description: '設定が正常に保存されました',
    })
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <main className="flex-1">
        <div className="mb-6 flex items-center">
          <Link
            href="/"
            className="flex items-center text-gray-600 hover:text-gray-900 mr-4"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            戻る
          </Link>
          <h2 className="text-lg font-bold">マスタ管理</h2>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>マスタデータ管理</CardTitle>
            <CardDescription>
              勘定科目・細目・消費税区分の追加・編集・削除を行います
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <div className="flex justify-between items-center mb-4">
                <TabsList>
                  <TabsTrigger value="kamoku">勘定科目</TabsTrigger>
                  <TabsTrigger value="saimoku">細目</TabsTrigger>
                  <TabsTrigger value="tax-categories">消費税区分</TabsTrigger>
                  <TabsTrigger value="mappings">消費税関連付け</TabsTrigger>
                  <TabsTrigger value="tax-settings">消費税設定</TabsTrigger>
                </TabsList>
                <div className="flex items-center gap-2">
                  {activeTab !== 'tax-settings' && (
                    <Button
                      onClick={() => {
                        if (activeTab === 'kamoku') {
                          openKamokuDialog()
                        } else if (activeTab === 'saimoku') {
                          if (kamokuList.length > 0) {
                            openSaimokuDialog(kamokuList[0])
                          } else {
                            toast({
                              title: '操作ガイド',
                              description:
                                '細目を追加するには、まず勘定科目を登録してください',
                            })
                          }
                        } else if (activeTab === 'tax-categories') {
                          openTaxCategoryDialog()
                        } else if (activeTab === 'mappings') {
                          openMappingDialog()
                        }
                      }}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      {activeTab === 'kamoku'
                        ? '勘定科目を追加'
                        : activeTab === 'saimoku'
                          ? '細目を追加'
                          : activeTab === 'tax-categories'
                            ? '消費税区分を追加'
                            : '消費税関連付けを追加'}
                    </Button>
                  )}
                  {activeTab === 'tax-settings' && (
                    <Button
                      onClick={saveTaxSettings}
                      disabled={isTaxSettingsReadOnly}
                    >
                      設定を保存
                    </Button>
                  )}
                </div>
              </div>

              <TabsContent value="kamoku" className="mt-0">
                <KamokuTab
                  kamokuList={filteredKamokuList}
                  onOpenKamokuDialog={openKamokuDialog}
                  onOpenSaimokuDialog={openSaimokuDialog}
                />
              </TabsContent>

              <TabsContent value="saimoku" className="mt-0">
                <SaimokuTab
                  saimokuList={filteredSaimokuList}
                  kamokuList={kamokuList}
                  onOpenSaimokuDialog={openSaimokuDialog}
                  confirmDelete={confirmDelete}
                />
              </TabsContent>

              <TabsContent value="tax-categories" className="mt-0">
                <TaxCategoryTab
                  taxCategories={filteredTaxCategories}
                  onOpenTaxCategoryDialog={openTaxCategoryDialog}
                  onConfirmDelete={confirmDelete}
                />
              </TabsContent>

              <TabsContent value="mappings" className="mt-0">
                <TaxMappingTab
                  kamokuTaxMappings={filteredKamokuTaxMappings}
                  onOpenMappingDialog={openMappingDialog}
                  onConfirmDelete={confirmDelete}
                />
              </TabsContent>

              <TabsContent value="tax-settings" className="mt-0">
                <TaxSettingsTab onYearChange={handleTaxSettingsYearChange} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </main>

      {/* 勘定科目追加/編集ダイアログ */}
      <KamokuDialog
        open={showKamokuDialog}
        onOpenChange={setShowKamokuDialog}
        isEditing={isEditing}
        currentKamoku={currentKamoku}
        onSave={saveKamoku}
        onChange={handleKamokuChange}
      />

      {/* 細目追加/編集ダイアログ */}
      <SaimokuDialog
        open={showSaimokuDialog}
        onOpenChange={setShowSaimokuDialog}
        isEditing={isEditing}
        currentSaimoku={currentSaimoku}
        kamokuList={kamokuList}
        parentKamokuForSaimoku={parentKamokuForSaimoku}
        onSave={saveSaimoku}
        onChange={handleSaimokuChange}
        onKamokuChange={handleSaimokuKamokuChange}
      />

      {/* 消費税区分追加/編集ダイアログ */}
      <TaxCategoryDialog
        open={showTaxCategoryDialog}
        onOpenChange={setShowTaxCategoryDialog}
        isEditing={isEditing}
        currentTaxCategory={currentTaxCategory}
        onSave={saveTaxCategory}
        onChange={handleTaxCategoryChange}
      />

      {/* 関連付け追加/編集ダイアログ */}
      <TaxMappingDialog
        open={showMappingDialog}
        onOpenChange={setShowMappingDialog}
        isEditing={isEditing}
        currentMapping={currentMapping}
        kamokuList={kamokuList}
        taxCategories={taxCategories}
        onSave={saveMapping}
        onChange={handleMappingChange}
      />

      {/* 削除確認ダイアログ */}
      <DeleteDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        deleteType={deleteType}
        onDelete={handleDelete}
      />
    </div>
  )
}
