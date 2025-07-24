import unkoSenseiImage from "@assets/unko-sensei_1753345324034.png";

interface RobotCharacterProps {
  isThinking: boolean;
}

export default function RobotCharacter({ isThinking }: RobotCharacterProps) {
  return (
    <div className="flex justify-center mb-8">
      <div className="relative">
        {/* うんこ先生 Character */}
        <div className={`relative ${isThinking ? 'animate-wiggle' : 'animate-bounce-gentle'}`}>
          <img 
            src={unkoSenseiImage} 
            alt="うんこ先生" 
            className="w-40 h-40 object-contain"
          />
        </div>
      </div>
    </div>
  );
}
