"use client";

import { Calendar, DollarSign, ArrowRight, Star } from "lucide-react";
import { Scholarship } from "@/lib/types";

interface Props {
  scholarship: Scholarship;
  onClick: () => void;
}

const CATEGORY_LABELS: Record<string, string> = {
  merit: "Merit-Based",
  "need-based": "Need-Based",
  stem: "STEM",
  humanities: "Humanities",
  arts: "Arts",
  business: "Business",
  "community-service": "Community Service",
  leadership: "Leadership",
  athletics: "Athletics",
  "ethnicity-specific": "Ethnicity-Specific",
  "first-generation": "First-Gen",
  military: "Military",
  religious: "Religious",
  "state-specific": "State-Specific",
  national: "National",
  science: "Science",
  health: "Health",
  law: "Law",
  education: "Education",
  "social-justice": "Social Justice",
};

const CATEGORY_COLORS: Record<string, string> = {
  merit: "bg-purple-50 text-purple-700",
  "need-based": "bg-blue-50 text-blue-700",
  stem: "bg-cyan-50 text-cyan-700",
  humanities: "bg-orange-50 text-orange-700",
  arts: "bg-pink-50 text-pink-700",
  business: "bg-emerald-50 text-emerald-700",
  "community-service": "bg-teal-50 text-teal-700",
  leadership: "bg-violet-50 text-violet-700",
  athletics: "bg-green-50 text-green-700",
  "ethnicity-specific": "bg-rose-50 text-rose-700",
  "first-generation": "bg-amber-50 text-amber-700",
  "state-specific": "bg-indigo-50 text-indigo-700",
  national: "bg-slate-100 text-slate-700",
  science: "bg-sky-50 text-sky-700",
  health: "bg-red-50 text-red-700",
  education: "bg-yellow-50 text-yellow-700",
};

// Roll a past deadline to its next annual occurrence
function getNextOccurrence(dateStr: string): Date {
  const stored = new Date(dateStr);
  const now = new Date();
  if (stored >= now) return stored;
  // Roll forward year by year until the date is in the future
  let candidate = new Date(now.getFullYear(), stored.getMonth(), stored.getDate());
  while (candidate < now) {
    candidate = new Date(candidate.getFullYear() + 1, stored.getMonth(), stored.getDate());
  }
  return candidate;
}

export default function ScholarshipCard({ scholarship, onClick }: Props) {
  const nextDeadline = scholarship.deadlineDate ? getNextOccurrence(scholarship.deadlineDate) : null;

  const isDeadlineSoon = () => {
    if (!nextDeadline) return false;
    const now = new Date();
    const diffDays = (nextDeadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    return diffDays >= 0 && diffDays <= 30;
  };

  // With recurring logic, nothing is ever "past" — always show next occurrence
  const isPast = () => false;

  const matchPercent = scholarship.matchScore
    ? Math.min(100, Math.round((scholarship.matchScore / 120) * 100))
    : null;

  return (
    <button
      onClick={onClick}
      className="group w-full text-left bg-white rounded-2xl border border-slate-200 hover:border-indigo-300 hover:shadow-lg shadow-sm transition-all duration-200 overflow-hidden flex flex-col"
    >
      {/* Top accent + match score */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <div className="flex flex-wrap gap-1.5">
          {scholarship.category.slice(0, 2).map((cat) => (
            <span
              key={cat}
              className={`text-xs font-medium px-2 py-0.5 rounded-full ${CATEGORY_COLORS[cat] || "bg-slate-100 text-slate-700"}`}
            >
              {CATEGORY_LABELS[cat] || cat}
            </span>
          ))}
        </div>
        {matchPercent !== null && (
          <div className="flex items-center gap-1 flex-shrink-0">
            <Star className="w-3 h-3 text-amber-400" />
            <span className="text-xs font-semibold text-amber-600">{matchPercent}% match</span>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="px-4 pb-3 flex-1">
        <h3 className="font-semibold text-slate-900 text-sm leading-snug mb-0.5 group-hover:text-indigo-700 transition-colors">
          {scholarship.name}
        </h3>
        <p className="text-xs text-slate-500">{scholarship.organization}</p>
      </div>

      {/* Footer stats */}
      <div className="px-4 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <DollarSign className="w-3.5 h-3.5 text-green-600" />
            <span className="text-sm font-semibold text-green-700">{scholarship.amount}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className={`flex items-center gap-1 ${isPast() ? "text-red-500" : isDeadlineSoon() ? "text-amber-500" : "text-slate-400"}`}>
            <Calendar className="w-3.5 h-3.5" />
            <span className="text-xs font-medium">
              {nextDeadline
                ? nextDeadline.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                : scholarship.deadline}
            </span>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-400 transition-colors" />
        </div>
      </div>
    </button>
  );
}
