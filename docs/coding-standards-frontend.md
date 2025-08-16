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

## React実装パターン

### コンポーネント設計

**参考**: `/app/master/page.tsx`

**1. Page Component構造**

```typescript
'use client'

export default function MasterManagementPage() {
  // 状態管理
  const [activeTab, setActiveTab] = useState('kamoku')
  const [searchTerm, setSearchTerm] = useState('')

  // Redux状態の取得
  const dispatch = useAppDispatch()
  const { data, loading, error } = useAppSelector(selectData)

  // Effect処理
  useEffect(() => {
    // 初期データ読み込み
  }, [])

  // イベントハンドラ
  const handleSave = () => {
    // 保存処理
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {/* JSX */}
    </div>
  )
}
```

**2. Dialog/Modal Component設計**

```typescript
interface DialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  isEditing: boolean
  currentData: DataType | null
  onSave: () => void
  onChange: (field: keyof DataType, value: string) => void
}

export function DataDialog({
  open,
  onOpenChange,
  isEditing,
  currentData,
  onSave,
  onChange
}: DialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        {/* フォーム内容 */}
      </DialogContent>
    </Dialog>
  )
}
```

**3. Tab Component設計**

```typescript
interface TabProps {
  dataList: DataType[]
  onOpenDialog: (data?: DataType) => void
  onConfirmDelete: (data: DataType, type: string) => void
}

export function DataTab({ dataList, onOpenDialog, onConfirmDelete }: TabProps) {
  return (
    <div>
      {/* テーブル表示 */}
    </div>
  )
}
```

### Hooks使用

**1. Custom Hooks**

```typescript
// 参考: /lib/client/hooks/use-mobile.tsx
export function useMobile() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkDevice = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkDevice()
    window.addEventListener('resize', checkDevice)

    return () => window.removeEventListener('resize', checkDevice)
  }, [])

  return isMobile
}
```

**2. Redux Hooks**

```typescript
// /lib/redux/hooks.ts で型付きフックを定義
import { useDispatch, useSelector } from 'react-redux'

import type { AppDispatch, RootState } from './store'

export const useAppDispatch = useDispatch.withTypes<AppDispatch>()
export const useAppSelector = useSelector.withTypes<RootState>()
```

**3. Form Hooks (react-hook-form)**

```typescript
import { useForm } from 'react-hook-form'

import { zodResolver } from '@hookform/resolvers/zod'

const form = useForm<FormData>({
  resolver: zodResolver(formSchema),
  defaultValues: {
    name: '',
    email: '',
  },
})
```

## TypeScript実装パターン

### 型定義

**参考**: `/lib/types.ts`, `/app/master/types.ts`

**1. Interface定義**

```typescript
// 基本的なエンティティ型
export interface Kamoku {
  id: string
  kamoku_cd: string
  kamoku_full_name: string
  kamoku_ryaku_name: string
  kamoku_kana_name: string
  kamoku_bunrui_cd: string
  description?: string
  created_at: string
  updated_at: string
  bunrui?: any
  saimokuList?: Saimoku[]
}

// Props型定義
interface ComponentProps {
  data: DataType[]
  onSave: (data: DataType) => void
  onChange: (field: keyof DataType, value: string) => void
}
```

**2. Union Types**

```typescript
export type DeleteType = 'kamoku' | 'saimoku' | 'tax-category' | 'mapping'
export type ToastVariant = 'default' | 'destructive'
```

**3. Generic Types**

```typescript
interface ApiResponse<T> {
  data: T
  message?: string
}

interface AsyncState<T> {
  data: T[]
  loading: boolean
  error: string | null
}
```

### Event Handler型定義

```typescript
// フォームイベント
const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  // 処理
}

// クリックイベント
const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
  // 処理
}

// カスタムハンドラ
const handleSave = () => void
const onChange = (field: keyof DataType, value: string) => void
```

### 条件型とユーティリティ型

```typescript
// 必須フィールドのみの型
type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>

// 更新用の型（IDと作成日時を除外）
type UpdateData<T> = Omit<T, 'id' | 'created_at' | 'updated_at'>

// 部分的な更新用の型
type PartialUpdate<T> = Partial<T> & { id: string }
```

## スタイリング

### Tailwind CSS クラス使用

**参考**: `/app/master/page.tsx`, `/components/ui/alert.tsx`

