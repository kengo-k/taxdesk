# バックエンドコーディング標準

## アーキテクチャパターン

### レイヤー構成

- **Route層**: API エンドポイント定義、リクエスト/レスポンス処理
- **Service層**: ビジネスロジック、データベースアクセス（Prisma直接使用）

## API Route実装パターン

**重要**:

- DBアクセスする際は必ず`withTransaction`を使用してトランザクション管理を行う
- Handler関数を`createApiRoute`に渡してHTTPメソッドを定義する
- Prismaを使用して直接DBにアクセスしてはいけない。必ずService層を経由すること

### 基本的なRoute実装

**参考**: `/app/api/master/fiscal-years/route.ts`

```typescript
export function getFiscalYearsHandler(conn: Connection) {
  return withTransaction(conn, async (tx) => {
    return await getFiscalYears(tx)
  })
}

export const GET = createApiRoute(getFiscalYearsHandler)
```

### URL変数・クエリパラメータ・リクエストボディ処理

**参考**: `/app/api/fiscal-years/[year]/ledger/[ledger_cd]/route.ts`

```typescript
export function listLedgersHandler(
  conn: Connection,
  { req, ctx }: { req: NextRequest; ctx: RouteContext },
) {
  return withTransaction(conn, async (tx) => {
    // 1. URL埋め込み変数の取得
    const { year: fiscal_year, ledger_cd } = await ctx.params

    // 2. URLクエリパラメータの取得
    const searchParams = req.nextUrl.searchParams
    const month = searchParams.get('month')
    const checked = searchParams.get('checked')
    const pageno = searchParams.get('pageno')
    const pagesize = searchParams.get('pagesize')

    // 3. Service層呼び出し
    const ledgers = await listLedgers(
      tx,
      {
        fiscal_year,
        ledger_cd,
        month: month || null,
        checked: checked || null,
      },
      {
        pageNo: pageno ? Number.parseInt(pageno, 10) : 1,
        pageSize: pagesize ? Number.parseInt(pagesize, 10) : 10,
      },
    )
    return ledgers
  })
}

export function createLedgerHandler(
  conn: Connection,
  { req, ctx }: { req: NextRequest; ctx: RouteContext },
) {
  return withTransaction(conn, async (tx) => {
    // 1. URL埋め込み変数の取得
    const { year: nendo, ledger_cd } = await ctx.params

    // 2. リクエストボディの取得
    const requestData = await req.json()

    // 3. データの結合
    const createLedgerData = {
      nendo,
      ledger_cd,
      date: requestData.date,
      counter_cd: requestData.other_cd || requestData.counter_cd,
      karikata_value:
        requestData.karikata_value > 0 ? requestData.karikata_value : undefined,
      kasikata_value:
        requestData.kasikata_value > 0 ? requestData.kasikata_value : undefined,
      note: requestData.note || null,
      checked: '0',
    }

    // 4. Service層呼び出し（データ更新）
    await createLedger(tx, createLedgerData)
    return { success: true, message: '取引が正常に登録されました' }
  })
}

// 5. createApiRouteでHTTPメソッドにバインド
export const GET = createApiRoute(listLedgersHandler)
export const POST = createApiRoute(createLedgerHandler)
export const PUT = createApiRoute(updateLedgerHandler)
```

## Service層実装パターン

**重要**: DBアクセスするService関数は第一引数に`Connection`を取ること

### Zodバリデーション付きService

**参考**: `/lib/backend/services/journal/create-journal.ts`

