/**
 * Chrome Built-in AI (Gemini Nano) Service
 * Provides sentiment analysis using on-device AI
 */

class ChromeAIService {
  constructor() {
    this.session = null;
    this.isAvailable = false;
    this.isInitialized = false;
  }

  /**
   * Check if Chrome Built-in AI is available
   */
  async checkAvailability() {
    try {
      if (!window.ai || !window.ai.languageModel) {
        console.warn("Chrome Built-in AI not available");
        return false;
      }

      const availability = await window.ai.languageModel.capabilities();
      this.isAvailable =
        availability.available === "readily" ||
        availability.available === "after-download";

      return this.isAvailable;
    } catch (error) {
      console.error("Error checking Chrome AI availability:", error);
      return false;
    }
  }

  /**
   * Initialize the AI session
   */
  async initialize() {
    if (this.isInitialized && this.session) {
      return true;
    }

    try {
      const available = await this.checkAvailability();
      if (!available) {
        throw new Error("Chrome Built-in AI is not available");
      }

      this.session = await window.ai.languageModel.create({
        systemPrompt: `You are a sentiment analysis expert. Analyze the emotional tone and mood of conversations.
Respond ONLY with a JSON object in this exact format:
{
  "mood": "one of: Happy, Sad, Anxious, Excited, Frustrated, Calm, Confused, Curious, Neutral",
  "confidence": 0.0-1.0,
  "emotions": {
    "joy": 0.0-1.0,
    "sadness": 0.0-1.0,
    "anger": 0.0-1.0,
    "fear": 0.0-1.0,
    "surprise": 0.0-1.0
  },
  "sentiment": "Positive, Negative, or Neutral",
  "keywords": ["word1", "word2", "word3"]
}
Be concise and accurate.`,
      });

      this.isInitialized = true;
      console.log("Chrome AI initialized successfully");
      return true;
    } catch (error) {
      console.error("Error initializing Chrome AI:", error);
      this.isInitialized = false;
      return false;
    }
  }

  /**
   * Analyze sentiment of a conversation session
   * @param {string} text - The conversation text to analyze
   * @returns {Promise<Object>} Sentiment analysis result
   */
  async analyzeSentiment(text) {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      if (!this.session) {
        throw new Error("AI session not initialized");
      }

      const prompt = `Analyze the sentiment and mood of this conversation:\n\n"${text}"\n\nProvide analysis in JSON format.`;

      const response = await this.session.prompt(prompt);

      // Parse JSON response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      // Fallback if JSON parsing fails
      return this.getFallbackAnalysis(text);
    } catch (error) {
      console.error("Error analyzing sentiment:", error);
      return this.getFallbackAnalysis(text);
    }
  }

  /**
   * Analyze multiple sessions in batch
   * @param {Array<{id: string, text: string}>} sessions
   * @returns {Promise<Array>} Array of sentiment results
   */
  async analyzeBatch(sessions) {
    const results = [];

    for (const session of sessions) {
      const analysis = await this.analyzeSentiment(session.text);
      results.push({
        sessionId: session.id,
        ...analysis,
      });
    }

    return results;
  }

  /**
   * Fallback analysis when AI is not available
   */
  getFallbackAnalysis(text) {
    // Simple keyword-based fallback
    const lowerText = text.toLowerCase();

    const positiveWords = [
      "happy",
      "great",
      "good",
      "excellent",
      "love",
      "wonderful",
      "amazing",
    ];
    const negativeWords = [
      "sad",
      "bad",
      "terrible",
      "hate",
      "awful",
      "horrible",
      "angry",
    ];
    const anxiousWords = [
      "worried",
      "anxious",
      "nervous",
      "stressed",
      "concerned",
    ];

    let positiveCount = 0;
    let negativeCount = 0;
    let anxiousCount = 0;

    positiveWords.forEach((word) => {
      if (lowerText.includes(word)) positiveCount++;
    });
    negativeWords.forEach((word) => {
      if (lowerText.includes(word)) negativeCount++;
    });
    anxiousWords.forEach((word) => {
      if (lowerText.includes(word)) anxiousCount++;
    });

    let mood = "Neutral";
    let sentiment = "Neutral";

    if (positiveCount > negativeCount && positiveCount > anxiousCount) {
      mood = "Happy";
      sentiment = "Positive";
    } else if (negativeCount > positiveCount) {
      mood = "Frustrated";
      sentiment = "Negative";
    } else if (anxiousCount > 0) {
      mood = "Anxious";
      sentiment = "Negative";
    }

    return {
      mood,
      confidence: 0.6,
      emotions: {
        joy: positiveCount / 10,
        sadness: negativeCount / 10,
        anger: negativeCount / 15,
        fear: anxiousCount / 10,
        surprise: 0.3,
      },
      sentiment,
      keywords: [],
    };
  }

  /**
   * Destroy the session
   */
  async destroy() {
    if (this.session) {
      try {
        await this.session.destroy();
      } catch (error) {
        console.error("Error destroying session:", error);
      }
      this.session = null;
      this.isInitialized = false;
    }
  }
}

export default new ChromeAIService();
