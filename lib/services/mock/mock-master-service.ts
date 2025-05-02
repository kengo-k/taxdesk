import type { MasterService, KamokuBunrui, Kamoku, Saimoku, TaxCategory, TaxMapping } from "../master-service"

export class MockMasterService implements MasterService {
  // 勘定科目分類のモックデータ
  private bunruiData: KamokuBunrui[] = [
    {
      id: "1",
      kamoku_bunrui_cd: "1",
      kamoku_bunrui_name: "資産",
      kamoku_bunrui_type: "A",
      kurikoshi_flg: "1",
      created_at: "2021-03-21 00:00:00",
      updated_at: "2021-03-21 00:00:00",
    },
    {
      id: "2",
      kamoku_bunrui_cd: "2",
      kamoku_bunrui_name: "負債",
      kamoku_bunrui_type: "L",
      kurikoshi_flg: "1",
      created_at: "2021-03-21 00:00:00",
      updated_at: "2021-03-21 00:00:00",
    },
    {
      id: "3",
      kamoku_bunrui_cd: "3",
      kamoku_bunrui_name: "純資産",
      kamoku_bunrui_type: "L",
      kurikoshi_flg: "1",
      created_at: "2021-03-21 00:00:00",
      updated_at: "2021-03-21 00:00:00",
    },
    {
      id: "4",
      kamoku_bunrui_cd: "4",
      kamoku_bunrui_name: "収益",
      kamoku_bunrui_type: "R",
      kurikoshi_flg: "0",
      created_at: "2021-03-21 00:00:00",
      updated_at: "2021-03-21 00:00:00",
    },
    {
      id: "5",
      kamoku_bunrui_cd: "5",
      kamoku_bunrui_name: "費用",
      kamoku_bunrui_type: "E",
      kurikoshi_flg: "0",
      created_at: "2021-03-21 00:00:00",
      updated_at: "2021-03-21 00:00:00",
    },
    {
      id: "6",
      kamoku_bunrui_cd: "6",
      kamoku_bunrui_name: "税金",
      kamoku_bunrui_type: "E",
      kurikoshi_flg: "0",
      created_at: "2021-03-21 00:00:00",
      updated_at: "2021-03-21 00:00:00",
    },
    {
      id: "9",
      kamoku_bunrui_cd: "Z",
      kamoku_bunrui_name: "その他",
      kamoku_bunrui_type: "Z",
      kurikoshi_flg: "0",
      created_at: "2021-03-21 00:00:00",
      updated_at: "2021-03-21 00:00:00",
    },
  ]

