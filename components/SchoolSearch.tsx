"use client";

import { useState, useRef, useEffect } from "react";
import { Search, X } from "lucide-react";

interface SchoolResult {
  name: string;
  city: string;
  state: string;
  domain: string | null;
  logoUrl: string | null;
}

interface Props {
  value: string;
  domain: string;
  onChange: (name: string, domain: string) => void;
  placeholder?: string;
  label?: string;
  className?: string;
}

export default function SchoolSearch({
  value,
  domain,
  onChange,
  placeholder = "Search for your school...",
  label = "High School",
  className = "",
}: Props) {
  const [query, setQuery] = useState(value);
  const [results, setResults] = useState<SchoolResult[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setQuery(value);
  }, [value]);

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
    if (!val) {
      onChange("", "");
    }
    search(val);
  };

  const handleSelect = (school: SchoolResult) => {
    setQuery(school.name);
    onChange(school.name, school.domain || "");
    setOpen(false);
    setResults([]);
  };

  const handleClear = () => {
    setQuery("");
    onChange("", "");
    setResults([]);
    setOpen(false);
  };

  return (
    <div className={`relative ${className}`} ref={wrapperRef}>
      {label && (
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={handleInput}
          onFocus={() => results.length > 0 && setOpen(true)}
          placeholder={placeholder}
          className="w-full pl-9 pr-9 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
        />
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
        {loading && !query && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        )}
      </div>

      {/* Logo preview when selected */}
      {domain && value && (
        <div className="mt-2 flex items-center gap-2 text-sm text-slate-500">
          {!imgErrors[domain] ? (
            <img
              src={`https://logo.clearbit.com/${domain}`}
              alt={value}
              className="w-6 h-6 rounded object-contain"
              onError={() => setImgErrors((prev) => ({ ...prev, [domain]: true }))}
            />
          ) : (
            <div className="w-6 h-6 rounded bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-600">
              {value.charAt(0)}
            </div>
          )}
          <span className="text-slate-600 font-medium truncate max-w-[200px]">{value}</span>
        </div>
      )}

      {/* Dropdown */}
      {open && results.length > 0 && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden">
          {results.map((school, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleSelect(school)}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 text-left border-b border-slate-100 last:border-0 transition-colors"
            >
              <div className="w-8 h-8 rounded-lg bg-slate-100 flex-shrink-0 overflow-hidden flex items-center justify-center">
                {school.logoUrl && !imgErrors[school.domain || ""] ? (
                  <img
                    src={school.logoUrl}
                    alt={school.name}
                    className="w-full h-full object-contain p-0.5"
                    onError={() =>
                      setImgErrors((prev) => ({
                        ...prev,
                        [school.domain || ""]: true,
                      }))
                    }
                  />
                ) : (
                  <span className="text-sm font-bold text-slate-500">
                    {school.name.charAt(0)}
                  </span>
                )}
              </div>
              <div>
                <div className="text-sm font-medium text-slate-800">{school.name}</div>
                <div className="text-xs text-slate-500">
                  {school.city}, {school.state}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {open && results.length === 0 && query.length >= 2 && !loading && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-lg px-4 py-3 text-sm text-slate-500">
          No schools found. You can type the name manually.
        </div>
      )}
    </div>
  );
}
