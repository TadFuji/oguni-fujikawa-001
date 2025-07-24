interface SpeechBubbleProps {
  responseText: string;
  isUserMessage?: boolean;
}

export default function SpeechBubble({ responseText, isUserMessage = false }: SpeechBubbleProps) {
  const isEmpty = !responseText || responseText === "ここにロボットの返事が表示されるよ！";
  
  return (
    <div className="mb-6">
      <div className={`speech-bubble bg-white rounded-2xl p-4 sm:p-6 shadow-lg border-4 min-h-[80px] sm:min-h-[100px] flex items-center justify-center relative ${
        isUserMessage ? 'border-kid-blue' : 'border-kid-yellow'
      }`}>
        <div className="text-center">
          <p className={`text-base sm:text-lg font-medium ${
            isEmpty ? 'text-gray-500' : isUserMessage ? 'text-kid-blue' : 'text-gray-800'
          }`}>
            {responseText}
          </p>
        </div>
      </div>
    </div>
  );
}
