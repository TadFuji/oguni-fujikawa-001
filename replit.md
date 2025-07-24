# Voice Chat Application

## Overview

This is a kid-friendly voice chat application built with React and Express that allows children to have conversations with an AI assistant through speech. The application features a colorful, animated interface designed specifically for children, with speech recognition and text-to-speech capabilities integrated with the Dify AI platform.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes (July 24, 2025)

### Character & Branding Update (Latest)
- **CHARACTER REDESIGN**: うんこ先生キャラクター導入
- タイトル変更: "うんこ先生と話そう!" に更新
- キャラクター画像: 専用うんこ先生イメージに置換（554KB→13KB最適化）
- メッセージ更新: キャラクターに合わせたテキスト変更
- パフォーマンス最適化: 画像圧縮で97.6%サイズ削減

### UI Cleanup
- **DEBUG WINDOW REMOVED**: デバッグパネル削除でクリーンなUI実現
- ユーザー体験向上: 技術情報非表示で子供向けインターフェース最適化

### OpenAI TTS Integration
- **MAJOR TTS UPGRADE**: Google Cloud TTSからOpenAI TTS APIに移行
- 音声品質向上: alloy voice (1.0倍速度) で自然な子供向け音声
- 音声認識高速化: タイムアウトを1.5秒に短縮
- OpenAI API最適化: 10秒タイムアウト、直接音声ストリーミング

### Code Cleanup & Architecture Simplification
- **COMPREHENSIVE OPTIMIZATION**: 不要機能とファイルの大幅削除
- 保護者ダッシュボード機能削除: メイン音声チャット機能に特化
- 不要UIコンポーネント削除: 25個の未使用shadcn/uiコンポーネント
- データベーススキーマ簡素化: userMessage, robotResponse, createdAtのみ
- ルーティング簡素化: 単一ページアプリケーション化

### Performance Optimization
- インポート最適化: 未使用ライブラリとモジュール削除
- API応答高速化: 不要メタデータ削除とシンプル化
- ログ最適化: 本番環境向けにデバッグログ削除
- キャッシュ削除: 複雑なTTSキャッシュロジック除去

### Architecture Modernization
- 音声認識タイムアウト: 2秒→1.5秒に高速化
- データベース軽量化: 不要カラム削除とクエリ最適化
- フロントエンド簡素化: 単一VoiceChatコンポーネント
- Dify API統合最適化: 不要なZodバリデーション削除

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **UI Framework**: Tailwind CSS with shadcn/ui component library
- **Build Tool**: Vite for fast development and optimized builds

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Runtime**: Node.js with ES modules
- **API Style**: RESTful APIs for chat and conversation management
- **Session Management**: Express sessions with PostgreSQL store (connect-pg-simple)

### Database Architecture
- **ORM**: Drizzle ORM for type-safe database operations
- **Database**: PostgreSQL (configured for Neon serverless)
- **Migrations**: Drizzle Kit for schema management
- **Schema Location**: `shared/schema.ts` for shared types between frontend and backend

## Key Components

### Core Features
1. **Voice Recognition**: Web Speech API integration for capturing user speech
2. **Text-to-Speech**: Web Speech Synthesis API for robot responses
3. **AI Integration**: Dify AI platform integration for conversational responses
4. **Conversation History**: Persistent storage of chat conversations
5. **Kid-Friendly Interface**: Animated robot character with colorful, engaging design

### Frontend Components
- **VoiceChat**: Main chat interface page
- **RobotCharacter**: Animated robot with thinking states
- **SpeechBubble**: Message display component
- **VoiceInput**: Microphone input with visual feedback
- **ActionButtons**: Replay and clear functionality
- **LoadingIndicator**: Processing state display

### Backend Routes
- `GET /api/conversations`: Retrieve conversation history
- `POST /api/chat`: Send message to AI and get response

### Custom Hooks
- **useSpeechRecognition**: Manages speech-to-text functionality
- **useTextToSpeech**: Handles text-to-speech output
- **useToast**: Toast notification system

## Data Flow

1. **User Speech Input**: User clicks microphone button to start speech recognition
2. **Speech Processing**: Browser converts speech to text using Web Speech API
3. **AI Request**: Text is sent to backend API endpoint `/api/chat`
4. **Dify Integration**: Backend forwards request to Dify AI platform
5. **Response Processing**: AI response is received and stored in database
6. **Audio Output**: Response is converted to speech and played to user
7. **State Update**: UI updates with conversation history

### Database Schema
```sql
conversations {
  id: serial (primary key)
  user_message: text (not null)
  robot_response: text (not null)
  created_at: timestamp (default now)
}
```

## External Dependencies

### AI Integration
- **Dify AI Platform**: External AI service for generating conversational responses
- **Configuration**: Requires `DIFY_API_KEY` and `DIFY_APP_URL` environment variables
- **Request Format**: Blocking mode requests with conversation context

### Database
- **Neon Database**: Serverless PostgreSQL hosting
- **Connection**: Uses `DATABASE_URL` environment variable
- **Session Store**: PostgreSQL-backed session storage

### Browser APIs
- **Web Speech API**: For speech recognition (browser-dependent)
- **Speech Synthesis API**: For text-to-speech output
- **Graceful Degradation**: Fallback handling for unsupported browsers

## Deployment Strategy

### Development
- **Dev Server**: Vite development server with HMR
- **Backend**: tsx for TypeScript execution in development
- **Database**: Drizzle push for schema synchronization

### Production Build
- **Frontend**: Vite build outputs to `dist/public`
- **Backend**: esbuild bundles server code to `dist/index.js`
- **Static Serving**: Express serves built frontend assets
- **Environment**: Production mode with optimized builds

### Configuration
- **TypeScript**: Shared tsconfig for client, server, and shared code
- **Path Aliases**: Configured for clean imports (@, @shared, @assets)
- **ESM**: Full ES module support throughout the stack
- **Replit Integration**: Specialized plugins for Replit development environment

### Environment Variables Required
- `DATABASE_URL`: PostgreSQL connection string
- `DIFY_API_KEY`: API key for Dify AI platform  
- `OPENAI_API_KEY`: OpenAI API key for TTS service
- `NODE_ENV`: Environment mode (development/production)

### Production Deployment Status
- ✅ OpenAI TTS API integrated and optimized
- ✅ Architecture simplified and modernized
- ✅ Database schema optimized (3 essential columns)
- ✅ Codebase cleaned (25+ unused components removed)
- ✅ Voice recognition speed optimized (1.5-second timeout)
- ✅ Performance maximized (minimal dependencies)
- ✅ Single-page application architecture
- ✅ Production-ready and deployment-optimized

The application is designed to be child-safe with a focus on simple interactions, colorful animations, and clear audio feedback to create an engaging learning experience for young users.