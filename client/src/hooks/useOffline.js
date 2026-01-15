import { useState, useEffect, useCallback } from "react";
import * as offlineServices from "@/lib/offlineServices";

export function useOffline() {
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [isReady, setIsReady] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [loadProgress, setLoadProgress] = useState({ progress: 0, status: "" });
    const [error, setError] = useState(null);

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

    const initOfflineServices = useCallback(async () => {
        if (isLoading || isReady) return;

        setIsLoading(true);
        setError(null);

        try {
            setLoadProgress({ progress: 0, status: "Initializing..." });

            setLoadProgress({ progress: 20, status: "Services ready" });

            setLoadProgress({ progress: 25, status: "Loading AI model..." });

            await offlineServices.initLLM((progress) => {
                const scaledProgress = 25 + progress.progress * 0.75;
                setLoadProgress({
                    progress: Math.round(scaledProgress),
                    status: progress.status,
                });
            });

            setIsReady(true);
            setLoadProgress({ progress: 100, status: "All systems ready" });
        } catch (err) {
            console.error(err);
            setError(err.message || "Failed to initialize offline AI");
            setLoadProgress({ progress: 0, status: "Error" });
        } finally {
            setIsLoading(false);
        }
    }, [isLoading, isReady]);

    const generateResponse = useCallback(async (prompt) => {
        return offlineServices.generateResponse(prompt);
    }, []);

    const speak = useCallback(async (text, options) => {
        return offlineServices.speak(text, options);
    }, []);

    const stopSpeaking = useCallback(() => {
        offlineServices.stopSpeaking();
    }, []);

    const startListening = useCallback((callbacks) => {
        return offlineServices.startListening(callbacks);
    }, []);

    const stopListening = useCallback(() => {
        offlineServices.stopListening();
    }, []);

    return {
        isOnline,
        isReady,
        isLoading,
        loadProgress,
        error,
        initOfflineServices,
        generateResponse,
        speak,
        stopSpeaking,
        startListening,
        stopListening,
        isSupported: offlineServices.isSupported,
    };
}

export default useOffline;
