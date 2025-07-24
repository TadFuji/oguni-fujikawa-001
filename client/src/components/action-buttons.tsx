import { Button } from "@/components/ui/button";

interface ActionButtonsProps {
  onReplay: () => void;
  onClear: () => void;
  disabled: boolean;
}

export default function ActionButtons({ onReplay, onClear, disabled }: ActionButtonsProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-6">
      <Button 
        onClick={onReplay}
        disabled={disabled}
        className="bg-kid-orange hover:bg-orange-500 text-white font-bold py-3 sm:py-4 px-4 sm:px-6 rounded-2xl shadow-lg active:scale-95 transition-all duration-200 text-base sm:text-lg disabled:opacity-50"
      >
        🔊 もういちど
      </Button>
      <Button 
        onClick={onClear}
        disabled={disabled}
        className="bg-kid-purple hover:bg-purple-600 text-white font-bold py-3 sm:py-4 px-4 sm:px-6 rounded-2xl shadow-lg active:scale-95 transition-all duration-200 text-base sm:text-lg disabled:opacity-50"
      >
        🗑️ クリア
      </Button>
    </div>
  );
}
