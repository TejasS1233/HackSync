import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DownloadIcon } from "lucide-react";
import { SmartSuggestions } from "./smart-suggestions";
import { exportConversation } from "@/lib/chat-export";
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
} from "@/components/ai-elements/conversation";
import { Message, MessageContent } from "@/components/ai-elements/message";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  AiBeautifyIcon,
  Comment01Icon,
  SentIcon,
} from "@hugeicons/core-free-icons";
import { classifyEmotion } from "@/lib/emotionClassifier";
import { cn } from "@/lib/utils";

const emotionConfig = {
  happy: { color: "bg-yellow-500/10 text-yellow-600 border-yellow-200", emoji: "😊" },
  sad: { color: "bg-blue-500/10 text-blue-600 border-blue-200", emoji: "😢" },
  angry: { color: "bg-red-500/10 text-red-600 border-red-200", emoji: "😠" },
  fear: { color: "bg-purple-500/10 text-purple-600 border-purple-200", emoji: "😨" },
  surprise: { color: "bg-pink-500/10 text-pink-600 border-pink-200", emoji: "😲" },
  neutral: { color: "bg-gray-500/10 text-gray-600 border-gray-200", emoji: "😐" },
};

function getMessageEmotion(msg) {
  // Try to find emotion in metadata or similar, default to null if not found
  // Assuming msg object structure from Convai or emotionClassifier
  return msg.emotion || null; 
}

function getEmotionStyle(emotion) {
  const normalized = (emotion || "neutral").toLowerCase();
  
  // Handle mapping from possible emotion strings to config keys
  if (normalized.includes("happy") || normalized.includes("joy")) return emotionConfig.happy;
  if (normalized.includes("sad")) return emotionConfig.sad;
  if (normalized.includes("angry") || normalized.includes("anger")) return emotionConfig.angry;
  if (normalized.includes("fear")) return emotionConfig.fear;
  if (normalized.includes("surpris")) return emotionConfig.surprise;

  return emotionConfig.neutral;
}

export function ChatInterface({
  messages,
  isConnected,
  onSendMessage,
  isGenerating = false,
  currentEmotion = "neutral",
}) {
  const [inputText, setInputText] = useState("");
  const [messageEmotions, setMessageEmotions] = useState({});

  useEffect(() => {
    // Determine emotion for messages that don't have one
    messages.forEach(async (msg, index) => {
        const msgId = msg.id || index;
        if (!messageEmotions[msgId] && msg.content) {
             // Only classify if not already present
             // We can use the simple getMessageEmotion if it existed, otherwise classify
             const existing = getMessageEmotion(msg);
             if (existing) {
                 setMessageEmotions(prev => ({ ...prev, [msgId]: existing}));
             } else {
                 try {
                     const detected = await classifyEmotion(msg.content);
                     if (detected) {
                        setMessageEmotions(prev => ({ ...prev, [msgId]: detected }));
                     }
                 } catch (e) {
                     // ignore error
                 }
             }
        }
    });
  }, [messages]);

  const handleSuggestionSelect = (suggestion) => {
    setInputText(suggestion);
    // Optional: auto-focus input
  };

  const handleSendMessage = () => {
    if (inputText.trim() && isConnected && !isGenerating) {
      onSendMessage(inputText.trim());
      setInputText("");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleExport = (format) => {
     // Prepare simple session data
     const sessionData = {
         duration: messages.length > 0 ? "~" + Math.ceil(messages.length * 0.5) + " min" : "0 min",
         emotions: [], // Could be aggregated
     };
     exportConversation(messages, sessionData, format);
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex-none border-b border-border p-4">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2 font-semibold">
            <HugeiconsIcon
              icon={AiBeautifyIcon}
              className="size-5 text-primary"
            />
            Chat History
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                    <DownloadIcon className="size-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleExport('txt')}>
                    Export as Text
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('json')}>
                    Export as JSON
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('mp3')}>
                    Export as Audio (MP3)
                </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="flex-1 overflow-hidden p-0">
        <Conversation className="h-full overflow-y-auto p-4">
          {messages.length === 0 ? (
            <ConversationEmptyState
              title="Start a conversation"
              description="Say hello to begin chatting with the AI"
              icon={<HugeiconsIcon icon={Comment01Icon} className="size-8" />}
            />
          ) : (
             <ConversationContent>
               {messages.map((msg, index) => {
                 const msgId = msg.id || index;
                 // Use emotion from state if available, or fallback to msg property
                 const emotion = messageEmotions[msgId] || getMessageEmotion(msg);
                 
                 const emotionStyle = getEmotionStyle(emotion);
                 const isUser = msg.type === "user-llm-text" || msg.type === "user-transcription" || msg.role === "user";
                 
                 return (
                   <Message
                     key={msgId}
                     from={isUser ? "user" : "assistant"}
                   >
                     <MessageContent>{msg.content}</MessageContent>
                     {emotion && (
                       <Badge
                         variant="outline"
                         className={cn(
                           "mt-2 w-fit text-[10px] capitalize",
                           emotionStyle.color,
                           isUser ? "ml-auto" : ""
                         )}
                       >
                         {emotionStyle.emoji} {emotion}
                       </Badge>
                     )}
                   </Message>
                 );
               })}
               {isGenerating && (
                 <div className="px-4 py-2 text-xs text-muted-foreground animate-pulse">
                   AI is thinking...
                 </div>
               )}
             </ConversationContent>
          )}
        </Conversation>
      </div>

      <div className="flex-none border-t border-border p-4">
        <SmartSuggestions 
            emotion={currentEmotion} 
            onSelectSuggestion={handleSuggestionSelect} 
        />
        <div className="flex gap-2">
          <Input
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isConnected ? "Type a message..." : "Connect first..."}
            disabled={!isConnected || isGenerating}
            className="flex-1"
          />
          <Button
            onClick={handleSendMessage}
            disabled={!isConnected || !inputText.trim() || isGenerating}
            size="icon"
          >
            <HugeiconsIcon icon={SentIcon} className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
