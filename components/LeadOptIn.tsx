"use client";

import { useState } from "react";
import { Building2, CheckCircle, X, ChevronDown, ChevronUp } from "lucide-react";
import { StudentProfile, Scholarship } from "@/lib/types";

interface Props {
  profile: StudentProfile;
  matchedScholarships: Scholarship[];
}

// Sample matched colleges based on profile — in production this would be a real college database
function getMatchedColleges(profile: StudentProfile) {
  const colleges = [
    { name: "University of Michigan", type: "Public Research", focus: ["Engineering", "Business", "Pre-Medicine"], minGpa: 3.7, states: [] },
    { name: "Florida State University", type: "Public Research", focus: ["Business", "Nursing", "Education"], minGpa: 3.2, states: ["Florida"] },
    { name: "University of Texas at Austin", type: "Public Research", focus: ["Computer Science", "Engineering", "Business"], minGpa: 3.5, states: ["Texas"] },
    { name: "Howard University", type: "HBCU", focus: ["Pre-Medicine", "Law", "Business", "Engineering"], minGpa: 3.0, states: [] },
    { name: "California State University", type: "Public", focus: ["Business", "Education", "Nursing"], minGpa: 2.8, states: ["California"] },
    { name: "Spelman College", type: "HBCU", focus: ["Pre-Medicine", "Biology", "Computer Science"], minGpa: 3.3, states: [] },
    { name: "University of Washington", type: "Public Research", focus: ["Computer Science", "Engineering", "Biology"], minGpa: 3.5, states: ["Washington"] },
    { name: "Georgia Tech", type: "Public Research", focus: ["Engineering", "Computer Science", "Mathematics"], minGpa: 3.8, states: ["Georgia"] },
    { name: "University of Arizona", type: "Public Research", focus: ["Business", "Engineering", "Nursing"], minGpa: 3.0, states: ["Arizona"] },
    { name: "Ohio State University", type: "Public Research", focus: ["Business", "Engineering", "Education", "Nursing"], minGpa: 3.4, states: ["Ohio"] },
    { name: "University of Illinois Urbana-Champaign", type: "Public Research", focus: ["Computer Science", "Engineering", "Business"], minGpa: 3.6, states: ["Illinois"] },
    { name: "Penn State University", type: "Public Research", focus: ["Engineering", "Business", "Education"], minGpa: 3.3, states: ["Pennsylvania"] },
    { name: "University of North Carolina", type: "Public Research", focus: ["Business", "Nursing", "Education", "Pre-Medicine"], minGpa: 3.5, states: ["North Carolina"] },
    { name: "San Diego State University", type: "Public", focus: ["Business", "Engineering", "Nursing"], minGpa: 3.0, states: ["California"] },
    { name: "Virginia Tech", type: "Public Research", focus: ["Engineering", "Computer Science", "Business"], minGpa: 3.5, states: ["Virginia"] },
  ];

  const gpa = parseFloat(profile.gpa) || 0;
  const major = profile.intendedMajor?.toLowerCase() || "";

  return colleges
    .filter((c) => {
      const gpaOk = gpa === 0 || gpa >= c.minGpa - 0.3;
      const stateOk = c.states.length === 0 || c.states.includes(profile.state);
      const majorOk =
        !major ||
        c.focus.some(
          (f) =>
            major.includes(f.toLowerCase()) ||
            f.toLowerCase().includes(major.split(" ")[0])
        );
      return gpaOk && (stateOk || majorOk);
    })
    .slice(0, 6);
}

type Status = "idle" | "expanded" | "done" | "dismissed";

export default function LeadOptIn({ profile, matchedScholarships }: Props) {
  const [status, setStatus] = useState<Status>("idle");
  const [submitting, setSubmitting] = useState(false);
  const [email, setEmail] = useState(profile.email || "");
  const [error, setError] = useState("");
  const [showColleges, setShowColleges] = useState(false);

  const matchedColleges = getMatchedColleges(profile);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }
    setError("");
    setSubmitting(true);

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profile: { ...profile, email },
          matchedScholarshipNames: matchedScholarships.slice(0, 10).map((s) => s.name),
        }),
      });

      if (!res.ok) throw new Error("Failed");
      setStatus("done");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (status === "dismissed") return null;

  if (status === "done") {
    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl px-5 py-4 mb-6 flex items-center gap-3">
        <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
        <div>
          <p className="text-sm font-semibold text-emerald-800">
            You are on the list — {matchedColleges.length} colleges may reach out to you.
          </p>
          <p className="text-xs text-emerald-700 mt-0.5">
            We will share your academic profile with matched schools. You can opt out at any time by emailing us.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-indigo-200 rounded-2xl mb-6 overflow-hidden shadow-sm">
      {/* Banner */}
      <div className="px-5 py-4 flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center flex-shrink-0">
          <Building2 className="w-5 h-5 text-indigo-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-900">
            {matchedColleges.length} colleges are looking for students like you
          </p>
          <p className="text-xs text-slate-500 mt-0.5">
            Opt in to let colleges matching your profile contact you about admissions, aid, and scholarships — free, no obligation.
          </p>
          <div className="flex items-center gap-3 mt-3 flex-wrap">
            <button
              onClick={() => setStatus("expanded")}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors"
            >
              Let colleges find me
            </button>
            <button
              onClick={() => setShowColleges(!showColleges)}
              className="text-xs text-slate-500 hover:text-slate-700 flex items-center gap-1"
            >
              See matched colleges
              {showColleges ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
        <button
          onClick={() => setStatus("dismissed")}
          className="text-slate-300 hover:text-slate-500 flex-shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Matched colleges preview */}
      {showColleges && (
        <div className="px-5 pb-4 border-t border-slate-100 pt-3">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">
            Colleges matched to your profile
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {matchedColleges.map((college) => (
              <div
                key={college.name}
                className="bg-slate-50 rounded-lg px-3 py-2 border border-slate-100"
              >
                <p className="text-xs font-medium text-slate-800 truncate">{college.name}</p>
                <p className="text-xs text-slate-400">{college.type}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Expanded opt-in form */}
      {status === "expanded" && (
        <form
          onSubmit={handleSubmit}
          className="px-5 pb-5 pt-3 border-t border-slate-100 space-y-3"
        >
          <p className="text-xs text-slate-600">
            We will share your academic profile (GPA, major, state, test scores) with matched colleges. They may contact you about admissions, merit aid, and scholarships. You can unsubscribe any time.
          </p>
          <div className="flex gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email address"
              className="flex-1 input-field"
              required
            />
            <button
              type="submit"
              disabled={submitting}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors flex-shrink-0"
            >
              {submitting ? "Saving..." : "Opt In"}
            </button>
          </div>
          {error && <p className="text-xs text-red-500">{error}</p>}
          <p className="text-xs text-slate-400">
            Your information is never sold. You will only hear from schools that match your profile.
          </p>
        </form>
      )}
    </div>
  );
}
