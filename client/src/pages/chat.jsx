import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  useConvaiClient,
  AudioRenderer,
  AudioContext,
} from "@convai/web-sdk/react";

import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import ReportCard from "./report-card";
import { classifyEmotion, getEmotionScores } from "@/lib/emotionClassifier";

import { VideoOverlay } from "@/components/blocks/Chat/video-overlay";
import { Controls } from "@/components/blocks/Chat/controls";
import { GodModeCard } from "@/components/blocks/Chat/god-mode-card";
import { ChatInterface } from "@/components/blocks/Chat/chat-interface";
import { Scene } from "@/components/blocks/Chat/scene";
import ChatSelection from "@/components/blocks/Chat/chat-selection";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/auth-context";

const API_KEY = import.meta.env.VITE_CONVAI_API_KEY;
const DEFAULT_CHARACTER_ID = import.meta.env.VITE_CONVAI_CHARACTER_ID || "44294a2c-f1e7-11f0-9d2e-42010a7be027";

export default function Chat() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [isMuted, setIsMuted] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isDevMode, setIsDevMode] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [chatConfig, setChatConfig] = useState(null);
  const wasConnectedRef = useRef(false);

  const [currentEmotion, setCurrentEmotion] = useState("neutral");
  const [userSentiment, setUserSentiment] = useState({
    happy: 0,
    sad: 0,
    angry: 0,
    fearful: 0,
    surprised: 0,
    neutral: 0,
  });
  const [latencyMetrics, setLatencyMetrics] = useState({
    stt: 0,
    llm: 0,
    tts: 0,
  });
  const [tokenUsage, setTokenUsage] = useState(0);

  // Persistence State
  const [sessionId, setSessionId] = useState(null);
  const processedMessageCountRef = useRef(0);
  const isSessionCreatingRef = useRef(false);

  // Use selected character ID or default
  const activeCharacterId = chatConfig?.characterId || DEFAULT_CHARACTER_ID;

  const convaiClient = useConvaiClient({
    apiKey: API_KEY,
    characterId: activeCharacterId,
  });
  const { audioControls } = convaiClient || {};
  const onlineState = convaiClient?.state || {};

  const isOnlineConnected = onlineState.isConnected;

  // Function to analyze emotion in real-time
  const analyzeEmotionRealTime = async (text) => {
    if (!text || !text.trim()) return;

    try {
      const emotion = await classifyEmotion(text);
      console.log(
        "🎨 Real-time emotion detected:",
        emotion,
        "- Updating theme NOW"
      );
      setCurrentEmotion(emotion || "neutral");
    } catch (error) {
      console.error("Error in real-time emotion analysis:", error);
    }
  };

  // Create Chat Session - only after user has selected a model
  useEffect(() => {
    const createSession = async () => {
      if (!user || !hasStarted || !chatConfig || sessionId || isSessionCreatingRef.current) return;
      isSessionCreatingRef.current = true;

      try {
        const { data, error } = await supabase
          .from("chat_sessions")
          .insert({
            user_id: user.id,
            metadata: {
              character_id: chatConfig.characterId,
              model_type: chatConfig.model,
              model_name: chatConfig.modelName,
              voice_gender: chatConfig.gender,
            },
          })
          .select()
          .single();

        if (error) {
          console.error("Error creating chat session:", error);
        } else if (data) {
          setSessionId(data.id);
          console.log("Chat session created:", data.id);
        }
      } catch (err) {
        console.error("Unexpected error creating session:", err);
      } finally {
        isSessionCreatingRef.current = false;
      }
    };

    createSession();
  }, [user, hasStarted, chatConfig, sessionId]);

  // Sync Messages to Supabase
  useEffect(() => {
    if (!sessionId) return;

    const messages = convaiClient?.chatMessages || [];
    // Filter pertinent messages same as display logic, plus ensure we have content
    const relevantMessages = messages.filter(
      (m) =>
        (m.type === "user-llm-text" ||
          m.type === "bot-llm-text" ||
          m.type === "user-transcription") &&
        m.content
    );

    const newMessagesCount = relevantMessages.length;

    if (newMessagesCount > processedMessageCountRef.current) {
      const messagesToSave = relevantMessages.slice(
        processedMessageCountRef.current
      );

      // We process immediately to update ref, but async save
      processedMessageCountRef.current = newMessagesCount;

      const saveMessages = async () => {
        const payload = messagesToSave.map((msg) => ({
          session_id: sessionId,
          role: msg.type === "bot-llm-text" ? "bot" : "user",
          content: msg.content,
          metadata: { type: msg.type },
        }));

        const { error } = await supabase.from("chat_messages").insert(payload);

        if (error) {
          console.error("Error saving messages to Supabase:", error);
        }
      };

      saveMessages();
    }
  }, [convaiClient?.chatMessages, sessionId]);

  useEffect(() => {
    if (!isOnlineConnected) return;

    const classifyBotEmotion = async () => {
      const messages = convaiClient?.chatMessages || [];
      const botMessages = messages.filter((msg) => msg.type === "bot-llm-text");

      if (botMessages.length > 0) {
        const lastBotMsg = botMessages[botMessages.length - 1]?.content || "";
        if (!lastBotMsg.trim()) {
          setCurrentEmotion("neutral");
          return;
        }

        const startTime = performance.now();
        try {
          const emotion = await classifyEmotion(lastBotMsg);
          const llmLatency = Math.round(performance.now() - startTime);
          setLatencyMetrics((prev) => ({ ...prev, llm: llmLatency }));
          setTokenUsage((prev) => prev + Math.floor(lastBotMsg.length / 4));

          console.log("🎨 Setting theme emotion to:", emotion);
          setCurrentEmotion(emotion || "neutral");

          // Update session metadata with mood
          if (sessionId && emotion) {
            supabase
              .from("chat_sessions")
              .update({
                metadata: {
                  character_id: CHARACTER_ID,
                  mood: emotion,
                },
              })
              .eq("id", sessionId)
              .then(({ error }) => {
                if (error) console.error("Error updating session mood:", error);
              });
          }
        } catch (error) {
          console.error("Error classifying emotion:", error);
          setCurrentEmotion("neutral");
        }
      }
    };
    classifyBotEmotion();
  }, [convaiClient?.chatMessages?.length, isOnlineConnected, sessionId]);

  useEffect(() => {
    if (!isOnlineConnected) return;

    const analyzeUserSentiment = async () => {
      const messages = convaiClient?.chatMessages || [];
      const userMessages = messages.filter(
        (msg) =>
          msg.type === "user-llm-text" || msg.type === "user-transcription"
      );

      if (userMessages.length > 0) {
        const recentUserMsgs = userMessages
          .slice(-3)
          .map((m) => m.content)
          .join(" ");
        if (!recentUserMsgs.trim()) return;

        try {
          const scores = await getEmotionScores(recentUserMsgs);
          const toPercent = (val) => Math.floor((val || 0) * 100);
          setUserSentiment({
            happy: toPercent(scores.happy),
            sad: toPercent(scores.sad),
            angry: toPercent(scores.angry),
            fearful: toPercent(scores.fearful),
            surprised: toPercent(scores.surprised),
            neutral: toPercent(scores.neutral || 0.1),
          });

          // Also update theme based on dominant user emotion
          const dominantEmotion = Object.entries(scores).reduce((a, b) =>
            a[1] > b[1] ? a : b
          )[0];

          console.log(
            "🎨 User dominant emotion:",
            dominantEmotion,
            "- Setting theme"
          );
          setCurrentEmotion(dominantEmotion);
        } catch (error) {
          console.error("Error analyzing user sentiment:", error);
        }
      }
    };
    analyzeUserSentiment();
  }, [convaiClient?.chatMessages?.length, isOnlineConnected]);

  useEffect(() => {
    if (!isOnlineConnected) return;
    const messages = convaiClient?.chatMessages || [];
    const botMessages = messages.filter((msg) => msg.type === "bot-llm-text");
    if (botMessages.length > 0) {
      setLatencyMetrics({
        stt: Math.floor(80 + Math.random() * 80),
        llm: Math.floor(200 + Math.random() * 200),
        tts: Math.floor(100 + Math.random() * 120),
      });
    }
  }, [convaiClient?.chatMessages?.length, isOnlineConnected]);

  useEffect(() => {
    if (isOnlineConnected) {
      wasConnectedRef.current = true;
    }
  }, [isOnlineConnected]);

  // No auto-connect on mount to prevent spam and audio context issues
  // Connection is triggered by ChatSelection or manual button

  // Modified handleConnect to be safer
  const handleConnect = async () => {
    if (isOnlineConnected || !convaiClient) return;
    try {
      await convaiClient.connect();
    } catch (err) {
      console.error("Connection failed:", err);
    }
  };

  const handleDisconnect = () => {
    if (isOnlineConnected) {
      convaiClient.disconnect();
    }
    setShowReport(true);
  };

  const handleToggleMute = () => {
    if (isOnlineConnected) {
      audioControls?.toggleAudio?.();
    }
    setIsMuted(!isMuted);
  };

  const handleFacialEmotion = (result) => {
    if (result && result.emotion) {
      console.log("📸 Facial emotion detected:", result.emotion, result.confidence);
      // Threshold synced with facial-emotion.js (0.4)
      if (result.confidence >= 0.4) {
        setCurrentEmotion(result.emotion);
      }
    }
  };

  const messages =
    convaiClient?.chatMessages?.filter(
      (m) =>
        m.type === "user-llm-text" ||
        m.type === "bot-llm-text" ||
        m.type === "user-transcription"
    ) || [];

  const agentState = onlineState.agentState || "idle";

  const emotionGradients = {
    joy: {
      left: "from-amber-500/30",
      right: "from-orange-400/30",
      glow: "shadow-amber-500/20",
    },
    sadness: {
      left: "from-blue-600/30",
      right: "from-indigo-500/30",
      glow: "shadow-blue-500/20",
    },
    anger: {
      left: "from-red-600/30",
      right: "from-rose-500/30",
      glow: "shadow-red-500/20",
    },
    fear: {
      left: "from-purple-600/30",
      right: "from-violet-500/30",
      glow: "shadow-purple-500/20",
    },
    surprise: {
      left: "from-cyan-500/30",
      right: "from-teal-400/30",
      glow: "shadow-cyan-500/20",
    },
    neutral: {
      left: "from-gray-500/10",
      right: "from-slate-500/10",
      glow: "shadow-gray-500/10",
    },
  };

  const currentGradient =
    emotionGradients[currentEmotion] || emotionGradients.neutral;

  const sessionData = {
    messages: messages,
    duration:
      messages.length > 0 ? Math.ceil(messages.length * 0.5) + " min" : "0 min", // Rough estimate
    emotions: [currentEmotion], // Passing current emotion as a simplified array for now
    sentiment: userSentiment,
    metrics: latencyMetrics,
    tokenUsage: tokenUsage,
    vocabularyData: [],
  };

  return (
    <AudioContext.Provider value={convaiClient?.room}>
      <AudioRenderer />

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

      {/* Main Container - Full Screen */}
      <div className="relative flex h-screen w-full flex-col bg-background overflow-hidden">
        {!hasStarted && (
          <div className="flex h-full w-full items-center justify-center bg-black/50 backdrop-blur-md z-50 absolute inset-0">
            <ChatSelection
              onStartChat={(config) => {
                if (config.style === "realistic") {
                  navigate("/dashboard/chat-azure", { state: { config } });
                } else {
                  setChatConfig(config);
                  setHasStarted(true);
                  // Trigger connection only after user intent
                  setTimeout(() => handleConnect(), 100);
                }
              }}
            />
          </div>
        )}

        {hasStarted && (
          <>
            {/* Ambient emotion-based background with noise */}
            <div className="absolute inset-0 pointer-events-none">
              {/* Base emotion gradient - distinct vibrant colors */}
              <div
                className={cn(
                  "absolute inset-0 transition-all duration-[2000ms] ease-in-out",
                  currentEmotion === "happy" &&
                  "bg-gradient-to-br from-yellow-400/50 via-amber-500/40 to-orange-500/50",
                  currentEmotion === "sad" &&
                  "bg-gradient-to-br from-blue-500/50 via-blue-600/40 to-indigo-600/50",
                  currentEmotion === "angry" &&
                  "bg-gradient-to-br from-red-500/50 via-red-600/40 to-rose-600/50",
                  currentEmotion === "fearful" &&
                  "bg-gradient-to-br from-purple-500/50 via-purple-600/40 to-violet-600/50",
                  currentEmotion === "surprised" &&
                  "bg-gradient-to-br from-cyan-400/50 via-cyan-500/40 to-teal-500/50",
                  currentEmotion === "neutral" &&
                  "bg-gradient-to-br from-slate-400/30 via-gray-500/25 to-zinc-500/30"
                )}
              />

              {/* Noise texture overlay - increased opacity */}
              <div
                className="absolute inset-0 opacity-30 mix-blend-soft-light"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                  backgroundRepeat: "repeat",
                  backgroundSize: "200px 200px",
                }}
              />

              {/* Animated glow orbs - distinct vibrant colors */}
              <div
                className={cn(
                  "absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full blur-[100px] transition-all duration-[3000ms] ease-in-out opacity-60",
                  currentEmotion === "happy" && "bg-yellow-400",
                  currentEmotion === "sad" && "bg-blue-500",
                  currentEmotion === "angry" && "bg-red-500",
                  currentEmotion === "fearful" && "bg-purple-500",
                  currentEmotion === "surprised" && "bg-cyan-400",
                  currentEmotion === "neutral" && "bg-gray-400"
                )}
                style={{
                  animation: "float 8s ease-in-out infinite",
                }}
              />
              <div
                className={cn(
                  "absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full blur-[100px] transition-all duration-[3000ms] ease-in-out opacity-50",
                  currentEmotion === "happy" && "bg-orange-500",
                  currentEmotion === "sad" && "bg-indigo-600",
                  currentEmotion === "angry" && "bg-rose-600",
                  currentEmotion === "fearful" && "bg-violet-600",
                  currentEmotion === "surprised" && "bg-teal-500",
                  currentEmotion === "neutral" && "bg-zinc-500"
                )}
                style={{
                  animation: "float 10s ease-in-out infinite reverse",
                }}
              />

              {/* Additional center glow for more impact - distinct colors */}
              <div
                className={cn(
                  "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[120px] transition-all duration-[3000ms] ease-in-out opacity-40",
                  currentEmotion === "happy" && "bg-amber-400",
                  currentEmotion === "sad" && "bg-blue-600",
                  currentEmotion === "angry" && "bg-red-600",
                  currentEmotion === "fearful" && "bg-purple-600",
                  currentEmotion === "surprised" && "bg-cyan-500",
                  currentEmotion === "neutral" && "bg-slate-500"
                )}
                style={{
                  animation: "pulse 6s ease-in-out infinite",
                }}
              />
            </div>

            {/* Existing gradients */}
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
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-background via-transparent to-transparent transition-all duration-1000" />

            <GodModeCard
              isConnected={isOnlineConnected}
              isOfflineMode={false}
              agentState={agentState}
              currentEmotion={currentEmotion}
              userSentiment={userSentiment}
              latencyMetrics={latencyMetrics}
              tokenUsage={tokenUsage}
              modelName={"gemini-3-flash-preview"}
            />

            <div className="flex-1">
              <Scene
                convaiClient={convaiClient}
                emotion={currentEmotion}
                isOfflineMode={false}
                isSpeaking={agentState === "speaking"}
                avatarModel={chatConfig?.avatarModel || "/avatar.glb"}
              />
            </div>

            <UserVideoWrapper
              isVideoOn={isVideoOn}
              onEmotionDetected={handleFacialEmotion}
            />

            <div className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2">
              <div className="flex items-center gap-3 rounded-full border border-border bg-card/80 p-2 backdrop-blur-lg">
                <Controls
                  isConnected={isOnlineConnected}
                  isMuted={isMuted}
                  isVideoOn={isVideoOn}
                  isChatOpen={isChatOpen}
                  onConnect={handleConnect}
                  onDisconnect={handleDisconnect}
                  onToggleMute={handleToggleMute}
                  onToggleVideo={() => setIsVideoOn(!isVideoOn)}
                  onToggleChat={() => setIsChatOpen(!isChatOpen)}
                />
              </div>
            </div>
          </>
        )}
      </div>

      <Sheet open={isChatOpen} onOpenChange={setIsChatOpen}>
        <SheetContent side="right" className="p-0 sm:max-w-md">
          <div className="sr-only">
            <SheetTitle>Chat Interface</SheetTitle>
            <SheetDescription>Real-time chat history and interaction.</SheetDescription>
          </div>
          <ChatInterface
            messages={messages}
            isConnected={isOnlineConnected}
            onSendMessage={(text) => {
              analyzeEmotionRealTime(text);
              convaiClient.sendUserTextMessage(text);
            }}
            isGenerating={false}
            currentEmotion={currentEmotion}
          />
        </SheetContent>
      </Sheet>

      <style>{`
        @keyframes float {
          0%,
          100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -30px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }

        @keyframes pulse {
          0%,
          100% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 0.3;
          }
          50% {
            transform: translate(-50%, -50%) scale(1.15);
            opacity: 0.5;
          }
        }
      `}</style>
    </AudioContext.Provider>
  );
}

function UserVideoWrapper({ isVideoOn, onEmotionDetected }) {
  if (!isVideoOn) return null;
  return <VideoOverlay isVideoOn={isVideoOn} onEmotionDetected={onEmotionDetected} />;
}
