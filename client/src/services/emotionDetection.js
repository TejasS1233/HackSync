import { GoogleGenerativeAI } from "@google/generative-ai";

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

let genAI = null;
let model = null;

// Initialize Gemini
function initializeGemini() {
  if (!genAI && GEMINI_API_KEY) {
    genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
  }
  return model;
}

// Enhanced emotion detection prompt with better sensitivity
const EMOTION_DETECTION_PROMPT = `You are an expert emotion detection AI with high sensitivity to emotional nuances. Analyze the given text and determine the primary emotion expressed.

Available emotions:
- joy: happiness, excitement, celebration, delight, cheerfulness
- happiness: contentment, satisfaction, pleasure, wellbeing
- sadness: sorrow, grief, disappointment, melancholy, despair, hopelessness, depression
- anger: frustration, rage, irritation, annoyance, fury, hostility, resentment
- fear: worry, anxiety, concern, nervousness, dread, panic
- surprise: amazement, astonishment, shock, wonder
- disgust: revulsion, distaste, aversion, contempt
- trust: confidence, faith, reliability, security
- anticipation: expectation, eagerness, looking forward, excitement
- neutral: no strong emotion, factual, purely informative

CRITICAL RULES:
1. Respond with ONLY ONE WORD - the emotion name (lowercase)
2. Be HIGHLY SENSITIVE to negative emotions - even subtle frustration should be detected as "anger"
3. Detect sarcasm, passive aggression, and veiled hostility as "anger"
4. Detect complaints, criticism, or negative feedback as "anger" or "sadness"
5. Profanity, insults, or aggressive language = "anger"
6. Expressions of loss, disappointment, or despair = "sadness"
7. Only use "neutral" for purely factual statements with NO emotional undertones
8. When in doubt between emotions, favor the stronger negative emotion

Examples:
- "This is garbage" → anger
- "I'm so done with this" → anger
- "Whatever, I don't care anymore" → sadness
- "Why would anyone do this?" → anger
- "This doesn't work at all" → anger
- "I feel terrible" → sadness
- "Ugh" → anger
- "The sky is blue" → neutral

Text to analyze: `;

/**
 * Detect emotion from text using Gemini AI with enhanced sensitivity
 * @param {string} text - The text to analyze
 * @returns {Promise<string>} - The detected emotion (lowercase)
 */
export async function detectEmotionWithAI(text) {
  if (!text || typeof text !== "string" || text.trim().length === 0) {
    return "neutral";
  }

  try {
    const aiModel = initializeGemini();
    if (!aiModel) {
      console.warn("Gemini API not initialized, falling back to keyword detection");
      return keywordBasedEmotionFallback(text);
    }

    const result = await aiModel.generateContent(
      EMOTION_DETECTION_PROMPT + text
    );
    const response = await result.response;
    const emotion = response.text().trim().toLowerCase();

    // Validate the response is a known emotion
    const validEmotions = [
      "joy",
      "happiness",
      "sadness",
      "anger",
      "fear",
      "surprise",
      "disgust",
      "trust",
      "anticipation",
      "neutral",
    ];

    if (validEmotions.includes(emotion)) {
      console.log(
        `AI detected emotion: "${emotion}" from text: "${text.substring(
          0,
          50
        )}..."`
      );
      return emotion;
    }

    console.warn(
      `Invalid emotion "${emotion}" returned, using fallback detection`
    );
    return keywordBasedEmotionFallback(text);
  } catch (error) {
    console.error("Error detecting emotion with AI:", error);
    return keywordBasedEmotionFallback(text);
  }
}

/**
 * Keyword-based fallback for emotion detection
 * More sensitive to negative emotions
 */
