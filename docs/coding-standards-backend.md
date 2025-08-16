# バックエンドコーディング標準

## アーキテクチャパターン

### レイヤー構成

- **Route層**: API エンドポイント定義、リクエスト/レスポンス処理
- **Service層**: ビジネスロジック、データベースアクセス（Prisma直接使用）

## API Route実装パターン

### 基本的なRoute実装

```typescript
import { listAccounts } from '@/lib/backend/services/masters/list-accounts'

export function listAccountsHandler(
  conn: Connection,
  { ctx }: { ctx: RouteContext },
) {
  return withTransaction(conn, async (tx) => {
    const { year: fiscalYear } = await ctx.params
    return await listAccounts(tx, { fiscalYear })
  })
}

export const GET = createApiRoute(listAccountsHandler)
```

**パターン**:

1. Handler関数を定義
2. `withTransaction`でトランザクション管理
3. Service層関数を呼び出し
4. `createApiRoute`でHTTPメソッドにバインド

### 複雑なCRUD Route実装

```typescript
import { createJournal } from '@/lib/backend/services/journal/create-journal'
import { validatePayrollLock } from '@/lib/backend/services/payroll/validate-payroll-lock'

export function createJournalHandler(
  conn: Connection,
  { ctx, request }: { ctx: RouteContext; request: Request },
) {
  return withTransaction(conn, async (tx) => {
    const { year: fiscalYear } = await ctx.params
    const body = await request.json()

    // 1. ビジネスルール検証
    await validatePayrollLock(tx, fiscalYear, body.date)

    // 2. Service層呼び出し
    await createJournal(tx, {
      fiscalYear,
      ...body,
    })
  })
}

export const POST = createApiRoute(createJournalHandler)
```

## Service層実装パターン

### バリデーション付きService

```typescript
import { getSaimokuDetail } from '@/lib/backend/services/masters/get-saimoku-detail'
import { createJournalRequestSchema } from '@/lib/schemas/journal-validation'

export async function createJournal(
  conn: Connection,
  input: CreateJournalRequest,
): Promise<void> {
  // 1. スキーマバリデーション
  const validationResult =
    await createJournalRequestSchema.safeParseAsync(input)
  if (!validationResult.success) {
    throw new ApiError(
      'バリデーションエラー',
      'VALIDATION_ERROR',
      validationResult.error.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      })),
    )
  }

  // 2. ビジネスロジック検証
  const [debitDetail, creditDetail] = await Promise.all([
    getSaimokuDetail(conn, input.debitSaimokuCd),
    getSaimokuDetail(conn, input.creditSaimokuCd),
  ])

  // 3. データベース操作
  await conn.journals.create({
    data: {
      ...validationResult.data,
      // データ変換
    },
  })
}
```

## エラーハンドリング

### ApiError使用パターン

```typescript
// バリデーションエラー
throw new ApiError('バリデーションエラー', 'VALIDATION_ERROR', [
  { field: 'amount', message: '金額は必須です' },
])

// ビジネスルールエラー
throw new ApiError(
  '給与支払期間がロックされています',
  'PAYROLL_PERIOD_LOCKED',
  [{ field: 'date', message: '2024年1月の仕訳は編集できません' }],
)

// データ不整合エラー
throw new ApiError('細目コードが見つかりません', 'SAIMOKU_NOT_FOUND', [
  { field: 'saimokuCd', message: '指定された細目コードは存在しません' },
])
```

### エラータイプ定義

```typescript
type ApiErrorType =
  | 'VALIDATION_ERROR'
  | 'PAYROLL_PERIOD_LOCKED'
  | 'SAIMOKU_NOT_FOUND'
  | 'JOURNAL_NOT_FOUND'
  | 'AMOUNT_MISMATCH'
```

## レスポンス形式

### 成功レスポンス

```typescript
// データ取得
return NextResponse.json({
  success: true,
  data: result
})

// 作成/更新/削除
return NextResponse.json({
  success: true
})
```

### エラーレスポンス（自動処理）

```typescript
// withTransactionが自動的に処理
{
  "success": false,
  "error": {
    "type": "VALIDATION_ERROR",
    "message": "バリデーションエラー",
    "details": [
      {
        "field": "amount",
        "message": "金額は必須です"
      }
    ]
  }
}
```

## トランザクション管理

### withTransaction使用

```typescript
// 必ずwithTransactionを使用
return withTransaction(conn, async (tx) => {
  // 全てのDB操作をtx経由で実行
  const result = await someService(tx, params)
  return result
})
```

## 命名規則

### ファイル・関数命名

```typescript
// Route Handler: {動詞}{対象}Handler
export function createJournalHandler() {}
export function listJournalsHandler() {}
export function updateJournalHandler() {}
export function deleteJournalHandler() {}

// Service関数: {動詞}{対象}
export async function createJournal() {}
export async function listJournals() {}
export async function updateJournal() {}
export async function deleteJournal() {}
```

### パラメータ命名

```typescript
// Request型: {動詞}{対象}Request
type CreateJournalRequest = {}
type UpdateJournalRequest = {}

// Response型: {対象}Response（必要な場合のみ）
type JournalListResponse = {}
```

## 必須チェックリスト

- [ ] `withTransaction`でトランザクション管理
- [ ] Zodスキーマでバリデーション
- [ ] `ApiError`で構造化エラー
- [ ] Service層でビジネスロジック
- [ ] 適切な命名規則
- [ ] TypeScript型定義
- [ ] エラーハンドリング実装
