"use client";

import { useState, useRef, useEffect } from "react";
import { Search, X } from "lucide-react";

interface CollegeResult {
  name: string;
  city: string;
  state: string;
  domain: string | null;
  logoUrl: string | null;
}

interface Props {
  selected: string[];
  onChange: (colleges: string[]) => void;
}

export default function CollegeSearch({ selected, onChange }: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<CollegeResult[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const search = (q: string) => {
    if (timeout.current) clearTimeout(timeout.current);
    if (!q || q.length < 2) {
      setResults([]);
      setOpen(false);
      return;
    }
    setLoading(true);
    timeout.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/schools?q=${encodeURIComponent(q)}`);
        const data = await res.json();
        setResults(data);
        setOpen(true);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 350);
  };

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    search(val);
  };

  const handleSelect = (college: CollegeResult) => {
    if (!selected.includes(college.name)) {
      onChange([...selected, college.name]);
    }
    setQuery("");
    setResults([]);
    setOpen(false);
  };

  const handleRemove = (name: string) => {
    onChange(selected.filter((s) => s !== name));
  };

  return (
    <div className="relative" ref={wrapperRef}>
      <label className="block text-sm font-medium text-slate-700 mb-1.5">
        Intended College(s) <span className="text-slate-400 font-normal">(optional)</span>
      </label>

      {/* Selected colleges */}
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {selected.map((name) => (
            <span
              key={name}
              className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 text-xs font-medium pl-2.5 pr-1.5 py-1 rounded-full"
            >
              {name}
              <button
                type="button"
                onClick={() => handleRemove(name)}
                className="text-indigo-400 hover:text-indigo-600"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Search input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={handleInput}
          onFocus={() => results.length > 0 && setOpen(true)}
          placeholder="Search for colleges..."
          className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
        />
        {loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        )}
      </div>

      {/* Dropdown */}
      {open && results.length > 0 && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden">
          {results.map((college, i) => {
            const alreadySelected = selected.includes(college.name);
            return (
              <button
                key={i}
                type="button"
                onClick={() => !alreadySelected && handleSelect(college)}
                disabled={alreadySelected}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left border-b border-slate-100 last:border-0 transition-colors ${
                  alreadySelected
                    ? "opacity-40 cursor-not-allowed bg-slate-50"
                    : "hover:bg-slate-50"
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-slate-100 flex-shrink-0 overflow-hidden flex items-center justify-center">
                  {college.logoUrl && !imgErrors[college.domain || ""] ? (
                    <img
                      src={college.logoUrl}
                      alt={college.name}
                      className="w-full h-full object-contain p-0.5"
                      onError={() =>
                        setImgErrors((prev) => ({
                          ...prev,
                          [college.domain || ""]: true,
                        }))
                      }
                    />
                  ) : (
                    <span className="text-sm font-bold text-slate-500">
                      {college.name.charAt(0)}
                    </span>
                  )}
                </div>
                <div>
                  <div className="text-sm font-medium text-slate-800">{college.name}</div>
                  <div className="text-xs text-slate-500">
                    {college.city}, {college.state}
                  </div>
                </div>
                {alreadySelected && (
                  <span className="ml-auto text-xs text-slate-400">Added</span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {open && results.length === 0 && query.length >= 2 && !loading && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-lg px-4 py-3 text-sm text-slate-500">
          No colleges found. Try a different name.
        </div>
      )}
    </div>
  );
}
