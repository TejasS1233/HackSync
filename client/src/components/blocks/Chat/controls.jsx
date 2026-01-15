import { Button } from "@/components/ui/button";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { HugeiconsIcon } from "@hugeicons/react";
import {
    Mic01Icon,
    MicOff01Icon,
    Video01Icon,
    VideoOffIcon as VideoOff01Icon,
    Comment01Icon,
    CallEnd01Icon,
} from "@hugeicons/core-free-icons";

function ControlButton({
    icon,
    isActive,
    onClick,
    tooltip,
    variant = "default",
}) {
    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <Button
                    onClick={onClick}
                    size="icon-lg"
                    variant={
                        variant === "destructive"
                            ? "destructive"
                            : isActive
                                ? "default"
                                : "outline"
                    }
                    className={cn(
                        "rounded-full transition-all",
                        variant === "destructive" && "hover:bg-destructive/90"
                    )}
                >
                    <HugeiconsIcon icon={icon} className="size-5" />
                </Button>
            </TooltipTrigger>
            <TooltipContent side="top">
                <p>{tooltip}</p>
            </TooltipContent>
        </Tooltip>
    );
}

export function Controls({
    isConnected,
    isMuted,
    isVideoOn,
    isChatOpen,
    onConnect,
    onDisconnect,
    onToggleMute,
    onToggleVideo,
    onToggleChat,
}) {
    if (!isConnected) {
        return (
            <Button onClick={onConnect} className="rounded-full px-6">
                Connect
            </Button>
        );
    }

    return (
        <>
            <ControlButton
                icon={isMuted ? MicOff01Icon : Mic01Icon}
                isActive={!isMuted}
                onClick={onToggleMute}
                tooltip={isMuted ? "Unmute" : "Mute"}
            />

            <ControlButton
                icon={isVideoOn ? Video01Icon : VideoOff01Icon}
                isActive={isVideoOn}
                onClick={onToggleVideo}
                tooltip={isVideoOn ? "Turn off video" : "Turn on video"}
            />

            <ControlButton
                icon={Comment01Icon}
                isActive={isChatOpen}
                onClick={onToggleChat}
                tooltip="Toggle chat"
            />

            <ControlButton
                icon={CallEnd01Icon}
                onClick={onDisconnect}
                tooltip="End call"
                variant="destructive"
            />
        </>
    );
}
