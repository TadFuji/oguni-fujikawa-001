# 🎤 うんこ先生と話そう！

小学校低学年向けの音声対話ウェブアプリケーション。AIアシスタント「うんこ先生」と楽しく音声で会話できる教育アプリです。

![うんこ先生](./attached_assets/unko-sensei-optimized.png)

## ✨ 主な機能

- 🎯 **ワンタップ音声入力**: マイクボタンを1回押すだけで音声認識開始
- 🤖 **AI対話**: Dify AIプラットフォーム統合による自然な会話
- 🔊 **高品質音声**: OpenAI TTS による明瞭な日本語音声
- 📱 **モバイル最適化**: iPhone Safari対応済み・スマートフォン完全対応
- 🎨 **子ども向けデザイン**: カラフルなアニメーションと大きなボタン
- 📊 **会話履歴**: 過去の対話を保存・確認可能

## 🚀 技術スタック

### フロントエンド
- **React 18** + TypeScript
- **Tailwind CSS** + shadcn/ui
- **TanStack Query** (状態管理)
- **Web Speech API** + OpenAI TTS
- **Wouter** (軽量ルーティング)

### バックエンド
- **Express.js** + TypeScript
- **Drizzle ORM** + PostgreSQL
- **OpenAI TTS API** 音声合成
- **Dify AI Platform** 対話AI統合
- **Express Session** (セッション管理)

### 音声技術
- **Google Cloud Text-to-Speech API**: 高品質な日本語音声生成
- **Web Speech API**: ブラウザ標準音声認識
- **2秒タイムアウト**: 自然な会話フロー
- **フォールバック対応**: ブラウザ互換性確保

## 🛠️ セットアップ

### 必要な環境変数
```bash
DATABASE_URL=postgresql://...        # PostgreSQL接続URL（必須）
OPENAI_API_KEY=sk-...                # OpenAI TTS API（必須）
NODE_ENV=development                 # 開発環境設定
```

### インストール・起動
```bash
# 依存関係のインストール
npm install

# データベース設定
npm run db:push

# 開発サーバー起動
npm run dev

# 本番ビルド
npm run build
npm run start
```

## 📁 プロジェクト構成

```
├── client/                 # フロントエンド
│   ├── src/
│   │   ├── components/     # UI コンポーネント
│   │   ├── hooks/         # カスタムフック（音声認識・TTS）
│   │   ├── pages/         # ページコンポーネント
│   │   └── lib/           # ユーティリティ
├── server/                # バックエンド
│   ├── index.ts          # サーバーエントリーポイント
│   ├── routes.ts         # API ルート
│   └── storage.ts        # データベース操作
├── shared/               # 共有型定義
│   └── schema.ts        # Drizzle スキーマ
└── attached_assets/     # 画像・アセット
```

## 🎯 主要機能詳細

### 音声認識システム
- 継続的音声認識
- 1.5秒無音検出で自動送信（高速化）
- ブラウザ互換性チェック
- エラーハンドリング

### 音声合成システム
- OpenAI TTS API: alloy voice (高品質日本語音声)
- 最適化パラメータ: 話速1.0倍、自然な発話
- Web Speech API フォールバック
- iOS Safari音声再生対応済み

### AIアシスタント統合
- Dify AIプラットフォーム
- うんこ先生キャラクター
- 文脈を理解した会話
- 子ども向け安全フィルター

## 🔧 開発・運用

### パフォーマンス最適化
- 本番バンドルサイズ: 241KB (gzipped: 77KB)
- コード最適化: 18個UIコンポーネント + 23個ファイル削除
- データベースクエリ最適化
- 画像最適化: うんこ先生 13KB (97.6%削減)

### デプロイメント
- Replit Deployments対応
- 自動HTTPS設定
- ヘルスチェック機能
- ゼロダウンタイムデプロイ

詳細なデプロイ手順は [DEPLOYMENT.md](./DEPLOYMENT.md) を参照してください。

## 📄 ライセンス

MIT License

---

**開発者**: Replit AI Assistant  
**対象年齢**: 小学校低学年（6-9歳）  
**動作環境**: Chrome, Safari, Edge (音声API対応ブラウザ)