  // 勘定科目のモックデータ
  private kamokuData: Kamoku[] = [
    {
      id: "1",
      kamoku_cd: "101",
      kamoku_full_name: "現金",
      kamoku_ryaku_name: "現金",
      kamoku_kana_name: "genkin",
      kamoku_bunrui_cd: "1",
      description: "手元にある現金",
      created_at: "2021-03-21 00:00:00",
      updated_at: "2021-03-21 00:00:00",
    },
    {
      id: "2",
      kamoku_cd: "102",
      kamoku_full_name: "普通預金",
      kamoku_ryaku_name: "普通預金",
      kamoku_kana_name: "futsuuyokin",
      kamoku_bunrui_cd: "1",
      description: "銀行の普通預金口座の残高",
      created_at: "2021-03-21 00:00:00",
      updated_at: "2021-03-21 00:00:00",
    },
    {
      id: "3",
      kamoku_cd: "103",
      kamoku_full_name: "売掛金",
      kamoku_ryaku_name: "売掛金",
      kamoku_kana_name: "urikakekin",
      kamoku_bunrui_cd: "1",
      description: "商品・サービスを販売した際の未回収金額",
      created_at: "2021-03-21 00:00:00",
      updated_at: "2021-03-21 00:00:00",
    },
    {
      id: "4",
      kamoku_cd: "201",
      kamoku_full_name: "買掛金",
      kamoku_ryaku_name: "買掛金",
      kamoku_kana_name: "kaikakekin",
      kamoku_bunrui_cd: "2",
      description: "商品・サービスを仕入れた際の未払金額",
      created_at: "2021-03-21 00:00:00",
      updated_at: "2021-03-21 00:00:00",
    },
    {
      id: "5",
      kamoku_cd: "202",
      kamoku_full_name: "未払金",
      kamoku_ryaku_name: "未払金",
      kamoku_kana_name: "miharaikin",
      kamoku_bunrui_cd: "2",
      description: "商品・サービス以外の未払金額",
      created_at: "2021-03-21 00:00:00",
      updated_at: "2021-03-21 00:00:00",
    },
    {
      id: "6",
      kamoku_cd: "301",
      kamoku_full_name: "資本金",
      kamoku_ryaku_name: "資本金",
      kamoku_kana_name: "shihonkin",
      kamoku_bunrui_cd: "3",
      description: "会社設立時や増資時に出資された金額",
      created_at: "2021-03-21 00:00:00",
      updated_at: "2021-03-21 00:00:00",
    },
    {
      id: "7",
      kamoku_cd: "401",
      kamoku_full_name: "売上高",
      kamoku_ryaku_name: "売上",
      kamoku_kana_name: "uriage",
      kamoku_bunrui_cd: "4",
      description: "商品・サービスの販売による収入",
      created_at: "2021-03-21 00:00:00",
      updated_at: "2021-03-21 00:00:00",
    },
    {
      id: "8",
      kamoku_cd: "501",
      kamoku_full_name: "仕入高",
      kamoku_ryaku_name: "仕入",
      kamoku_kana_name: "shiire",
      kamoku_bunrui_cd: "5",
      description: "商品・サービスの仕入れによる支出",
      created_at: "2021-03-21 00:00:00",
      updated_at: "2021-03-21 00:00:00",
    },
  ]

  // 細目のモックデータ
  private saimokuData: Saimoku[] = [
    {
      id: "1",
      saimoku_cd: "10101",
      saimoku_full_name: "本店現金",
      saimoku_ryaku_name: "本店現金",
      saimoku_kana_name: "honten genkin",
      kamoku_cd: "101",
      description: "本店で管理している現金",
      created_at: "2021-03-21 00:00:00",
      updated_at: "2021-03-21 00:00:00",
    },
    {
      id: "2",
      saimoku_cd: "10201",
      saimoku_full_name: "みずほ銀行",
      saimoku_ryaku_name: "みずほ",
      saimoku_kana_name: "mizuho",
      kamoku_cd: "102",
      description: "みずほ銀行の普通預金口座",
      created_at: "2021-03-21 00:00:00",
      updated_at: "2021-03-21 00:00:00",
    },
    {
      id: "3",
      saimoku_cd: "10202",
      saimoku_full_name: "三菱UFJ銀行",
      saimoku_ryaku_name: "三菱UFJ",
      saimoku_kana_name: "mitsubishi",
      kamoku_cd: "102",
      description: "三菱UFJ銀行の普通預金口座",
      created_at: "2021-03-21 00:00:00",
      updated_at: "2021-03-21 00:00:00",
    },
  ]

  // 消費税カテゴリのモックデータ
  private taxCategoryData: TaxCategory[] = [
    {
      id: "1",
      category_cd: "01",
      category_name: "課税売上",
      tax_type: "1",
      tax_rate: "10",
      created_at: "2021-03-21 00:00:00",
      updated_at: "2021-03-21 00:00:00",
    },
    {
      id: "2",
      category_cd: "02",
      category_name: "軽減税率売上",
      tax_type: "1",
      tax_rate: "8",
      created_at: "2021-03-21 00:00:00",
      updated_at: "2021-03-21 00:00:00",
    },
    {
      id: "3",
      category_cd: "03",
      category_name: "課税仕入",
      tax_type: "2",
      tax_rate: "10",
      created_at: "2021-03-21 00:00:00",
      updated_at: "2021-03-21 00:00:00",
    },
    {
      id: "4",
      category_cd: "04",
      category_name: "軽減税率仕入",
      tax_type: "2",
      tax_rate: "8",
      created_at: "2021-03-21 00:00:00",
      updated_at: "2021-03-21 00:00:00",
    },
    {
      id: "5",
      category_cd: "05",
      category_name: "非課税売上",
      tax_type: "3",
      tax_rate: "0",
      created_at: "2021-03-21 00:00:00",
      updated_at: "2021-03-21 00:00:00",
    },
    {
      id: "6",
      category_cd: "06",
      category_name: "非課税仕入",
      tax_type: "4",
      tax_rate: "0",
      created_at: "2021-03-21 00:00:00",
      updated_at: "2021-03-21 00:00:00",
    },
  ]

