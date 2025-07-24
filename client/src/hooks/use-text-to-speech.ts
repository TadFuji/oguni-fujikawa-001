import { useState, useCallback } from 'react';

export function useTextToSpeech() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;
  
  // iOS detection for audio optimization
  const isIOS = typeof window !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent);

  const speak = useCallback(async (text: string) => {
    if (!isSupported) {
      setError('Text-to-speech is not supported in this browser');
      return;
    }

    if (!text.trim()) return;

    // Stop any ongoing speech
    window.speechSynthesis.cancel();

    // Try OpenAI TTS with optimized settings
    try {
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });

      if (response.ok) {
        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        
        // iOS-specific audio optimizations
        if (isIOS) {
          audio.preload = 'metadata'; // Lighter preload for iOS
          // Set playsInline for iOS (TypeScript workaround)
          (audio as any).playsInline = true;
        } else {
          audio.preload = 'auto';
        }
        audio.volume = 0.9;
        audio.playbackRate = 1.0;
        
        setIsSpeaking(true);
        setError(null);

        audio.onended = () => {
          setIsSpeaking(false);
          URL.revokeObjectURL(audioUrl);
        };

        audio.onerror = () => {
          setIsSpeaking(false);
          URL.revokeObjectURL(audioUrl);
          fallbackToWebSpeechAPI(text);
        };

        // iOS Safari requires user interaction for audio playback
        // Create a promise that handles both success and failure cases
        const playAudio = () => {
          return new Promise<void>((resolve, reject) => {
            audio.addEventListener('canplaythrough', () => {
              audio.play()
                .then(() => resolve())
                .catch((err) => reject(err));
            }, { once: true });
            
            audio.addEventListener('error', (err) => {
              reject(err);
            }, { once: true });
            
            // Force load the audio
            audio.load();
          });
        };

        try {
          await playAudio();
          return;
        } catch (playError) {
          console.log('OpenAI TTS playback failed, falling back to Web Speech API:', playError);
          setIsSpeaking(false);
          URL.revokeObjectURL(audioUrl);
          fallbackToWebSpeechAPI(text);
          return;
        }
      }
    } catch (error) {
      // Fallback to Web Speech API on error
    }

    // Fallback to Web Speech API
    fallbackToWebSpeechAPI(text);
  }, [isSupported]);

  const fallbackToWebSpeechAPI = (text: string) => {
    
    const speakWithVoices = () => {
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Enhanced configuration for better Japanese speech on iOS
      utterance.lang = 'ja-JP';
      utterance.rate = 0.9; // Slower rate for iOS Safari compatibility
      utterance.pitch = 1.0; // Normal pitch for iOS compatibility
      utterance.volume = 1;

      // Select Japanese voice with iOS optimization
      const voices = window.speechSynthesis.getVoices();
      // On iOS, prefer system Japanese voices
      const japaneseVoice = voices.find(voice => {
        const lang = voice.lang.toLowerCase();
        return lang.startsWith('ja') && voice.localService;
      }) || voices.find(voice => {
        const lang = voice.lang.toLowerCase();
        return lang.includes('ja') || lang.includes('jp');
      });

      if (japaneseVoice) {
        utterance.voice = japaneseVoice;
      }

      utterance.onstart = () => {
        setIsSpeaking(true);
        setError(null);
      };

      utterance.onend = () => {
        setIsSpeaking(false);
      };

      utterance.onerror = (event) => {
        setError(`音声合成エラー: ${event.error}`);
        setIsSpeaking(false);
      };

      window.speechSynthesis.speak(utterance);
    };

    // Wait for voices to be loaded
    if (window.speechSynthesis.getVoices().length === 0) {
      window.speechSynthesis.onvoiceschanged = () => {
        speakWithVoices();
      };
    } else {
      speakWithVoices();
    }
  };

  const stop = useCallback(() => {
    if (isSupported) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, [isSupported]);

  return {
    speak,
    stop,
    isSpeaking,
    isSupported,
    error,
  };
}
