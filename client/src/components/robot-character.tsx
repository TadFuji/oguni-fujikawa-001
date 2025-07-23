interface RobotCharacterProps {
  isThinking: boolean;
}

export default function RobotCharacter({ isThinking }: RobotCharacterProps) {
  return (
    <div className="flex justify-center mb-8">
      <div className="relative">
        {/* Robot Body */}
        <div className={`w-32 h-32 robot-face rounded-3xl border-4 border-white relative animate-bounce-gentle ${isThinking ? 'animate-wiggle' : ''}`}>
          {/* Robot Eyes */}
          <div className="flex justify-center items-center h-full">
            <div className="flex space-x-4">
              <div className="w-8 h-8 bg-kid-blue rounded-full relative">
                <div className="w-4 h-4 bg-white rounded-full absolute top-1 left-1 animate-pulse-slow"></div>
              </div>
              <div className="w-8 h-8 bg-kid-blue rounded-full relative">
                <div className="w-4 h-4 bg-white rounded-full absolute top-1 left-1 animate-pulse-slow"></div>
              </div>
            </div>
          </div>
          {/* Robot Mouth */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
            <div className="w-8 h-4 bg-kid-orange rounded-full"></div>
          </div>
          {/* Robot Antennas */}
          <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
            <div className="flex space-x-6">
              <div className="w-2 h-6 bg-white rounded-full"></div>
              <div className="w-2 h-6 bg-white rounded-full"></div>
            </div>
            <div className="flex space-x-6 -mt-1">
              <div className="w-4 h-4 bg-kid-yellow rounded-full animate-pulse"></div>
              <div className="w-4 h-4 bg-kid-red rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
