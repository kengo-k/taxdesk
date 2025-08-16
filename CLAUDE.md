# CLAUDE.md

このファイルはClaudeとの効率的な開発協業のためのガイドラインです。

## プロジェクト情報

プロジェクト固有の詳細情報は以下のドキュメントを参照してください：

- **プロジェクト概要**: @docs/project-overview.md
- **技術スタック**: @docs/tech-stack.md
- **コーディング標準 (Backend)**: @docs/coding-standards-backend.md
- **コーディング標準 (Frontend)**: @docs/coding-standards-frontend.md

## 開発ワークフロー

### /コマンドベース運用

Claude Codeの/コマンドを活用した標準化されたワークフローを採用する。

#### 主要コマンド(DRAFT)

- `/create-issue` - 新規issue作成（テンプレート適用、ラベル自動設定）
- `/pr` - Pull Request作成（コミット、ブランチ作成、テンプレート適用）

#### ワークフロー例

```
/create-issue → 機能実装 → /pr
```
