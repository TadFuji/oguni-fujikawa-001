import { useState, useCallback } from 'react';

export function useTextToSpeech() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;

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
        
        // Optimize audio playback for mobile and speed
        audio.preload = 'auto';
        audio.volume = 0.9; // Slightly lower volume for comfort
        audio.playbackRate = 1.0; // Ensure consistent playback speed
        
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

        try {
          await audio.play();
          return;
        } catch (playError) {
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
      
      // Enhanced configuration for better Japanese speech
      utterance.lang = 'ja-JP';
      utterance.rate = 1.05; // Slightly faster for energy
      utterance.pitch = 0.7; // Lower pitch for male voice
      utterance.volume = 1;

      // Select Japanese voice
      const voices = window.speechSynthesis.getVoices();
      const japaneseVoice = voices.find(voice => {
        const lang = voice.lang.toLowerCase();
        const name = voice.name.toLowerCase();
        return (lang.includes('ja') || lang.includes('jp')) && 
               (name.includes('ichiro') || name.includes('takeshi') || 
                name.includes('male') || name.includes('男'));
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
