"use client";

import { useState, useEffect, useRef } from "react";
import { MapPin, RefreshCw, Loader } from "lucide-react";
import { Scholarship, StudentProfile } from "@/lib/types";

interface Props {
  scholarship: Scholarship;
  profile: StudentProfile;
  autoStart?: boolean;
}

// Minimal markdown renderer: handles ## headers, - bullets, numbered lists, **bold**
function RoadmapContent({ text }: { text: string }) {
  const lines = text.split("\n");

  return (
    <div className="space-y-1 text-sm">
      {lines.map((line, i) => {
        if (line.startsWith("## ")) {
          return (
            <h3
              key={i}
              className="text-sm font-semibold text-slate-800 mt-5 mb-2 first:mt-0 flex items-center gap-1.5"
            >
              <span className="w-1 h-4 rounded-full bg-indigo-500 inline-block flex-shrink-0" />
              {line.replace("## ", "")}
            </h3>
          );
        }
        if (line.match(/^\d+\.\s/)) {
          const content = line.replace(/^\d+\.\s/, "");
          const num = line.match(/^(\d+)/)?.[1];
          return (
            <div key={i} className="flex items-start gap-2.5 py-0.5">
              <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                {num}
              </span>
              <span className="text-slate-600 leading-relaxed">{renderInline(content)}</span>
            </div>
          );
        }
        if (line.startsWith("- ") || line.startsWith("• ")) {
          const content = line.replace(/^[-•]\s/, "");
          return (
            <div key={i} className="flex items-start gap-2.5 py-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400 flex-shrink-0 mt-2" />
              <span className="text-slate-600 leading-relaxed">{renderInline(content)}</span>
            </div>
          );
        }
        if (line.trim() === "") {
          return <div key={i} className="h-1" />;
        }
        return (
          <p key={i} className="text-slate-600 leading-relaxed">
            {renderInline(line)}
          </p>
        );
      })}
    </div>
  );
}

function renderInline(text: string): React.ReactNode {
  // Handle **bold**
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-semibold text-slate-800">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
}

export default function RoadmapView({ scholarship, profile, autoStart = true }: Props) {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [started, setStarted] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const generate = async () => {
    if (loading) return;
    setContent("");
    setLoading(true);
    setStarted(true);
    abortRef.current = new AbortController();

    try {
      const res = await fetch("/api/roadmap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile, scholarship, mode: "single" }),
        signal: abortRef.current.signal,
      });

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          setContent((prev) => prev + decoder.decode(value));
        }
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name !== "AbortError") {
        setContent("Unable to generate roadmap. Please check your API key in .env.local.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (autoStart && !started) {
      generate();
    }
    return () => {
      abortRef.current?.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoStart]);

  if (!started && !autoStart) {
    return (
      <div className="text-center py-10">
        <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center mx-auto mb-3">
          <MapPin className="w-6 h-6 text-indigo-600" />
        </div>
        <p className="text-sm font-medium text-slate-700 mb-1">Personalized Roadmap</p>
        <p className="text-xs text-slate-500 max-w-xs mx-auto mb-4">
          Get a gap analysis and action plan comparing your profile to what this scholarship looks for.
        </p>
        <button
          onClick={generate}
          className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-colors"
        >
          Generate My Roadmap
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-indigo-500" />
          <span className="text-sm font-semibold text-slate-800">
            Your Roadmap for {scholarship.name}
          </span>
        </div>
        {!loading && content && (
          <button
            onClick={generate}
            className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1"
          >
            <RefreshCw className="w-3 h-3" />
            Regenerate
          </button>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {loading && !content && (
          <div className="flex items-center gap-2 text-sm text-slate-500 py-4">
            <Loader className="w-4 h-4 animate-spin text-indigo-500" />
            Analyzing your profile against this scholarship...
          </div>
        )}

        {content && <RoadmapContent text={content} />}

        {loading && content && (
          <div className="flex items-center gap-1.5 mt-3 text-xs text-slate-400">
            <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-pulse" />
            Analyzing...
          </div>
        )}
      </div>
    </div>
  );
}
