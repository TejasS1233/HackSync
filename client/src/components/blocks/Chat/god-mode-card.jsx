import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { HugeiconsIcon } from "@hugeicons/react";
import { AiBrain01Icon, DashboardSpeed01Icon as Speedometer01Icon, Coins01Icon } from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";

export function GodModeCard({
    isConnected,
    isOfflineMode,
    agentState,
    currentEmotion,
    userSentiment,
    latencyMetrics,
    tokenUsage,
    modelName = "gemini-3-flash-preview",
}) {
    const totalLatency = latencyMetrics.stt + latencyMetrics.llm + latencyMetrics.tts;

    return (
        <div className="absolute right-4 top-4 z-10 w-72">
            <Card className="bg-card/90 backdrop-blur-lg border-border/50 shadow-xl">
                <CardHeader className="pb-2 pt-3 px-4">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-semibold flex items-center gap-2">
                            <HugeiconsIcon icon={AiBrain01Icon} className="size-4 text-primary" />
                            God Mode
                        </CardTitle>
                        <div className="flex items-center gap-2">
                            <span
                                className={cn(
                                    "size-2 animate-pulse rounded-full",
                                    isConnected ? "bg-green-500" : "bg-red-500"
                                )}
                            />
                            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                                {isConnected
                                    ? isOfflineMode
                                        ? "Offline"
                                        : "Live"
                                    : "Disconnected"}
                            </span>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="px-4 pb-4 space-y-4">
                    {/* AI State */}
                    <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">State</span>
                        <div className="flex items-center gap-2">
                            <Badge variant="outline" className="gap-1 capitalize text-xs py-0">
                                <span
                                    className={cn(
                                        "size-1.5 rounded-full",
                                        agentState === "speaking"
                                            ? "bg-blue-500 animate-pulse"
                                            : agentState === "listening"
                                                ? "bg-green-500 animate-pulse"
                                                : "bg-muted-foreground"
                                    )}
                                />
                                {agentState || "Idle"}
                            </Badge>
                            <Badge variant="secondary" className="capitalize text-xs py-0">
                                {currentEmotion}
                            </Badge>
                        </div>
                    </div>

                    {/* Latency Metrics */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <HugeiconsIcon icon={Speedometer01Icon} className="size-3" />
                                Latency
                            </span>
                            <span className="text-xs font-mono font-medium">{totalLatency}ms</span>
                        </div>
                        <div className="grid grid-cols-3 gap-1.5">
                            <div className="rounded bg-muted/50 p-1.5 text-center">
                                <p className="text-sm font-mono font-bold text-blue-500">
                                    {latencyMetrics.stt}
                                </p>
                                <p className="text-[9px] text-muted-foreground">STT</p>
                            </div>
                            <div className="rounded bg-muted/50 p-1.5 text-center">
                                <p className="text-sm font-mono font-bold text-purple-500">
                                    {latencyMetrics.llm}
                                </p>
                                <p className="text-[9px] text-muted-foreground">LLM</p>
                            </div>
                            <div className="rounded bg-muted/50 p-1.5 text-center">
                                <p className="text-sm font-mono font-bold text-green-500">
                                    {latencyMetrics.tts}
                                </p>
                                <p className="text-[9px] text-muted-foreground">TTS</p>
                            </div>
                        </div>
                    </div>

                    {/* Token Usage */}
                    <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <HugeiconsIcon icon={Coins01Icon} className="size-3" />
                            Tokens
                        </span>
                        <Badge variant="outline" className="font-mono text-xs py-0">
                            {tokenUsage}
                        </Badge>
                    </div>

                    {/* Model */}
                    <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">Model</span>
                        <code className="text-[10px] bg-muted px-1.5 py-0.5 rounded truncate max-w-[140px]">
                            {modelName}
                        </code>
                    </div>

                    {/* User Sentiment Mini */}
                    <div className="space-y-1.5 pt-1 border-t border-border/50">
                        <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                            User Sentiment
                        </span>
                        <div className="grid grid-cols-2 gap-x-3 gap-y-1">
                            {["happy", "sad", "angry", "neutral"].map((sentiment) => (
                                <div key={sentiment} className="flex items-center gap-1.5">
                                    <span className="w-12 text-[10px] capitalize truncate">
                                        {sentiment}
                                    </span>
                                    <Progress
                                        value={userSentiment[sentiment] || 0}
                                        className="h-1 flex-1"
                                    />
                                    <span className="w-6 text-right text-[9px] text-muted-foreground font-mono">
                                        {userSentiment[sentiment] || 0}%
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
