import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/auth-context";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown } from "lucide-react";

const AnalyticsReal = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalInteractions: 0,
    totalMessages: 0,
    avgSentiment: 50,
    uniqueWords: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!user) return;

      try {
        // Fetch sessions
        const { data: sessions, error: sessionsError } = await supabase
          .from("chat_sessions")
          .select("id, created_at, metadata")
          .eq("user_id", user.id);

        if (sessionsError) throw sessionsError;

        // Fetch messages
        const sessionIds = sessions?.map((s) => s.id) || [];
        const { data: messages, error: messagesError } = await supabase
          .from("chat_messages")
          .select("*")
          .in("session_id", sessionIds);

        if (messagesError) throw messagesError;

        // Calculate sentiment
        const moodValues = {
          joy: 80,
          neutral: 50,
          sadness: 30,
          anger: 20,
          fear: 25,
          surprise: 60,
        };
        const sentiments =
          sessions?.map((s) => moodValues[s.metadata?.mood] || 50) || [];
        const avgSentiment =
          sentiments.length > 0
            ? Math.round(
                sentiments.reduce((a, b) => a + b, 0) / sentiments.length
              )
            : 50;

        // Calculate unique words
        const userMessages = messages?.filter((m) => m.role === "user") || [];
        const allText = userMessages.map((m) => m.content).join(" ");
        const words = allText.toLowerCase().match(/\b[a-z]{3,}\b/g) || [];
        const uniqueWords = new Set(words).size;

        setStats({
          totalInteractions: sessions?.length || 0,
          totalMessages: messages?.length || 0,
          avgSentiment,
          uniqueWords,
        });
        setLoading(false);
      } catch (error) {
        console.error("Error fetching analytics:", error);
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [user]);

  if (loading) {
    return <div className="p-6">Loading analytics...</div>;
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="mx-auto space-y-6">
        <h1 className="text-3xl font-bold">Analytics Dashboard</h1>

        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Total Sessions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {stats.totalInteractions}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Conversations completed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Total Messages
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalMessages}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Messages exchanged
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Sentiment Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">+{stats.avgSentiment}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Average mood rating
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Vocabulary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.uniqueWords}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Unique words used
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsReal;
