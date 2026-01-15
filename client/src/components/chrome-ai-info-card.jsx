import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Info, Sparkles } from "lucide-react";

export function ChromeAIInfoCard() {
  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="size-5 text-primary" />
            <CardTitle className="text-lg">
              Powered by Chrome Built-in AI
            </CardTitle>
          </div>
          <Badge variant="outline" className="border-primary text-primary">
            Gemini Nano
          </Badge>
        </div>
        <CardDescription>
          On-device sentiment analysis using Google's latest AI technology
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2 text-sm">
          <div className="flex items-start gap-2">
            <Info className="size-4 mt-0.5 text-muted-foreground flex-shrink-0" />
            <div>
              <p className="font-medium">Privacy First</p>
              <p className="text-xs text-muted-foreground">
                All analysis happens locally on your device. No data sent to
                servers.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <Info className="size-4 mt-0.5 text-muted-foreground flex-shrink-0" />
            <div>
              <p className="font-medium">Offline Capable</p>
              <p className="text-xs text-muted-foreground">
                Works without internet connection once model is downloaded.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <Info className="size-4 mt-0.5 text-muted-foreground flex-shrink-0" />
            <div>
              <p className="font-medium">Zero API Costs</p>
              <p className="text-xs text-muted-foreground">
                No cloud API fees. Unlimited analysis at no cost.
              </p>
            </div>
          </div>
        </div>

        <div className="pt-2 border-t">
          <Button
            variant="outline"
            size="sm"
            className="w-full gap-2"
            onClick={() => window.open("/CHROME_AI_SETUP.md", "_blank")}
          >
            <ExternalLink className="size-4" />
            Setup Instructions
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