function keywordBasedEmotionFallback(text) {
  const lowerText = text.toLowerCase();
  
  // Anger indicators (expanded and more sensitive)
  const angerKeywords = [
    'hate', 'angry', 'mad', 'furious', 'rage', 'pissed', 'damn', 'hell',
    'stupid', 'idiot', 'garbage', 'trash', 'terrible', 'horrible', 'awful',
    'suck', 'worst', 'annoying', 'frustrating', 'ridiculous', 'pathetic',
    'useless', 'pointless', 'ugh', 'wtf', 'bullshit', 'crap', 'dumb',
    'irritating', 'infuriating', 'disgusting', 'outrageous', 'unacceptable',
    'fed up', 'sick of', 'done with', 'can\'t stand', 'shut up'
  ];
  
  // Sadness indicators (expanded)
  const sadnessKeywords = [
    'sad', 'depressed', 'lonely', 'hurt', 'pain', 'cry', 'tears',
    'miserable', 'heartbroken', 'hopeless', 'defeated', 'lost', 'empty',
    'disappointed', 'regret', 'sorry', 'miss', 'wish', 'unfortunate',
    'despair', 'grief', 'sorrow', 'melancholy', 'gloomy', 'down',
    'don\'t care', 'whatever', 'give up', 'can\'t anymore'
  ];
  
  // Fear indicators
  const fearKeywords = [
    'afraid', 'scared', 'fear', 'worry', 'anxious', 'nervous', 'terrified',
    'panic', 'dread', 'frightened', 'concerned', 'uneasy', 'threat'
  ];
  
  // Joy/Happiness indicators
  const joyKeywords = [
    'happy', 'joy', 'love', 'great', 'awesome', 'amazing', 'wonderful',
    'fantastic', 'excellent', 'perfect', 'yay', 'excited', 'thrilled',
    'delighted', 'glad', 'pleased', 'nice', 'good', 'best'
  ];

  // Check for profanity or aggressive punctuation
  const hasProfanity = /\b(fuck|shit|ass|bitch|bastard)\w*/i.test(text);
  const hasAggressivePunctuation = /!{2,}/.test(text) || /\?{2,}/.test(text);
  const hasAllCaps = /[A-Z]{4,}/.test(text);
  
  // Count emotion keywords
  const angerCount = angerKeywords.filter(word => lowerText.includes(word)).length;
  const sadnessCount = sadnessKeywords.filter(word => lowerText.includes(word)).length;
  const fearCount = fearKeywords.filter(word => lowerText.includes(word)).length;
  const joyCount = joyKeywords.filter(word => lowerText.includes(word)).length;
  
  // Profanity or aggressive formatting = anger
  if (hasProfanity || (hasAggressivePunctuation && angerCount > 0) || hasAllCaps) {
    return "anger";
  }
  
  // Return strongest emotion detected
  if (angerCount >= 1) return "anger";
  if (sadnessCount >= 1) return "sadness";
  if (fearCount >= 1) return "fear";
  if (joyCount >= 2) return "joy";
  
  return "neutral";
}

/**
 * Batch detect emotions for multiple messages
 * @param {string[]} texts - Array of texts to analyze
 * @returns {Promise<string[]>} - Array of detected emotions
 */
export async function detectEmotionsBatch(texts) {
  if (!Array.isArray(texts) || texts.length === 0) {
    return [];
  }

  try {
    const promises = texts.map((text) => detectEmotionWithAI(text));
    return await Promise.all(promises);
  } catch (error) {
    console.error("Error in batch emotion detection:", error);
    return texts.map(() => "neutral");
  }
}

/**
 * Get emotion with caching to avoid redundant API calls
 */
const emotionCache = new Map();
const CACHE_DURATION = 60000; // 1 minute

export async function detectEmotionCached(text) {
  const cacheKey = text.trim().toLowerCase();
  const cached = emotionCache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.emotion;
  }

  const emotion = await detectEmotionWithAI(text);
  emotionCache.set(cacheKey, { emotion, timestamp: Date.now() });

  // Clean old cache entries
  if (emotionCache.size > 100) {
    const oldestKey = emotionCache.keys().next().value;
    emotionCache.delete(oldestKey);
  }

  return emotion;
}