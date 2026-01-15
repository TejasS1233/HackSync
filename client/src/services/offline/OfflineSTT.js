/**
 * OfflineSTT - Speech-to-Text using Web Speech API
 * Fallback for Vosk WASM (simpler setup for MVP)
 */
export class OfflineSTT {
    constructor() {
        this.recognition = null;
        this.isListening = false;
        this.onResult = null;
        this.onInterim = null;
        this.onError = null;
        this.onEnd = null;

        this.init();
    }

    init() {
        const SpeechRecognition =
            window.SpeechRecognition || window.webkitSpeechRecognition;

        if (!SpeechRecognition) {
            console.warn("SpeechRecognition not supported in this browser");
            return;
        }

        this.recognition = new SpeechRecognition();
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.recognition.lang = "en-US";

        this.recognition.onresult = (event) => {
            let interimTranscript = "";
            let finalTranscript = "";

            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                    finalTranscript += transcript;
                } else {
                    interimTranscript += transcript;
                }
            }

            if (finalTranscript) {
                this.onResult?.(finalTranscript);
            }
            if (interimTranscript) {
                this.onInterim?.(interimTranscript);
            }
        };

        this.recognition.onerror = (event) => {
            console.error("STT Error:", event.error);
            this.onError?.(event.error);
        };

        this.recognition.onend = () => {
            this.isListening = false;
            this.onEnd?.();
        };
    }

    /**
     * Start listening
     */
    start() {
        if (!this.recognition) {
            this.onError?.("SpeechRecognition not supported");
            return false;
        }

        try {
            this.recognition.start();
            this.isListening = true;
            return true;
        } catch (error) {
            console.error("Failed to start STT:", error);
            return false;
        }
    }

    /**
     * Stop listening
     */
    stop() {
        if (this.recognition && this.isListening) {
            this.recognition.stop();
            this.isListening = false;
        }
    }

    /**
     * Set language
     */
    setLanguage(lang) {
        if (this.recognition) {
            this.recognition.lang = lang;
        }
    }

    /**
     * Check if currently listening
     */
    getIsListening() {
        return this.isListening;
    }

    /**
     * Check if STT is supported
     */
    static isSupported() {
        return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
    }
}

export default OfflineSTT;