  // 消費税マッピングのモックデータ
  private taxMappingData: TaxMapping[] = [
    {
      id: "1",
      kamoku_cd: "401",
      saimoku_cd: null,
      category_cd: "01",
      created_at: "2021-03-21 00:00:00",
      updated_at: "2021-03-21 00:00:00",
    },
    {
      id: "2",
      kamoku_cd: "501",
      saimoku_cd: null,
      category_cd: "03",
      created_at: "2021-03-21 00:00:00",
      updated_at: "2021-03-21 00:00:00",
    },
  ]

  // 勘定科目分類の取得
  async getKamokuBunrui(): Promise<KamokuBunrui[]> {
    return Promise.resolve([...this.bunruiData])
  }

  // 勘定科目の取得
  async getKamoku(): Promise<Kamoku[]> {
    return Promise.resolve([...this.kamokuData])
  }

  // 勘定科目の追加
  async addKamoku(kamoku: Omit<Kamoku, "id" | "created_at" | "updated_at">): Promise<Kamoku> {
    const newId = (Math.max(...this.kamokuData.map((k) => Number.parseInt(k.id))) + 1).toString()
    const now = new Date().toISOString().replace("T", " ").substring(0, 19)
    const newKamoku: Kamoku = {
      ...kamoku,
      id: newId,
      created_at: now,
      updated_at: now,
    }
    this.kamokuData.push(newKamoku)
    return Promise.resolve(newKamoku)
  }

  // 勘定科目の更新
  async updateKamoku(id: string, kamoku: Partial<Kamoku>): Promise<Kamoku> {
    const index = this.kamokuData.findIndex((k) => k.id === id)
    if (index === -1) {
      return Promise.reject(new Error("勘定科目が見つかりません"))
    }
    const now = new Date().toISOString().replace("T", " ").substring(0, 19)
    const updatedKamoku = {
      ...this.kamokuData[index],
      ...kamoku,
      updated_at: now,
    }
    this.kamokuData[index] = updatedKamoku
    return Promise.resolve(updatedKamoku)
  }

  // 勘定科目の削除
  async deleteKamoku(id: string): Promise<void> {
    const index = this.kamokuData.findIndex((k) => k.id === id)
    if (index === -1) {
      return Promise.reject(new Error("勘定科目が見つかりません"))
    }
    this.kamokuData.splice(index, 1)
    return Promise.resolve()
  }

  // 細目の取得
  async getSaimoku(): Promise<Saimoku[]> {
    return Promise.resolve([...this.saimokuData])
  }

  // 細目の追加
  async addSaimoku(saimoku: Omit<Saimoku, "id" | "created_at" | "updated_at">): Promise<Saimoku> {
    const newId = (Math.max(...this.saimokuData.map((s) => Number.parseInt(s.id))) + 1).toString()
    const now = new Date().toISOString().replace("T", " ").substring(0, 19)
    const newSaimoku: Saimoku = {
      ...saimoku,
      id: newId,
      created_at: now,
      updated_at: now,
    }
    this.saimokuData.push(newSaimoku)
    return Promise.resolve(newSaimoku)
  }

  // 細目の更新
  async updateSaimoku(id: string, saimoku: Partial<Saimoku>): Promise<Saimoku> {
    const index = this.saimokuData.findIndex((s) => s.id === id)
    if (index === -1) {
      return Promise.reject(new Error("細目が見つかりません"))
    }
    const now = new Date().toISOString().replace("T", " ").substring(0, 19)
    const updatedSaimoku = {
      ...this.saimokuData[index],
      ...saimoku,
      updated_at: now,
    }
    this.saimokuData[index] = updatedSaimoku
    return Promise.resolve(updatedSaimoku)
  }

