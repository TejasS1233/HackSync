import { useEffect, useRef, useState } from "react";
import * as SpeechSDK from "microsoft-cognitiveservices-speech-sdk";
import { GoogleGenAI } from "@google/genai";
// import "./chat.css"
// Avatar is only available in these regions:
const AVATAR_SUPPORTED_REGIONS = [
  "westus2",
  "westeurope",
  "southeastasia",
  "eastus",
  "southcentralus",
  "northeurope",
  "westcentralus",
];

// Supported speaking styles for Azure Neural voices (mstts:express-as)
const SUPPORTED_STYLES = [
  "cheerful",
  "sad",
  "angry",
  "excited",
  "friendly",
  "hopeful",
  "shouting",
  "whispering",
  "terrified",
  "unfriendly",
  "empathetic",
  "calm",
  "chat",
  "newscast",
  "customerservice",
  "assistant",
  "narration-professional",
  "default", // fallback neutral
];

// System prompt for Gemini to analyze emotions and generate response
const GEMINI_SYSTEM_PROMPT = `You are a helpful, expressive AI assistant. Your task is to:
1. Respond naturally to the user's message
2. Analyze the emotional context and determine the best speaking style
3. Add emotion markers in your response text using special tags

IMPORTANT: You MUST respond in valid JSON format with this exact structure:
{
  "response": "Your natural conversational response here",
  "emotion": "one of: cheerful, sad, angry, excited, friendly, hopeful, terrified, empathetic, calm, chat, default",
  "segments": [
    {
      "text": "segment of your response",
      "style": "emotion style for this segment",
      "intensity": "low, medium, or high"
    }
  ]
}

Rules for segments:
- Break your response into emotional segments if the tone changes
- Each segment should have appropriate emotion
- Use "default" for neutral statements
- Match emotion to content (e.g., "I'm so sorry" → sad/empathetic, "That's wonderful!" → cheerful/excited)
- Keep segments natural - don't force emotion changes

Example user: "I just got promoted at work!"
Example response:
{
  "response": "Oh wow, congratulations! That's absolutely wonderful news! You must have worked so hard for this. I'm really happy for you!",
  "emotion": "cheerful",
  "segments": [
    {"text": "Oh wow, congratulations!", "style": "excited", "intensity": "high"},
    {"text": "That's absolutely wonderful news!", "style": "cheerful", "intensity": "high"},
    {"text": "You must have worked so hard for this.", "style": "empathetic", "intensity": "medium"},
    {"text": "I'm really happy for you!", "style": "cheerful", "intensity": "high"}
  ]
}

Example user: "My pet passed away yesterday"
Example response:
{
  "response": "I'm so deeply sorry for your loss. Losing a beloved pet is incredibly painful - they become such important members of our families. Please take all the time you need to grieve.",
  "emotion": "sad",
  "segments": [
    {"text": "I'm so deeply sorry for your loss.", "style": "sad", "intensity": "high"},
    {"text": "Losing a beloved pet is incredibly painful - they become such important members of our families.", "style": "empathetic", "intensity": "medium"},
    {"text": "Please take all the time you need to grieve.", "style": "calm", "intensity": "low"}
  ]
}

Always respond with empathy and match your emotional expression to the context of the conversation.`;

