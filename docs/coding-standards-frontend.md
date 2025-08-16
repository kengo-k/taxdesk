# フロントエンドコーディング標準

## アーキテクチャパターン

### 構成要素とディレクトリ構成

**Pages** - Next.js App Router のページコンポーネント

```
app/
├── (feature-name)/
│   ├── page.tsx           # ページコンポーネント
│   ├── loading.tsx        # ローディングコンポーネント
│   └── components/        # ページ固有コンポーネント
├── layout.tsx             # レイアウトコンポーネント
└── globals.css            # グローバルスタイル
```

**Components** - 再利用可能なUIコンポーネント

```
components/
├── ui/                    # shadcn/ui コンポーネント
│   ├── button.tsx
│   ├── dialog.tsx
│   └── ...
├── header.tsx             # アプリケーション共通コンポーネント
├── sidebar.tsx
└── ...
```

**Client Library** - フロントエンド固有のロジック

```
lib/client/
├── hooks/                 # カスタムReactフック
│   ├── use-mobile.tsx
│   └── use-toast.ts
├── utils/                 # ユーティリティ関数
│   ├── formatting.ts
│   ├── pagination.ts
│   └── ...
└── tax-calculation/       # ドメイン固有ロジック
```

**Redux** - 状態管理（RTK）

```
lib/redux/
├── features/              # Redux Toolkit slices
│   ├── journalSlice.ts
│   ├── ledgerSlice.ts
│   └── ...
├── hooks.ts               # 型付きReduxフック
├── provider.tsx           # Redux Provider
└── store.ts               # Store設定
```

**Types & Validation** - 型定義とバリデーション

```
lib/
├── types.ts               # 共通型定義
├── schemas/               # Zodバリデーションスキーマ
│   ├── journal-validation.ts
│   └── ...
├── constants/             # 定数定義
└── contexts/              # React Context
```

## エラーハンドリング

### 基本方針

1. **try-catch**: 明確な理由がある場合のみ使用（自然なエラー伝播を優先）
2. **APIエラー**: `rejectWithValue()`で処理
3. **例外投げ**: ビジネスロジックでは`throw`しない
4. **Toast通知**: エラー表示の統一

### Redux Slice

```typescript
export const fetchData = createAsyncThunk(
  'slice/fetchData',
  async (params, { rejectWithValue }) => {
    const response = await fetch('/api/data')

    if (!response.ok) {
      const errorData = await response.json()
      return rejectWithValue(errorData.message)
    }

    return await response.json()
  },
)
```

### dispatch戻り値の処理

#### 基本パターン（推奨）

Redux stateでエラー・ローディング状態を管理

```typescript
// dispatch - Redux stateで状態監視
dispatch(fetchData(params))

// UIでエラー表示
const { data, loading, error } = useAppSelector(selectData)
if (error) {
  toast({ title: 'エラー', description: error, variant: 'destructive' })
}
```

#### 例外パターン（限定的）

成功時のみ実行したい処理がある場合

```typescript
// 成功時のみ画面遷移・モーダル制御・フォームリセット・連続処理
const result = await dispatch(saveData(data))
if (saveData.fulfilled.match(result)) {
  toast({ title: '保存完了' })
  router.push('/list') // 成功時のみ遷移
} else {
  toast({
    title: '保存エラー',
    description: result.payload,
    variant: 'destructive',
  })
}
```

**判断基準**: 「成功した場合にのみ実行したい処理があるか？」

- Yes → 戻り値を取る
- No → Redux stateに任せる

### 状態管理

#### Redux Store使用基準

**Redux Storeに配置すべきデータ:**

1. **アプリケーション全体の状態**: 認証情報、ユーザー設定、選択された年度
2. **複数画面で共有するデータ**: マスターデータ（勘定科目、年度）、キャッシュされたAPIレスポンス
3. **画面横断ナビゲーションデータ**: 検索条件、ナビゲーション状態の保持
4. **検索・ページネーション状態**: 詳細画面から戻る際に検索条件やページ位置を復元する必要がある取引一覧

#### Local State使用基準

**Component内のuseStateで管理すべきデータ:**

1. **画面固有のUI状態**: フォーム入力データ、モーダルの開閉状態、コンポーネント固有のローディング状態
2. **一時的な計算結果**: バリデーション結果、フィルタリング結果

#### 実装例

```typescript
// Redux Store - アプリケーション全体で共有
const fiscalYear = useAppSelector((state) => state.master.selectedFiscalYear)

// Redux Store - 画面横断での検索条件保持
const { journals, searchConditions } = useAppSelector((state) => state.journal)

// Local State - フォーム入力データ
const [formData, setFormData] = useState({
  date: '',
  amount: '',
  note: '',
})

// Local State - モーダル状態
const [isDialogOpen, setIsDialogOpen] = useState(false)
```