**1. レイアウトクラス**

```typescript
// コンテナとスペーシング
<div className="container mx-auto px-4 py-6">
<div className="mb-6 flex items-center">

// グリッドレイアウト
<div className="grid gap-4">
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
```

**2. shadcn/ui コンポーネント使用**

```typescript
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

// バリアント使用
<Button variant="destructive" size="sm">
<Alert variant="destructive">
```

**3. 条件付きスタイリング**

```typescript
import { cn } from '@/lib/client/utils'

// 条件付きクラス適用
<div className={cn(
  'base-classes',
  isActive && 'active-classes',
  error && 'error-classes'
)}>

// バリアント管理
const alertVariants = cva(
  'base-classes',
  {
    variants: {
      variant: {
        default: 'default-classes',
        destructive: 'destructive-classes',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)
```

**4. レスポンシブデザイン**

```typescript
// ブレークポイント使用
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
<Button className="w-full md:w-auto">

// モバイル対応
const isMobile = useMobile()

return (
  <div className={cn(
    'flex',
    isMobile ? 'flex-col' : 'flex-row'
  )}>
)
```

## パフォーマンス最適化

### React.memo使用

```typescript
export const MemoizedComponent = React.memo(function Component({ data }: Props) {
  return <div>{data.name}</div>
})

// 比較関数付き
export const ComplexComponent = React.memo(
  function Component(props) {
    // コンポーネント
  },
  (prevProps, nextProps) => {
    return prevProps.id === nextProps.id
  }
)
```

### useMemo / useCallback使用

```typescript
// 計算結果のメモ化
const filteredData = useMemo(() => {
  return data.filter((item) => item.active)
}, [data])

// 関数のメモ化
const handleSave = useCallback((id: string) => {
  // 保存処理
}, [])
```

### 動的インポート

```typescript
// コンポーネントの遅延読み込み
const LazyComponent = lazy(() => import('./HeavyComponent'))

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LazyComponent />
    </Suspense>
  )
}
```

## エラーハンドリング指針

### 現在の実装状況と改善方針

#### ✅ 現在の強み

- Redux sliceでの基本的なエラー処理
- Toast通知による統一的なエラー表示
- Zodスキーマを使った包括的フォームバリデーション

#### ❌ 改善が必要な領域

- React Error Boundaryの未実装
- Redux エラーハンドリングの不統一
- グローバルエラーハンドリングの欠如

### React Error Boundary実装【新規】

#### グローバルエラーバウンダリ

```typescript
// /components/error-boundary.tsx
interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

export class GlobalErrorBoundary extends React.Component<
  React.PropsWithChildren<{}>,
  ErrorBoundaryState
> {
  constructor(props: React.PropsWithChildren<{}>) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('React Error Boundary:', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
    })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <AlertCircle className="h-5 w-5" />
                システムエラー
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">
                予期しないエラーが発生しました。ページを更新してお試しください。
              </p>
              <div className="flex gap-2">
                <Button onClick={() => window.location.reload()}>
                  ページを更新
                </Button>
                <Button
                  onClick={() => window.location.href = '/'}
                  variant="outline"
                >
                  ホームに戻る
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}
```

#### 機能別エラーバウンダリ

```typescript
// /components/feature-error-boundary.tsx
interface FeatureErrorBoundaryProps {
  feature: string
  fallback?: React.ReactNode
}

export function FeatureErrorBoundary({
  feature,
  fallback,
  children
}: React.PropsWithChildren<FeatureErrorBoundaryProps>) {
  return (
    <ErrorBoundary
      fallback={fallback || (
        <Alert variant="destructive" className="m-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>{feature}でエラーが発生しました</AlertTitle>
          <AlertDescription>
            ページを更新するか、しばらく時間をおいてお試しください。
          </AlertDescription>
        </Alert>
      )}
      onError={(error, errorInfo) => {
        console.error(`Feature Error: ${feature}`, {
          error: error.message,
          componentStack: errorInfo.componentStack,
        })
      }}
    >
      {children}
    </ErrorBoundary>
  )
}

// 使用例
<FeatureErrorBoundary feature="仕訳入力">
  <JournalEntryForm />
</FeatureErrorBoundary>
```

### Redux エラーハンドリング統一【改善】

#### エラー処理ユーティリティ

