import { useEffect, useState } from "react";
import { format, formatDistanceToNow } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/auth-context";
import {
  Loader2,
  Trash2,
  Eye,
  MessageSquare,
  Activity,
  Clock,
  Sparkles,
  Calendar,
  MessagesSquare,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";

const moodConfig = {
  happy: { color: "from-amber-500 to-orange-500", bg: "bg-amber-500/10", text: "text-amber-600", border: "border-amber-500/30" },
  joy: { color: "from-amber-500 to-orange-500", bg: "bg-amber-500/10", text: "text-amber-600", border: "border-amber-500/30" },
  sad: { color: "from-blue-500 to-indigo-500", bg: "bg-blue-500/10", text: "text-blue-600", border: "border-blue-500/30" },
  sadness: { color: "from-blue-500 to-indigo-500", bg: "bg-blue-500/10", text: "text-blue-600", border: "border-blue-500/30" },
  angry: { color: "from-red-500 to-rose-500", bg: "bg-red-500/10", text: "text-red-600", border: "border-red-500/30" },
  anger: { color: "from-red-500 to-rose-500", bg: "bg-red-500/10", text: "text-red-600", border: "border-red-500/30" },
  fear: { color: "from-purple-500 to-violet-500", bg: "bg-purple-500/10", text: "text-purple-600", border: "border-purple-500/30" },
  fearful: { color: "from-purple-500 to-violet-500", bg: "bg-purple-500/10", text: "text-purple-600", border: "border-purple-500/30" },
  surprised: { color: "from-cyan-500 to-teal-500", bg: "bg-cyan-500/10", text: "text-cyan-600", border: "border-cyan-500/30" },
  neutral: { color: "from-slate-500 to-gray-500", bg: "bg-slate-500/10", text: "text-slate-600", border: "border-slate-500/30" },
};

const getMoodStyle = (mood) => moodConfig[mood] || moodConfig.neutral;

export default function DashboardHistory() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [metrics, setMetrics] = useState({ avgLength: 0, userTurnCount: 0 });

  useEffect(() => {
    const fetchSessions = async () => {
      if (!user) return;
      try {
        const { data: sessionData, error } = await supabase
          .from("chat_sessions")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (error) throw error;

        const sessionsWithCounts = await Promise.all(
          sessionData.map(async (session) => {
            const { count } = await supabase
              .from("chat_messages")
              .select("*", { count: "exact", head: true })
              .eq("session_id", session.id);
            return { ...session, messageCount: count };
          })
        );

        setSessions(sessionsWithCounts);
      } catch (err) {
        console.error("Error fetching sessions:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, [user]);

  useEffect(() => {
    if (!selectedSession) {
      setMessages([]);
      return;
    }

    const fetchMessages = async () => {
      setMessagesLoading(true);
      try {
        const { data, error } = await supabase
          .from("chat_messages")
          .select("*")
          .eq("session_id", selectedSession.id)
          .order("created_at", { ascending: true });

        if (error) throw error;
        setMessages(data);

        const userMsgs = data.filter((m) => m.role === "user");
        const avgLen = userMsgs.reduce((acc, curr) => acc + curr.content.length, 0) / (userMsgs.length || 1);
        setMetrics({
          avgLength: Math.round(avgLen),
          userTurnCount: userMsgs.length,
        });
      } catch (err) {
        console.error("Error fetching messages:", err);
      } finally {
        setMessagesLoading(false);
      }
    };

    fetchMessages();
  }, [selectedSession]);

  const handleDelete = async (sessionId, e) => {
    e.stopPropagation();
    try {
      const { error } = await supabase.from("chat_sessions").delete().eq("id", sessionId);
      if (error) throw error;
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
      if (selectedSession?.id === sessionId) setSelectedSession(null);
    } catch (err) {
      console.error("Error deleting session:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
        <p className="text-muted-foreground text-sm">Loading your history...</p>
      </div>
    );
  }

  const totalMessages = sessions.reduce((acc, s) => acc + (s.messageCount || 0), 0);

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Stats Cards - Matching Analytics Style */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <div className="relative overflow-hidden rounded-xl border border-border bg-gradient-to-b from-card to-primary/10 p-6">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">
                Total Sessions
              </p>
              <p className="font-mono text-5xl font-bold tracking-tighter">
                {sessions.length}
              </p>
            </div>
            <MessagesSquare className="size-5 text-muted-foreground" />
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            All time conversations
          </p>
        </div>

        <div className="relative overflow-hidden rounded-xl border border-border bg-gradient-to-b from-card to-primary/10 p-6">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">
                Total Messages
              </p>
              <p className="font-mono text-5xl font-bold tracking-tighter">
                {totalMessages}
              </p>
            </div>
            <MessageSquare className="size-5 text-muted-foreground" />
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Messages exchanged
          </p>
        </div>

        <div className="relative overflow-hidden rounded-xl border border-border bg-gradient-to-b from-card to-primary/10 p-6">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">
                Avg per Session
              </p>
              <p className="font-mono text-5xl font-bold tracking-tighter">
                {sessions.length > 0 ? Math.round(totalMessages / sessions.length) : 0}
              </p>
            </div>
            <Activity className="size-5 text-muted-foreground" />
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Messages per conversation
          </p>
        </div>

        <div className="relative overflow-hidden rounded-xl border border-border bg-gradient-to-b from-card to-primary/10 p-6">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">
                Last Active
              </p>
              <p className="font-mono text-3xl font-bold tracking-tighter">
                {sessions.length > 0
                  ? formatDistanceToNow(new Date(sessions[0].created_at), { addSuffix: false })
                  : "N/A"}
              </p>
            </div>
            <Clock className="size-5 text-muted-foreground" />
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Since last conversation
          </p>
        </div>
      </div>

      {/* Sessions Table */}
      <Card className="border-none shadow-none ring-1 ring-border overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent bg-muted/30">
                <TableHead className="w-[200px] font-semibold">
                  <div className="flex items-center gap-2">
                    <Calendar className="size-4" />
                    Date
                  </div>
                </TableHead>
                <TableHead className="font-semibold">Session</TableHead>
                <TableHead className="font-semibold">Mood</TableHead>
                <TableHead className="text-center font-semibold">Messages</TableHead>
                <TableHead className="text-right font-semibold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sessions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-40">
                    <div className="flex flex-col items-center justify-center gap-3 text-muted-foreground">
                      <Sparkles className="size-10 opacity-50" />
                      <div className="text-center">
                        <p className="font-medium">No conversations yet</p>
                        <p className="text-sm">Start a chat to see your history here</p>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                sessions.map((session) => {
                  const moodStyle = getMoodStyle(session.metadata?.mood);
                  return (
                    <TableRow
                      key={session.id}
                      className="group cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => setSelectedSession(session)}
                    >
                      <TableCell className="font-medium py-4">
                        <div className="flex flex-col">
                          <span>{format(new Date(session.created_at), "MMM d, yyyy")}</span>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(session.created_at), "h:mm a")}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={cn(
                              "size-10 rounded-full bg-gradient-to-br flex items-center justify-center",
                              moodStyle.color
                            )}
                          >
                            <MessageSquare className="size-5 text-white" />
                          </div>
                          <div>
                            <p className="font-medium text-sm">Conversation</p>
                            <p className="text-xs text-muted-foreground font-mono">
                              #{session.id.slice(0, 8)}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <Badge
                          variant="outline"
                          className={cn(
                            "capitalize font-medium",
                            moodStyle.bg,
                            moodStyle.text,
                            moodStyle.border
                          )}
                        >
                          {session.metadata?.mood || "Neutral"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center py-4">
                        <Badge variant="secondary" className="font-mono">
                          {session.messageCount}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right py-4">
                        <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedSession(session);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                            onClick={(e) => handleDelete(session.id, e)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Session Detail Dialog */}
      <Dialog open={!!selectedSession} onOpenChange={(open) => !open && setSelectedSession(null)}>
        <DialogContent className="max-w-2xl h-[80vh] flex flex-col p-0 gap-0 overflow-hidden">
          <DialogHeader className="px-6 py-4 border-b bg-muted/30">
            <DialogTitle className="flex items-center gap-2">
              <div
                className={cn(
                  "size-8 rounded-lg bg-gradient-to-br flex items-center justify-center",
                  getMoodStyle(selectedSession?.metadata?.mood).color
                )}
              >
                <MessageSquare className="size-4 text-white" />
              </div>
              Session Details
            </DialogTitle>
            <DialogDescription className="flex items-center gap-4 mt-2">
              <span className="flex items-center gap-1.5 text-xs">
                <Activity className="h-3.5 w-3.5" />
                Avg: {metrics.avgLength} chars
              </span>
              <span className="flex items-center gap-1.5 text-xs">
                <MessageSquare className="h-3.5 w-3.5" />
                {metrics.userTurnCount} turns
              </span>
              <Badge
                variant="outline"
                className={cn(
                  "capitalize text-xs",
                  getMoodStyle(selectedSession?.metadata?.mood).bg,
                  getMoodStyle(selectedSession?.metadata?.mood).text,
                  getMoodStyle(selectedSession?.metadata?.mood).border
                )}
              >
                {selectedSession?.metadata?.mood || "Neutral"}
              </Badge>
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="flex-1 p-6">
            {messagesLoading ? (
              <div className="flex justify-center items-center h-full min-h-[200px]">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={cn(
                      "flex w-full",
                      msg.role === "user" ? "justify-end" : "justify-start"
                    )}
                  >
                    <div
                      className={cn(
                        "max-w-[80%] rounded-2xl px-4 py-3 text-sm",
                        msg.role === "user"
                          ? "bg-primary text-primary-foreground rounded-br-md"
                          : "bg-muted rounded-bl-md"
                      )}
                    >
                      <p className="leading-relaxed">{msg.content}</p>
                      <span className="mt-1.5 block text-[10px] opacity-60">
                        {format(new Date(msg.created_at), "h:mm a")}
                      </span>
                    </div>
                  </div>
                ))}
                {messages.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                    <MessageSquare className="size-12 opacity-30 mb-3" />
                    <p className="text-sm">No messages in this session</p>
                  </div>
                )}
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}
