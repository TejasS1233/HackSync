import { useState, useEffect, useCallback, useRef } from "react";
import { OfflineLLM } from "./OfflineLLM";
import { OfflineSTT } from "./OfflineSTT";
import { OfflineTTS } from "./OfflineTTS";

/**
 * useOffline - Hook for offline AI services
 * Provides LLM, STT, TTS with automatic online/offline detection
 */
export function useOffline() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isReady, setIsReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadProgress, setLoadProgress] = useState({ progress: 0, status: "" });
  const [error, setError] = useState(null);

  // Service refs (persist across renders)
  const llmRef = useRef(null);
  const sttRef = useRef(null);
  const ttsRef = useRef(null);

  // Track online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Initialize offline services
  const initOfflineServices = useCallback(async () => {
    if (isLoading || isReady) return;

    setIsLoading(true);
    setError(null);

    try {
      setLoadProgress({ progress: 0, status: "Initializing..." });

      // Initialize TTS (instant, no download)
      ttsRef.current = new OfflineTTS();
      setLoadProgress({ progress: 10, status: "TTS ready" });

      // Initialize STT (instant, no download)
      sttRef.current = new OfflineSTT();
      setLoadProgress({ progress: 20, status: "STT ready" });

      // Initialize LLM (downloads model ~300MB)
      setLoadProgress({ progress: 25, status: "Loading AI model..." });
      llmRef.current = new OfflineLLM();

      await llmRef.current.init((progress) => {
        // Scale progress from 25-100%
        const scaledProgress = 25 + progress.progress * 0.75;
        setLoadProgress({
          progress: Math.round(scaledProgress),
          status: progress.status,
        });
      });

      setIsReady(true);
      setLoadProgress({ progress: 100, status: "All systems ready" });
    } catch (err) {
      console.error("Failed to init offline services:", err);
      const errorMessage = err.message || "Failed to initialize offline AI";
      setError(errorMessage);
      setLoadProgress({
        progress: 0,
        status: `Error: ${errorMessage}`,
      });
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, isReady]);

  // Generate LLM response
  const generateResponse = useCallback(async (prompt) => {
    if (!llmRef.current?.getIsLoaded()) {
      throw new Error("LLM not ready");
    }
    return llmRef.current.generate(prompt);
  }, []);

  // Speak text
  const speak = useCallback(async (text, options) => {
    if (!ttsRef.current) {
      throw new Error("TTS not initialized");
    }
    return ttsRef.current.speak(text, options);
  }, []);

  // Stop speaking
  const stopSpeaking = useCallback(() => {
    ttsRef.current?.stop();
  }, []);

  // Start listening
  const startListening = useCallback((callbacks) => {
    if (!sttRef.current) {
      throw new Error("STT not initialized");
    }
    sttRef.current.onResult = callbacks?.onResult;
    sttRef.current.onInterim = callbacks?.onInterim;
    sttRef.current.onError = callbacks?.onError;
    return sttRef.current.start();
  }, []);

  // Stop listening
  const stopListening = useCallback(() => {
    sttRef.current?.stop();
  }, []);

  return {
    // Status
    isOnline,
    isReady,
    isLoading,
    loadProgress,
    error,

    // Actions
    initOfflineServices,
    generateResponse,
    speak,
    stopSpeaking,
    startListening,
    stopListening,

    // Check support
    isSupported: {
      llm: OfflineLLM.isSupported(),
      stt: OfflineSTT.isSupported(),
      tts: OfflineTTS.isSupported(),
    },
  };
}

export default useOffline;
