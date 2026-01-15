/**
 * OfflineTTS - Text-to-Speech using Web Speech API
 * Zero download - uses browser's built-in speech synthesis
 */
export class OfflineTTS {
    constructor() {
        this.synth = window.speechSynthesis;
        this.voice = null;
        this.speaking = false;
    }

    /**
     * Get available voices (call after voices are loaded)
     */
    getVoices() {
        return this.synth.getVoices();
    }

    /**
     * Set preferred voice by name or language
     */
    setVoice(voiceNameOrLang) {
        const voices = this.getVoices();
        this.voice =
            voices.find(
                (v) =>
                    v.name.includes(voiceNameOrLang) || v.lang.includes(voiceNameOrLang)
            ) || voices[0];
    }

    /**
     * Speak text
     * @param {string} text - Text to speak
     * @param {object} options - { rate, pitch, volume, onStart, onEnd, onWord }
     */
    speak(text, options = {}) {
        return new Promise((resolve, reject) => {
            if (!this.synth) {
                reject(new Error("Speech synthesis not supported"));
                return;
            }

            // Cancel any ongoing speech
            this.stop();

            const utterance = new SpeechSynthesisUtterance(text);
            utterance.voice = this.voice || this.getVoices()[0];
            utterance.rate = options.rate ?? 1;
            utterance.pitch = options.pitch ?? 1;
            utterance.volume = options.volume ?? 1;

            utterance.onstart = () => {
                this.speaking = true;
                options.onStart?.();
            };

            utterance.onend = () => {
                this.speaking = false;
                options.onEnd?.();
                resolve();
            };

            utterance.onerror = (event) => {
                this.speaking = false;
                reject(event.error);
            };

            // Word boundary for lip-sync
            utterance.onboundary = (event) => {
                if (event.name === "word") {
                    options.onWord?.(event);
                }
            };

            this.synth.speak(utterance);
        });
    }

    /**
     * Stop current speech
     */
    stop() {
        if (this.synth) {
            this.synth.cancel();
            this.speaking = false;
        }
    }

    /**
     * Check if currently speaking
     */
    isSpeaking() {
        return this.speaking || this.synth?.speaking;
    }

    /**
     * Check if TTS is supported
     */
    static isSupported() {
        return "speechSynthesis" in window;
    }
}

export default OfflineTTS;
