import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { HugeiconsIcon } from "@hugeicons/react";
import {
    InformationCircleIcon,
    AiBrain01Icon,
    Sun03Icon,
    Moon02Icon,
} from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/theme-provider";

export function SystemHUD({
    isConnected,
    isOfflineMode,
    agentState,
    currentEmotion,
    userSentiment,
    latencyMetrics,
    tokenUsage,
    isDevMode,
    setIsDevMode,

    modelName = "gemini-3-flash-preview",
}) {
    const { theme, setTheme } = useTheme();

    return (
        <div className="absolute left-4 top-4 z-10">
            <div className="flex items-center gap-1 rounded-full border border-border bg-card/80 p-1 backdrop-blur-lg">
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            size="icon"
                            variant="ghost"
                            className="size-8 rounded-full"
                        >
                            <HugeiconsIcon icon={InformationCircleIcon} className="size-4" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent
                        side="bottom"
                        align="start"
                        className="w-72 border-border/50 bg-card/95 backdrop-blur-xl"
                    >
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <p className="text-sm font-semibold">System HUD</p>
                                <div className="flex items-center gap-2">
                                    <span
                                        className={cn(
                                            "size-2 animate-pulse rounded-full",
                                            isConnected ? "bg-green-500" : "bg-red-500"
                                        )}
                                    />
                                    <span className="text-xs text-muted-foreground">
                                        {isConnected
                                            ? isOfflineMode
                                                ? "Offline Mode"
                                                : "Live"
                                            : "Disconnected"}
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                    AI State
                                </p>
                                <div className="flex items-center gap-2">
                                    <Badge variant="outline" className="gap-1.5 capitalize">
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
                                    <Badge variant="secondary" className="capitalize">
                                        {currentEmotion}
                                    </Badge>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                    User Sentiment
                                </p>
                                <div className="space-y-1.5">
                                    {[
                                        "happy",
                                        "sad",
                                        "angry",
                                        "fearful",
                                        "surprised",
                                        "neutral",
                                    ].map((sentiment) => (
                                        <div key={sentiment} className="flex items-center gap-2">
                                            <span className="w-16 text-xs capitalize">
                                                {sentiment}
                                            </span>
                                            <Progress
                                                value={userSentiment[sentiment] || 0}
                                                className="h-1.5 flex-1"
                                            />
                                            <span className="w-6 text-right text-xs text-muted-foreground">
                                                {userSentiment[sentiment] || 0}%
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                        </div>
                    </PopoverContent>
                </Popover>

                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            size="icon"
                            variant="ghost"
                            className="size-8 rounded-full"
                        >
                            <HugeiconsIcon icon={AiBrain01Icon} className="size-4" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent
                        side="bottom"
                        align="start"
                        className="w-80 border-border/50 bg-card/95 backdrop-blur-xl"
                    >
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-semibold">Dev Mode</p>
                                    <p className="text-xs text-muted-foreground">
                                        Show technical details
                                    </p>
                                </div>
                                <Switch checked={isDevMode} onCheckedChange={setIsDevMode} />
                            </div>

                            {isDevMode && (
                                <>
                                    <div className="space-y-2 border-t border-border pt-3">
                                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                            Live Latency
                                        </p>
                                        <div className="grid grid-cols-3 gap-2">
                                            <div className="rounded-md border border-border bg-muted/30 p-2 text-center">
                                                <p className="text-lg font-mono font-bold text-blue-500">
                                                    {latencyMetrics.stt}
                                                </p>
                                                <p className="text-[10px] text-muted-foreground">
                                                    STT (ms)
                                                </p>
                                            </div>
                                            <div className="rounded-md border border-border bg-muted/30 p-2 text-center">
                                                <p className="text-lg font-mono font-bold text-purple-500">
                                                    {latencyMetrics.llm}
                                                </p>
                                                <p className="text-[10px] text-muted-foreground">
                                                    LLM (ms)
                                                </p>
                                            </div>
                                            <div className="rounded-md border border-border bg-muted/30 p-2 text-center">
                                                <p className="text-lg font-mono font-bold text-green-500">
                                                    {latencyMetrics.tts}
                                                </p>
                                                <p className="text-[10px] text-muted-foreground">
                                                    TTS (ms)
                                                </p>
                                            </div>
                                        </div>
                                        <p className="text-center text-xs text-muted-foreground">
                                            Total:{" "}
                                            <span className="font-mono font-medium">
                                                {latencyMetrics.stt +
                                                    latencyMetrics.llm +
                                                    latencyMetrics.tts}
                                                ms
                                            </span>
                                        </p>
                                    </div>

                                    <div className="space-y-2 border-t border-border pt-3">
                                        <div className="flex items-center justify-between">
                                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                                Token Usage
                                            </p>
                                            <Badge variant="outline" className="font-mono">
                                                {tokenUsage} tokens
                                            </Badge>
                                        </div>
                                    </div>

                                    <div className="space-y-2 border-t border-border pt-3">
                                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                            Model
                                        </p>
                                        <div className="flex items-center gap-2">
                                            <code className="rounded bg-muted px-2 py-1 text-xs">
                                                {modelName}
                                            </code>
                                            <Badge
                                                variant="secondary"
                                                className="capitalize text-[10px]"
                                            >
                                                {currentEmotion}
                                            </Badge>
                                        </div>
                                    </div>
                                </>
                            )}

                            {!isDevMode && (
                                <p className="text-center text-xs text-muted-foreground py-2">
                                    Enable Dev Mode to see technical metrics
                                </p>
                            )}
                        </div>
                    </PopoverContent>
                </Popover>

                <Button
                    size="icon"
                    variant="ghost"
                    className="size-8 rounded-full"
                    onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                >
                    <HugeiconsIcon
                        icon={Sun03Icon}
                        className="size-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0"
                    />
                    <HugeiconsIcon
                        icon={Moon02Icon}
                        className="absolute size-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100"
                    />
                </Button>
            </div>
        </div>
    );
}
