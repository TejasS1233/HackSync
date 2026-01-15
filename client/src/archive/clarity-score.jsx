import React from "react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, AlertCircle, ChevronUp } from "lucide-react";

const ClarityScore = ({ userData }) => {
  const score = userData?.clarityScore || 85;

  return (
    <Card className="border-none shadow-none bg-transparent">
      <CardHeader className="p-0 pb-6">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            Clarity Overview
          </CardTitle>
          <Badge
            variant="outline"
            className="font-semibold border-emerald-500/30 bg-emerald-500/10 text-emerald-700"
          >
            <ChevronUp className="w-3 h-3 mr-1" /> 12% Inc
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-0 space-y-8">
        <div className="flex items-baseline gap-2">
          <span className="text-5xl font-bold tracking-tighter">{score}%</span>
          <span className="text-sm text-muted-foreground font-medium">
            Global Rank
          </span>
        </div>

        <div className="space-y-2">
          <Progress value={score} className="h-1.5 bg-slate-100" />
          <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-tighter">
            {score >= 80 ? "Peak Performance Zone" : "Optimization Required"}
          </p>
        </div>

        <div className="grid gap-4">
          {[
            { label: "Articulation", val: "92%", color: "bg-zinc-900" },
            { label: "Coherence", val: "88%", color: "bg-zinc-700" },
            { label: "Structure", val: "78%", color: "bg-zinc-400" },
          ].map((item) => (
            <div key={item.label} className="group">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground group-hover:text-foreground transition-colors">
                  {item.label}
                </span>
                <span className="font-semibold text-zinc-900">{item.val}</span>
              </div>
              <div className="h-[2px] w-full bg-slate-100 overflow-hidden">
                <div
                  className={`h-full ${item.color}`}
                  style={{ width: item.val }}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 mt-6">
          <div className="flex gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <p className="text-xs leading-relaxed text-slate-600">
              Your communication is in the <strong>top 5%</strong> of users this
              week. Focus on maintaining your "Structure" score to reach Elite
              status.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ClarityScore;
