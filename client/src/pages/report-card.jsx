import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Separator } from "../components/ui/separator";
import { ReportGenerator } from "@/pages/report-generator";
import { Drama, Lightbulb, Bot, ClipboardList } from "lucide-react";

const ReportCard = ({ sessionData, onClose }) => {
  const messages = sessionData?.messages || [];
  const sentiment = sessionData?.sentiment || {};
  const metrics = sessionData?.metrics || {};

  const [isGenerating, setIsGenerating] = useState(false);
  const reportGenerator = new ReportGenerator();

  // Quick analysis for the summary
  const quickAnalysis = React.useMemo(() => {
    return reportGenerator.analyzeConversation(messages);
  }, [messages]);

  const handleDownloadPDF = async () => {
    setIsGenerating(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      reportGenerator.generateAndDownloadReport(messages);
    } catch (error) {
      console.error("Error generating PDF:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-300">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            Session Report
          </CardTitle>
          <CardDescription>
            Performance analytics and conversation insights
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Top Level Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatsCard label="Messages" value={quickAnalysis.messageCount} />
            <StatsCard label="Duration" value={sessionData.duration || quickAnalysis.duration} />
            <StatsCard label="Tokens Used" value={sessionData.tokenUsage || 0} />
            <StatsCard label="LLM Latency" value={`${metrics.llm || 0}ms`} />
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Sentiment Analysis */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-3">
                <Drama className="w-8 h-8 text-primary" /> User Sentiment Profile
              </h3>
              <div className="space-y-3">
                <SentimentBar label="Happy" value={sentiment.happy} color="bg-amber-500" />
                <SentimentBar label="Sad" value={sentiment.sad} color="bg-blue-500" />
                <SentimentBar label="Neutral" value={sentiment.neutral} color="bg-gray-400" />
                <SentimentBar label="Surprised" value={sentiment.surprised} color="bg-purple-500" />
              </div>
            </div>

            {/* Conversation Topics & Mood */}
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-3">
                  <Lightbulb className="w-8 h-8 text-amber-500" /> Topics Detected
                </h3>
                <div className="flex flex-wrap gap-2">
                  {quickAnalysis.topics.length > 0 ? (
                    quickAnalysis.topics.map((topic, index) => (
                      <Badge key={index} variant="secondary" className="px-3 py-1 text-sm bg-primary/10 hover:bg-primary/20 transition-colors">
                        {topic}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-muted-foreground text-sm italic">No specific topics identified</span>
                  )}
                </div>
              </div>

              <div className="pt-4">
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-3">
                  <Bot className="w-8 h-8 text-purple-500" /> AI Mood
                </h3>
                <Badge variant="outline" className="text-base px-4 py-1 border-primary/50 text-foreground">
                  {quickAnalysis.dominantMood}
                </Badge>
              </div>
            </div>
          </div>

          <Separator />

          {/* Action Items */}
          <div className="bg-muted/30 p-4 rounded-xl border">
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-3">
              <ClipboardList className="w-8 h-8 text-green-500" /> Action Items & Suggestions
            </h3>
            {quickAnalysis.actionItems.length > 0 ? (
              <ul className="space-y-2">
                {quickAnalysis.actionItems.map((item, idx) => (
                  <li key={idx} className="flex gap-2 text-sm text-muted-foreground">
                    <span className="text-primary">•</span> {item}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground italic">No specific action items detected in this session.</p>
            )}
          </div>

          <div className="flex gap-3 justify-center pt-4">
            <Button
              onClick={handleDownloadPDF}
              disabled={isGenerating}
              className="w-full md:w-auto min-w-[200px]"
              size="lg"
            >
              {isGenerating ? <span className="animate-pulse">Generating PDF...</span> : "Download Full Report"}
            </Button>
            <Button variant="outline" onClick={onClose} className="w-full md:w-auto">
              Close
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Helper Components
const StatsCard = ({ label, value }) => (
  <div className="bg-card border rounded-lg p-3 text-center shadow-sm">
    <div className="text-2xl font-bold text-foreground">{value}</div>
    <div className="text-xs text-muted-foreground uppercase tracking-wider font-medium">{label}</div>
  </div>
);

const SentimentBar = ({ label, value, color }) => (
  <div className="space-y-1">
    <div className="flex justify-between text-xs font-medium">
      <span>{label}</span>
      <span>{value || 0}%</span>
    </div>
    <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
      <div
        className={`h-full ${color} transition-all duration-500 ease-out`}
        style={{ width: `${value || 0}%` }}
      />
    </div>
  </div>
);

export default ReportCard;
