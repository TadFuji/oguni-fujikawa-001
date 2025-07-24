import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import VoiceChat from "@/pages/voice-chat";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Toaster />
      <VoiceChat />
    </QueryClientProvider>
  );
}

export default App;
