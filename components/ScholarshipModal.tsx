"use client";

import { useEffect, useState } from "react";
import {
  X,
  Calendar,
  DollarSign,
  ExternalLink,
  Star,
  CheckCircle,
  Lightbulb,
  BookOpen,
  RefreshCw,
  MapPin,
} from "lucide-react";
import { Scholarship, StudentProfile } from "@/lib/types";
import WritingAssistant from "./WritingAssistant";
import RoadmapView from "./RoadmapView";
import ScholarshipTracker from "./ScholarshipTracker";

interface Props {
  scholarship: Scholarship | null;
  profile: StudentProfile;
  onClose: () => void;
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
  "first-generation": "First-Generation",
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

type Tab = "details" | "roadmap" | "assistant";

export default function ScholarshipModal({ scholarship, profile, onClose }: Props) {
  const [tab, setTab] = useState<Tab>("details");

  useEffect(() => {
    if (scholarship) {
      setTab("details");
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [scholarship]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  if (!scholarship) return null;

  const isDeadlineSoon = () => {
    if (!scholarship.deadlineDate) return false;
    const deadline = new Date(scholarship.deadlineDate);
    const now = new Date();
    const diffDays = (deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    return diffDays >= 0 && diffDays <= 30;
  };

  const isPast = () => {
    if (!scholarship.deadlineDate) return false;
    return new Date(scholarship.deadlineDate) < new Date();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full sm:max-w-3xl h-[92vh] sm:h-[85vh] bg-white sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-slideUp">
        {/* Header */}
        <div className="flex-shrink-0 border-b border-slate-100 px-6 pt-6 pb-0">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1 pr-4">
              <div className="flex flex-wrap gap-1.5 mb-2">
                {scholarship.category.slice(0, 3).map((cat) => (
                  <span
                    key={cat}
                    className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700"
                  >
                    {CATEGORY_LABELS[cat] || cat}
                  </span>
                ))}
                {scholarship.renewable && (
                  <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
                    Renewable
                  </span>
                )}
              </div>
              <h2 className="text-xl font-bold text-slate-900 leading-tight">
                {scholarship.name}
              </h2>
              <p className="text-sm text-slate-500 mt-0.5">{scholarship.organization}</p>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 transition-colors flex-shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Key stats */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-slate-50 rounded-xl p-3 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                <DollarSign className="w-4 h-4 text-green-700" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Award Amount</p>
                <p className="text-sm font-bold text-slate-900">{scholarship.amount}</p>
              </div>
            </div>
            <div className={`rounded-xl p-3 flex items-center gap-3 ${isPast() ? "bg-red-50" : isDeadlineSoon() ? "bg-amber-50" : "bg-slate-50"}`}>
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${isPast() ? "bg-red-100" : isDeadlineSoon() ? "bg-amber-100" : "bg-blue-100"}`}>
                <Calendar className={`w-4 h-4 ${isPast() ? "text-red-600" : isDeadlineSoon() ? "text-amber-600" : "text-blue-600"}`} />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Deadline</p>
                <p className={`text-sm font-bold ${isPast() ? "text-red-700" : isDeadlineSoon() ? "text-amber-700" : "text-slate-900"}`}>
                  {isPast() ? "Passed" : isDeadlineSoon() ? `Soon — ${scholarship.deadline}` : scholarship.deadline}
                </p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-0">
            <button
              onClick={() => setTab("details")}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                tab === "details"
                  ? "border-indigo-600 text-indigo-600"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              Details
            </button>
            <button
              onClick={() => setTab("roadmap")}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors flex items-center gap-1.5 ${
                tab === "roadmap"
                  ? "border-indigo-600 text-indigo-600"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              <MapPin className="w-3.5 h-3.5" />
              My Roadmap
            </button>
            {scholarship.essayPrompts.length > 0 && (
              <button
                onClick={() => setTab("assistant")}
                className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors flex items-center gap-1.5 ${
                  tab === "assistant"
                    ? "border-indigo-600 text-indigo-600"
                    : "border-transparent text-slate-500 hover:text-slate-700"
                }`}
              >
                <RefreshCw className="w-3.5 h-3.5" />
                AI Writer
              </button>
            )}
          </div>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto">
          {tab === "details" && (
            <div className="px-6 py-5 space-y-6">
              {/* Description */}
              <div>
                <h3 className="text-sm font-semibold text-slate-700 mb-2">About This Scholarship</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{scholarship.description}</p>
                {scholarship.renewable && scholarship.renewalInfo && (
                  <p className="text-sm text-emerald-700 bg-emerald-50 rounded-lg px-3 py-2 mt-2">
                    Renewal: {scholarship.renewalInfo}
                  </p>
                )}
              </div>

              {/* Eligibility */}
              <div>
                <h3 className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-indigo-500" />
                  Eligibility Requirements
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed mb-2">
                  {scholarship.eligibility.description}
                </p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {scholarship.eligibility.minGpa && (
                    <span className="text-xs bg-slate-100 text-slate-700 px-2.5 py-1 rounded-full">
                      Min GPA: {scholarship.eligibility.minGpa}
                    </span>
                  )}
                  {scholarship.eligibility.maxHouseholdIncome && (
                    <span className="text-xs bg-slate-100 text-slate-700 px-2.5 py-1 rounded-full">
                      Income: {scholarship.eligibility.maxHouseholdIncome}
                    </span>
                  )}
                  {scholarship.eligibility.ethnicities?.map((e) => (
                    <span key={e} className="text-xs bg-slate-100 text-slate-700 px-2.5 py-1 rounded-full">
                      {e}
                    </span>
                  ))}
                  {scholarship.eligibility.states?.map((s) => (
                    <span key={s} className="text-xs bg-slate-100 text-slate-700 px-2.5 py-1 rounded-full">
                      {s} residents
                    </span>
                  ))}
                  {scholarship.eligibility.citizenshipRequired && (
                    <span className="text-xs bg-slate-100 text-slate-700 px-2.5 py-1 rounded-full">
                      U.S. citizen / PR required
                    </span>
                  )}
                </div>
              </div>

              {/* What makes a strong candidate */}
              <div>
                <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-1.5">
                  <Star className="w-4 h-4 text-amber-500" />
                  What Makes a Strong Candidate
                </h3>
                <ul className="space-y-2">
                  {scholarship.whatMakesStrongCandidate.map((item, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-slate-600">
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-2 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Tips */}
              {scholarship.tips.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-1.5">
                    <Lightbulb className="w-4 h-4 text-indigo-500" />
                    Application Tips
                  </h3>
                  <ul className="space-y-2">
                    {scholarship.tips.map((tip, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-sm text-slate-600 bg-indigo-50 rounded-lg px-3 py-2.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-2 flex-shrink-0" />
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Essay prompts preview */}
              {scholarship.essayPrompts.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-indigo-500" />
                    Essay Prompts
                  </h3>
                  <div className="space-y-2">
                    {scholarship.essayPrompts.map((p, i) => (
                      <div key={i} className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                        <p className="text-xs font-medium text-slate-400 mb-1">
                          Prompt {i + 1}{p.wordLimit ? ` · ${p.wordLimit} words` : ""}
                        </p>
                        <p className="text-sm text-slate-700">{p.prompt}</p>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => setTab("assistant")}
                    className="mt-3 w-full text-sm font-medium text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-xl py-2.5 transition-colors"
                  >
                    Open AI Writing Assistant
                  </button>
                </div>
              )}

              {/* Roadmap teaser */}
              <div className="bg-gradient-to-br from-indigo-50 to-slate-50 border border-indigo-100 rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-1.5">
                  <MapPin className="w-4 h-4 text-indigo-600" />
                  <span className="text-sm font-semibold text-slate-800">Not ready to apply yet?</span>
                </div>
                <p className="text-xs text-slate-600 mb-3">
                  Get a personalized gap analysis comparing your profile to what this scholarship looks for — with a specific action plan to become competitive.
                </p>
                <button
                  onClick={() => setTab("roadmap")}
                  className="text-sm font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                >
                  View my roadmap
                  <span className="text-indigo-400">→</span>
                </button>
              </div>
            </div>
          )}

          {tab === "roadmap" && (
            <div className="px-6 py-5 h-full">
              {/* Key: use scholarship.id so RoadmapView remounts per scholarship */}
              <RoadmapView
                key={scholarship.id}
                scholarship={scholarship}
                profile={profile}
                autoStart={true}
              />
            </div>
          )}

          {tab === "assistant" && (
            <div className="px-6 py-5 h-full flex flex-col">
              <WritingAssistant scholarship={scholarship} profile={profile} />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 border-t border-slate-100 px-6 py-4 bg-white space-y-3">
          <ScholarshipTracker scholarshipId={scholarship.id} />
          <a
            href={scholarship.applicationUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-xl text-sm transition-colors"
          >
            Apply Now
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
}
