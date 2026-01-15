/**
 * OfflineLLM - Local LLM using Transformers.js
 * Uses SmolLM-360M for minimum viable offline responses
 */

// Lazy-load transformers.js to avoid bundling if not used
let pipeline = null;
let generator = null;

export class OfflineLLM {
  constructor() {
    this.isLoaded = false;
    this.isLoading = false;
    // Use a smaller, more reliable model
    this.model = "Xenova/LaMini-Flan-T5-783M";
    this.onProgress = null;
  }

  /**
   * Initialize the LLM (downloads model ~300MB on first use)
   * @param {function} onProgress - Progress callback ({ progress, status })
   */
  async init(onProgress) {
    if (this.isLoaded || this.isLoading) return;

    this.isLoading = true;
    this.onProgress = onProgress;

    try {
      // Dynamic import to enable code splitting
      const { pipeline: pipelineFn, env } = await import(
        "@xenova/transformers"
      );
      pipeline = pipelineFn;

      // Configure transformers.js
      env.allowLocalModels = false;
      env.allowRemoteModels = true;

      onProgress?.({ progress: 0, status: "Loading model..." });

      generator = await pipeline("text2text-generation", this.model, {
        progress_callback: (data) => {
          if (data.status === "progress" && data.progress) {
            onProgress?.({
              progress: Math.round(data.progress),
              status: `Downloading: ${Math.round(data.progress)}%`,
            });
          } else if (data.status === "ready") {
            onProgress?.({
              progress: 100,
              status: "Model ready",
            });
          } else if (data.status === "initiate") {
            onProgress?.({
              progress: 5,
              status: "Starting download...",
            });
          } else if (data.file) {
            onProgress?.({
              progress: data.progress || 0,
              status: `Loading ${data.file}...`,
            });
          }
        },
      });

      this.isLoaded = true;
      onProgress?.({ progress: 100, status: "Ready" });
    } catch (error) {
      console.error("Failed to load LLM:", error);
      this.isLoading = false;

      // Provide helpful error message
      let errorMessage = "Failed to load offline AI model.";
      if (error.message && error.message.includes("JSON")) {
        errorMessage =
          "Network error: Unable to download AI model. Please check your internet connection and try again.";
      } else if (error.message) {
        errorMessage = `Failed to load offline AI model: ${error.message}`;
      }

      throw new Error(errorMessage);
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Generate a response
   * @param {string} prompt - User message
   * @param {object} options - { maxTokens, temperature }
   */
  async generate(prompt, options = {}) {
    if (!this.isLoaded) {
      throw new Error("LLM not initialized. Call init() first.");
    }

    const lowerPrompt = prompt.toLowerCase();

    // Hardcoded responses for demo
    if (lowerPrompt.includes("stress") || lowerPrompt.includes("anxious") || lowerPrompt.includes("worried")) {
      return "I hear you. Feeling stressed is completely normal. Take a deep breath with me — inhale for 4 seconds, hold for 4, exhale for 4. Remember, it's okay to take things one step at a time. Would you like to talk about what's on your mind?";
    }

    if (lowerPrompt.includes("learn") || lowerPrompt.includes("teach") || lowerPrompt.includes("study") || lowerPrompt.includes("help me understand")) {
      return "I'd love to help you learn! Breaking things into smaller chunks makes it easier. What topic would you like to explore? I'll guide you step by step.";
    }

    if (lowerPrompt.includes("sad") || lowerPrompt.includes("depressed") || lowerPrompt.includes("lonely") || lowerPrompt.includes("down")) {
      return "I'm really sorry you're feeling this way. It takes courage to share that. You're not alone — I'm here with you. Sometimes just talking about it can help. What's been weighing on you?";
    }

    if (lowerPrompt.includes("motivat") || lowerPrompt.includes("give up") || lowerPrompt.includes("can't do") || lowerPrompt.includes("hopeless")) {
      return "I believe in you, even when it's hard to believe in yourself. Every small step counts. What's one tiny thing you could do right now? Sometimes starting small builds momentum.";
    }

    if (lowerPrompt.includes("hello") || lowerPrompt.includes("hi") || lowerPrompt.includes("hey") || lowerPrompt.includes("who are you")) {
      return "Hello! I'm Mirage, your AI companion. I'm here to listen, support, and help you learn. How are you feeling today?";
    }

    if (lowerPrompt.includes("sleep") || lowerPrompt.includes("insomnia") || lowerPrompt.includes("can't rest") || lowerPrompt.includes("tired")) {
      return "Sleep troubles can be really draining. Try a calming routine before bed — no screens, maybe some gentle stretching or reading. Would you like some relaxation techniques?";
    }

    if (lowerPrompt.includes("focus") || lowerPrompt.includes("distract") || lowerPrompt.includes("concentrate") || lowerPrompt.includes("productive")) {
      return "Staying focused can be tough! Try the Pomodoro technique: 25 minutes of work, then a 5-minute break. Also, remove distractions and set a clear goal. What are you working on?";
    }

    try {
      // Minimal knowledge injection
      const SYSTEM = "You are Mirage, an empathetic AI companion. Respond with warmth and understanding.";
      const formattedPrompt = `${SYSTEM}\n\nUser: ${prompt}\nAssistant:`;

      const result = await generator(formattedPrompt, {
        max_new_tokens: options.maxTokens ?? 100,
        temperature: options.temperature ?? 0.7,
        do_sample: true,
        top_p: 0.9,
      });

      // Extract the generated text
      return result[0].generated_text.trim();
    } catch (error) {
      console.error("Generation error:", error);
      throw new Error(`Failed to generate response: ${error.message}`);
    }
  }

  /**
   * Check if LLM is ready
   */
  getIsLoaded() {
    return this.isLoaded;
  }

  /**
   * Check if LLM is currently loading
   */
  getIsLoading() {
    return this.isLoading;
  }

  /**
   * Check if Transformers.js is supported
   */
  static isSupported() {
    // Check for WebAssembly support
    return typeof WebAssembly !== "undefined";
  }
}

export default OfflineLLM;
