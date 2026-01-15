import React, { useEffect, useState, useRef } from "react";
import cloud from "d3-cloud";
import { scaleLinear } from "d3-scale";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChartContainer } from "@/components/ui/chart";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  CheckCircle2,
  ChevronUp,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { useSpring, useMotionValueEvent } from "motion/react";
import { DashboardHeader } from "@/components/blocks/Dashboard/dashboard-header";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/auth-context";

export const VocabularyHeatmap = ({ data }) => {
  const [words, setWords] = useState([]);

  const displayData =
    data && data.length > 0
      ? data
      : [
          { text: "Tax", count: 142 },
          { text: "American", count: 98 },
          { text: "State", count: 85 },
          { text: "Plan", count: 64 },
          { text: "People", count: 52 },
          { text: "Economy", count: 31 },
          { text: "Jobs", count: 28 },
          { text: "Future", count: 22 },
          { text: "Security", count: 19 },
          { text: "Federal", count: 15 },
          { text: "Country", count: 12 },
          { text: "Budget", count: 9 },
          { text: "Health", count: 7 },
          { text: "Finance", count: 5 },
          { text: "Policy", count: 4 },
          { text: "Growth", count: 3 },
          { text: "Reform", count: 2 },
        ];

  useEffect(() => {
    if (!displayData.length) return;

    const counts = displayData.map((d) => d.count);
    const minCount = Math.min(...counts);
    const maxCount = Math.max(...counts);

    const sizeScale = scaleLinear()
      .domain([minCount, maxCount])
      .range(minCount === maxCount ? [32, 32] : [10, 60]);

    const layout = cloud()
      .size([700, 350])
      .words(
        displayData.map((d) => ({
          text: d.text,
          size: sizeScale(d.count),
        }))
      )
      .padding(20)
      .rotate(0)
      .font("Inter, sans-serif")
      .fontSize((d) => d.size)
      .spiral("archimedean")
      .on("end", (renderedWords) => {
        setWords(renderedWords);
      });

    layout.start();
  }, [data]);

  return (
    <Card className="border-none shadow-none ring-1 ring-border bg-card overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="space-y-0.5">
            <CardTitle className="text-lg font-bold tracking-tight text-foreground">
              Keyword Density Map
            </CardTitle>
            <CardDescription className="text-xs font-medium text-muted-foreground">
              Visualizing raw word frequency from your session.
            </CardDescription>
          </div>
          <div className="bg-muted px-2 py-0.5 rounded-md text-[10px] font-bold text-muted-foreground uppercase tracking-tighter border border-border">
            {displayData.reduce((acc, curr) => acc + curr.count, 0)} Total
            Mentions
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-2">
        <div className="relative w-full h-[350px] bg-muted/20 rounded-xl border border-border flex items-center justify-center overflow-hidden">
          <div
            className="absolute inset-0 opacity-[0.03] pointer-events-none"
            style={{
              backgroundImage:
                "radial-gradient(currentColor 1px, transparent 1px)",
              backgroundSize: "20px 20px",
            }}
          />

          <svg
            width="100%"
            height="100%"
            viewBox="0 0 700 350"
            preserveAspectRatio="xMidYMid meet"
            className="overflow-visible font-sans"
          >
            <g transform="translate(350, 175)">
              {words.map((w, i) => {
                const isDominant = w.size > 45;
                const isFrequent = w.size <= 45 && w.size > 25;

                return (
                  <text
                    key={`${w.text}-${i}`}
                    style={{
                      fontSize: `${w.size}px`,
                      fontWeight: isDominant
                        ? "900"
                        : isFrequent
                        ? "700"
                        : "500",
                      fill: "currentColor",
                      opacity: isDominant ? 1 : isFrequent ? 0.7 : 0.4,
                    }}
                    textAnchor="middle"
                    transform={`translate(${w.x}, ${w.y})`}
                    className="select-none transition-all duration-700 ease-in-out cursor-default text-foreground hover:opacity-80"
                  >
                    {w.text}
                  </text>
                );
              })}
            </g>
          </svg>
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30" />
              <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
                Low Frequency
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-foreground" />
              <span className="text-[9px] font-bold uppercase tracking-widest text-foreground">
                High Frequency
              </span>
            </div>
          </div>
          <div className="text-[9px] font-medium text-muted-foreground uppercase tracking-tighter">
            Mapped Frequency Index
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const chartData = [
  { month: "January", score: 45 },
  { month: "February", score: 65 },
  { month: "March", score: 48 },
  { month: "April", score: 72 },
  { month: "May", score: 61 },
  { month: "June", score: 85 },
  { month: "July", score: 52 },
  { month: "August", score: 78 },
  { month: "September", score: 69 },
  { month: "October", score: 56 },
  { month: "November", score: 82 },
  { month: "December", score: 71 },
];

const chartConfig = {
  score: {
    label: "Score",
    color: "hsl(var(--primary))",
  },
};

export const SentimentTrendsChart = ({ chartData }) => {
  const chartRef = useRef(null);
  const [axis, setAxis] = useState(0);

  // Use provided data or fallback to default
  const displayChartData =
    chartData && chartData.length > 0
      ? chartData
      : [
          { month: "Jan", score: 45 },
          { month: "Feb", score: 65 },
          { month: "Mar", score: 48 },
        ];

  const [displayValue, setDisplayValue] = useState(
    displayChartData[displayChartData.length - 1].score
  );

  const springX = useSpring(0, {
    damping: 30,
    stiffness: 100,
  });

  useMotionValueEvent(springX, "change", (latest) => {
    setAxis(latest);
  });

  const chartConfig = {
    score: {
      label: "Score",
      color: "hsl(var(--primary))",
    },
  };

  return (
    <Card className="border-none shadow-sm ring-1 ring-border">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base font-semibold tracking-tight">
          <span className="font-mono text-3xl font-bold">{displayValue}</span>
          <Badge variant="secondary" className="ml-2">
            <TrendingUp className="mr-1 size-3" />
            Sentiment
          </Badge>
        </CardTitle>
        <CardDescription className="text-xs">
          Sentiment trends from your conversations
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          ref={chartRef}
          className="h-[200px] w-full"
          config={chartConfig}
        >
          <AreaChart
            className="overflow-visible"
            accessibilityLayer
            data={displayChartData}
            onMouseMove={(state) => {
              const x = state.activeCoordinate?.x;
              const dataValue = state.activePayload?.[0]?.value;
              if (x && dataValue !== undefined) {
                springX.set(x);
                setDisplayValue(dataValue);
              }
            }}
            onMouseLeave={() => {
              springX.set(chartRef.current?.getBoundingClientRect().width || 0);
              setDisplayValue(
                displayChartData[displayChartData.length - 1].score
              );
            }}
            margin={{ right: 0, left: 0 }}
          >
            <CartesianGrid
              vertical={false}
              strokeDasharray="3 3"
              stroke="hsl(var(--primary) / 0.1)"
            />
            <Area
              dataKey="score"
              type="monotone"
              fill="url(#gradient-sentiment)"
              fillOpacity={0.4}
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              clipPath={`inset(0 ${
                Number(chartRef.current?.getBoundingClientRect().width) - axis
              } 0 0)`}
            />
            <line
              x1={axis}
              y1={0}
              x2={axis}
              y2="85%"
              stroke="hsl(var(--primary))"
              strokeDasharray="3 3"
              strokeLinecap="round"
              strokeOpacity={0.3}
            />
            <Area
              dataKey="score"
              type="monotone"
              fill="none"
              stroke="hsl(var(--primary))"
              strokeOpacity={0.1}
              strokeWidth={2}
            />
            <defs>
              <linearGradient
                id="gradient-sentiment"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="5%"
                  stopColor="hsl(var(--primary))"
                  stopOpacity={0.3}
                />
                <stop
                  offset="95%"
                  stopColor="hsl(var(--primary))"
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export const ClarityScore = ({ clarityData }) => {
  const score = clarityData?.score || 0;
  const articulation = clarityData?.articulation || 0;
  const coherence = clarityData?.coherence || 0;
  const structure = clarityData?.structure || 0;

  const getScoreLabel = (s) => {
    if (s >= 80) return "Peak Performance Zone";
    if (s >= 60) return "Good Progress";
    if (s >= 40) return "Room for Improvement";
    return "Getting Started";
  };

  const getInsightMessage = () => {
    if (score === 0) return "Start chatting to build your clarity profile.";
    const lowest = Math.min(articulation, coherence, structure);
    if (lowest === articulation) {
      return "Try using longer, more detailed responses to improve your articulation score.";
    }
    if (lowest === coherence) {
      return "Expand your vocabulary by using more diverse words in conversations.";
    }
    return "Add more punctuation to structure your messages better.";
  };

  return (
    <Card className="border-none shadow-none bg-transparent">
      <CardHeader className="p-0 pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Clarity Overview
          </CardTitle>
          {score > 0 && (
            <Badge
              variant="outline"
              className="font-semibold text-xs border-primary/20 bg-primary/5 text-primary"
            >
              {score >= 70 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
              {score}% Score
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-0 space-y-6">
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-bold tracking-tighter">{score}%</span>
          <span className="text-xs text-muted-foreground font-medium">
            Overall Clarity
          </span>
        </div>

        <div className="space-y-1.5">
          <Progress value={score} className="h-1.5" />
          <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-tighter">
            {getScoreLabel(score)}
          </p>
        </div>

        <div className="grid gap-3">
          {[
            { label: "Articulation", val: articulation, color: "bg-primary" },
            { label: "Coherence", val: coherence, color: "bg-primary/80" },
            { label: "Structure", val: structure, color: "bg-primary/60" },
          ].map((item) => (
            <div key={item.label} className="group">
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-muted-foreground group-hover:text-foreground transition-colors">
                  {item.label}
                </span>
                <span className="font-semibold text-foreground">
                  {item.val}%
                </span>
              </div>
              <div className="h-[2px] w-full bg-muted overflow-hidden rounded-full">
                <div
                  className={`h-full ${item.color} transition-all duration-500`}
                  style={{ width: `${item.val}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="p-3 rounded-lg bg-muted/50 border border-border mt-4">
          <div className="flex gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
            <p className="text-[11px] leading-relaxed text-muted-foreground">
              {getInsightMessage()}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const Analytics = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalInteractions: 0,
    totalMessages: 0,
    avgSentiment: 0,
    uniqueWords: 0,
  });
  const [clarityData, setClarityData] = useState({
    score: 0,
    articulation: 0,
    coherence: 0,
    structure: 0,
  });
  const [vocabularyData, setVocabularyData] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!user) return;

      try {
        // Fetch all sessions for the user
        const { data: sessions, error: sessionsError } = await supabase
          .from("chat_sessions")
          .select("id, created_at, metadata")
          .eq("user_id", user.id)
          .order("created_at", { ascending: true });

        if (sessionsError) throw sessionsError;

        // Fetch all messages for the user's sessions
        const sessionIds = sessions?.map((s) => s.id) || [];

        if (sessionIds.length === 0) {
          setLoading(false);
          return;
        }

        const { data: messages, error: messagesError } = await supabase
          .from("chat_messages")
          .select("*")
          .in("session_id", sessionIds)
          .order("created_at", { ascending: true });

        if (messagesError) throw messagesError;

        // Calculate sentiment score from session metadata
        const moodValues = {
          joy: 80,
          neutral: 50,
          sadness: 30,
          anger: 20,
          fear: 25,
          surprise: 60,
        };
        const moodScores =
          sessions?.map((s) => {
            const mood = s.metadata?.mood;
            return moodValues[mood] || 50;
          }) || [];
        const avgSentiment =
          moodScores.length > 0
            ? Math.round(
                moodScores.reduce((a, b) => a + b, 0) / moodScores.length
              )
            : 0;

        // Group sessions by month for chart
        const monthlyData = {};
        sessions?.forEach((session) => {
          const date = new Date(session.created_at);
          const monthKey = date.toLocaleString("default", { month: "short" });
          if (!monthlyData[monthKey]) {
            monthlyData[monthKey] = { count: 0, sentiment: [] };
          }
          monthlyData[monthKey].count++;
          const mood = session.metadata?.mood;
          monthlyData[monthKey].sentiment.push(moodValues[mood] || 50);
        });

        const chartDataArray = Object.entries(monthlyData).map(
          ([month, data]) => ({
            month,
            score: Math.round(
              data.sentiment.reduce((a, b) => a + b, 0) / data.sentiment.length
            ),
          })
        );

        // Extract vocabulary from messages - filter stop words
        const stopWords = new Set(['this', 'that', 'with', 'have', 'from', 'they', 'been', 'were', 'will', 'would', 'could', 'should', 'their', 'there', 'what', 'when', 'where', 'which', 'your', 'about', 'just', 'like', 'some', 'more', 'very', 'really', 'also', 'into', 'only', 'other', 'than', 'then', 'these', 'those']);
        const userMessages = messages?.filter((m) => m.role === "user") || [];
        const allText = userMessages.map((m) => m.content).join(" ");
        const words = allText.toLowerCase().match(/\b[a-z]{4,}\b/g) || [];
        const filteredWords = words.filter(w => !stopWords.has(w));
        const wordCount = {};
        filteredWords.forEach((word) => {
          wordCount[word] = (wordCount[word] || 0) + 1;
        });
        const vocabArray = Object.entries(wordCount)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 25)
          .map(([text, count]) => ({ text, count }));

        // Calculate Clarity Score metrics from user messages
        let articulation = 0;
        let coherence = 0;
        let structure = 0;

        if (userMessages.length > 0) {
          // Articulation: Average words per message (normalized)
          const totalWords = userMessages.reduce((acc, m) => {
            const msgWords = m.content.split(/\s+/).filter(Boolean);
            return acc + msgWords.length;
          }, 0);
          const avgWordsPerMessage = totalWords / userMessages.length;
          // Scale: 5 words = 50%, 15+ words = 100%
          articulation = Math.min(100, Math.round((avgWordsPerMessage / 15) * 100));

          // Coherence: Vocabulary diversity (unique words / total words)
          const uniqueWordCount = Object.keys(wordCount).length;
          const diversityRatio = filteredWords.length > 0 ? uniqueWordCount / filteredWords.length : 0;
          // Scale: 0.3 ratio = 60%, 0.7+ ratio = 100%
          coherence = Math.min(100, Math.round((diversityRatio / 0.7) * 100));

          // Structure: Punctuation usage score
          const punctuationRegex = /[.!?,;:]/g;
          const totalPunctuation = userMessages.reduce((acc, m) => {
            const matches = m.content.match(punctuationRegex);
            return acc + (matches ? matches.length : 0);
          }, 0);
          const punctuationPerMessage = totalPunctuation / userMessages.length;
          // Scale: 1 punctuation = 50%, 3+ = 100%
          structure = Math.min(100, Math.round((punctuationPerMessage / 3) * 100));
        }

        // Overall clarity score (weighted average)
        const overallClarity = Math.round(
          articulation * 0.4 + coherence * 0.3 + structure * 0.3
        );

        setStats({
          totalInteractions: sessions?.length || 0,
          totalMessages: messages?.length || 0,
          avgSentiment,
          uniqueWords: Object.keys(wordCount).length,
        });
        setClarityData({
          score: overallClarity,
          articulation,
          coherence,
          structure,
        });
        setChartData(chartDataArray);
        setVocabularyData(vocabArray);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching analytics:", error);
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="mx-auto space-y-6">
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          <div className="relative overflow-hidden rounded-xl border border-border bg-gradient-to-b from-card to-primary/10 p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground">
                  Total Sessions
                </p>
                <p className="font-mono text-5xl font-bold tracking-tighter">
                  {stats.totalInteractions}
                </p>
              </div>
              <TrendingUp className="size-5 text-muted-foreground" />
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              {stats.totalInteractions === 0
                ? "Start chatting to see stats"
                : "Real-time data"}
            </p>
          </div>

          <div className="relative overflow-hidden rounded-xl border border-border bg-gradient-to-b from-card to-primary/10 p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground">
                  Total Messages
                </p>
                <p className="font-mono text-5xl font-bold tracking-tighter">
                  {stats.totalMessages}
                </p>
              </div>
              <TrendingUp className="size-5 text-muted-foreground" />
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              Messages exchanged
            </p>
          </div>

          <div className="relative overflow-hidden rounded-xl border border-border bg-gradient-to-b from-card to-primary/10 p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground">
                  Unique Words
                </p>
                <p className="font-mono text-5xl font-bold tracking-tighter">
                  {stats.uniqueWords}
                </p>
              </div>
              <TrendingUp className="size-5 text-muted-foreground" />
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              Vocabulary diversity
            </p>
          </div>

          <div className="relative overflow-hidden rounded-xl border border-border bg-gradient-to-b from-card to-primary/10 p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground">
                  Sentiment Score
                </p>
                <p className="font-mono text-5xl font-bold tracking-tighter">
                  {stats.avgSentiment > 0
                    ? `+${stats.avgSentiment}`
                    : stats.avgSentiment}
                </p>
              </div>
              <TrendingUp className="size-5 text-muted-foreground" />
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              Overall mood rating
            </p>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <VocabularyHeatmap data={vocabularyData} />
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Clarity Score</CardTitle>
                  <CardDescription className="text-xs">
                    How articulate is your speech?
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ClarityScore clarityData={clarityData} />
                </CardContent>
              </Card>
            </div>

            <SentimentTrendsChart chartData={chartData} />
          </div>

          <div className="lg:col-span-1">
            <Card className="h-full">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">AI Insights</CardTitle>
                <CardDescription className="text-xs">
                  Personalized recommendations based on your communication
                  patterns
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start space-x-3 p-3 rounded-lg bg-muted/30">
                  <Badge
                    variant="secondary"
                    className="mt-0.5 h-1.5 w-1.5 rounded-full p-0 flex-shrink-0"
                  />
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">
                      Vocabulary Diversity
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {vocabularyData.length > 0
                        ? `You've used ${stats.uniqueWords} unique words. ${
                            stats.uniqueWords > 100
                              ? "Excellent vocabulary range!"
                              : "Keep chatting to expand your vocabulary!"
                          }`
                        : "Start chatting to build your vocabulary profile."}
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-3 rounded-lg bg-muted/30">
                  <Badge
                    variant="secondary"
                    className="mt-0.5 h-1.5 w-1.5 rounded-full p-0 flex-shrink-0"
                  />
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">
                      Session Activity
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {stats.totalInteractions > 0
                        ? `You've completed ${
                            stats.totalInteractions
                          } conversation${
                            stats.totalInteractions !== 1 ? "s" : ""
                          }. Keep the momentum going!`
                        : "Start your first conversation to see insights."}
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-3 rounded-lg bg-muted/30">
                  <Badge
                    variant="secondary"
                    className="mt-0.5 h-1.5 w-1.5 rounded-full p-0 flex-shrink-0"
                  />
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">
                      Mood Tracking
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {stats.avgSentiment > 0
                        ? `Your average sentiment score is ${
                            stats.avgSentiment
                          }. ${
                            stats.avgSentiment > 60
                              ? "You're maintaining positive energy!"
                              : "Consider more uplifting conversations."
                          }`
                        : "Chat more to track your mood patterns."}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
