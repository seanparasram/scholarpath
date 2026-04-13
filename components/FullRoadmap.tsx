"use client";

import { useState, useEffect, useRef } from "react";
import { X, MapPin, RefreshCw, Loader, GraduationCap, ChevronRight } from "lucide-react";
import { Scholarship, StudentProfile } from "@/lib/types";

interface Props {
  scholarships: Scholarship[];
  profile: StudentProfile;
  onClose: () => void;
}

// Shared markdown renderer
function RoadmapContent({ text }: { text: string }) {
  const lines = text.split("\n");

  return (
    <div className="space-y-0.5 text-sm">
      {lines.map((line, i) => {
        if (line.startsWith("## ")) {
          return (
            <h3
              key={i}
              className="text-sm font-semibold text-slate-800 mt-6 mb-2 first:mt-0 pb-1.5 border-b border-slate-100 flex items-center gap-2"
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
            <div key={i} className="flex items-start gap-3 py-1">
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
            <div key={i} className="flex items-start gap-2.5 py-0.5 ml-1">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 flex-shrink-0 mt-2" />
              <span className="text-slate-600 leading-relaxed">{renderInline(content)}</span>
            </div>
          );
        }
        if (line.trim() === "") return <div key={i} className="h-1" />;
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

export default function FullRoadmap({ scholarships, profile, onClose }: Props) {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const abortRef = useRef<AbortController | null>(null);

  const generate = async () => {
    setContent("");
    setLoading(true);
    abortRef.current = new AbortController();

    try {
      const res = await fetch("/api/roadmap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profile,
          scholarship: scholarships.slice(0, 8),
          mode: "multi",
        }),
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
        setContent(
          "Unable to generate roadmap. Make sure your ANTHROPIC_API_KEY is set in .env.local."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    generate();
    return () => abortRef.current?.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  // Top scholarship chips to show at a glance
  const topScholarships = scholarships.slice(0, 5);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full sm:max-w-2xl h-[92vh] sm:h-[88vh] bg-white sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-slideUp">
        {/* Header */}
        <div className="flex-shrink-0 px-6 pt-6 pb-4 border-b border-slate-100">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-white" />
                </div>
                <h2 className="text-lg font-bold text-slate-900">My Full Scholarship Roadmap</h2>
              </div>
              <p className="text-sm text-slate-500 ml-10">
                Personalized analysis across your top {topScholarships.length} matched scholarships
              </p>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Profile pill */}
          <div className="mt-3 flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-bold text-indigo-700">
                {profile.firstName.charAt(0)}{profile.lastName.charAt(0)}
              </span>
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs font-medium text-slate-700">
                {profile.firstName} {profile.lastName}
              </span>
              {profile.gpa && (
                <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                  GPA {profile.gpa}
                </span>
              )}
              {profile.intendedMajor && (
                <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                  {profile.intendedMajor}
                </span>
              )}
              {profile.state && (
                <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                  {profile.state}
                </span>
              )}
            </div>
          </div>

          {/* Scholarships being analyzed */}
          <div className="mt-3 flex items-center gap-1.5 flex-wrap">
            <span className="text-xs text-slate-400 font-medium">Analyzing:</span>
            {topScholarships.map((s) => (
              <span
                key={s.id}
                className="text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full font-medium"
              >
                {s.name.split(" ").slice(0, 3).join(" ")}
                {s.name.split(" ").length > 3 ? "..." : ""}
              </span>
            ))}
            {scholarships.length > 5 && (
              <span className="text-xs text-slate-400">+{scholarships.length - 5} more</span>
            )}
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {loading && !content && (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="relative w-12 h-12">
                <div className="absolute inset-0 rounded-full border-2 border-indigo-100" />
                <div className="absolute inset-0 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin" />
                <GraduationCap className="absolute inset-0 m-auto w-5 h-5 text-indigo-600" />
              </div>
              <p className="text-sm font-medium text-slate-700">Building your roadmap...</p>
              <p className="text-xs text-slate-400 text-center max-w-xs">
                Comparing your profile against each scholarship&apos;s requirements and identifying your best opportunities.
              </p>
            </div>
          )}

          {content && <RoadmapContent text={content} />}

          {loading && content && (
            <div className="flex items-center gap-1.5 mt-4 text-xs text-slate-400">
              <Loader className="w-3 h-3 animate-spin" />
              Still analyzing...
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 border-t border-slate-100 px-6 py-4 flex items-center justify-between bg-white">
          {!loading && content && (
            <button
              onClick={generate}
              className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Regenerate
            </button>
          )}
          <div className="ml-auto">
            <button
              onClick={onClose}
              className="flex items-center gap-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-xl px-4 py-2 transition-colors"
            >
              Back to Scholarships
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