```typescript
import { z } from 'zod'

import { ApiError, ApiErrorType, toDetails } from '@/lib/backend/api-error'

const createJournalRequestSchema = z
  .object({
    nendo: z.string(),
    date: z.string(),
    debitAccount: z.string().length(3),
    debitAmount: z.number(),
    creditAccount: z.string().length(3),
    creditAmount: z.number(),
    description: z.string(),
  })
  .superRefine((data, ctx) => {
    // 年度形式チェック
    if (!/^\d{4}$/.test(data.nendo)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: '年度は4桁の数字である必要があります',
        path: ['nendo'],
        params: { code: 'INVALID_NENDO_FORMAT' },
      })
    }
    // 金額の妥当性チェック
    if (data.debitAmount !== data.creditAmount) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: '借方金額と貸方金額が一致しません',
        path: ['creditAmount'],
        params: { code: 'AMOUNT_MISMATCH' },
      })
    }
  })
  .refine((data) => data.debitAccount !== data.creditAccount, {
    message: '借方科目と貸方科目は異なる必要があります',
    path: ['creditAccount'],
    params: { code: 'SAME_ACCOUNT_CODES' },
  })

export async function createJournal(
  conn: Connection,
  input: CreateJournalRequest,
): Promise<void> {
  // Zodバリデーション実行
  const validationResult =
    await createJournalRequestSchema.safeParseAsync(input)
  if (!validationResult.success) {
    throw new ApiError(
      'バリデーションエラーが発生しました',
      ApiErrorType.VALIDATION,
      toDetails(validationResult.error.errors),
    )
  }

  // ... ビジネスロジック
}
```

### Prisma ORMによるデータ取得

**参考**: `/lib/backend/services/payroll/get-payment-statuses.ts`

```typescript
export async function getPaymentStatuses(
  conn: Connection,
  fiscalYear: string,
): Promise<PaymentStatus[]> {
  // findManyでデータ取得
  const paymentStatuses = await conn.payroll_payments.findMany({
    where: {
      fiscal_year: fiscalYear,
    },
    select: {
      month: true,
      is_paid: true,
      created_at: true,
    },
    orderBy: {
      month: 'asc',
    },
  })

  // データ変換
  return paymentStatuses.map((status) => ({
    month: status.month,
    isPaid: status.is_paid,
    createdAt: status.created_at.toISOString(),
  }))
}
```

**参考**: `/lib/backend/services/journal/create-journal.ts`

```typescript
// Prisma createでデータ作成
await conn.journals.create({
  data: {
    nendo: input.nendo,
    date: input.date,
    karikata_cd: input.debitAccount,
    karikata_value: input.debitAmount,
    kasikata_cd: input.creditAccount,
    kasikata_value: input.creditAmount,
    note: input.description || null,
    checked: '0',
    deleted: '0',
    created_at: new Date(),
    updated_at: new Date(),
  },
})
```

### 生SQLによるデータ取得

**参考**: `/lib/backend/services/masters/get-saimoku-detail.ts`

```typescript
export async function getSaimokuDetail(
  conn: Connection,
  input: { saimoku_cd: string },
): Promise<SaimokuDetailResponse | null> {
  // 生SQL実行
  const result = await conn.$queryRaw<SaimokuDetailResponse[]>`
    select
      k.kamoku_cd,
      s.saimoku_cd,
      b.kamoku_bunrui_type
    from
      saimoku_masters s
        inner join kamoku_masters k on
          k.kamoku_cd = s.kamoku_cd
        inner join kamoku_bunrui_masters b on
          b.kamoku_bunrui_cd = k.kamoku_bunrui_cd
    where
      saimoku_cd = ${input.saimoku_cd}`

  return result[0] ?? null
}
```

**参考**: `/lib/backend/services/journal/list-journals.ts`

```typescript
// 複雑な条件付きクエリ
const rows = await conn.$queryRaw<any[]>`
  select
    j.id,
    j.nendo,
    j.date,
    j.karikata_cd,
    j.karikata_value,
    j.kasikata_cd,
    j.kasikata_value,
    j.note,
    j.checked,
    j.created_at
  from
    journals j
  where
    j.nendo = ${input.fiscal_year}
    and j.deleted = '0'
    and (case when ${month} = 'all' then 'all' else ${month} end)
    = (case when ${month} = 'all' then 'all' else substring(j.date, 5, 2) end)
    and (case when ${checked} = 'all' then 'all' else ${checked} end)
    = (case when ${checked} = 'all' then 'all' else j.checked end)
  order by
    j.date desc,
    j.created_at desc
  limit ${pagination.pageSize} offset ${calculateOffset(pagination)}`
```

