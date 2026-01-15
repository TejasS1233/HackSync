import { Badge } from "@/components/ui/badge";
import { Lightbulb } from "lucide-react";

const SUGGESTIONS_BY_EMOTION = {
  happy: [
    "Tell me about what made you happy today",
    "Share your favorite memory",
    "What are you grateful for?",
  ],
  sad: [
    "What's on your mind?",
    "Would you like to talk about it?",
    "Tell me what would make you feel better",
  ],
  angry: [
    "What's frustrating you right now?",
    "Let's work through this together",
    "Tell me what happened",
  ],
  fearful: [
    "What are you worried about?",
    "Let's talk about your concerns",
    "How can I help you feel safer?",
  ],
  surprised: [
    "Tell me what surprised you!",
    "Share the unexpected news",
    "What caught you off guard?",
  ],
  neutral: [
    "How are you feeling today?",
    "What's on your mind?",
    "Tell me about your day",
  ],
};

export function SmartSuggestions({ emotion = "neutral", onSelectSuggestion }) {
  // Normalize emotion to lowercase and default to neutral if undefined/unknown
  const normalizedEmotion = (emotion || "neutral").toLowerCase();
  const suggestions =
    SUGGESTIONS_BY_EMOTION[normalizedEmotion] || SUGGESTIONS_BY_EMOTION.neutral;

  return (
    <div className="mb-4 p-3 bg-muted/30 rounded-lg border border-border">
      <div className="flex items-center gap-2 mb-2">
        <Lightbulb className="size-4 text-primary" />
        <span className="text-xs font-medium text-muted-foreground">
          Suggested topics
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        {suggestions.map((suggestion, index) => (
          <Badge
            key={index}
            variant="secondary"
            className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
            onClick={() => onSelectSuggestion(suggestion)}
          >
            {suggestion}
          </Badge>
        ))}
      </div>
    </div>
  );
}