  // 細目の削除
  async deleteSaimoku(id: string): Promise<void> {
    const index = this.saimokuData.findIndex((s) => s.id === id)
    if (index === -1) {
      return Promise.reject(new Error("細目が見つかりません"))
    }
    this.saimokuData.splice(index, 1)
    return Promise.resolve()
  }

  // 消費税カテゴリの取得
  async getTaxCategories(): Promise<TaxCategory[]> {
    return Promise.resolve([...this.taxCategoryData])
  }

  // 消費税カテゴリの追加
  async addTaxCategory(category: Omit<TaxCategory, "id" | "created_at" | "updated_at">): Promise<TaxCategory> {
    const newId = (Math.max(...this.taxCategoryData.map((c) => Number.parseInt(c.id))) + 1).toString()
    const now = new Date().toISOString().replace("T", " ").substring(0, 19)
    const newCategory: TaxCategory = {
      ...category,
      id: newId,
      created_at: now,
      updated_at: now,
    }
    this.taxCategoryData.push(newCategory)
    return Promise.resolve(newCategory)
  }

  // 消費税カテゴリの更新
  async updateTaxCategory(id: string, category: Partial<TaxCategory>): Promise<TaxCategory> {
    const index = this.taxCategoryData.findIndex((c) => c.id === id)
    if (index === -1) {
      return Promise.reject(new Error("消費税カテゴリが見つかりません"))
    }
    const now = new Date().toISOString().replace("T", " ").substring(0, 19)
    const updatedCategory = {
      ...this.taxCategoryData[index],
      ...category,
      updated_at: now,
    }
    this.taxCategoryData[index] = updatedCategory
    return Promise.resolve(updatedCategory)
  }

  // 消費税カテゴリの削除
  async deleteTaxCategory(id: string): Promise<void> {
    const index = this.taxCategoryData.findIndex((c) => c.id === id)
    if (index === -1) {
      return Promise.reject(new Error("消費税カテゴリが見つかりません"))
    }
    this.taxCategoryData.splice(index, 1)
    return Promise.resolve()
  }

  // 消費税マッピングの取得
  async getTaxMappings(): Promise<TaxMapping[]> {
    return Promise.resolve([...this.taxMappingData])
  }

  // 消費税マッピングの追加
  async addTaxMapping(mapping: Omit<TaxMapping, "id" | "created_at" | "updated_at">): Promise<TaxMapping> {
    const newId = (Math.max(...this.taxMappingData.map((m) => Number.parseInt(m.id))) + 1).toString()
    const now = new Date().toISOString().replace("T", " ").substring(0, 19)
    const newMapping: TaxMapping = {
      ...mapping,
      id: newId,
      created_at: now,
      updated_at: now,
    }
    this.taxMappingData.push(newMapping)
    return Promise.resolve(newMapping)
  }

  // 消費税マッピングの更新
  async updateTaxMapping(id: string, mapping: Partial<TaxMapping>): Promise<TaxMapping> {
    const index = this.taxMappingData.findIndex((m) => m.id === id)
    if (index === -1) {
      return Promise.reject(new Error("消費税マッピングが見つかりません"))
    }
    const now = new Date().toISOString().replace("T", " ").substring(0, 19)
    const updatedMapping = {
      ...this.taxMappingData[index],
      ...mapping,
      updated_at: now,
    }
    this.taxMappingData[index] = updatedMapping
    return Promise.resolve(updatedMapping)
  }

  // 消費税マッピングの削除
  async deleteTaxMapping(id: string): Promise<void> {
    const index = this.taxMappingData.findIndex((m) => m.id === id)
    if (index === -1) {
      return Promise.reject(new Error("消費税マッピングが見つかりません"))
    }
    this.taxMappingData.splice(index, 1)
    return Promise.resolve()
  }
}
