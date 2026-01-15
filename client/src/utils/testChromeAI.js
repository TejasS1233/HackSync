/**
 * Test utility for Chrome Built-in AI
 * Run in browser console to verify setup
 */

export async function testChromeAI() {
  console.log("🧪 Testing Chrome Built-in AI...\n");

  // Test 1: Check if API exists
  console.log("1️⃣ Checking API availability...");
  if (!window.ai || !window.ai.languageModel) {
    console.error("❌ Chrome Built-in AI API not found");
    console.log("💡 Make sure you are using Chrome 127+ with flags enabled");
    console.log("📖 See CHROME_AI_SETUP.md for instructions");
    return false;
  }
  console.log("✅ API found\n");

  // Test 2: Check capabilities
  console.log("2️⃣ Checking capabilities...");
  try {
    const capabilities = await window.ai.languageModel.capabilities();
    console.log("Capabilities:", capabilities);

    if (capabilities.available === "no") {
      console.error("❌ Model not available");
      return false;
    }

    if (capabilities.available === "after-download") {
      console.warn("⚠️ Model needs to be downloaded");
      console.log("💡 Run: await ai.languageModel.create() to download");
      return false;
    }

    console.log("✅ Model ready\n");
  } catch (error) {
    console.error("❌ Error checking capabilities:", error);
    return false;
  }

  // Test 3: Create session
  console.log("3️⃣ Creating AI session...");
  let session;
  try {
    session = await window.ai.languageModel.create({
      systemPrompt: "You are a helpful assistant. Respond concisely.",
    });
    console.log("✅ Session created\n");
  } catch (error) {
    console.error("❌ Error creating session:", error);
    return false;
  }

  // Test 4: Test prompt
  console.log("4️⃣ Testing prompt...");
  try {
    const response = await session.prompt(
      'Say "Hello from Gemini Nano!" in JSON format: {"message": "..."}'
    );
    console.log("Response:", response);
    console.log("✅ Prompt successful\n");
  } catch (error) {
    console.error("❌ Error with prompt:", error);
    return false;
  }

  // Test 5: Test sentiment analysis
  console.log("5️⃣ Testing sentiment analysis...");
  try {
    const sentimentPrompt = `Analyze the sentiment of this text: "I'm so excited about this project!"
Return JSON: {"mood": "Happy", "sentiment": "Positive"}`;

    const sentimentResponse = await session.prompt(sentimentPrompt);
    console.log("Sentiment Response:", sentimentResponse);
    console.log("✅ Sentiment analysis successful\n");
  } catch (error) {
    console.error("❌ Error with sentiment analysis:", error);
    return false;
  }

  // Cleanup
  try {
    await session.destroy();
    console.log("✅ Session destroyed\n");
  } catch (error) {
    console.warn("⚠️ Error destroying session:", error);
  }

  console.log("🎉 All tests passed! Chrome AI is ready to use.");
  return true;
}

// Auto-run if in browser console
if (typeof window !== "undefined") {
  window.testChromeAI = testChromeAI;
  console.log("💡 Run testChromeAI() in console to test Chrome AI setup");
}
