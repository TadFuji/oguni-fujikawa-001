# 音声チャットアプリ デプロイメントガイド

このドキュメントは、小学校低学年向け音声対話ウェブアプリケーションのデプロイメント手順を説明します。

## 本番環境要件

### 必須環境変数
- `DATABASE_URL`: PostgreSQL データベース接続文字列
- `DIFY_API_KEY`: Dify AI プラットフォーム API キー
- `DIFY_APP_URL`: Dify アプリケーション URL（通常は `https://api.dify.ai/v1/chat-messages`）
- `GOOGLE_CLOUD_API_KEY`: Google Cloud Text-to-Speech API キー
- `NODE_ENV`: 本番環境では `production` に設定

### システム要件
- Node.js 18以上
- PostgreSQL データベース
- 512MB以上のメモリ
- HTTPS対応（音声認識API要件）

## デプロイ手順

### 1. ビルド
```bash
npm install
npm run build
```

### 2. データベース設定
```bash
npm run db:push
```

### 3. 本番環境起動
```bash
npm run start
```

## 設定済み機能

### 高品質音声システム
- Google Cloud TTS使用時: ja-JP-Neural2-C 男性音声
- 最適化パラメータ: 話速1.25倍、ピッチ-2.5st、音量4.0dB
- Web Speech API フォールバック対応

### 音声認識システム
- 2秒無音タイムアウト自動検出
- 継続的音声認識
- ブラウザ互換性自動チェック

### セキュリティ機能
- Express セッション管理
- PostgreSQL セッションストア
- API エラーハンドリング
- CORS 設定

### パフォーマンス最適化
- 静的ファイル配信最適化
- データベースクエリ最適化
- フロントエンド bundling
- 不要ログ削除による軽量化

## 運用監視

### ヘルスチェック
- エンドポイント: `GET /api/conversations`
- 期待レスポンス: 200 OK with JSON array

### ログ監視
- サーバー起動: "serving on port 5000"
- API リクエスト: "GET/POST /api/... 200 in XXXms"
- エラー: HTTP 4xx/5xx ステータス

### パフォーマンス指標
- API レスポンス時間: < 1秒
- TTS生成時間: < 3秒
- データベースクエリ: < 100ms

## トラブルシューティング

### 音声認識が動作しない
- HTTPS接続を確認
- ブラウザのマイク許可を確認
- コンソールでエラーログを確認

### TTS音声が再生されない
- GOOGLE_CLOUD_API_KEY の設定を確認
- ネットワーク接続を確認
- Web Speech API フォールバック動作を確認

### データベース接続エラー
- DATABASE_URL の形式を確認
- PostgreSQL サーバーの稼働状況を確認
- ネットワーク接続を確認

## 技術仕様

### フロントエンド
- React 18 + TypeScript
- Tailwind CSS + shadcn/ui
- TanStack Query (状態管理)
- Web Speech API + Google Cloud TTS

### バックエンド
- Express.js + TypeScript
- Drizzle ORM + PostgreSQL
- Dify AI Platform 統合
- セッション永続化

### デプロイメント
- Vite ビルドシステム
- esbuild サーバーバンドル
- 静的ファイル配信
- ゼロダウンタイムデプロイ対応