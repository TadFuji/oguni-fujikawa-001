# 🚀 デプロイメント手順書

## 📋 事前準備

### 必要な環境変数
```bash
OPENAI_API_KEY=sk-...     # OpenAI TTS API用（必須）
DATABASE_URL=postgresql://...  # PostgreSQL接続URL（必須）
NODE_ENV=production       # 本番環境設定
```

## 🔧 Replitデプロイメント（推奨）

### 1. 自動デプロイ
```bash
# Replitで「Deploy」ボタンをクリック
# 自動的に以下が実行されます：
npm run build
npm run start
```

### 2. 手動ビルド確認
```bash
# ローカルでビルドテスト
npm run build

# 本番サーバー起動テスト
npm run start
```

## 🌐 外部プラットフォームデプロイ

### Vercel
```bash
# vercel.json 設定
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist/public",
  "installCommand": "npm install",
  "framework": null,
  "functions": {
    "server/index.ts": {
      "runtime": "nodejs18.x"
    }
  }
}

# デプロイコマンド
vercel --prod
```

### Railway
```bash
# Dockerfile使用
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 5000
CMD ["npm", "start"]

# Railway CLI
railway login
railway deploy
```

### Heroku
```bash
# heroku.yml
build:
  docker:
    web: Dockerfile

# Heroku CLI
heroku create unko-sensei-voice-chat
heroku config:set OPENAI_API_KEY=sk-...
heroku config:set DATABASE_URL=postgresql://...
git push heroku main
```

## 🗄️ データベース設定

### Neon PostgreSQL（推奨）
```bash
# 1. Neon.tech でプロジェクト作成
# 2. DATABASE_URL取得
# 3. スキーマ同期
npm run db:push
```

### 他のPostgreSQL
```bash
# PlanetScale、Supabase、ElephantSQL等
# DATABASE_URL形式：
# postgresql://username:password@hostname:port/database

# スキーマ適用
npm run db:push
```

## 📱 本番環境テスト

### 基本機能確認
1. **ページ読み込み**: 3秒以内
2. **マイクボタン**: タップで音声認識開始
3. **音声認識**: 日本語正確認識（1.5秒無音で自動停止）
4. **AI応答**: うんこ先生キャラクター応答
5. **音声再生**: OpenAI TTS高品質再生
6. **会話履歴**: データベース永続化確認

### モバイル対応テスト
- **iPhone Safari**: iOS音声制限対応確認
- **Android Chrome**: 全機能動作確認
- **レスポンシブ**: 320px〜対応確認
- **タッチ操作**: 大きなボタン操作性確認

## 🔍 トラブルシューティング

### よくある問題

#### 音声が再生されない
```bash
# 原因: OpenAI API Key未設定
# 解決: 環境変数確認
echo $OPENAI_API_KEY

# Web Speech API fallback確認
# ブラウザコンソールでエラーチェック
```

#### データベース接続エラー
```bash
# 原因: DATABASE_URL形式エラー
# 解決: 正しい形式確認
postgresql://username:password@hostname:port/database

# スキーマ同期
npm run db:push
```

#### ビルドエラー
```bash
# 原因: 依存関係不整合
# 解決: クリーンインストール
rm -rf node_modules package-lock.json
npm install
npm run build
```

## 📊 パフォーマンス最適化

### 完了済み最適化
- **コードサイズ**: 18個UIコンポーネント + 23個ファイル削除
- **バンドルサイズ**: フロントエンド 241KB, サーバー 9.7KB
- **画像最適化**: うんこ先生 13KB（97.6%削減）
- **API最適化**: タイムアウト・リクエスト最適化

### 追加最適化案
```bash
# CDN設定（本番環境）
# - 画像配信最適化
# - CSS/JS圧縮配信
# - gzip圧縮有効化

# キャッシュ戦略
# - 静的ファイル長期キャッシュ
# - API適切キャッシュヘッダー
```

## 🔒 セキュリティ設定

### 環境変数保護
```bash
# 本番環境でのAPI Key保護
# - 環境変数のみ使用
# - .env ファイル .gitignore 登録済み
# - クライアントサイドにAPI Key露出なし
```

### CORS設定
```javascript
// 本番環境でのドメイン制限
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
  credentials: true
}));
```

## 📈 監視・ログ

### ログ確認
```bash
# Replitコンソールでログ確認
# API応答時間・エラー監視
# データベース接続状態確認
```

### パフォーマンス監視
- **応答時間**: API < 2秒
- **音声再生**: 遅延 < 1秒
- **ページ読み込み**: < 3秒
- **メモリ使用量**: < 512MB

---

**最終更新**: 2025年7月24日  
**対応プラットフォーム**: Replit, Vercel, Railway, Heroku  
**推奨デプロイ**: Replit自動デプロイメント