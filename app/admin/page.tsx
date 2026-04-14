"use client";

import { useState, useEffect } from "react";
import { Download, RefreshCw, Users, GraduationCap, MapPin } from "lucide-react";

interface Lead {
  id: string;
  submittedAt: string;
  firstName: string;
  lastName: string;
  email: string;
  highSchool: string;
  state: string;
  gpa: string;
  intendedMajor: string;
  intendedColleges: string[];
  satScore: string;
  actScore: string;
  ethnicity: string;
  householdIncome: string;
  firstGenCollegeStudent: boolean;
  communityServiceHours: string;
  activitiesCount: number;
  awardsCount: number;
  matchedScholarships: string[];
}

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState(false);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchLeads = async (pw: string) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/leads/list?password=${encodeURIComponent(pw)}`);
      if (res.status === 401) {
        setError("Incorrect password.");
        setAuthed(false);
        return;
      }
      const data = await res.json();
      setLeads(data.leads || []);
      setAuthed(true);
    } catch {
      setError("Failed to load leads.");
    } finally {
      setLoading(false);
    }
  };

  const downloadCsv = () => {
    window.open(
      `/api/leads/list?password=${encodeURIComponent(password)}&format=csv`,
      "_blank"
    );
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    fetchLeads(password);
  };

  const stateBreakdown = leads.reduce<Record<string, number>>((acc, l) => {
    if (l.state) acc[l.state] = (acc[l.state] || 0) + 1;
    return acc;
  }, {});

  const majorBreakdown = leads.reduce<Record<string, number>>((acc, l) => {
    if (l.intendedMajor) acc[l.intendedMajor] = (acc[l.intendedMajor] || 0) + 1;
    return acc;
  }, {});

  const avgGpa =
    leads.length > 0
      ? (
          leads.reduce((sum, l) => sum + (parseFloat(l.gpa) || 0), 0) / leads.length
        ).toFixed(2)
      : "—";

  if (!authed) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 w-full max-w-sm">
          <div className="flex items-center gap-2.5 mb-6">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
              <GraduationCap className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-slate-900">Scholarship Route Admin</span>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Admin Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="input-field"
                autoFocus
              />
              <p className="text-xs text-slate-400 mt-1">
                Set via ADMIN_PASSWORD in .env.local. Default: scholarpath-admin
              </p>
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold py-2.5 rounded-xl transition-colors"
            >
              {loading ? "Loading..." : "View Leads"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white border-b border-slate-200 px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center">
            <GraduationCap className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="font-bold text-slate-900">Scholarship Route — Lead Dashboard</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchLeads(password)}
            className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh
          </button>
          <button
            onClick={downloadCsv}
            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-3 py-1.5 rounded-lg transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-4">
            <div className="flex items-center gap-2 mb-1">
              <Users className="w-4 h-4 text-indigo-500" />
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Total Leads</span>
            </div>
            <p className="text-3xl font-bold text-slate-900">{leads.length}</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 p-4">
            <div className="flex items-center gap-2 mb-1">
              <GraduationCap className="w-4 h-4 text-indigo-500" />
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Avg GPA</span>
            </div>
            <p className="text-3xl font-bold text-slate-900">{avgGpa}</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 p-4">
            <div className="flex items-center gap-2 mb-1">
              <MapPin className="w-4 h-4 text-indigo-500" />
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">States</span>
            </div>
            <p className="text-3xl font-bold text-slate-900">{Object.keys(stateBreakdown).length}</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 p-4">
            <div className="flex items-center gap-2 mb-1">
              <GraduationCap className="w-4 h-4 text-indigo-500" />
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">First-Gen</span>
            </div>
            <p className="text-3xl font-bold text-slate-900">
              {leads.filter((l) => l.firstGenCollegeStudent).length}
            </p>
          </div>
        </div>

        {/* Breakdown */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <h3 className="text-sm font-semibold text-slate-700 mb-3">Top Majors</h3>
            <div className="space-y-2">
              {Object.entries(majorBreakdown)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 8)
                .map(([major, count]) => (
                  <div key={major} className="flex items-center justify-between text-sm">
                    <span className="text-slate-600 truncate max-w-[200px]">{major}</span>
                    <span className="text-slate-900 font-semibold">{count}</span>
                  </div>
                ))}
              {Object.keys(majorBreakdown).length === 0 && (
                <p className="text-sm text-slate-400 italic">No data yet</p>
              )}
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <h3 className="text-sm font-semibold text-slate-700 mb-3">Top States</h3>
            <div className="space-y-2">
              {Object.entries(stateBreakdown)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 8)
                .map(([state, count]) => (
                  <div key={state} className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">{state}</span>
                    <span className="text-slate-900 font-semibold">{count}</span>
                  </div>
                ))}
              {Object.keys(stateBreakdown).length === 0 && (
                <p className="text-sm text-slate-400 italic">No data yet</p>
              )}
            </div>
          </div>
        </div>

        {/* Leads table */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100">
            <h3 className="text-sm font-semibold text-slate-800">All Leads</h3>
          </div>
          {leads.length === 0 ? (
            <div className="px-5 py-10 text-center text-sm text-slate-400">
              No leads yet. When students opt in on the results page, they will appear here.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    <th className="text-left px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">Name</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">Email</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">GPA</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">Major</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">State</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">SAT/ACT</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">Submitted</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {leads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-slate-50">
                      <td className="px-5 py-3 font-medium text-slate-800">
                        {lead.firstName} {lead.lastName}
                      </td>
                      <td className="px-4 py-3 text-slate-600">{lead.email}</td>
                      <td className="px-4 py-3 text-slate-600">{lead.gpa || "—"}</td>
                      <td className="px-4 py-3 text-slate-600 max-w-[160px] truncate">
                        {lead.intendedMajor || "—"}
                      </td>
                      <td className="px-4 py-3 text-slate-600">{lead.state || "—"}</td>
                      <td className="px-4 py-3 text-slate-600">
                        {lead.satScore ? `SAT ${lead.satScore}` : ""}
                        {lead.satScore && lead.actScore ? " / " : ""}
                        {lead.actScore ? `ACT ${lead.actScore}` : ""}
                        {!lead.satScore && !lead.actScore ? "—" : ""}
                      </td>
                      <td className="px-4 py-3 text-slate-400 text-xs">
                        {new Date(lead.submittedAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
