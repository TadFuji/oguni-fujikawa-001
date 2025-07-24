import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import RobotCharacter from "@/components/robot-character";
import SpeechBubble from "@/components/speech-bubble";
import VoiceInput from "@/components/voice-input";
import ActionButtons from "@/components/action-buttons";
import LoadingIndicator from "@/components/loading-indicator";
import { useSpeechRecognition } from "@/hooks/use-speech-recognition";
import { useTextToSpeech } from "@/hooks/use-text-to-speech";

export default function VoiceChat() {
  const [lastResponse, setLastResponse] = useState<string>("");
  const { toast } = useToast();
  const { speak, isSpeaking } = useTextToSpeech();
  
  const handleTranscriptComplete = (finalTranscript: string) => {
    chatMutation.mutate(finalTranscript);
  };

  const {
    isListening,
    transcript,
    startListening,
    stopListening,
    resetTranscript,
    isSupported: speechSupported,
    error: speechError
  } = useSpeechRecognition(handleTranscriptComplete);

  // Fetch conversation history
  const { data: conversations = [] } = useQuery({
    queryKey: ["/api/conversations"],
  });
  
  // Type assertion for conversations array
  const typedConversations = conversations as Array<{
    id: number;
    userMessage: string;
    robotResponse: string;
    createdAt: string;
  }>;

  // Send message to chat API
  const chatMutation = useMutation({
    mutationFn: async (userMessage: string) => {
      const response = await apiRequest("POST", "/api/chat", { userMessage });
      const data = await response.json();
      return data;
    },
    onSuccess: (data) => {
      setLastResponse(data.robotResponse);
      resetTranscript();
      // Start speaking immediately without waiting for cache invalidation
      speak(data.robotResponse);
      // Invalidate cache in parallel for better performance
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
    },
    onError: (error) => {
      toast({
        title: "エラー",
        description: "申し訳ありません。もう一度試してみてください。",
        variant: "destructive",
      });
    },
  });

  const handleVoiceInput = () => {
    if (!speechSupported) {
      toast({
        title: "音声認識エラー",
        description: "お使いのブラウザは音声認識をサポートしていません。",
        variant: "destructive",
      });
      return;
    }

    if (isListening) {
      stopListening();
      return;
    }

    resetTranscript();
    startListening();
    
    // Show microphone permission hint if needed
    if (!isListening) {
      setTimeout(() => {
        if (!isListening && speechError) {
          toast({
            title: "マイクの許可が必要です",
            description: "ブラウザでマイクの使用を許可してください。",
            variant: "destructive",
          });
        }
      }, 2000);
    }
  };

  const handleReplay = () => {
    if (lastResponse) {
      speak(lastResponse);
    }
  };

  const handleClear = () => {
    setLastResponse("");
    queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
  };

  const isProcessing = chatMutation.isPending || isSpeaking;
  const isThinking = chatMutation.isPending && !isListening;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-purple-500 to-green-400">
      <div className="container mx-auto px-4 py-6 max-w-md">
        
        {/* Header */}
        <header className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2 drop-shadow-lg">
            おしゃべりロボット
          </h1>
          <p className="text-white/90 text-lg">ロボットとおはなししよう！</p>
        </header>

        {/* Robot Character */}
        <RobotCharacter isThinking={isThinking} />

        {/* Speech Bubble */}
        <SpeechBubble 
          responseText={lastResponse || transcript || "ここにロボットの返事が表示されるよ！"}
          isUserMessage={isListening && !!transcript}
        />

        {/* Debug: Show raw Dify response */}
        {typedConversations.length > 0 && (
          <div className="mt-4 p-4 bg-gray-800 text-white text-xs rounded-lg max-w-full overflow-auto">
            <h3 className="font-bold mb-2">🔍 DEBUG: Dify接続状況分析</h3>
            <div className="space-y-2">
              <div><strong>ユーザー:</strong> {typedConversations[0]?.userMessage}</div>
              <div className="bg-red-900 p-2 rounded">
                <strong>Dify生返答:</strong> {typedConversations[0]?.rawDifyResponse || '❌ データが保存されていません（既存レコードまたはDify接続問題）'}
              </div>
              <div><strong>処理後返答:</strong> {typedConversations[0]?.robotResponse}</div>
              <div className="text-yellow-300 text-xs mt-2">
                💡 新しい音声入力でテストしてください。既存データにはrawDifyResponseがありません。
              </div>
            </div>
          </div>
        )}

        {/* Voice Input */}
        <VoiceInput 
          isListening={isListening}
          isProcessing={isProcessing}
          transcript={transcript}
          onVoiceInput={handleVoiceInput}
          speechError={speechError}
        />

        {/* Action Buttons */}
        <ActionButtons 
          onReplay={handleReplay}
          onClear={handleClear}
          disabled={isProcessing}
        />

        {/* Fun animated dots */}
        <div className="flex justify-center space-x-4 mb-6">
          <div className="w-8 h-8 bg-kid-yellow rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
          <div className="w-8 h-8 bg-kid-red rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-8 h-8 bg-kid-green rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-8 h-8 bg-kid-blue rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
        </div>

        {/* Loading Indicator */}
        <LoadingIndicator isVisible={isThinking} />

      </div>
    </div>
  );
}