```typescript
// /lib/redux/error-utils.ts
export interface ApiErrorResponse {
  error: true
  message: string
  code: string
  details?: Array<{
    field?: string
    code: string
    message: string
  }>
}

export function extractErrorMessage(error: unknown): string {
  // API error response
  if (error && typeof error === 'object' && 'message' in error) {
    return (error as ApiErrorResponse).message
  }

  // Network error
  if (error instanceof Error) {
    if (error.message.includes('fetch')) {
      return 'ネットワークエラーが発生しました。接続を確認してください。'
    }
    return error.message
  }

  return '予期しないエラーが発生しました'
}

export function isRetryableError(error: unknown): boolean {
  if (error && typeof error === 'object' && 'code' in error) {
    const apiError = error as ApiErrorResponse
    return ['INTERNAL', 'SERVICE_UNAVAILABLE'].includes(apiError.code)
  }

  if (error instanceof Error) {
    return error.message.includes('fetch') || error.message.includes('network')
  }

  return false
}
```

#### 統一asyncThunkパターン

```typescript
// 改善されたRedux slice パターン
export const fetchJournals = createAsyncThunk<
  ApiSuccessResponse<Journal[]>,
  FetchJournalsParams,
  { rejectValue: string }
>(
  'journal/fetchJournals',
  async (params, { rejectWithValue }) => {
    try {
      const response = await fetch(buildApiUrl('/api/journals', params))

      if (!response.ok) {
        const errorData = await response.json()
        return rejectWithValue(extractErrorMessage(errorData))
      }

      return await response.json()
    } catch (error) {
      console.error('Journal fetch error:', error)
      return rejectWithValue(extractErrorMessage(error))
    }
  }
)

// 統一エラー状態管理
interface AsyncState<T> {
  data: T[]
  loading: boolean
  error: string | null
  retryCount: number
}

// 統一extraReducers
.addCase(fetchJournals.pending, (state) => {
  state.loading = true
  state.error = null
})
.addCase(fetchJournals.fulfilled, (state, action) => {
  state.loading = false
  state.data = action.payload.data
  state.retryCount = 0
})
.addCase(fetchJournals.rejected, (state, action) => {
  state.loading = false
  state.error = action.payload || 'データの取得に失敗しました'
  state.retryCount += 1
})
```

### コンポーネントレベルエラーハンドリング統一

#### エラーハンドリングフック

```typescript
// /lib/client/hooks/use-error-handler.ts
export function useErrorHandler() {
  const showErrorToast = (error: unknown, title?: string) => {
    const message = extractErrorMessage(error)

    toast({
      title: title || 'エラーが発生しました',
      description: message,
      variant: 'destructive',
    })
  }

  const handleAsyncOperation = async <T>(
    asyncFn: () => Promise<T>,
    options?: {
      title?: string
      onSuccess?: (result: T) => void
      onError?: (error: unknown) => void
      showToast?: boolean
    },
  ): Promise<T | null> => {
    try {
      const result = await asyncFn()
      options?.onSuccess?.(result)
      return result
    } catch (error) {
      if (options?.showToast !== false) {
        showErrorToast(error, options?.title)
      }

      options?.onError?.(error)
      console.error('Async operation failed:', error)

      return null
    }
  }

  return { showErrorToast, handleAsyncOperation }
}
```

#### 統一保存処理パターン

```typescript
// 理想的なコンポーネント保存処理
const SaveComponent = () => {
  const dispatch = useAppDispatch()
  const { handleAsyncOperation } = useErrorHandler()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSave = async (data: FormData) => {
    setIsSubmitting(true)

    const result = await handleAsyncOperation(
      async () => {
        const result = await dispatch(saveJournal(data))

        if (saveJournal.fulfilled.match(result)) {
          toast({
            title: '保存完了',
            description: '仕訳データが正常に保存されました',
          })
          return result.payload
        } else {
          throw new Error(result.payload)
        }
      },
      {
        title: '保存エラー',
        onError: () => setIsSubmitting(false)
      }
    )

    if (result) {
      router.push('/journals')
    }

    setIsSubmitting(false)
  }

  return (
    <Button
      onClick={() => handleSave(formData)}
      disabled={isSubmitting}
    >
      {isSubmitting ? '保存中...' : '保存'}
    </Button>
  )
}
```

### フォームバリデーションエラー表示統一

#### 統一バリデーションエラーコンポーネント

