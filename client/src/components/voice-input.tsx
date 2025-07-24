import { Button } from "@/components/ui/button";

interface VoiceInputProps {
  isListening: boolean;
  isProcessing: boolean;
  transcript: string;
  onVoiceInput: () => void;
  speechError: string | null;
}

export default function VoiceInput({ 
  isListening, 
  isProcessing, 
  transcript, 
  onVoiceInput, 
  speechError 
}: VoiceInputProps) {
  
  const getStatusText = () => {
    if (speechError) {
      return "音声認識でエラーが発生しました";
    }
    if (isProcessing && !isListening) {
      return "考えているよ...";
    }
    if (isListening) {
      return "🎤 お話を聞いているよ... (話し終わったら停止します)";
    }
    return "マイクボタンを押してお話ししてね！";
  };

  const getMicIcon = () => {
    if (isListening) return "⏸️";
    return "🎤";
  };

  return (
    <div className="text-center mb-6">
      {/* Large Microphone Button */}
      <Button
        onClick={onVoiceInput}
        disabled={isProcessing && !isListening}
        className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full text-white text-3xl sm:text-4xl flex items-center justify-center mx-auto mb-4 transition-all duration-300 hover:scale-105 active:scale-95 ${
          isListening 
            ? 'bg-red-500 animate-pulse shadow-lg shadow-red-500/50' 
            : 'bg-blue-500 hover:bg-blue-600'
        }`}
      >
        {getMicIcon()}
      </Button>
      
      {/* Status Text */}
      <div className="text-white text-base sm:text-lg font-semibold mb-4 px-2">
        <span className={isListening ? "animate-pulse" : ""}>
          {getStatusText()}
        </span>
      </div>
      
      {/* Voice Level Indicator */}
      {isListening && (
        <div className="flex justify-center space-x-1 mb-4">
          {[8, 10, 6, 12, 8].map((height, index) => (
            <div 
              key={index}
              className={`w-2 rounded-full transition-all duration-200 ${
                transcript ? 'bg-white' : 'bg-white/30'
              }`}
              style={{ 
                height: `${height * (transcript ? 1.5 : 1)}px`,
                animationDelay: `${index * 0.1}s`
              }}
            />
          ))}
        </div>
      )}

      {/* Show current transcript */}
      {transcript && isListening && (
        <div className="text-white/80 text-sm italic mt-2">
          「{transcript}」
        </div>
      )}
    </div>
  );
}
