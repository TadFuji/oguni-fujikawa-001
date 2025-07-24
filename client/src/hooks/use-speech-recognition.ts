import { useState, useEffect, useRef } from 'react';

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  [key: number]: {
    transcript: string;
    confidence: number;
  };
}

interface SpeechRecognitionResultList {
  length: number;
  [key: number]: SpeechRecognitionResult;
}

interface SpeechRecognition {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onstart: ((event: Event) => void) | null;
  onend: ((event: Event) => void) | null;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

export function useSpeechRecognition(onTranscriptComplete?: (transcript: string) => void) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const isStartingRef = useRef(false);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const currentTextRef = useRef('');
  const isStoppedRef = useRef(false);
  const callbackRef = useRef(onTranscriptComplete);
  
  // コールバック関数を常に最新に保つ
  callbackRef.current = onTranscriptComplete;

  const isSupported = typeof window !== 'undefined' && 
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  // 1.5秒の無音を検出する関数
  const startSilenceTimer = () => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
    }
    
    silenceTimerRef.current = setTimeout(() => {
      if (currentTextRef.current.trim() && callbackRef.current && !isStoppedRef.current) {
        callbackRef.current(currentTextRef.current.trim());
      }
      
      // 認識を停止
      if (recognitionRef.current && !isStoppedRef.current) {
        isStoppedRef.current = true;
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // Ignore stop errors
        }
      }
    }, 1500);
  };

  useEffect(() => {
    if (!isSupported) return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();

    const recognition = recognitionRef.current;
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'ja-JP';

    recognition.onstart = () => {
      isStartingRef.current = false;
      isStoppedRef.current = false;
      setIsListening(true);
      setError(null);
      setTranscript('');
      currentTextRef.current = '';
    };

    recognition.onend = () => {
      isStartingRef.current = false;
      setIsListening(false);
      
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = null;
      }
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      if (isStoppedRef.current) return;
      
      // 全ての音声結果を累積
      let totalText = '';
      for (let i = 0; i < event.results.length; i++) {
        totalText += event.results[i][0].transcript;
      }

      setTranscript(totalText);
      currentTextRef.current = totalText;
      
      // 音声が検出されたら無音タイマーを開始/リセット
      if (totalText.trim()) {
        startSilenceTimer();
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      isStartingRef.current = false;
      
      if (event.error !== 'no-speech' && event.error !== 'aborted') {
        setError(`音声認識エラー: ${event.error}`);
      }
      setIsListening(false);
    };

    return () => {
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
      }
      if (recognition) {
        recognition.stop();
      }
    };
  }, [isSupported]);

  const startListening = () => {
    if (!isSupported || !recognitionRef.current) {
      return;
    }

    // Stop existing recognition if running
    if (isStartingRef.current || isListening) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // Ignore stop errors
      }
      isStartingRef.current = false;
      setIsListening(false);
    }

    try {
      isStartingRef.current = true;
      isStoppedRef.current = false;
      setError(null);
      setTranscript('');
      currentTextRef.current = '';
      
      // 短い遅延でブラウザ制限を回避
      setTimeout(() => {
        if (recognitionRef.current && isStartingRef.current) {
          recognitionRef.current.start();
        }
      }, 50);
    } catch (error) {
      isStartingRef.current = false;
      setIsListening(false);
      setError('音声認識の開始に失敗しました');
    }
  };

  const stopListening = () => {
    isStoppedRef.current = true;
    
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    
    if (recognitionRef.current && (isListening || isStartingRef.current)) {
      try {
        recognitionRef.current.stop();
      } catch (error) {
        // Ignore stop errors
      }
      isStartingRef.current = false;
      setIsListening(false);
    }
  };

  const resetTranscript = () => {
    setTranscript('');
    setError(null);
    currentTextRef.current = '';
  };

  return {
    isListening,
    transcript,
    startListening,
    stopListening,
    resetTranscript,
    isSupported,
    error,
  };
}