```typescript
// /components/form/validation-error-display.tsx
interface ValidationError {
  field?: string
  code: string
  message: string
}

interface ValidationErrorDisplayProps {
  errors: ValidationError[]
  className?: string
}

export function ValidationErrorDisplay({
  errors,
  className
}: ValidationErrorDisplayProps) {
  if (errors.length === 0) return null

  const fieldErrors = errors.filter(e => e.field)
  const generalErrors = errors.filter(e => !e.field)

  return (
    <Alert variant="destructive" className={className}>
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>入力エラーがあります</AlertTitle>
      <AlertDescription>
        <div className="space-y-2 mt-2">
          {generalErrors.map((error, index) => (
            <div key={index} className="text-sm">
              {error.message}
            </div>
          ))}

          {fieldErrors.length > 0 && (
            <ul className="list-disc list-inside text-sm space-y-1">
              {fieldErrors.map((error, index) => (
                <li key={index}>
                  <span className="font-medium">{error.field}:</span>{' '}
                  {error.message}
                </li>
              ))}
            </ul>
          )}
        </div>
      </AlertDescription>
    </Alert>
  )
}
```

### グローバルエラーハンドリング設定【新規】

#### アプリケーション初期化時の設定

```typescript
// /app/layout.tsx または /lib/client/error-setup.ts
export function setupGlobalErrorHandling() {
  // 未処理のJavaScriptエラー
  window.onerror = (message, source, lineno, colno, error) => {
    console.error('Global JavaScript Error:', {
      message,
      source,
      lineno,
      colno,
      stack: error?.stack,
    })

    return false
  }

  // 未処理のPromise reject
  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled Promise Rejection:', {
      reason: event.reason,
      stack: event.reason?.stack,
    })

    // 重要なエラーの場合はユーザーに通知
    if (typeof event.reason === 'object' && event.reason?.severity === 'critical') {
      toast({
        title: 'システムエラー',
        description: '予期しないエラーが発生しました',
        variant: 'destructive',
      })
    }
  })
}

// ルートレイアウトで初期化
export default function RootLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    setupGlobalErrorHandling()
  }, [])

  return (
    <html>
      <body>
        <GlobalErrorBoundary>
          {children}
        </GlobalErrorBoundary>
      </body>
    </html>
  )
}
```

### 自動リトライ機能【新規】

```typescript
// /lib/client/retry-utils.ts
interface RetryConfig {
  maxAttempts: number
  baseDelay: number
  maxDelay: number
  retryCondition?: (error: unknown) => boolean
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  config: Partial<RetryConfig> = {},
): Promise<T> {
  const {
    maxAttempts = 3,
    baseDelay = 1000,
    maxDelay = 5000,
    retryCondition = isRetryableError,
  } = config

  let lastError: unknown

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error

      if (attempt === maxAttempts || !retryCondition(error)) {
        throw error
      }

      const delay = Math.min(baseDelay * Math.pow(2, attempt - 1), maxDelay)
      await new Promise((resolve) => setTimeout(resolve, delay))
    }
  }

  throw lastError
}

// Redux slice での使用例
export const fetchJournalsWithRetry = createAsyncThunk(
  'journal/fetchJournalsWithRetry',
  async (params: FetchJournalsParams, { rejectWithValue }) => {
    try {
      return await withRetry(
        async () => {
          const response = await fetch(buildApiUrl('/api/journals', params))
          if (!response.ok) {
            const errorData = await response.json()
            throw errorData
          }
          return await response.json()
        },
        { maxAttempts: 3 },
      )
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error))
    }
  },
)
```

### 実装優先度

#### 高優先度（即時実装推奨）

1. **React Error Boundary** - GlobalErrorBoundaryの実装
2. **Redux エラーハンドリング統一** - extractErrorMessage等のユーティリティ作成
3. **統一エラーハンドリングフック** - useErrorHandler実装

#### 中優先度（段階的実装）

4. **グローバルエラーハンドラ** - window.onerror等の設定
5. **自動リトライ機能** - withRetry関数の実装
6. **統一バリデーションエラー表示** - ValidationErrorDisplayコンポーネント

#### 導入手順

1. **Phase 1**: Error Boundary実装とReduxエラー統一
2. **Phase 2**: グローバルエラーハンドラとリトライ機能
3. **Phase 3**: バリデーションエラー表示統一と機能拡張

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