## エラーハンドリング

**参考**: `/lib/backend/api-error.ts`

**重要**:

- 明示的なエラーを投げる場合は必ず`ApiError`としてスローすること
- `catch`でエラーを握りつぶすことは基本的に行ってはいけない（適切な理由がある場合は除く）
- ライブラリ（Prisma等）が投げるエラーは基本的に`catch`しないこと（適切な理由がある場合は除く）

### ApiError使用パターン

```typescript
// Zodバリデーションエラー
const validationResult = await schema.safeParseAsync(input)
if (!validationResult.success) {
  throw new ApiError(
    'バリデーションエラーが発生しました',
    ApiErrorType.VALIDATION,
    toDetails(validationResult.error.errors),
  )
}

// ビジネスルールエラー（リソース不存在）
if (!debitDetail) {
  throw new ApiError(
    `借方科目コード ${input.debitAccount} は存在しません`,
    ApiErrorType.VALIDATION,
    [
      {
        code: 'INVALID_ACCOUNT_CODE',
        message: `借方科目コード ${input.debitAccount} は存在しません`,
        path: ['debitAccount'],
      },
    ],
  )
}

// ビジネスルールエラー（操作制限）
if (paymentStatus.isPaid) {
  throw new ApiError(
    `${paymentStatus.month}月は既に給与支払いが完了しているため、仕訳の追加はできません`,
    ApiErrorType.VALIDATION,
    [
      {
        code: 'PAYROLL_PERIOD_LOCKED',
        message: '給与支払期間がロックされています',
      },
    ],
  )
}
```

## レスポンス形式

**参考**: `/lib/backend/api-error.ts`

### TypeScript型定義

```typescript
// 成功レスポンス（統一）
interface ApiSuccessResponse<T> {
  success: true
  data: T
}

// エラーレスポンス
interface ApiErrorResponse {
  success: false
  error: {
    message: string
    type: ApiErrorType
    details: ErrorDetail[]
  }
}

// エラー詳細
interface ErrorDetail {
  code: string
  message: string
  path?: string[]
}

// エラータイプ
enum ApiErrorType {
  UNAUTHORIZED = 'UNAUTHORIZED', // 401
  FORBIDDEN = 'FORBIDDEN', // 403
  NOT_FOUND = 'NOT_FOUND', // 404
  VALIDATION = 'VALIDATION', // 400
  INTERNAL = 'INTERNAL', // 500
}
```

### 成功レスポンス例

```json
// データ取得API
{
  "success": true,
  "data": [
    {
      "id": 1,
      "nendo": "2024",
      "date": "20240401",
      "karikata_cd": "101",
      "karikata_value": 10000
    }
  ]
}

// データ作成/更新/削除API
{
  "success": true,
  "message": "仕訳が正常に作成されました"
}
```

### エラーレスポンス例

```json
// バリデーションエラー
{
  "success": false,
  "error": {
    "type": "VALIDATION",
    "message": "バリデーションエラーが発生しました",
    "details": [
      {
        "code": "INVALID_DATE_FORMAT",
        "message": "日付は有効なYYYYMMDD形式である必要があります",
        "path": ["date"]
      },
      {
        "code": "AMOUNT_MISMATCH",
        "message": "借方金額と貸方金額が一致しません",
        "path": ["creditAmount"]
      }
    ]
  }
}

// ビジネスルールエラー
{
  "success": false,
  "error": {
    "type": "BUSINESS_RULE",
    "message": "給与支払期間がロックされています",
    "details": [
      {
        "code": "PAYROLL_PERIOD_LOCKED",
        "message": "2024年1月の仕訳は編集できません",
        "path": ["date"]
      }
    ]
  }
}

// リソース不存在エラー
{
  "success": false,
  "error": {
    "type": "NOT_FOUND",
    "message": "指定されたリソースが見つかりません",
    "details": [
      {
        "code": "JOURNAL_NOT_FOUND",
        "message": "仕訳ID 123 は存在しません",
        "path": ["id"]
      }
    ]
  }
}
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