function App() {
  // API Keys from environment variables
  const [speechKey, setSpeechKey] = useState(
    import.meta.env.VITE_AZURE_SPEECH_KEY || ""
  );
  const [speechRegion, setSpeechRegion] = useState(
    import.meta.env.VITE_AZURE_SPEECH_REGION || "southeastasia"
  );
  const [geminiKey, setGeminiKey] = useState(
    import.meta.env.VITE_GEMINI_API_KEY || ""
  );

  // Chat state
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");

  // Avatar state
  const [status, setStatus] = useState("Idle");
  const [isStarting, setIsStarting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Refs
  const peerConnectionRef = useRef(null);
  const avatarSynthesizerRef = useRef(null);
  const geminiClientRef = useRef(null);
  const chatRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Auto-scroll chat to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (avatarSynthesizerRef.current) {
        avatarSynthesizerRef.current.close();
        avatarSynthesizerRef.current = null;
      }
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
        peerConnectionRef.current = null;
      }
    };
  }, []);

  // Initialize Gemini client when API key changes
  useEffect(() => {
    if (geminiKey) {
      try {
        geminiClientRef.current = new GoogleGenAI({ apiKey: geminiKey });
        chatRef.current = geminiClientRef.current.chats.create({
          model: "gemini-2.5-flash",
          config: {
            systemInstruction: GEMINI_SYSTEM_PROMPT,
          },
        });
        setStatus("Gemini connected. Start avatar to begin chatting.");
      } catch (err) {
        console.error("Failed to initialize Gemini:", err);
        setStatus("Failed to initialize Gemini client.");
      }
    }
  }, [geminiKey]);

  const getIceToken = async () => {
    if (!speechKey || !speechRegion) {
      throw new Error("Please enter Speech key and region.");
    }

    if (!AVATAR_SUPPORTED_REGIONS.includes(speechRegion.toLowerCase())) {
      console.warn(`Warning: Region "${speechRegion}" may not support avatar.`);
    }

    const response = await fetch(
      `https://${speechRegion}.tts.speech.microsoft.com/cognitiveservices/avatar/relay/token/v1`,
      {
        method: "GET",
        headers: {
          "Ocp-Apim-Subscription-Key": speechKey,
        },
      }
    );

    if (!response.ok) {
      const message = await response.text();
      throw new Error(
        `Failed to get ICE token. Status ${response.status}: ${message}`
      );
    }

    const data = await response.json();
    console.log("ICE token response:", data);

    const uris = data.Urls || data.urls || data.uris || [];
    const username = data.Username || data.username;
    const password = data.Password || data.password || data.credential;

    if (!Array.isArray(uris) || !uris.length) {
      throw new Error("ICE server response did not contain any URIs.");
    }

    const turnUris = uris.filter(
      (u) => typeof u === "string" && u.startsWith("turn:")
    );

    const iceServer = {
      urls: turnUris.length ? turnUris : uris,
    };

    if (username && password) {
      iceServer.username = username;
      iceServer.credential = password;
    }

    return iceServer;
  };

  const startAvatar = async () => {
    if (isStarting || isConnected) return;

    try {
      setIsStarting(true);
      setStatus("Requesting ICE server token...");

      const iceServer = await getIceToken();

      setStatus("Creating WebRTC peer connection...");
      const peerConnection = new RTCPeerConnection({
        iceServers: [iceServer],
      });

      peerConnectionRef.current = peerConnection;

      peerConnection.ontrack = (event) => {
        const container = document.getElementById("avatarContainer");
        if (!container) return;

        if (event.track.kind === "video") {
          let videoElement = document.getElementById("videoPlayer");
          if (!videoElement) {
            videoElement = document.createElement("video");
            videoElement.id = "videoPlayer";
            videoElement.autoplay = true;
            videoElement.playsInline = true;
            videoElement.muted = true;
            videoElement.className = "avatar-video";
            container.appendChild(videoElement);
          }
          videoElement.srcObject = event.streams[0];
        }

        if (event.track.kind === "audio") {
          let audioElement = document.getElementById("audioPlayer");
          if (!audioElement) {
            audioElement = document.createElement("audio");
            audioElement.id = "audioPlayer";
            audioElement.autoplay = true;
            container.appendChild(audioElement);
          }
          audioElement.srcObject = event.streams[0];
        }
      };

      peerConnection.addTransceiver("video", { direction: "sendrecv" });
      peerConnection.addTransceiver("audio", { direction: "sendrecv" });

      setStatus("Configuring Speech and Avatar...");
      const speechConfig = SpeechSDK.SpeechConfig.fromSubscription(
        speechKey,
        speechRegion
      );
      // Using Jenny voice which has good style support
      speechConfig.speechSynthesisLanguage = "en-US";
      speechConfig.speechSynthesisVoiceName = "en-US-JennyNeural";

      const videoFormat = new SpeechSDK.AvatarVideoFormat();
      videoFormat.width = 1280;
      videoFormat.height = 720;

      const avatarConfig = new SpeechSDK.AvatarConfig(
        "lisa",
        "casual-sitting",
        videoFormat
      );

      avatarConfig.backgroundColor = "#1a1a2e";

      const avatarSynthesizer = new SpeechSDK.AvatarSynthesizer(
        speechConfig,
        avatarConfig
      );
      avatarSynthesizerRef.current = avatarSynthesizer;

      setStatus("Starting avatar session...");
      await avatarSynthesizer.startAvatarAsync(peerConnection);

      setIsConnected(true);
      setStatus("Avatar ready! Type a message to chat.");
    } catch (err) {
      console.error(err);
      setStatus(`Error: ${err.message || err.toString()}`);
      if (avatarSynthesizerRef.current) {
        avatarSynthesizerRef.current.close();
        avatarSynthesizerRef.current = null;
      }
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
        peerConnectionRef.current = null;
      }
      setIsConnected(false);
    } finally {
      setIsStarting(false);
    }
  };

  const stopAvatar = () => {
    if (avatarSynthesizerRef.current) {
      avatarSynthesizerRef.current.close();
      avatarSynthesizerRef.current = null;
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    setIsConnected(false);
    setStatus("Avatar stopped.");
  };

  // Build SSML with emotion segments
  const buildEmotionalSSML = (segments, voiceName = "en-US-JennyNeural") => {
    let ssmlContent = "";

    for (const segment of segments) {
      const style = SUPPORTED_STYLES.includes(segment.style)
        ? segment.style
        : "default";

      // Map intensity to styledegree (0.01 to 2)
      let styledegree = "1";
      if (segment.intensity === "low") styledegree = "0.5";
      else if (segment.intensity === "high") styledegree = "1.5";

      if (style !== "default") {
        ssmlContent += `<mstts:express-as style="${style}" styledegree="${styledegree}">${segment.text} </mstts:express-as>`;
      } else {
        ssmlContent += `${segment.text} `;
      }
    }

    const ssml = `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xmlns:mstts="https://www.w3.org/2001/mstts" xml:lang="en-US">
      <voice name="${voiceName}">
        ${ssmlContent}
      </voice>
    </speak>`;

    return ssml;
  };

  // Process message with Gemini and speak with avatar
  const sendMessage = async () => {
    if (!inputText.trim()) return;
    if (!isConnected) {
      setStatus("Please start the avatar first.");
      return;
    }
    if (!geminiKey) {
      setStatus("Please enter your Gemini API key.");
      return;
    }

    const userMessage = inputText.trim();
    setInputText("");
    setIsProcessing(true);
    setIsSpeaking(true);

    // Add user message to chat
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);

    try {
      setStatus("Processing with Gemini...");

      // Send to Gemini
      let geminiResponse;
      if (chatRef.current) {
        const response = await chatRef.current.sendMessage({
          message: userMessage,
        });
        geminiResponse = response.text;
      } else {
        // Fallback if chat session not initialized
        const response = await geminiClientRef.current.models.generateContent({
          model: "gemini-2.5-flash",
          contents: `${GEMINI_SYSTEM_PROMPT}\n\nUser: ${userMessage}`,
        });
        geminiResponse = response.text;
      }

      console.log("Gemini raw response:", geminiResponse);

      // Parse JSON response
      let parsed;
      try {
        // Try to extract JSON from response (might have markdown code blocks)
        const jsonMatch = geminiResponse.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          parsed = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error("No JSON found in response");
        }
      } catch (parseErr) {
        console.error("Failed to parse Gemini response:", parseErr);
        // Fallback: use raw response as plain text
        parsed = {
          response: geminiResponse,
          emotion: "default",
          segments: [
            { text: geminiResponse, style: "default", intensity: "medium" },
          ],
        };
      }

      // Add assistant message to chat
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: parsed.response,
          emotion: parsed.emotion,
          segments: parsed.segments,
        },
      ]);

      // Build SSML with emotions
      const ssml = buildEmotionalSSML(parsed.segments);
      console.log("Generated SSML:", ssml);

      // Speak with avatar using SSML
      setStatus(`Speaking with ${parsed.emotion} emotion...`);
      const result = await avatarSynthesizerRef.current.speakSsmlAsync(ssml);

      if (result.reason === SpeechSDK.ResultReason.SynthesizingAudioCompleted) {
        setStatus("Ready for next message.");
      } else {
        console.error("Speech synthesis failed:", result);
        if (result.reason === SpeechSDK.ResultReason.Canceled) {
          const details = SpeechSDK.CancellationDetails.fromResult(result);
          console.error("Cancellation details:", details);
          // Fallback to plain text if SSML fails
          setStatus("SSML failed, trying plain text...");
          await avatarSynthesizerRef.current.speakTextAsync(parsed.response);
        }
        setStatus("Ready (with warnings).");
      }
    } catch (err) {
      console.error("Error processing message:", err);
      setStatus(`Error: ${err.message}`);

      // Add error message
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I encountered an error processing your message.",
          emotion: "sad",
        },
      ]);
    } finally {
      setIsProcessing(false);
      setIsSpeaking(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="app-root">
      <header className="app-header">
        <h1>🎭 Expressive Avatar Chat</h1>
        <p className="subtitle">Powered by Azure Avatar + Gemini AI</p>
      </header>

      {/* Config Panel */}
      <details className="config-panel">
        <summary>⚙️ Configuration</summary>
        <div className="config-grid">
          <div className="config-section">
            <h3>Azure Speech</h3>
            <label>
              Speech Key
              <input
                type="password"
                placeholder="Azure Speech API key"
                value={speechKey}
                onChange={(e) => setSpeechKey(e.target.value)}
              />
            </label>
            <label>
              Region
              <select
                value={speechRegion}
                onChange={(e) => setSpeechRegion(e.target.value)}
              >
                {AVATAR_SUPPORTED_REGIONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="config-section">
            <h3>Google Gemini</h3>
            <label>
              Gemini API Key
              <input
                type="password"
                placeholder="Get from ai.google.dev"
                value={geminiKey}
                onChange={(e) => setGeminiKey(e.target.value)}
              />
            </label>
            <a
              href="https://ai.google.dev/"
              target="_blank"
              rel="noreferrer"
              className="get-key-link"
            >
              Get a free Gemini API key →
            </a>
          </div>
        </div>
      </details>

      {/* Main Layout */}
      <div className="main-layout">
        {/* Avatar Panel */}
        <div className="avatar-panel">
          <div id="avatarContainer" className="avatar-container">
            {!isConnected && (
              <div className="avatar-placeholder">
                <span className="placeholder-icon">🤖</span>
                <p>Start the avatar to begin</p>
              </div>
            )}
          </div>

          <div className="avatar-controls">
            <button
              onClick={startAvatar}
              disabled={isStarting || isConnected}
              className="btn-start"
            >
              {isStarting ? "⏳ Starting..." : "▶️ Start Avatar"}
            </button>
            <button
              onClick={stopAvatar}
              disabled={!isConnected}
              className="btn-stop"
            >
              ⏹️ Stop
            </button>
          </div>

          <div className="status-badge" data-connected={isConnected}>
            {status}
          </div>
        </div>

        {/* Chat Panel */}
        <div className="chat-panel">
          <div className="chat-messages">
            {messages.length === 0 && (
              <div className="empty-chat">
                <p>👋 Start a conversation!</p>
                <p className="hint">
                  The avatar will respond with appropriate emotions based on
                  what you say.
                </p>
              </div>
            )}

            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`message ${msg.role}`}
                data-emotion={msg.emotion}
              >
                <div className="message-content">
                  {msg.content}
                  {msg.emotion && msg.role === "assistant" && (
                    <span className="emotion-tag">{msg.emotion}</span>
                  )}
                </div>
              </div>
            ))}

            {isProcessing && (
              <div className="message assistant typing">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <div className="chat-input-area">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Type your message... (Enter to send)"
              disabled={!isConnected || isSpeaking}
              rows={2}
            />
            <button
              onClick={sendMessage}
              disabled={!isConnected || isSpeaking || !inputText.trim()}
              className="btn-send"
            >
              {isSpeaking ? "🔊" : "📤"}
            </button>
          </div>
        </div>
      </div>

      {/* Info Footer */}
      <footer className="app-footer">
        <p>
          Emotions supported: <code>cheerful</code>, <code>sad</code>,{" "}
          <code>angry</code>, <code>excited</code>, <code>friendly</code>,{" "}
          <code>empathetic</code>, <code>calm</code> and more via{" "}
          <a
            href="https://learn.microsoft.com/en-us/azure/ai-services/speech-service/speech-synthesis-markup-voice"
            target="_blank"
            rel="noreferrer"
          >
            SSML mstts:express-as
          </a>
        </p>
      </footer>
    </div>
  );
}

export default App;