#### 新規API呼び出しの実装手順

**参考**: `/lib/redux/features/masterSlice.ts`

**1. Stateの型定義**

```typescript
interface MasterState {
  fiscalYears: FiscalYear[]
  fiscalYearsLoading: boolean
  fiscalYearsError: string | null
}
```

**2. 非同期アクションの定義**

```typescript
export const fetchFiscalYears = createAsyncThunk<{ data: FiscalYear[] }, void>(
  'master/fetchFiscalYears',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/master/fiscal-years')
      if (!response.ok) {
        throw new Error(`APIエラー: ${response.status}`)
      }
      return await response.json()
    } catch (error) {
      return rejectWithValue(
        error instanceof Error
          ? error.message
          : '年度一覧の取得中にエラーが発生しました',
      )
    }
  },
)
```

**3. extraReducersでの状態管理**

```typescript
extraReducers: (builder) => {
  builder
    .addCase(fetchFiscalYears.pending, (state) => {
      state.fiscalYearsLoading = true
      state.fiscalYearsError = null
    })
    .addCase(fetchFiscalYears.fulfilled, (state, action) => {
      state.fiscalYearsLoading = false
      state.fiscalYears = action.payload.data
    })
    .addCase(fetchFiscalYears.rejected, (state, action) => {
      state.fiscalYearsLoading = false
      state.fiscalYearsError = action.payload as string
    })
}
```

**4. コンポーネントでの使用**

```typescript
import {
  fetchFiscalYears,
  selectFiscalYears,
} from '@/lib/redux/features/masterSlice'
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks'

const dispatch = useAppDispatch()
const { fiscalYears, fiscalYearsLoading, fiscalYearsError } =
  useAppSelector(selectFiscalYears)

useEffect(() => {
  dispatch(fetchFiscalYears())
}, [dispatch])
```

## エラーハンドリング

### Redux Sliceでのエラー処理

**参考**: `/lib/redux/features/journalSlice.ts`

```typescript
export const fetchJournals = createAsyncThunk<ResponseType, ParamsType>(
  'journal/fetchJournals',
  async (params: ParamsType, { rejectWithValue }) => {
    try {
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`APIエラー: ${response.status}`)
      }
      return await response.json()
    } catch (error) {
      return rejectWithValue(
        error instanceof Error
          ? error.message
          : '仕訳データの取得中にエラーが発生しました',
      )
    }
  },
)

// State管理
interface State {
  loading: boolean
  error: string | null
}

// extraReducers
.addCase(fetchJournals.pending, (state) => {
  state.loading = true
  state.error = null
})
.addCase(fetchJournals.rejected, (state, action) => {
  state.loading = false
  state.error = action.payload as string
})
```

### Toastによるエラー表示

**参考**: `/components/ui/use-toast.ts`

```typescript
import { toast } from '@/components/ui/use-toast'

// 成功時
toast({
  title: '仕訳登録完了',
  description: '仕訳データが正常に更新されました',
  variant: 'default',
})

// エラー時
toast({
  title: '仕訳登録エラー',
  description: errorMessage,
  variant: 'destructive',
})
```

### コンポーネントでのエラー処理

**参考**: `/app/journal-entry/page.tsx`

```typescript
try {
  const result = await dispatch(createJournal(updateData))

  if (createJournal.fulfilled.match(result)) {
    toast({
      title: '仕訳登録完了',
      description: '仕訳データが正常に更新されました',
    })
  } else {
    const errorMessage = result.payload as string
    toast({
      title: '仕訳登録エラー',
      description: errorMessage,
      variant: 'destructive',
    })
  }
} catch (error) {
  console.error('仕訳登録エラー:', error)
  toast({
    title: '仕訳登録エラー',
    description: '予期しないエラーが発生しました',
    variant: 'destructive',
  })
}
```

### フォームバリデーション

**参考**: `/lib/schemas/journal-validation.ts`

```typescript
// Zodスキーマベースのバリデーション
export function validateJournalField(
  field: string,
  value: any,
  rowData?: Record<string, any>
): { valid: boolean; message?: string }

// エラー表示UI
{showErrorSummary && (
  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded">
    <div className="flex items-center gap-2 mb-2">
      <AlertCircle className="h-4 w-4 text-red-600" />
      <span className="font-medium text-red-800">
        入力エラーがあります
      </span>
    </div>
    {/* エラー詳細 */}
  </div>
)}
```
