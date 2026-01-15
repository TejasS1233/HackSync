import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import * as SpeechSDK from "microsoft-cognitiveservices-speech-sdk";
import { GoogleGenAI } from "@google/genai";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import ReportCard from "@/pages/report-card";
import { VideoOverlay } from "@/components/blocks/Chat/video-overlay";
import { Controls } from "@/components/blocks/Chat/controls";
import { SystemHUD } from "@/components/blocks/Chat/system-hud";
import { ChatInterface } from "@/components/blocks/Chat/chat-interface";

// ... (Constants preserved)
const AVATAR_SUPPORTED_REGIONS = [
  "westus2",
  "westeurope",
  "southeastasia",
  "eastus",
  "southcentralus",
  "northeurope",
  "westcentralus",
];

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
  "default",
];

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
- Match emotion to content
- Keep segments natural`;

export default function ChatAzure() {
  const navigate = useNavigate();

  // ... (State preserved)
  const [speechKey] = useState(import.meta.env.VITE_AZURE_SPEECH_KEY);
  const [speechRegion] = useState(import.meta.env.VITE_AZURE_SPEECH_REGION || "southeastasia");
  const [geminiKey] = useState(import.meta.env.VITE_GEMINI_API_KEY);

  const [isMuted, setIsMuted] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isDevMode, setIsDevMode] = useState(false);
  const [showReport, setShowReport] = useState(false);

  const [status, setStatus] = useState("Idle");
  const [isStarting, setIsStarting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const [messages, setMessages] = useState([]);
  const [currentEmotion, setCurrentEmotion] = useState("neutral");
  const [tokenUsage, setTokenUsage] = useState(0);
  const [latencyMetrics, setLatencyMetrics] = useState({ stt: 0, llm: 0, tts: 0 });
  const [userSentiment, setUserSentiment] = useState({
    happy: 0, sad: 0, angry: 0, fearful: 0, surprised: 0, neutral: 0
  });

  const peerConnectionRef = useRef(null);
  const avatarSynthesizerRef = useRef(null);
  const geminiClientRef = useRef(null);
  const chatRef = useRef(null);
  const videoRef = useRef(null);
  const audioRef = useRef(null);
  const streamRef = useRef(null);

  // ... (Effects preserved)
  useEffect(() => {
    if (geminiKey) {
      try {
        geminiClientRef.current = new GoogleGenAI({ apiKey: geminiKey });
        chatRef.current = geminiClientRef.current.chats.create({
          model: "gemini-3-flash-preview",
          config: {
            systemInstruction: GEMINI_SYSTEM_PROMPT,
            generationConfig: { responseMimeType: "application/json" }
          },
        });
        setStatus("Gemini connected.");
      } catch (err) {
        console.error("Failed to initialize Gemini:", err);
        setStatus("Failed to initialize Gemini client.");
      }
    }
  }, [geminiKey]);

  useEffect(() => {
    return () => {
      stopAvatar();
    };
  }, []);

  const getIceToken = async () => {
    if (!speechKey || !speechRegion) throw new Error("Check Speech key/region.");

    const response = await fetch(
      `https://${speechRegion}.tts.speech.microsoft.com/cognitiveservices/avatar/relay/token/v1`,
      {
        method: "GET",
        headers: { "Ocp-Apim-Subscription-Key": speechKey },
      }
    );

    if (!response.ok) throw new Error("Failed to get ICE token");
    const data = await response.json();
    const uris = data.Urls || data.urls || [];
    const username = data.Username || data.username;
    const password = data.Password || data.password;

    const turnUris = uris.filter(u => typeof u === "string" && u.startsWith("turn:"));
    const iceServer = {
      urls: turnUris.length ? turnUris : uris,
      username,
      credential: password
    };
    return iceServer;
  };

  const startAvatar = async () => {
    if (isStarting || isConnected) return;
    try {
      setIsStarting(true);
      setStatus("Requesting ICE token...");
      const iceServer = await getIceToken();

      setStatus("Creating PeerConnection...");
      const peerConnection = new RTCPeerConnection({ iceServers: [iceServer] });
      peerConnectionRef.current = peerConnection;

      peerConnection.ontrack = (event) => {
        console.log("Track received:", event.track.kind, event.streams[0]);
        if (event.streams && event.streams[0]) {
          streamRef.current = event.streams[0];
        }

        if (event.track.kind === "video" && videoRef.current) {
          videoRef.current.srcObject = event.streams[0];
          videoRef.current.play().catch(e => console.error("Video play error:", e));
        }
        if (event.track.kind === "audio" && audioRef.current) {
          audioRef.current.srcObject = event.streams[0];
          audioRef.current.play().catch(e => console.error("Audio play error:", e));
        }
      };

      peerConnection.addTransceiver("video", { direction: "sendrecv" });
      peerConnection.addTransceiver("audio", { direction: "sendrecv" });

      setStatus("Configuring Avatar...");
      const speechConfig = SpeechSDK.SpeechConfig.fromSubscription(speechKey, speechRegion);
      speechConfig.speechSynthesisLanguage = "en-US";
      speechConfig.speechSynthesisVoiceName = "en-US-JennyNeural";

      const videoFormat = new SpeechSDK.AvatarVideoFormat();
      videoFormat.width = 1920;
      videoFormat.height = 1080;

      const avatarConfig = new SpeechSDK.AvatarConfig("lisa", "casual-sitting", videoFormat);
      avatarConfig.backgroundColor = "#1a1a2e";

      const avatarSynthesizer = new SpeechSDK.AvatarSynthesizer(speechConfig, avatarConfig);
      avatarSynthesizerRef.current = avatarSynthesizer;

      setStatus("Starting Avatar...");
      await avatarSynthesizer.startAvatarAsync(peerConnection);

      setIsConnected(true);
      setStatus("Avatar Ready");
    } catch (err) {
      console.error(err);
      setStatus(`Error: ${err.message}`);
      stopAvatar();
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

  const handleDisconnect = () => {
    stopAvatar();
    setShowReport(true);
  };

  const buildEmotionalSSML = (segments, voiceName = "en-US-JennyNeural") => {
    let ssmlContent = "";
    for (const segment of segments) {
      const style = SUPPORTED_STYLES.includes(segment.style) ? segment.style : "default";
      let styledegree = segment.intensity === "high" ? "1.5" : segment.intensity === "low" ? "0.5" : "1";

      if (style !== "default") {
        ssmlContent += `<mstts:express-as style="${style}" styledegree="${styledegree}">${segment.text} </mstts:express-as>`;
      } else {
        ssmlContent += `${segment.text} `;
      }
    }
    return `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xmlns:mstts="https://www.w3.org/2001/mstts" xml:lang="en-US"><voice name="${voiceName}">${ssmlContent}</voice></speak>`;
  };

  const onSendMessage = async (text) => {
    if (!text.trim() || !isConnected) return;

    setIsProcessing(true);
    setIsSpeaking(true);
    setMessages(prev => [...prev, { type: "user-llm-text", content: text, role: "user" }]);

    const startTime = performance.now();
    const getGeminiText = async (result) => {
      console.log("Gemini Result Object:", result);

      try {
        if (result.response && typeof result.response.text === 'function') {
          return result.response.text();
        }
        if (typeof result.text === 'function') {
          return result.text();
        }
        if (typeof result.text === 'string') {
          return result.text;
        }
        if (result.response && result.response.text) {
          return result.response.text; // Property case
        }
        // Fallback for raw candidates if needed, but usually SDK handles it.
        return JSON.stringify(result);
      } catch (err) {
        console.error("Error extracting text from Gemini result:", err);
        return "";
      }
    };

    try {
      let geminiResponse;
      if (chatRef.current) {
        const result = await chatRef.current.sendMessage({ message: text });
        geminiResponse = await getGeminiText(result);
      } else {
        // Fallback
        const result = await geminiClientRef.current.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: `${GEMINI_SYSTEM_PROMPT}\n\nUser: ${text}`,
          generationConfig: { responseMimeType: "application/json" }
        });
        geminiResponse = await getGeminiText(result);
      }

      const llmLatency = Math.round(performance.now() - startTime);
      setLatencyMetrics(prev => ({ ...prev, llm: llmLatency }));
      setTokenUsage(prev => prev + Math.floor(geminiResponse.length / 4));

      let parsed;
      try {
        const cleanText = geminiResponse.replace(/```json/g, "").replace(/```/g, "").trim();
        parsed = JSON.parse(cleanText);
      } catch (e) {
        console.error("JSON Parse Error:", e);
        parsed = { response: geminiResponse, emotion: "neutral", segments: [{ text: geminiResponse, style: "default" }] };
      }

      const emotionMap = {
        cheerful: "happy", excited: "happy", friendly: "happy", hopeful: "happy",
        sad: "sad", empathetic: "sad",
        angry: "angry", terrified: "fearful",
        calm: "neutral", chat: "neutral", default: "neutral"
      };
      const mappedEmotion = emotionMap[parsed.emotion] || "neutral";
      setCurrentEmotion(mappedEmotion);

      setMessages(prev => [...prev, { type: "bot-llm-text", role: "assistant", content: parsed.response, emotion: mappedEmotion }]);

      const ssml = buildEmotionalSSML(parsed.segments);
      const result = await avatarSynthesizerRef.current.speakSsmlAsync(ssml);

      if (result.reason !== SpeechSDK.ResultReason.SynthesizingAudioCompleted) {
        console.warn("SSML failed, fallback to text");
        await avatarSynthesizerRef.current.speakTextAsync(parsed.response);
      }

    } catch (err) {
      console.error("Processing Error:", err);
    } finally {
      setIsProcessing(false);
      setIsSpeaking(false);
    }
  };

  const emotionGradients = {
    happy: { left: "from-amber-500/30", right: "from-orange-400/30" },
    sad: { left: "from-blue-600/30", right: "from-indigo-500/30" },
    angry: { left: "from-red-600/30", right: "from-rose-500/30" },
    fearful: { left: "from-purple-600/30", right: "from-violet-500/30" },
    surprised: { left: "from-cyan-500/30", right: "from-teal-400/30" },
    neutral: { left: "from-gray-500/10", right: "from-slate-500/10" },
  };
  const currentGradient = emotionGradients[currentEmotion] || emotionGradients.neutral;

  const sessionData = {
    messages: messages,
    duration: messages.length > 0 ? Math.ceil(messages.length * 0.5) + " min" : "0 min",
    emotions: [currentEmotion],
    sentiment: userSentiment,
    metrics: latencyMetrics,
    tokenUsage: tokenUsage,
    vocabularyData: [],
  };

  return (
    <>
      <audio ref={audioRef} autoPlay />

      {showReport && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="max-w-4xl w-full">
            <ReportCard
              sessionData={sessionData}
              onClose={() => {
                setShowReport(false);
                navigate("/dashboard/home");
              }}
            />
          </div>
        </div>
      )}

      {/* Main Container - Full Screen, no SidebarProvider */}
      <div className="relative flex h-screen w-full flex-col bg-background overflow-hidden">
        {/* Background Layers */}
        <div className="absolute inset-0 pointer-events-none">
          {/* ... (Gradient logic kept simple for brevity in thought, but code will have it) */}
          <div
            className={cn(
              "absolute inset-0 transition-all duration-[2000ms] ease-in-out",
              currentEmotion === "happy" && "bg-gradient-to-br from-yellow-400/50 via-amber-500/40 to-orange-500/50",
              currentEmotion === "sad" && "bg-gradient-to-br from-blue-500/50 via-blue-600/40 to-indigo-600/50",
              currentEmotion === "angry" && "bg-gradient-to-br from-red-500/50 via-red-600/40 to-rose-600/50",
              currentEmotion === "fearful" && "bg-gradient-to-br from-purple-500/50 via-purple-600/40 to-violet-600/50",
              currentEmotion === "surprised" && "bg-gradient-to-br from-cyan-400/50 via-cyan-500/40 to-teal-500/50",
              currentEmotion === "neutral" && "bg-gradient-to-br from-slate-400/30 via-gray-500/25 to-zinc-500/30"
            )}
          />
          <div
            className="absolute inset-0 opacity-30 mix-blend-soft-light"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
              backgroundRepeat: "repeat",
              backgroundSize: "200px 200px",
            }}
          />
          <div
            className={cn(
              "pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r to-transparent transition-all duration-1000",
              currentGradient.left
            )}
          />
          <div
            className={cn(
              "pointer-events-none absolute inset-y-0 right-0 w-1/3 bg-gradient-to-l to-transparent transition-all duration-1000",
              currentGradient.right
            )}
          />
        </div>

        <SystemHUD
          isConnected={isConnected}
          isOfflineMode={false}
          agentState={isSpeaking ? "speaking" : isProcessing ? "thinking" : "idle"}
          currentEmotion={currentEmotion}
          userSentiment={userSentiment}
          latencyMetrics={latencyMetrics}
          tokenUsage={tokenUsage}
          isDevMode={true}
          setIsDevMode={setIsDevMode}
          modelName="Gemini + Azure Avatar"
        />

        <div className="flex-1 relative z-10 flex items-center justify-center min-h-0">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className={cn(
              "w-full h-full object-contain max-h-[85vh] transition-opacity duration-500",
              isConnected ? "opacity-100" : "opacity-0 invisible"
            )}
          />

          {!isConnected && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center p-8 bg-black/20 backdrop-blur-sm rounded-xl border border-white/10 max-w-md mx-auto pointer-events-auto">
                <p className="text-xl font-semibold mb-2">Ready to Connect</p>
                <p className="text-muted-foreground">Start the Real-time Avatar to begin.</p>
              </div>
            </div>
          )}
        </div>

        <UserVideoWrapper isVideoOn={isVideoOn} />

        <div className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2">
          <div className="flex items-center gap-3 rounded-full border border-border bg-card/80 p-2 backdrop-blur-lg">
            <Controls
              isConnected={isConnected}
              isMuted={isMuted}
              isVideoOn={isVideoOn}
              isChatOpen={isChatOpen}
              onConnect={startAvatar}
              onDisconnect={handleDisconnect}
              onToggleMute={() => setIsMuted(!isMuted)}
              onToggleVideo={() => setIsVideoOn(!isVideoOn)}
              onToggleChat={() => setIsChatOpen(!isChatOpen)}
            />
          </div>
        </div>
      </div>

      {/* Chat Sheet */}
      <Sheet open={isChatOpen} onOpenChange={setIsChatOpen}>
        <SheetContent side="right" className="p-0 sm:max-w-md">
          <div className="sr-only">
            <SheetTitle>Chat Interface</SheetTitle>
            <SheetDescription>Real-time chat history and interaction.</SheetDescription>
          </div>
          <ChatInterface
            messages={messages}
            isConnected={isConnected}
            onSendMessage={onSendMessage}
            isGenerating={isProcessing}
            currentEmotion={currentEmotion}
          />
        </SheetContent>
      </Sheet>
    </>
  );
}

function UserVideoWrapper({ isVideoOn }) {
  if (!isVideoOn) return null;
  return <VideoOverlay isVideoOn={isVideoOn} />;
}
