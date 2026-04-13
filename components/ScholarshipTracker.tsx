"use client";

import { useState } from "react";
import { Bookmark, CheckCircle, XCircle, Trophy, Trash2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { ScholarshipStatus } from "@/lib/types";

interface Props {
  scholarshipId: string;
}

const STATUS_CONFIG: Record<ScholarshipStatus, { label: string; icon: React.ElementType; color: string; bg: string }> = {
  saved: { label: "Saved", icon: Bookmark, color: "text-blue-700", bg: "bg-blue-50 border-blue-200" },
  applied: { label: "Applied", icon: CheckCircle, color: "text-amber-700", bg: "bg-amber-50 border-amber-200" },
  won: { label: "Won", icon: Trophy, color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200" },
  rejected: { label: "Not Selected", icon: XCircle, color: "text-slate-500", bg: "bg-slate-50 border-slate-200" },
};

export default function ScholarshipTracker({ scholarshipId }: Props) {
  const { user, tracked, trackScholarship, removeTracked } = useAuth();
  const [loading, setLoading] = useState(false);

  if (!user) return null;

  const current = tracked.find((t) => t.scholarshipId === scholarshipId);

  const handleTrack = async (status: ScholarshipStatus) => {
    setLoading(true);
    try {
      await trackScholarship(scholarshipId, status);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async () => {
    setLoading(true);
    try {
      await removeTracked(scholarshipId);
    } finally {
      setLoading(false);
    }
  };

  if (current) {
    const config = STATUS_CONFIG[current.status];
    const Icon = config.icon;
    return (
      <div className={`rounded-xl border px-4 py-3 ${config.bg}`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Icon className={`w-4 h-4 ${config.color}`} />
            <span className={`text-sm font-semibold ${config.color}`}>{config.label}</span>
          </div>
          <button
            onClick={handleRemove}
            disabled={loading}
            className="text-slate-400 hover:text-red-400 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="flex gap-1.5">
          {(Object.keys(STATUS_CONFIG) as ScholarshipStatus[]).map((s) => {
            const isActive = s === current.status;
            return (
              <button
                key={s}
                onClick={() => handleTrack(s)}
                disabled={loading || isActive}
                className={`text-xs px-2.5 py-1 rounded-full font-medium transition-colors ${
                  isActive
                    ? "bg-white shadow-sm text-slate-800"
                    : "text-slate-500 hover:bg-white/60"
                }`}
              >
                {STATUS_CONFIG[s].label}
              </button>
            );
          })}
        </div>
        <p className="text-xs text-slate-400 mt-1.5">
          Updated {new Date(current.dateUpdated).toLocaleDateString()}
        </p>
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      <button
        onClick={() => handleTrack("saved")}
        disabled={loading}
        className="flex-1 flex items-center justify-center gap-1.5 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-600 text-xs font-medium py-2 rounded-lg transition-colors"
      >
        <Bookmark className="w-3.5 h-3.5" />
        Save
      </button>
      <button
        onClick={() => handleTrack("applied")}
        disabled={loading}
        className="flex-1 flex items-center justify-center gap-1.5 bg-slate-100 hover:bg-amber-50 hover:text-amber-700 text-slate-600 text-xs font-medium py-2 rounded-lg transition-colors"
      >
        <CheckCircle className="w-3.5 h-3.5" />
        Mark Applied
      </button>
    </div>
  );
}
