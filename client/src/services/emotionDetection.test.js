// Simple test file to verify emotion detection
// Run this in browser console or create a test page

import { detectEmotionWithAI } from "./emotionDetection";

export async function testEmotionDetection() {
  const testCases = [
    { text: "I'm so happy and excited about this!", expected: "joy" },
    { text: "This is terrible news, I feel awful.", expected: "sadness" },
    { text: "Wow! I can't believe this happened!", expected: "surprise" },
    { text: "I'm really worried about what might happen.", expected: "fear" },
    { text: "This is so frustrating and unfair!", expected: "anger" },
    { text: "The weather is nice today.", expected: "neutral" },
    { text: "I trust you completely with this decision.", expected: "trust" },
    {
      text: "I can't wait to see what happens next!",
      expected: "anticipation",
    },
  ];

  console.log("🧪 Testing Emotion Detection with Gemini AI\n");

  for (const testCase of testCases) {
    try {
      const detected = await detectEmotionWithAI(testCase.text);
      const match = detected === testCase.expected ? "✅" : "❌";
      console.log(`${match} Text: "${testCase.text}"`);
      console.log(`   Expected: ${testCase.expected}, Got: ${detected}\n`);
    } catch (error) {
      console.error(`❌ Error testing: "${testCase.text}"`, error);
    }
  }
}

// Uncomment to run tests
// testEmotionDetection();
