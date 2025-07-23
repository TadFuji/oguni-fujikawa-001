interface LoadingIndicatorProps {
  isVisible: boolean;
}

export default function LoadingIndicator({ isVisible }: LoadingIndicatorProps) {
  if (!isVisible) return null;

  return (
    <div className="text-center">
      <div className="inline-flex items-center px-6 py-3 bg-white rounded-2xl shadow-lg">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-kid-blue mr-3"></div>
        <span className="text-gray-700 font-semibold">考えているよ...</span>
      </div>
    </div>
  );
}
