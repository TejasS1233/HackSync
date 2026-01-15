import React from "react";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const data = [
  { name: "Mon", score: 45 },
  { name: "Tue", score: 52 },
  { name: "Wed", score: 48 },
  { name: "Thu", score: 70 },
  { name: "Fri", score: 61 },
  { name: "Sat", score: 85 },
  { name: "Sun", score: 80 },
];

const SentimentTrends = () => {
  return (
    <Card className="border-none shadow-sm ring-1 ring-slate-200">
      <CardHeader>
        <CardTitle className="text-lg font-semibold tracking-tight">
          Sentiment Velocity
        </CardTitle>
        <CardDescription>
          Fluctuation of emotional resonance over time.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#18181b" stopOpacity={0.1} />
                  <stop offset="95%" stopColor="#18181b" stopOpacity={0.01} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#f1f5f9"
              />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: "#94a3b8" }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: "#94a3b8" }}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: "12px",
                  border: "none",
                  boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
                }}
                cursor={{ stroke: "#e2e8f0", strokeWidth: 2 }}
              />
              <Area
                type="monotone"
                dataKey="score"
                stroke="#18181b"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#chartGradient)"
                animationDuration={1500}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default SentimentTrends;
