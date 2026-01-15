import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  MessageSquare,
  Bot,
  Video,
  Activity,
  ArrowRight,
  History,
  TrendingUp,
  Brain,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/auth-context";

function QuickStats({ stats }) {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card className="border-border/50 bg-card/50 shadow-sm backdrop-blur-sm transition-all hover:bg-card/80 hover:shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between space-y-0 pb-2">
                <p className="text-sm font-medium text-muted-foreground">
                  {stat.label}
                </p>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="flex items-baseline gap-2 pt-2">
                <div className="text-2xl font-bold">{stat.value}</div>
                {stat.trend && (
                  <p className="text-xs text-muted-foreground">{stat.trend}</p>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}

function ActionCard({ title, description, icon: Icon, onClick, gradient, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="group relative h-full"
    >
      <div
        className={cn(
          "absolute inset-0 rounded-xl bg-gradient-to-br opacity-5 transition-opacity duration-500 group-hover:opacity-10",
          gradient
        )}
      />
      <Card
        className="relative h-full border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/20 hover:shadow-lg"
        onClick={onClick}
      >
        <CardHeader>
          <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-background/80 shadow-sm ring-1 ring-border/50 transition-transform duration-300 group-hover:scale-110">
            <Icon className="h-6 w-6 text-foreground" />
          </div>
          <CardTitle className="text-lg">{title}</CardTitle>
          <CardDescription className="line-clamp-2">
            {description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="ghost"
            className="group/btn w-full justify-between hover:bg-primary/5"
          >
            Start Session
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover/btn:translate-x-1" />
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function DashboardHome() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState([
    { label: "Total Sessions", value: "0", icon: History },
    { label: "Messages Sent", value: "0", icon: MessageSquare },
    { label: "Words Spoken", value: "0", icon: Activity },
  ]);

  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return;

      try {
        const { data: sessions, error: sessionError } = await supabase
          .from("chat_sessions")
          .select("id")
          .eq("user_id", user.id);
        
        if (sessionError) throw sessionError;

        const sessionIds = sessions?.map((s) => s.id) || [];
        const sessionCount = sessions?.length || 0;

        let messageCount = 0;
        let wordCount = 0;

        if (sessionIds.length > 0) {
          const { data: messages, error: msgError } = await supabase
            .from("chat_messages")
            .select("content, role")
            .in("session_id", sessionIds);
            
           if (msgError) throw msgError;

          const userMessages = messages?.filter((m) => m.role === "user") || [];
          messageCount = messages?.length || 0;
          
          const allText = userMessages.map((m) => m.content).join(" ");
          const words = allText.match(/\b\w+\b/g) || [];
          wordCount = words.length;
        }

        setStats([
          { label: "Total Sessions", value: String(sessionCount), icon: History },
          { label: "Messages Sent", value: String(messageCount), icon: MessageSquare },
          { label: "Words Spoken", value: String(wordCount), icon: Activity },
        ]);
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    };

    fetchStats();
  }, [user]);

  return (
    <div className="space-y-8 p-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Welcome back</h2>
        <p className="text-muted-foreground">
          Ready to continue your journey? Choose a mode to get started.
        </p>
      </div>

      <QuickStats stats={stats} />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <ActionCard
          title="Animated Chat"
          description="Interactive 3D avatar with real-time emotional responses and dynamic environments."
          icon={Bot}
          gradient="from-blue-500 to-cyan-500"
          delay={0.1}
          onClick={() => navigate("/dashboard/chat", { state: { style: "animated" } })}
        />
        <ActionCard
          title="Realistic Avatar"
          description="High-fidelity Azure AI avatar for professional, lifelike conversational practice."
          icon={Video}
          gradient="from-purple-500 to-pink-500"
          delay={0.2}
          onClick={() => navigate("/dashboard/chat-azure")}
        />
        <ActionCard
            title="Analysis & Insights"
            description="Deep dive into your conversation metrics, sentiment analysis, and progress over time."
            icon={TrendingUp}
            gradient="from-amber-500 to-orange-500"
            delay={0.3}
            onClick={() => navigate("/dashboard/report")}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
         <Card className="col-span-2 border-border/50 bg-card/50 shadow-sm backdrop-blur-sm">
            <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Your latest sessions and milestones.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                    <Brain className="mb-4 h-12 w-12 opacity-20" />
                    <p>No recent activity breakdown available yet.</p>
                    <p className="text-sm">Start a chat to generate insights!</p>
                </div>
            </CardContent>
         </Card>
      </div>
    </div>
  );
}
