
let recognition = null;
let synth = window.speechSynthesis;
let voice = null;
let isLLMLoaded = false;
let isLLMLoading = false;
let isListening = false;
let isSpeaking = false;

export const isSupported = {
    llm: typeof WebAssembly !== "undefined",
    stt: !!(window.SpeechRecognition || window.webkitSpeechRecognition),
    tts: "speechSynthesis" in window,
};

let worker = null;
let pendingResolves = [];

export async function initLLM(onProgress) {
    if (isLLMLoaded || isLLMLoading) return;
    isLLMLoading = true;

    try {
        // Initialize Worker
        worker = new Worker(new URL("./offlineWorker.js", import.meta.url), {
            type: "module",
        });

        worker.onmessage = (e) => {
            const { type, payload } = e.data;

            if (type === "status") {
                if (payload.status === "ready") {
                    isLLMLoaded = true;
                    isLLMLoading = false;
                    onProgress?.({ progress: 100, status: "Model ready" });
                } else {
                    onProgress?.({ progress: 0, status: payload.status });
                }
            } else if (type === "progress") {
                // Map transformer progress to user-friendly status
                if (payload.status === "progress") {
                    onProgress?.({
                        progress: payload.progress,
                        status: `Downloading ${payload.file || 'model'}...`
                    });
                } else if (payload.status === "initiate") {
                    onProgress?.({ progress: 5, status: "Starting download..." });
                } else {
                    onProgress?.({
                        progress: payload.progress || 0,
                        status: payload.status
                    });
                }
            } else if (type === "response") {
                const resolve = pendingResolves.shift();
                if (resolve) resolve(payload);
            } else if (type === "error") {
                console.error("Worker Error:", payload);
                isLLMLoading = false;
                // Fail any pending generation
                const resolve = pendingResolves.shift();
                if (resolve) resolve("Error: " + payload);
                throw new Error(payload);
            }
        };

        worker.postMessage({ type: "init" });

    } catch (error) {
        console.error(error);
        isLLMLoading = false;
        throw new Error(error.message || "Failed to load offline AI model.");
    }
}

export async function generateResponse(prompt, options = {}) {
    if (!isLLMLoaded || !worker) throw new Error("LLM not initialized");

    return new Promise((resolve) => {
        pendingResolves.push(resolve);
        worker.postMessage({ type: "generate", payload: prompt });
    });
}

export function initSTT(callbacks) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event) => {
        let finalTranscript = "";
        let interimTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
                finalTranscript += transcript;
            } else {
                interimTranscript += transcript;
            }
        }

        if (finalTranscript) callbacks?.onResult?.(finalTranscript);
        if (interimTranscript) callbacks?.onInterim?.(interimTranscript);
    };

    recognition.onerror = (event) => {
        console.error(event.error);
        callbacks?.onError?.(event.error);
    };

    recognition.onend = () => {
        isListening = false;
        callbacks?.onEnd?.();
    };
}

export function startListening(callbacks) { // callbacks: { onResult, onInterim, onError, onEnd }
    if (!recognition) {
        initSTT(callbacks);
    } else {
        // Update callbacks for existing instance
        recognition.onresult = (event) => {
            let finalTranscript = "";
            let interimTranscript = "";
            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript;
                if (event.results[i].isFinal) finalTranscript += transcript;
                else interimTranscript += transcript;
            }
            if (finalTranscript) callbacks?.onResult?.(finalTranscript);
            if (interimTranscript) callbacks?.onInterim?.(interimTranscript);
        };
        recognition.onerror = (event) => {
            console.error("STT Error:", event.error);
            callbacks?.onError?.(event.error);
        };
        recognition.onend = () => {
            isListening = false;
            callbacks?.onEnd?.();
        };
    }

    if (isListening) return true;

    try {
        recognition.start();
        isListening = true;
        return true;
    } catch (error) {
        if (error.name === 'NotAllowedError') {
            console.error("Microphone permission denied");
            callbacks?.onError?.('permission-denied');
        } else if (error.message.includes("already started")) {
            isListening = true; // Sync state
            return true;
        }
        console.error("STT Start Error:", error);
        return false;
    }
}

export function stopListening() {
    if (recognition) {
        try {
            recognition.stop();
        } catch (e) { /* ignore */ }
    }
    isListening = false;
}

export function speak(text, options = {}) {
    return new Promise((resolve, reject) => {
        if (!synth) {
            console.error("TTS not supported");
            reject(new Error("Speech synthesis not supported"));
            return;
        }

        // Cancel previous speech
        synth.cancel();

        const utterance = new SpeechSynthesisUtterance(text);

        // Robust voice loading
        let voices = synth.getVoices();
        if (voices.length === 0) {
            // Wait for voices to load
            speechSynthesis.onvoiceschanged = () => {
                voices = synth.getVoices();
                setUtteranceVoice();
                synth.speak(utterance);
            };
        } else {
            setUtteranceVoice();
            synth.speak(utterance);
        }

        function setUtteranceVoice() {
            utterance.voice = voice || voices.find(v => v.name.includes("Google US English")) || voices.find(v => v.lang.startsWith("en")) || voices[0];
        }

        utterance.rate = options.rate ?? 1;
        utterance.pitch = options.pitch ?? 1;
        utterance.volume = options.volume ?? 1;

        utterance.onstart = () => {
            isSpeaking = true;
            options.onStart?.();
        };

        utterance.onend = () => {
            isSpeaking = false;
            options.onEnd?.();
            resolve();
        };

        utterance.onerror = (event) => {
            console.error("TTS Error:", event);
            isSpeaking = false;
            // Don't reject on 'interrupted' or 'canceled' as these are normal during rapid conversation
            if (event.error === 'interrupted' || event.error === 'canceled') {
                resolve();
            } else {
                reject(event.error);
            }
        };

        // Fallback if voices logic handled above
        if (voices.length > 0) {
            // speak called above
        }
    });
}


export const getIsLLMLoaded = () => isLLMLoaded;
