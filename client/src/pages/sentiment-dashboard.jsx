import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Brain, Sparkles, TrendingUp, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import chromeAI from "@/services/chromeAI";
import { ChromeAIInfoCard } from "@/components/chrome-ai-info-card";
import { cn } from "@/lib/utils";

import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/auth-context";

const MOOD_COLORS = {
  Happy: "bg-green-500",
  Excited: "bg-yellow-500",
  Calm: "bg-blue-500",
  Curious: "bg-purple-500",
  Neutral: "bg-gray-500",
  Anxious: "bg-orange-500",
  Frustrated: "bg-red-500",
  Sad: "bg-indigo-500",
  Confused: "bg-pink-500",
};

const MOOD_EMOJI = {
  Happy: "😊",
  Excited: "🤩",
  Calm: "😌",
  Curious: "🤔",
  Neutral: "😐",
  Anxious: "😰",
  Frustrated: "😤",
  Sad: "😢",
  Confused: "😕",
};

function SessionCard({ session, analysis, isAnalyzing }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-base">{session.date}</CardTitle>
              <CardDescription className="text-xs">
                {session.duration}
              </CardDescription>
            </div>
            {isAnalyzing ? (
              <Badge variant="outline" className="gap-1">
                <Sparkles className="size-3 animate-pulse" />
                Analyzing...
              </Badge>
            ) : analysis ? (
              <div className="flex items-center gap-2">
                <span className="text-2xl">{MOOD_EMOJI[analysis.mood]}</span>
                <Badge className={cn("text-white", MOOD_COLORS[analysis.mood])}>
                  {analysis.mood}
                </Badge>
              </div>
            ) : null}
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground line-clamp-2">
            {session.text}
          </p>

          {analysis && !isAnalyzing && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Sentiment</span>
                <Badge variant="secondary">{analysis.sentiment}</Badge>
              </div>

              <div className="space-y-1">
                <span className="text-xs text-muted-foreground">Emotions</span>
                <div className="grid grid-cols-5 gap-1">
                  {Object.entries(analysis.emotions).map(([emotion, value]) => (
                    <div key={emotion} className="text-center">
                      <div className="h-12 bg-muted rounded flex items-end overflow-hidden">
                        <div
                          className="w-full bg-primary transition-all"
                          style={{ height: `${value * 100}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-muted-foreground capitalize">
                        {emotion}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <TrendingUp className="size-3" />
                Confidence: {(analysis.confidence * 100).toFixed(0)}%
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

function AIStatusBanner({ isAvailable, isInitialized }) {
  if (isAvailable && isInitialized) {
    return (
      <Card className="border-green-500/50 bg-green-500/5">
        <CardContent className="flex items-center gap-3 p-4">
          <Brain className="size-5 text-green-500" />
          <div className="flex-1">
            <p className="text-sm font-medium">Chrome Built-in AI Active</p>
            <p className="text-xs text-muted-foreground">
              Using Gemini Nano for on-device sentiment analysis
            </p>
          </div>
          <Badge variant="outline" className="border-green-500 text-green-500">
            <Sparkles className="size-3 mr-1" />
            Powered by Gemini Nano
          </Badge>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-orange-500/50 bg-orange-500/5">
      <CardContent className="flex items-center gap-3 p-4">
        <AlertCircle className="size-5 text-orange-500" />
        <div className="flex-1">
          <p className="text-sm font-medium">
            Chrome Built-in AI Not Available
          </p>
          <p className="text-xs text-muted-foreground">
            Using fallback keyword-based analysis. Enable Chrome AI for better
            results.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export default function SentimentDashboard() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [analyses, setAnalyses] = useState({});
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiAvailable, setAiAvailable] = useState(false);
  const [aiInitialized, setAiInitialized] = useState(false);

  useEffect(() => {
    checkAIAvailability();
  }, []);

  useEffect(() => {
    if (user) {
      fetchSessions();
    }
  }, [user]);

  const fetchSessions = async () => {
    try {
      setIsLoading(true);
      
      // Fetch recent sessions
      const { data: sessionsData, error: sessionsError } = await supabase
        .from("chat_sessions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10);

      if (sessionsError) throw sessionsError;

      if (!sessionsData || sessionsData.length === 0) {
        setSessions([]);
        setIsLoading(false);
        return;
      }

      // Process sessions and fetch messages for each
      const processedSessions = await Promise.all(
        sessionsData.map(async (session) => {
          // Fetch messages for this session
          const { data: messages, error: messagesError } = await supabase
            .from("chat_messages")
            .select("content, role, created_at")
            .eq("session_id", session.id)
            .order("created_at", { ascending: true });
            
          if (messagesError) console.error("Error fetching messages:", messagesError);
          
          const msgs = messages || [];
          
          // Combine user and bot messages for analysis context
          // or focus on user messages for sentiment? Usually user messages.
          // Let's combine user messages to gauge their sentiment.
          const userText = msgs
            .filter(m => m.role === "user")
            .map(m => m.content)
            .join(" ");

          // Fallback if no user messages
          const fullText = userText || msgs.map(m => m.content).join(" ");
            
          // Format date
          const date = new Date(session.created_at);
          const formattedDate = date.toLocaleDateString("en-US", {
            year: 'numeric', 
            month: 'short', 
            day: 'numeric',
            hour: '2-digit', 
            minute: '2-digit'
          });

          // Estimate duration (diff between first and last message or default)
          let duration = "5 min";
          if (msgs.length > 1) {
            const start = new Date(msgs[0].created_at);
            const end = new Date(msgs[msgs.length - 1].created_at);
            const diffMins = Math.round((end - start) / 60000);
            duration = `${Math.max(1, diffMins)} min`;
          }

          return {
            id: session.id,
            date: formattedDate,
            text: fullText || "No conversation text available.",
            duration,
            messageCount: msgs.length
          };
        })
      );
      
      // Filter out empty sessions if desired, or keep them
      setSessions(processedSessions);
      
    } catch (error) {
      console.error("Error fetching sessions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const checkAIAvailability = async () => {
    const available = await chromeAI.checkAvailability();
    setAiAvailable(available);

    if (available) {
      const initialized = await chromeAI.initialize();
      setAiInitialized(initialized);
    }
  };

  const analyzeSessions = async () => {
    setIsAnalyzing(true);
    const results = {};

    for (const session of sessions) {
      const analysis = await chromeAI.analyzeSentiment(session.text);
      results[session.id] = analysis;
      setAnalyses({ ...results }); // Update UI progressively
    }

    setIsAnalyzing(false);
  };

  const moodDistribution = Object.values(analyses).reduce((acc, analysis) => {
    acc[analysis.mood] = (acc[analysis.mood] || 0) + 1;
    return acc;
  }, {});

  const dominantMood = Object.entries(moodDistribution).sort(
    (a, b) => b[1] - a[1]
  )[0]?.[0];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Sentiment Analysis</h1>
          <p className="text-muted-foreground">
            AI-powered mood tracking across your sessions
          </p>
        </div>
        <Button
          onClick={analyzeSessions}
          disabled={isAnalyzing}
          size="lg"
          className="gap-2"
        >
          <Brain className="size-4" />
          {isAnalyzing ? "Analyzing..." : "Analyze All Sessions"}
        </Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <AIStatusBanner
            isAvailable={aiAvailable}
            isInitialized={aiInitialized}
          />
        </div>
        <ChromeAIInfoCard />
      </div>

      {Object.keys(analyses).length > 0 && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Dominant Mood
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <span className="text-4xl">{MOOD_EMOJI[dominantMood]}</span>
                <div>
                  <p className="text-2xl font-bold">{dominantMood}</p>
                  <p className="text-xs text-muted-foreground">
                    {moodDistribution[dominantMood]} sessions
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Sessions Analyzed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold">
                {Object.keys(analyses).length}
              </p>
              <p className="text-xs text-muted-foreground">
                out of {sessions.length} total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Avg Confidence
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold">
                {(
                  (Object.values(analyses).reduce(
                    (sum, a) => sum + a.confidence,
                    0
                  ) /
                    Object.keys(analyses).length) *
                  100
                ).toFixed(0)}
                %
              </p>
              <p className="text-xs text-muted-foreground">analysis accuracy</p>
            </CardContent>
          </Card>
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading specific sessions...</p>
        </div>
      ) : sessions.length === 0 ? (
        <div className="text-center py-12 border rounded-lg bg-muted/20">
          <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium">No Sessions Found</h3>
          <p className="text-muted-foreground">
            Start a chat to see sentiment analysis here.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {sessions.map((session) => (
            <SessionCard
              key={session.id}
              session={session}
              analysis={analyses[session.id]}
              isAnalyzing={isAnalyzing && !analyses[session.id]}
            />
          ))}
        </div>
      )}
    </div>
  );
}
