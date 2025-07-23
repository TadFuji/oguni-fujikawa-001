# プロジェクトファイル構成

このプロジェクトをGitHubにアップロードする際の重要なファイル一覧：

## 必須ソースコード
- `client/` - フロントエンドReactアプリケーション
- `server/` - バックエンドExpressサーバー  
- `shared/` - 共有型定義とスキーマ
- `attached_assets/` - 画像・アセットファイル

## 設定ファイル
- `package.json` - 依存関係とスクリプト
- `tsconfig.json` - TypeScript設定
- `vite.config.ts` - Viteビルド設定
- `tailwind.config.ts` - Tailwind CSS設定
- `drizzle.config.ts` - データベース設定
- `components.json` - shadcn/ui設定

## ドキュメント
- `README.md` - プロジェクト概要と使用方法
- `DEPLOYMENT.md` - デプロイメント手順  
- `replit.md` - 開発履歴と設定詳細

## その他
- `.gitignore` - Git除外ファイル設定
- `postcss.config.js` - PostCSS設定

## 除外されるファイル（.gitignoreで管理）
- `node_modules/` - 依存関係（npm installで復元）
- `dist/` - ビルド成果物（npm run buildで生成）
- `.env*` - 環境変数（セキュリティ上除外）
- `.replit` - Replit固有設定