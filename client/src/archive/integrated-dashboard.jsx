import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  useConvaiClient,
  AudioRenderer,
  AudioContext,
} from "@convai/web-sdk/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { ScrollArea } from "../components/ui/scroll-area";
import {
  Activity,
  BarChart3,
  Brain,
  MessageSquare,
  Clock,
  Download,
} from "lucide-react";
import { detectEmotionCached } from "../services/emotionDetection";
import {
  VocabularyHeatmap,
  SentimentTrends,
  ClarityScore,
} from "../components/blocks/Dashboard/analytics";
import ReportCard from "./report-card";
import { ReportGenerator } from "./report-generator";

const API_KEY = import.meta.env.VITE_CONVAI_API_KEY;
const CHARACTER_ID = import.meta.env.VITE_CONVAI_CHARACTER_ID;

export default function IntegratedDashboard() {
  const navigate = useNavigate();
  const convaiClient = useConvaiClient({
    apiKey: API_KEY,
    characterId: CHARACTER_ID,
  });

  const [showReport, setShowReport] = useState(false);
  const [sessionData, setSessionData] = useState({
    messages: [],
    duration: 0,
    emotions: [],
    vocabularyData: [],
  });
  const [currentEmotion, setCurrentEmotion] = useState("neutral");
  const sessionStartRef = useRef(null);
  const wasConnectedRef = useRef(false);

  // Track session data
  useEffect(() => {
    const messages = convaiClient?.chatMessages || [];
    const isConnected = convaiClient?.state?.isConnected;

    if (isConnected && !sessionStartRef.current) {
      sessionStartRef.current = Date.now();
    }

    if (messages.length > 0) {
      const wordCounts = {};
      messages
        .filter(
          (msg) => msg.type === "user-llm-text" || msg.type === "bot-llm-text"
        )
        .forEach((msg) => {
          const words = (msg.content || "")
            .toLowerCase()
            .split(/\s+/)
            .filter((w) => w.length > 3);
          words.forEach((word) => {
            wordCounts[word] = (wordCounts[word] || 0) + 1;
          });
        });

      const vocabularyData = Object.entries(wordCounts)
        .map(([text, count]) => ({ text, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 20);

      setSessionData((prev) => ({
        ...prev,
        messages,
        duration: sessionStartRef.current
          ? Date.now() - sessionStartRef.current
          : 0,
        vocabularyData,
      }));
    }
  }, [convaiClient?.chatMessages?.length, convaiClient?.state?.isConnected]);

  // Detect emotions
  useEffect(() => {
    const messages = convaiClient?.chatMessages || [];
    const botMessages = messages.filter((msg) => msg.type === "bot-llm-text");

    if (botMessages.length > 0) {
      const lastBotMsg = botMessages[botMessages.length - 1];
      const messageText = lastBotMsg?.content || "";

      if (messageText.trim()) {
        detectEmotionCached(messageText).then((emotion) => {
          if (emotion) {
            setCurrentEmotion(emotion);
            setSessionData((prev) => ({
              ...prev,
              emotions: [...prev.emotions, { emotion, timestamp: Date.now() }],
            }));
          }
        });
      }
    }
  }, [convaiClient?.chatMessages?.length]);

  // Show report when disconnected
  useEffect(() => {
    if (convaiClient?.state?.isConnected) {
      wasConnectedRef.current = true;
    }
    if (wasConnectedRef.current && !convaiClient?.state?.isConnected) {
      setShowReport(true);
    }
  }, [convaiClient?.state?.isConnected]);

  const handleConnect = async () => {
    navigate("/chat");
  };

  const handleDisconnect = () => {
    convaiClient.disconnect();
    setShowReport(true);
  };

  const handleDownloadReport = () => {
    const reportGenerator = new ReportGenerator();
    reportGenerator.generateAndDownloadReport(sessionData.messages);
  };

  const userMessages = sessionData.messages.filter(
    (msg) => msg.type === "user-llm-text" || msg.type === "user-transcription"
  ).length;
  const botMessages = sessionData.messages.filter(
    (msg) => msg.type === "bot-llm-text"
  ).length;
  const totalMessages = userMessages + botMessages;
  const durationMinutes = Math.floor(sessionData.duration / 60000);
  const durationSeconds = Math.floor((sessionData.duration % 60000) / 1000);

  if (showReport) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold">Session Report</h1>
              <p className="text-muted-foreground">
                Your conversation analytics
              </p>
            </div>
            <Button onClick={() => setShowReport(false)} variant="outline">
              Back to Dashboard
            </Button>
          </div>
          <ReportCard
            sessionData={sessionData}
            onClose={() => setShowReport(false)}
          />
        </div>
      </div>
    );
  }

  return (
    <AudioContext.Provider value={convaiClient?.room}>
      <AudioRenderer />
      <div className="min-h-screen bg-background">
        <header className="border-b sticky top-0 bg-background/95 backdrop-blur z-10">
          <div className="container flex h-16 items-center px-4">
            <div className="flex items-center gap-2">
              <Brain className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-bold">Analytics Dashboard</h1>
            </div>
            <div className="ml-auto flex items-center gap-4">
              <Badge
                variant={
                  convaiClient?.state?.isConnected ? "default" : "secondary"
                }
              >
                {convaiClient?.state?.isConnected
                  ? "Live Session"
                  : "No Active Session"}
              </Badge>
              {convaiClient?.state?.isConnected ? (
                <Button onClick={handleDisconnect} variant="outline" size="sm">
                  End Session
                </Button>
              ) : (
                <Button onClick={handleConnect} size="sm">
                  Start Session
                </Button>
              )}
              {totalMessages > 0 && (
                <Button
                  onClick={handleDownloadReport}
                  variant="ghost"
                  size="sm"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
              )}
            </div>
          </div>
        </header>

        <main className="container mx-auto p-6">
          <ScrollArea className="h-[calc(100vh-5rem)]">
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total Messages
                    </CardTitle>
                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{totalMessages}</div>
                    <p className="text-xs text-muted-foreground">
                      {userMessages} from you, {botMessages} from AI
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Duration
                    </CardTitle>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {durationMinutes}m {durationSeconds}s
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {convaiClient?.state?.isConnected
                        ? "Active now"
                        : "Last session"}
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Emotion
                    </CardTitle>
                    <Activity className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold capitalize">
                      {currentEmotion}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {sessionData.emotions.length} detected
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Vocabulary
                    </CardTitle>
                    <BarChart3 className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {sessionData.vocabularyData.length}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Unique words
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="md:col-span-2">
                  <VocabularyHeatmap data={sessionData.vocabularyData} />
                </div>
                <SentimentTrends userData={sessionData} />
                <ClarityScore userData={sessionData} />
              </div>
              {sessionData.emotions.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Emotion Timeline</CardTitle>
                    <CardDescription>
                      Recent emotional states detected
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {sessionData.emotions.slice(-10).map((e, idx) => (
                        <Badge
                          key={idx}
                          variant="secondary"
                          className="capitalize"
                        >
                          {e.emotion}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
              {totalMessages === 0 && (
                <Card className="border-dashed">
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <BarChart3 className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Data Yet</h3>
                    <p className="text-sm text-muted-foreground text-center max-w-sm mb-4">
                      Start a session to see your conversation analytics
                    </p>
                    <Button onClick={handleConnect}>
                      Start Your First Session
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </ScrollArea>
        </main>
      </div>
    </AudioContext.Provider>
  );
}
