# GitHub デプロイガイド

## 📋 アップロード必須ファイル一覧

### 🎯 核心コードファイル
```
client/                    # フロントエンドアプリケーション
├── index.html
├── src/
│   ├── App.tsx           # メインアプリケーション
│   ├── main.tsx          # エントリーポイント
│   ├── components/       # UIコンポーネント
│   │   ├── action-buttons.tsx
│   │   ├── loading-indicator.tsx
│   │   ├── robot-character.tsx
│   │   ├── speech-bubble.tsx
│   │   ├── voice-input.tsx
│   │   └── ui/           # 基本UIコンポーネント（3個のみ）
│   │       ├── button.tsx
│   │       ├── toast.tsx
│   │       └── toaster.tsx
│   ├── hooks/            # カスタムフック
│   │   ├── use-speech-recognition.ts
│   │   ├── use-text-to-speech.ts
│   │   └── use-toast.ts
│   ├── lib/              # ユーティリティ
│   │   ├── queryClient.ts
│   │   └── utils.ts
│   └── pages/            # ページコンポーネント
│       └── voice-chat.tsx

server/                    # バックエンドサーバー
├── db.ts                 # データベース接続
├── index.ts              # サーバーエントリーポイント
├── routes.ts             # API ルート（chat, tts, conversations）
├── storage.ts            # データベース操作
└── vite.ts               # Vite統合

shared/                    # 共有型定義
└── schema.ts             # Drizzle ORMスキーマ

attached_assets/          # アセットファイル
└── unko-sensei-optimized.png  # うんこ先生キャラクター画像（13KB）
```

### ⚙️ 設定ファイル
```
package.json              # 依存関係とスクリプト
package-lock.json         # 依存関係ロック
tsconfig.json            # TypeScript設定
vite.config.ts           # Viteビルド設定
tailwind.config.ts       # Tailwind CSS設定
postcss.config.js        # PostCSS設定
drizzle.config.ts        # データベース設定
components.json          # shadcn/ui設定
.gitignore              # Git除外ファイル設定
```

### 📚 ドキュメントファイル
```
README.md                # プロジェクト概要と使用方法
replit.md               # 技術仕様とアーキテクチャ詳細
GitHub-Deploy-Guide.md   # このファイル
```

## 🚀 GitHubリポジトリ準備手順

### 1. 必要な環境変数設定
```bash
# GitHub上で以下のSecretsを設定
OPENAI_API_KEY=your_openai_api_key
DATABASE_URL=your_neon_postgres_url
```

### 2. 推奨リポジトリ設定
- **Repository name**: `unko-sensei-voice-chat`
- **Description**: `小学生向け音声チャットアプリ - うんこ先生との楽しい対話体験`
- **Visibility**: Private（APIキーを含むため）
- **Include README**: ✅

### 3. デプロイメントオプション
- **Vercel**: 推奨（フロントエンドとサーバーレス関数）
- **Netlify**: 代替案（静的サイト + Functions）
- **Railway**: フルスタック対応
- **Heroku**: 従来型PaaS

## 📊 最適化完了状況

### ✅ 完了項目
- [x] 18個の未使用UIコンポーネント削除
- [x] 23個の不要ファイル削除
- [x] API最適化（Dify/OpenAI統合）
- [x] インポート軽量化
- [x] データベーススキーマ簡素化
- [x] iOS音声再生対応
- [x] モバイル最適化
- [x] キャラクター画像最適化（97.6%削減）

### 🎯 技術スタック
- **Frontend**: React 18 + TypeScript + Tailwind CSS
- **Backend**: Express.js + TypeScript
- **Database**: PostgreSQL + Drizzle ORM
- **AI**: OpenAI TTS + Dify AI Platform
- **Audio**: Web Speech API + OpenAI TTS
- **Build**: Vite + esbuild

## 🔧 ローカル開発環境構築

```bash
# 1. リポジトリクローン
git clone <your-repo-url>
cd unko-sensei-voice-chat

# 2. 依存関係インストール
npm install

# 3. 環境変数設定
cp .env.example .env
# .envファイルを編集してAPIキーを設定

# 4. データベース設定
npm run db:push

# 5. 開発サーバー起動
npm run dev
```

## 📱 対応プラットフォーム
- ✅ iPhone Safari（iOS音声最適化済み）
- ✅ Android Chrome
- ✅ Desktop Chrome/Firefox/Safari
- ✅ iPad（タブレット最適化）

---

**最終更新**: 2025年7月24日  
**プロジェクトサイズ**: 27MB（node_modules除く）  
**最適化済みコンポーネント数**: 必須3個のみ