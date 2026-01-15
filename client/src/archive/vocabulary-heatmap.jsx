import React, { useEffect, useState } from "react";
import cloud from "d3-cloud";
import { scaleLinear } from "d3-scale";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

/**
 * VocabularyHeatmap Component
 * @param {Array} data - Array of objects: [{ text: string, count: number }]
 * count represents the raw frequency of how many times the word was said.
 */
const VocabularyHeatmap = ({ data }) => {
  const [words, setWords] = useState([]);

  // Fallback sample data using raw frequency counts
  const displayData =
    data && data.length > 0
      ? data
      : [
          { text: "Tax", count: 142 },
          { text: "American", count: 98 },
          { text: "State", count: 85 },
          { text: "Plan", count: 64 },
          { text: "People", count: 52 },
          { text: "Economy", count: 31 },
          { text: "Jobs", count: 28 },
          { text: "Future", count: 22 },
          { text: "Security", count: 19 },
          { text: "Federal", count: 15 },
          { text: "Country", count: 12 },
          { text: "Budget", count: 9 },
          { text: "Health", count: 7 },
          { text: "Finance", count: 5 },
          { text: "Policy", count: 4 },
          { text: "Growth", count: 3 },
          { text: "Reform", count: 2 },
        ];

  useEffect(() => {
    if (!displayData.length) return;

    // 1. Find the frequency range in your raw data
    const counts = displayData.map((d) => d.count);
    const minCount = Math.min(...counts);
    const maxCount = Math.max(...counts);

    // 2. Map the raw counts to font sizes
    const sizeScale = scaleLinear()
      .domain([minCount, maxCount])
      .range(minCount === maxCount ? [40, 40] : [12, 80]);

    // 3. Generate the layout based on the calculated sizes
    const layout = cloud()
      .size([700, 450])
      .words(
        displayData.map((d) => ({
          text: d.text,
          size: sizeScale(d.count),
        }))
      )
      .padding(35) // Increased from 24 to 35 for even more whitespace
      .rotate(0)
      .font("Inter, sans-serif")
      .fontSize((d) => d.size)
      .spiral("archimedean")
      .on("end", (renderedWords) => {
        setWords(renderedWords);
      });

    layout.start();
  }, [data]);

  return (
    <Card className="border-none shadow-none ring-1 ring-slate-200 bg-white overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <CardTitle className="text-xl font-bold tracking-tight text-slate-900">
              Keyword Density Map
            </CardTitle>
            <CardDescription className="text-sm font-medium text-slate-500">
              Visualizing raw word frequency from your session.
            </CardDescription>
          </div>
          <div className="bg-slate-100 px-3 py-1 rounded-md text-[10px] font-bold text-slate-600 uppercase tracking-tighter border border-slate-200">
            {displayData.reduce((acc, curr) => acc + curr.count, 0)} Total
            Mentions
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-4">
        <div className="relative w-full h-[450px] bg-slate-50/20 rounded-2xl border border-slate-100 flex items-center justify-center overflow-hidden">
          <div
            className="absolute inset-0 opacity-[0.02] pointer-events-none"
            style={{
              backgroundImage: "radial-gradient(#000 1px, transparent 1px)",
              backgroundSize: "30px 30px",
            }}
          />

          <svg
            width="100%"
            height="100%"
            viewBox="0 0 700 450"
            preserveAspectRatio="xMidYMid meet"
            className="overflow-visible font-sans"
          >
            <g transform="translate(350, 225)">
              {words.map((w, i) => {
                const isDominant = w.size > 55;
                const isFrequent = w.size <= 55 && w.size > 30;

                return (
                  <text
                    key={`${w.text}-${i}`}
                    style={{
                      fontSize: `${w.size}px`,
                      fontWeight: isDominant
                        ? "900"
                        : isFrequent
                        ? "700"
                        : "500",
                      fill: isDominant
                        ? "#020617"
                        : isFrequent
                        ? "#334155"
                        : "#94a3b8",
                      letterSpacing: isDominant ? "-0.06em" : "-0.02em",
                    }}
                    textAnchor="middle"
                    transform={`translate(${w.x}, ${w.y})`}
                    className="select-none transition-all duration-700 ease-in-out cursor-default hover:fill-slate-500"
                  >
                    {w.text}
                  </text>
                );
              })}
            </g>
          </svg>
        </div>

        <div className="mt-8 flex items-center justify-between border-t border-slate-100 pt-6">
          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-slate-200" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Low Frequency
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-slate-900" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-900">
                High Frequency
              </span>
            </div>
          </div>
          <div className="text-[10px] font-medium text-slate-400 uppercase tracking-tighter">
            Mapped Frequency Index
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default VocabularyHeatmap;
