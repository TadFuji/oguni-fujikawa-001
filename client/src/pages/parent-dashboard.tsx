import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MessageSquare, TrendingUp, User } from "lucide-react";
import { format } from "date-fns";
import { ja } from "date-fns/locale";

interface Conversation {
  id: number;
  userMessage: string;
  robotResponse: string;
  duration?: number;
  messageLength?: number;
  responseLength?: number;
  sessionId?: string;
  createdAt: string;
}

interface Stats {
  totalConversations: number;
  todayConversations: number;
  averageMessageLength: number;
  totalDuration: number;
  popularTopics: string[];
}

export default function ParentDashboard() {
  const { data: stats, isLoading: statsLoading } = useQuery<Stats>({
    queryKey: ["/api/parent/stats"],
  });

  const { data: conversations, isLoading: conversationsLoading } = useQuery<Conversation[]>({
    queryKey: ["/api/parent/conversations"],
  });

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}時間${minutes}分`;
    }
    return `${minutes}分`;
  };

  const getSafetyLevel = (message: string) => {
    // Simple content analysis - in production, use more sophisticated methods
    const concerningWords = ['悲しい', '怖い', '嫌い', '痛い'];
    const hasConcern = concerningWords.some(word => message.includes(word));
    return hasConcern ? 'warning' : 'safe';
  };

  if (statsLoading || conversationsLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">保護者ダッシュボード</h1>
          <p className="text-gray-600 mt-2">お子様の音声対話アプリの利用状況を確認できます</p>
        </div>
        <Badge variant="outline" className="text-sm">
          {format(new Date(), 'yyyy年MM月dd日', { locale: ja })}
        </Badge>
      </div>

      {/* 統計カード */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">総会話数</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalConversations || 0}</div>
            <p className="text-xs text-muted-foreground">累計の対話回数</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">今日の会話</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.todayConversations || 0}</div>
            <p className="text-xs text-muted-foreground">本日の対話回数</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">平均メッセージ長</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.averageMessageLength || 0}</div>
            <p className="text-xs text-muted-foreground">文字数</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">総利用時間</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatDuration(stats?.totalDuration || 0)}
            </div>
            <p className="text-xs text-muted-foreground">累計時間</p>
          </CardContent>
        </Card>
      </div>

      {/* 最近の会話履歴 */}
      <Card>
        <CardHeader>
          <CardTitle>最近の会話履歴</CardTitle>
          <CardDescription>
            お子様とAIアシスタントの対話内容を確認できます
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {conversations && conversations.length > 0 ? (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {conversations.slice(0, 10).map((conversation) => (
                <div
                  key={conversation.id}
                  className="border rounded-lg p-4 space-y-3 bg-gray-50"
                >
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      {format(new Date(conversation.createdAt), 'MM月dd日 HH:mm', { locale: ja })}
                    </span>
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant={getSafetyLevel(conversation.userMessage) === 'safe' ? 'default' : 'destructive'}
                        className="text-xs"
                      >
                        {getSafetyLevel(conversation.userMessage) === 'safe' ? '安全' : '要注意'}
                      </Badge>
                      {conversation.duration && (
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          {conversation.duration}秒
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <p className="text-sm font-medium text-blue-900 mb-1">お子様:</p>
                      <p className="text-sm text-blue-800">{conversation.userMessage}</p>
                    </div>
                    
                    <div className="p-3 bg-green-100 rounded-lg">
                      <p className="text-sm font-medium text-green-900 mb-1">AIアシスタント:</p>
                      <p className="text-sm text-green-800">{conversation.robotResponse}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>まだ会話履歴がありません</p>
              <p className="text-sm">お子様がアプリを使用すると、ここに会話が表示されます</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}