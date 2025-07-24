import unkoSenseiImage from "@assets/unko-sensei-optimized.png";

interface RobotCharacterProps {
  isThinking: boolean;
}

export default function RobotCharacter({ isThinking }: RobotCharacterProps) {
  return (
    <div className="flex justify-center mb-6">
      <div className="relative">
        {/* うんこ先生 Character */}
        <div className={`relative ${isThinking ? 'animate-wiggle' : 'animate-bounce-gentle'}`}>
          <img 
            src={unkoSenseiImage} 
            alt="うんこ先生" 
            className="w-32 h-32 sm:w-40 sm:h-40 object-contain"
          />
        </div>
      </div>
    </div>
  );
}
