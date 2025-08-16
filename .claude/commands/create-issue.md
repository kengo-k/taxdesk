---
description: '新規GitHub issueを標準フォーマットで作成'
allowed-tools: ['Bash']
---

GitHub issueを対話的に作成します。

**注意**: いつでも`:exit`と入力することで処理を中断できます。

## 実行手順

1. **ラベル選択画面**: 以下の利用可能ラベルを番号付きリストで表示し、ユーザーに選択を求める

   ```
   使用可能なラベル:
   1. type:bug - Something isn't working
   2. type:dig - Research, analysis, and investigation tasks
   3. type:doc - Improvements or additions to documentation
   4. type:feat - New feature or request
   5. type:setup - Configuration, environment setup, and deployment settings

   Issueの種別を入力してください（例: 1）:
   ```

2. **ラベル番号入力**: ユーザーが番号を入力して1つのtypeラベルを指定（無効な番号の場合は再度入力を求める）

3. **Issue内容入力プロンプト**: 「Issueの内容を入力してください:」とユーザーに促す

4. **内容整理と確認**: ユーザーの入力内容を構造化し下記のテンプレートで表示（Issue内容は英語で作成、対話内容に応じて任意のセクションを追加可能）

   ```
   === Issue内容（現在の状態） ===
   タイトル: [自動生成]

   ## What
   [何をやるか]

   ## Why
   [なぜやるか]

   [任意セクション - 必要に応じて追加]

   ## Acceptance Criteria
   [受け入れ条件]

   ===========================

   追加・修正がある場合は内容を入力してください。
   完了の場合は「:done」と入力してください。
   中断する場合は「:exit」と入力してください。
   ```

5. **反復改善**: done入力まで3-4を繰り返し、内容をブラッシュアップ

6. **Issue作成**: `gh issue create`で最終版のissueを作成し、手順1で指定したtypeラベルと`state:draft`ラベルを自動で付与
