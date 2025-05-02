"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Plus, Search, Edit, Trash2, Download } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/components/ui/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"

// 消費税区分の型定義
interface TaxCategory {
  id: string
  code: string
  name: string
  description: string
  tax_rate: number
  is_reduced_tax: boolean
  is_taxable: boolean
  is_deductible: boolean
  created_at: string
  updated_at: string
}

// 勘定科目と消費税区分の関連付けの型定義
interface KamokuTaxMapping {
  id: string
  kamoku_cd: string
  tax_category_id: string
  is_default: boolean
  created_at: string
  updated_at: string
  kamoku_name?: string // 表示用
  tax_category?: TaxCategory // 表示用
}

export default function TaxManagementPage() {
  // 状態管理
  const [activeTab, setActiveTab] = useState("tax-categories")
  const [searchTerm, setSearchTerm] = useState("")
  const [taxCategories, setTaxCategories] = useState<TaxCategory[]>([])
  const [kamokuTaxMappings, setKamokuTaxMappings] = useState<KamokuTaxMapping[]>([])
  const [filteredTaxCategories, setFilteredTaxCategories] = useState<TaxCategory[]>([])
  const [filteredKamokuTaxMappings, setFilteredKamokuTaxMappings] = useState<KamokuTaxMapping[]>([])
  const [kamokuList, setKamokuList] = useState<{ kamoku_cd: string; kamoku_full_name: string }[]>([])

  // ダイアログの状態
  const [showTaxCategoryDialog, setShowTaxCategoryDialog] = useState(false)
  const [showMappingDialog, setShowMappingDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [currentTaxCategory, setCurrentTaxCategory] = useState<TaxCategory | null>(null)
  const [currentMapping, setCurrentMapping] = useState<KamokuTaxMapping | null>(null)
  const [isEditing, setIsEditing] = useState(false)

  // モックデータの読み込み（実際の実装ではAPIから取得）
  useEffect(() => {
    // 勘定科目データ（実際はAPIから取得）
    const kamokuData = [
      { kamoku_cd: "101", kamoku_full_name: "現金" },
      { kamoku_cd: "102", kamoku_full_name: "普通預金" },
      { kamoku_cd: "103", kamoku_full_name: "売掛金" },
      { kamoku_cd: "201", kamoku_full_name: "買掛金" },
      { kamoku_cd: "202", kamoku_full_name: "未払金" },
      { kamoku_cd: "301", kamoku_full_name: "資本金" },
      { kamoku_cd: "401", kamoku_full_name: "売上高" },
      { kamoku_cd: "501", kamoku_full_name: "仕入高" },
      { kamoku_cd: "601", kamoku_full_name: "法人税等" },
      { kamoku_cd: "ZZ", kamoku_full_name: "繰越" },
    ]

    // 消費税区分データ
    const taxCategoryData: TaxCategory[] = [
      {
        id: "1",
        code: "TAXABLE_10",
        name: "課税（標準税率10%）",
        description: "標準税率10%が適用される課税取引",
        tax_rate: 10,
        is_reduced_tax: false,
        is_taxable: true,
        is_deductible: true,
        created_at: "2021-03-21 00:00:00",
        updated_at: "2021-03-21 00:00:00",
      },
      {
        id: "2",
        code: "TAXABLE_8",
        name: "課税（軽減税率8%）",
        description: "軽減税率8%が適用される課税取引（食料品等）",
        tax_rate: 8,
        is_reduced_tax: true,
        is_taxable: true,
        is_deductible: true,
        created_at: "2021-03-21 00:00:00",
        updated_at: "2021-03-21 00:00:00",
      },
      {
        id: "3",
        code: "NON_TAXABLE",
        name: "非課税",
        description: "消費税が課税されない取引（医療費、教育費等）",
        tax_rate: 0,
        is_reduced_tax: false,
        is_taxable: false,
        is_deductible: false,
        created_at: "2021-03-21 00:00:00",
        updated_at: "2021-03-21 00:00:00",
      },
      {
        id: "4",
        code: "EXEMPT",
        name: "免税",
        description: "輸出取引等の免税取引",
        tax_rate: 0,
        is_reduced_tax: false,
        is_taxable: false,
        is_deductible: true,
        created_at: "2021-03-21 00:00:00",
        updated_at: "2021-03-21 00:00:00",
      },
      {
        id: "5",
        code: "OUT_OF_SCOPE",
        name: "対象外",
        description: "消費税の課税対象外の取引",
        tax_rate: 0,
        is_reduced_tax: false,
        is_taxable: false,
        is_deductible: false,
        created_at: "2021-03-21 00:00:00",
        updated_at: "2021-03-21 00:00:00",
      },
    ]

    // 勘定科目と消費税区分の関連付けデータ
    const mappingData: KamokuTaxMapping[] = [
      {
        id: "1",
        kamoku_cd: "401",
        tax_category_id: "1",
        is_default: true,
        created_at: "2021-03-21 00:00:00",
        updated_at: "2021-03-21 00:00:00",
      },
      {
        id: "2",
        kamoku_cd: "401",
        tax_category_id: "2",
        is_default: false,
        created_at: "2021-03-21 00:00:00",
        updated_at: "2021-03-21 00:00:00",
      },
      {
        id: "3",
        kamoku_cd: "501",
        tax_category_id: "1",
        is_default: true,
        created_at: "2021-03-21 00:00:00",
        updated_at: "2021-03-21 00:00:00",
      },
      {
        id: "4",
        kamoku_cd: "501",
        tax_category_id: "2",
        is_default: false,
        created_at: "2021-03-21 00:00:00",
        updated_at: "2021-03-21 00:00:00",
      },
      {
        id: "5",
        kamoku_cd: "202",
        tax_category_id: "1",
        is_default: true,
        created_at: "2021-03-21 00:00:00",
        updated_at: "2021-03-21 00:00:00",
      },
    ]

    // 表示用に関連情報を付与
    const mappingsWithDetails = mappingData.map((mapping) => {
      const kamoku = kamokuData.find((k) => k.kamoku_cd === mapping.kamoku_cd)
      const taxCategory = taxCategoryData.find((t) => t.id === mapping.tax_category_id)
      return {
        ...mapping,
        kamoku_name: kamoku?.kamoku_full_name,
        tax_category: taxCategory,
      }
    })

    setKamokuList(kamokuData)
    setTaxCategories(taxCategoryData)
    setKamokuTaxMappings(mappingsWithDetails)
    setFilteredTaxCategories(taxCategoryData)
    setFilteredKamokuTaxMappings(mappingsWithDetails)
  }, [])

  // 検索とフィルタリングの処理
  useEffect(() => {
    // 消費税区分のフィルタリング
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      const filtered = taxCategories.filter(
        (category) =>
          category.code.toLowerCase().includes(term) ||
          category.name.toLowerCase().includes(term) ||
          category.description.toLowerCase().includes(term),
      )
      setFilteredTaxCategories(filtered)
    } else {
      setFilteredTaxCategories(taxCategories)
    }

    // 関連付けのフィルタリング
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      const filtered = kamokuTaxMappings.filter(
        (mapping) =>
          mapping.kamoku_cd.toLowerCase().includes(term) ||
          mapping.kamoku_name?.toLowerCase().includes(term) ||
          mapping.tax_category?.name.toLowerCase().includes(term),
      )
      setFilteredKamokuTaxMappings(filtered)
    } else {
      setFilteredKamokuTaxMappings(kamokuTaxMappings)
    }
  }, [searchTerm, taxCategories, kamokuTaxMappings])

  // 消費税区分の追加/編集ダイアログを開く
  const openTaxCategoryDialog = (category?: TaxCategory) => {
    if (category) {
      setCurrentTaxCategory(category)
      setIsEditing(true)
    } else {
      setCurrentTaxCategory({
        id: "",
        code: "",
        name: "",
        description: "",
        tax_rate: 0,
        is_reduced_tax: false,
        is_taxable: true,
        is_deductible: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
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
        id: "",
        kamoku_cd: "",
        tax_category_id: "",
        is_default: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      setIsEditing(false)
    }
    setShowMappingDialog(true)
  }

  // 消費税区分の保存処理
  const saveTaxCategory = () => {
    if (!currentTaxCategory) return

    // バリデーション
    if (!currentTaxCategory.code || !currentTaxCategory.name) {
      toast({
        title: "入力エラー",
        description: "必須項目を入力してください",
        variant: "destructive",
      })
      return
    }

    // 新規追加の場合はIDを生成
    if (!isEditing) {
      currentTaxCategory.id = Date.now().toString()
    }

    // 更新日時を設定
    currentTaxCategory.updated_at = new Date().toISOString()

    // 消費税区分リストを更新
    if (isEditing) {
      setTaxCategories((prev) => prev.map((c) => (c.id === currentTaxCategory?.id ? currentTaxCategory : c)))
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
      title: isEditing ? "消費税区分を更新しました" : "消費税区分を追加しました",
      description: `${currentTaxCategory.name}（${currentTaxCategory.code}）`,
    })

    setShowTaxCategoryDialog(false)
  }

  // 関連付けの保存処理
  const saveMapping = () => {
    if (!currentMapping) return

    // バリデーション
    if (!currentMapping.kamoku_cd || !currentMapping.tax_category_id) {
      toast({
        title: "入力エラー",
        description: "必須項目を入力してください",
        variant: "destructive",
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
    const kamoku = kamokuList.find((k) => k.kamoku_cd === currentMapping.kamoku_cd)
    const taxCategory = taxCategories.find((t) => t.id === currentMapping.tax_category_id)

    // 関連付けリストを更新
    const updatedMapping = {
      ...currentMapping,
      kamoku_name: kamoku?.kamoku_full_name,
      tax_category: taxCategory,
    }

    if (isEditing) {
      setKamokuTaxMappings((prev) => prev.map((m) => (m.id === currentMapping.id ? updatedMapping : m)))
    } else {
      setKamokuTaxMappings((prev) => [...prev, updatedMapping])
    }

    toast({
      title: isEditing ? "関連付けを更新しました" : "関連付けを追加しました",
      description: `${kamoku?.kamoku_full_name} - ${taxCategory?.name}`,
    })

    setShowMappingDialog(false)
  }

  // 削除確認ダイアログを開く
  const confirmDelete = (item: TaxCategory | KamokuTaxMapping, type: "category" | "mapping") => {
    if (type === "category") {
      setCurrentTaxCategory(item as TaxCategory)
    } else {
      setCurrentMapping(item as KamokuTaxMapping)
    }
    setShowDeleteDialog(true)
  }

  // 削除処理
  const handleDelete = () => {
    if (activeTab === "tax-categories" && currentTaxCategory) {
      // 消費税区分の削除
      setTaxCategories((prev) => prev.filter((c) => c.id !== currentTaxCategory.id))
      // 関連する関連付けも削除
      setKamokuTaxMappings((prev) => prev.filter((m) => m.tax_category_id !== currentTaxCategory.id))

      toast({
        title: "消費税区分を削除しました",
        description: `${currentTaxCategory.name}（${currentTaxCategory.code}）`,
      })
    } else if (activeTab === "mappings" && currentMapping) {
      // 関連付けの削除
      setKamokuTaxMappings((prev) => prev.filter((m) => m.id !== currentMapping.id))

      toast({
        title: "関連付けを削除しました",
        description: `${currentMapping.kamoku_name} - ${currentMapping.tax_category?.name}`,
      })
    }

    setShowDeleteDialog(false)
  }

  // CSVエクスポート処理
  const handleExportCSV = () => {
    let csvData = ""
    let fileName = ""

    if (activeTab === "tax-categories") {
      // 消費税区分のCSVヘッダー
      const headers = ["コード", "名称", "説明", "税率", "軽減税率", "課税対象", "仕入税額控除対象"]
      // 消費税区分のCSVデータ
      const data = filteredTaxCategories.map((category) => [
        category.code,
        category.name,
        category.description,
        `${category.tax_rate}%`,
        category.is_reduced_tax ? "はい" : "いいえ",
        category.is_taxable ? "はい" : "いいえ",
        category.is_deductible ? "はい" : "いいえ",
      ])
      csvData = [headers.join(","), ...data.map((row) => row.join(","))].join("\n")
      fileName = "消費税区分一覧.csv"
    } else {
      // 関連付けのCSVヘッダー
      const headers = ["勘定科目コード", "勘定科目名", "消費税区分", "デフォルト設定"]
      // 関連付けのCSVデータ
      const data = filteredKamokuTaxMappings.map((mapping) => [
        mapping.kamoku_cd,
        mapping.kamoku_name,
        mapping.tax_category?.name,
        mapping.is_default ? "はい" : "いいえ",
      ])
      csvData = [headers.join(","), ...data.map((row) => row.join(","))].join("\n")
      fileName = "勘定科目消費税区分関連付け一覧.csv"
    }

    // BOMを追加してExcelで文字化けしないようにする
    const BOM = "\uFEFF"
    const blob = new Blob([BOM + csvData], { type: "text/csv;charset=utf-8" })

    // ダウンロードリンクを作成
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast({
      title: "CSVファイルをダウンロードしました",
      description: fileName,
    })
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <main className="flex-1 container mx-auto px-4 py-6">
        <div className="mb-6 flex items-center">
          <Link href="/" className="flex items-center text-gray-600 hover:text-gray-900 mr-4">
            <ArrowLeft className="h-4 w-4 mr-1" />
            戻る
          </Link>
          <h2 className="text-lg font-bold">消費税管理</h2>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>消費税設定</CardTitle>
            <CardDescription>消費税区分の管理と勘定科目への関連付けを行います</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <div className="flex justify-between items-center mb-4">
                <TabsList>
                  <TabsTrigger value="tax-categories">消費税区分</TabsTrigger>
                  <TabsTrigger value="mappings">勘定科目関連付け</TabsTrigger>
                </TabsList>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                      type="search"
                      placeholder="検索..."
                      className="pl-9 w-64"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <Button variant="outline" onClick={handleExportCSV}>
                    <Download className="h-4 w-4 mr-2" />
                    CSVエクスポート
                  </Button>
                  <Button
                    onClick={() => (activeTab === "tax-categories" ? openTaxCategoryDialog() : openMappingDialog())}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    {activeTab === "tax-categories" ? "消費税区分を追加" : "関連付けを追加"}
                  </Button>
                </div>
              </div>

              <TabsContent value="tax-categories" className="mt-0">
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[120px]">コード</TableHead>
                        <TableHead className="w-[200px]">名称</TableHead>
                        <TableHead>説明</TableHead>
                        <TableHead className="w-[80px]">税率</TableHead>
                        <TableHead className="w-[100px]">軽減税率</TableHead>
                        <TableHead className="w-[100px]">課税対象</TableHead>
                        <TableHead className="w-[120px]">仕入税額控除</TableHead>
                        <TableHead className="text-right w-[120px]">操作</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredTaxCategories.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-4 text-gray-500">
                            消費税区分が見つかりません
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredTaxCategories.map((category) => (
                          <TableRow key={category.id}>
                            <TableCell className="font-medium">{category.code}</TableCell>
                            <TableCell>{category.name}</TableCell>
                            <TableCell className="max-w-xs truncate">{category.description}</TableCell>
                            <TableCell>{category.tax_rate}%</TableCell>
                            <TableCell>
                              <Badge
                                variant={category.is_reduced_tax ? "default" : "outline"}
                                className={
                                  category.is_reduced_tax ? "bg-amber-100 text-amber-800 hover:bg-amber-100" : ""
                                }
                              >
                                {category.is_reduced_tax ? "軽減税率" : "標準税率"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={category.is_taxable ? "default" : "outline"}
                                className={category.is_taxable ? "bg-green-100 text-green-800 hover:bg-green-100" : ""}
                              >
                                {category.is_taxable ? "課税" : "非課税"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={category.is_deductible ? "default" : "outline"}
                                className={category.is_deductible ? "bg-blue-100 text-blue-800 hover:bg-blue-100" : ""}
                              >
                                {category.is_deductible ? "控除対象" : "控除対象外"}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => openTaxCategoryDialog(category)}
                                  title="編集"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => confirmDelete(category, "category")}
                                  title="削除"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>

              <TabsContent value="mappings" className="mt-0">
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[120px]">勘定科目コード</TableHead>
                        <TableHead className="w-[200px]">勘定科目名</TableHead>
                        <TableHead>消費税区分</TableHead>
                        <TableHead className="w-[100px]">税率</TableHead>
                        <TableHead className="w-[120px]">デフォルト設定</TableHead>
                        <TableHead className="text-right w-[120px]">操作</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredKamokuTaxMappings.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-4 text-gray-500">
                            関連付けが見つかりません
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredKamokuTaxMappings.map((mapping) => (
                          <TableRow key={mapping.id}>
                            <TableCell className="font-medium">{mapping.kamoku_cd}</TableCell>
                            <TableCell>{mapping.kamoku_name}</TableCell>
                            <TableCell>
                              {mapping.tax_category?.name || <span className="text-gray-400">未設定</span>}
                            </TableCell>
                            <TableCell>{mapping.tax_category?.tax_rate || 0}%</TableCell>
                            <TableCell>
                              <Badge
                                variant={mapping.is_default ? "default" : "outline"}
                                className={
                                  mapping.is_default ? "bg-purple-100 text-purple-800 hover:bg-purple-100" : ""
                                }
                              >
                                {mapping.is_default ? "デフォルト" : "任意選択"}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => openMappingDialog(mapping)}
                                  title="編集"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => confirmDelete(mapping, "mapping")}
                                  title="削除"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* インボイス制度対応セクション */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>インボイス制度対応</CardTitle>
            <CardDescription>適格請求書発行事業者（インボイス制度）に関する設定を行います</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="invoice-issuer">適格請求書発行事業者</Label>
                  <p className="text-sm text-muted-foreground">
                    適格請求書（インボイス）を発行できる事業者として登録されている場合はオンにしてください
                  </p>
                </div>
                <Switch id="invoice-issuer" defaultChecked />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="invoice-number" className="mb-1 block">
                    登録番号
                  </Label>
                  <Input id="invoice-number" placeholder="T1234567890123" defaultValue="T1234567890123" />
                  <p className="text-xs text-gray-500 mt-1">適格請求書発行事業者の登録番号を入力してください</p>
                </div>

                <div>
                  <Label htmlFor="invoice-start-date" className="mb-1 block">
                    登録開始日
                  </Label>
                  <Input id="invoice-start-date" type="date" defaultValue="2023-10-01" />
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-md border border-blue-200">
                <h3 className="font-medium mb-2">インボイス制度対応の設定</h3>
                <div className="space-y-2">
                  <div className="flex items-start">
                    <Checkbox id="invoice-setting-1" className="mt-1" defaultChecked />
                    <Label htmlFor="invoice-setting-1" className="ml-2">
                      <span className="font-medium">請求書に登録番号を自動表示</span>
                      <p className="text-sm text-gray-600">
                        請求書や見積書に適格請求書発行事業者の登録番号を自動的に表示します
                      </p>
                    </Label>
                  </div>
                  <div className="flex items-start">
                    <Checkbox id="invoice-setting-2" className="mt-1" defaultChecked />
                    <Label htmlFor="invoice-setting-2" className="ml-2">
                      <span className="font-medium">税率ごとに消費税額を表示</span>
                      <p className="text-sm text-gray-600">請求書に税率ごとに区分した消費税額を表示します</p>
                    </Label>
                  </div>
                  <div className="flex items-start">
                    <Checkbox id="invoice-setting-3" className="mt-1" defaultChecked />
                    <Label htmlFor="invoice-setting-3" className="ml-2">
                      <span className="font-medium">軽減税率対象品目を明示</span>
                      <p className="text-sm text-gray-600">軽減税率対象の商品・サービスにその旨を明示します</p>
                    </Label>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 消費税申告設定セクション */}
        <Card>
          <CardHeader>
            <CardTitle>消費税申告設定</CardTitle>
            <CardDescription>消費税の申告に関する設定を行います</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <Label htmlFor="tax-calculation-method" className="mb-1 block">
                    消費税計算方式
                  </Label>
                  <Select defaultValue="invoice">
                    <SelectTrigger id="tax-calculation-method">
                      <SelectValue placeholder="計算方式を選択" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="invoice">請求書等保存方式</SelectItem>
                      <SelectItem value="account">帳簿方式</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="tax-filing-period" className="mb-1 block">
                    申告期間
                  </Label>
                  <Select defaultValue="yearly">
                    <SelectTrigger id="tax-filing-period">
                      <SelectValue placeholder="申告期間を選択" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yearly">年次（確定申告のみ）</SelectItem>
                      <SelectItem value="half-yearly">半期（中間申告あり）</SelectItem>
                      <SelectItem value="quarterly">四半期（中間申告あり）</SelectItem>
                      <SelectItem value="monthly">毎月（中間申告あり）</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="tax-payment-method" className="mb-1 block">
                    納付方法
                  </Label>
                  <Select defaultValue="cash">
                    <SelectTrigger id="tax-payment-method">
                      <SelectValue placeholder="納付方法を選択" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">現金納付</SelectItem>
                      <SelectItem value="bank-transfer">振替納税</SelectItem>
                      <SelectItem value="e-tax">電子納税</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="simplified-tax-system">簡易課税制度の適用</Label>
                  <p className="text-sm text-muted-foreground">簡易課税制度を適用している場合はオンにしてください</p>
                </div>
                <Switch id="simplified-tax-system" />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="tax-exempt">消費税免税事業者</Label>
                  <p className="text-sm text-muted-foreground">
                    消費税免税事業者（基準期間の課税売上高が1,000万円以下）の場合はオンにしてください
                  </p>
                </div>
                <Switch id="tax-exempt" />
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* 消費税区分追加/編集ダイアログ */}
      <Dialog open={showTaxCategoryDialog} onOpenChange={setShowTaxCategoryDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{isEditing ? "消費税区分を編集" : "消費税区分を追加"}</DialogTitle>
            <DialogDescription>消費税区分の情報を入力してください。</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="tax-code" className="text-right">
                コード <span className="text-red-500">*</span>
              </Label>
              <Input
                id="tax-code"
                value={currentTaxCategory?.code || ""}
                onChange={(e) => setCurrentTaxCategory((prev) => (prev ? { ...prev, code: e.target.value } : null))}
                className="col-span-3"
                placeholder="例: TAXABLE_10"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="tax-name" className="text-right">
                名称 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="tax-name"
                value={currentTaxCategory?.name || ""}
                onChange={(e) => setCurrentTaxCategory((prev) => (prev ? { ...prev, name: e.target.value } : null))}
                className="col-span-3"
                placeholder="例: 課税（標準税率10%）"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="tax-rate" className="text-right">
                税率 (%)
              </Label>
              <Input
                id="tax-rate"
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={currentTaxCategory?.tax_rate || 0}
                onChange={(e) =>
                  setCurrentTaxCategory((prev) =>
                    prev ? { ...prev, tax_rate: Number.parseFloat(e.target.value) || 0 } : null,
                  )
                }
                className="col-span-3"
                placeholder="例: 10"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <div className="text-right">
                <Label>設定</Label>
              </div>
              <div className="col-span-3 space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="is-taxable"
                    checked={currentTaxCategory?.is_taxable || false}
                    onCheckedChange={(checked) =>
                      setCurrentTaxCategory((prev) => (prev ? { ...prev, is_taxable: checked as boolean } : null))
                    }
                  />
                  <Label htmlFor="is-taxable">課税対象</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="is-reduced-tax"
                    checked={currentTaxCategory?.is_reduced_tax || false}
                    onCheckedChange={(checked) =>
                      setCurrentTaxCategory((prev) => (prev ? { ...prev, is_reduced_tax: checked as boolean } : null))
                    }
                  />
                  <Label htmlFor="is-reduced-tax">軽減税率</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="is-deductible"
                    checked={currentTaxCategory?.is_deductible || false}
                    onCheckedChange={(checked) =>
                      setCurrentTaxCategory((prev) => (prev ? { ...prev, is_deductible: checked as boolean } : null))
                    }
                  />
                  <Label htmlFor="is-deductible">仕入税額控除対象</Label>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="tax-desc" className="text-right pt-2">
                説明
              </Label>
              <Textarea
                id="tax-desc"
                value={currentTaxCategory?.description || ""}
                onChange={(e) =>
                  setCurrentTaxCategory((prev) => (prev ? { ...prev, description: e.target.value } : null))
                }
                className="col-span-3"
                placeholder="消費税区分の説明を入力"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTaxCategoryDialog(false)}>
              キャンセル
            </Button>
            <Button onClick={saveTaxCategory}>{isEditing ? "更新" : "追加"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 関連付け追加/編集ダイアログ */}
      <Dialog open={showMappingDialog} onOpenChange={setShowMappingDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{isEditing ? "関連付けを編集" : "関連付けを追加"}</DialogTitle>
            <DialogDescription>勘定科目と消費税区分の関連付け情報を入力してください。</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="kamoku-cd" className="text-right">
                勘定科目 <span className="text-red-500">*</span>
              </Label>
              <Select
                value={currentMapping?.kamoku_cd || ""}
                onValueChange={(value) => setCurrentMapping((prev) => (prev ? { ...prev, kamoku_cd: value } : null))}
              >
                <SelectTrigger id="kamoku-cd" className="col-span-3">
                  <SelectValue placeholder="勘定科目を選択" />
                </SelectTrigger>
                <SelectContent>
                  {kamokuList.map((kamoku) => (
                    <SelectItem key={kamoku.kamoku_cd} value={kamoku.kamoku_cd}>
                      {kamoku.kamoku_full_name} ({kamoku.kamoku_cd})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="tax-category-id" className="text-right">
                消費税区分 <span className="text-red-500">*</span>
              </Label>
              <Select
                value={currentMapping?.tax_category_id || ""}
                onValueChange={(value) =>
                  setCurrentMapping((prev) => (prev ? { ...prev, tax_category_id: value } : null))
                }
              >
                <SelectTrigger id="tax-category-id" className="col-span-3">
                  <SelectValue placeholder="消費税区分を選択" />
                </SelectTrigger>
                <SelectContent>
                  {taxCategories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name} ({category.tax_rate}%)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <div className="text-right">
                <Label>設定</Label>
              </div>
              <div className="col-span-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="is-default"
                    checked={currentMapping?.is_default || false}
                    onCheckedChange={(checked) =>
                      setCurrentMapping((prev) => (prev ? { ...prev, is_default: checked as boolean } : null))
                    }
                  />
                  <Label htmlFor="is-default">デフォルト設定（この勘定科目のデフォルト消費税区分として設定）</Label>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowMappingDialog(false)}>
              キャンセル
            </Button>
            <Button onClick={saveMapping}>{isEditing ? "更新" : "追加"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 削除確認ダイアログ */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>削除の確認</DialogTitle>
            <DialogDescription>
              {activeTab === "tax-categories" && currentTaxCategory
                ? `消費税区分「${currentTaxCategory.name}（${currentTaxCategory.code}）」を削除しますか？関連する関連付けもすべて削除されます。`
                : currentMapping
                  ? `関連付け「${currentMapping.kamoku_name} - ${currentMapping.tax_category?.name}」を削除しますか？`
                  : "選択した項目を削除しますか？"}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              キャンセル
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              削除する
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
