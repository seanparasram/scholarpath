"use client";

import { useState, useMemo, useEffect } from "react";
import {
  GraduationCap,
  User,
  BookOpen,
  Trophy,
  Plus,
  Trash2,
  Search,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  Filter,
  X,
  MapPin,
  LogIn,
  LogOut,
  Bookmark,
  School,
  UserPlus,
  ChevronLeft,
  ChevronRight as ChevronRightIcon,
} from "lucide-react";
import { StudentProfile, Scholarship, FilterState, Activity, Award, Project, ScholarshipCategory, StudentType } from "@/lib/types";
import { SCHOLARSHIPS, matchScholarships } from "@/lib/scholarships";
import { useAuth } from "@/lib/auth-context";
import ScholarshipCard from "@/components/ScholarshipCard";
import ScholarshipModal from "@/components/ScholarshipModal";
import CollegeSearch from "@/components/CollegeSearch";
import FullRoadmap from "@/components/FullRoadmap";
import LeadOptIn from "@/components/LeadOptIn";
import AffiliateResources from "@/components/AffiliateResources";
import AuthModal from "@/components/AuthModal";
import SchoolSearch from "@/components/SchoolSearch";

const EMPTY_PROFILE: StudentProfile = {
  studentType: "high-school",
  firstName: "",
  lastName: "",
  email: "",
  highSchool: "",
  highSchoolDomain: "",
  currentCollege: "",
  currentCollegeDomain: "",
  classYear: "",
  gpa: "",
  satScore: "",
  actScore: "",
  intendedMajor: "",
  intendedColleges: [],
  state: "",
  ethnicity: "",
  gender: "",
  citizenshipStatus: "",
  householdIncome: "",
  firstGenCollegeStudent: false,
  activities: [],
  awards: [],
  communityServiceHours: "",
  workExperience: "",
  personalStatement: "",
  projects: [],
};

const US_STATES = [
  "Alabama","Alaska","Arizona","Arkansas","California","Colorado","Connecticut","Delaware",
  "Florida","Georgia","Hawaii","Idaho","Illinois","Indiana","Iowa","Kansas","Kentucky",
  "Louisiana","Maine","Maryland","Massachusetts","Michigan","Minnesota","Mississippi",
  "Missouri","Montana","Nebraska","Nevada","New Hampshire","New Jersey","New Mexico",
  "New York","North Carolina","North Dakota","Ohio","Oklahoma","Oregon","Pennsylvania",
  "Rhode Island","South Carolina","South Dakota","Tennessee","Texas","Utah","Vermont",
  "Virginia","Washington","West Virginia","Wisconsin","Wyoming",
];

const ETHNICITIES = [
  "African American",
  "Hispanic/Latino",
  "Asian/Pacific Islander",
  "American Indian/Alaska Native",
  "White/Caucasian",
  "Multiracial",
  "Middle Eastern/North African",
  "Other",
  "Prefer not to say",
];

const INCOME_RANGES = [
  "Under $30,000",
  "$30,000–$50,000",
  "$50,000–$75,000",
  "$75,000–$100,000",
  "$100,000–$150,000",
  "Over $150,000",
];

const CITIZENSHIP_OPTIONS = [
  "US Citizen",
  "Permanent Resident",
  "DACA Recipient",
  "International Student",
  "Other",
];

const ALL_CATEGORIES: { key: ScholarshipCategory; label: string }[] = [
  { key: "merit", label: "Merit-Based" },
  { key: "need-based", label: "Need-Based" },
  { key: "stem", label: "STEM" },
  { key: "arts", label: "Arts" },
  { key: "humanities", label: "Humanities" },
  { key: "business", label: "Business" },
  { key: "leadership", label: "Leadership" },
  { key: "community-service", label: "Community Service" },
  { key: "ethnicity-specific", label: "Ethnicity-Specific" },
  { key: "first-generation", label: "First-Generation" },
  { key: "athletics", label: "Athletics" },
  { key: "state-specific", label: "State-Specific" },
  { key: "health", label: "Health" },
  { key: "education", label: "Education" },
  { key: "science", label: "Science" },
];

type ProfileSection = "personal" | "academic" | "activities" | "about";

export default function Home() {
  const { user, profile: savedProfile, loading: authLoading, signOut, saveProfile, tracked } = useAuth();
  const [profile, setProfile] = useState<StudentProfile>(EMPTY_PROFILE);
  const [submitted, setSubmitted] = useState(false);
  const [openSection, setOpenSection] = useState<ProfileSection>("personal");
  const [selectedScholarship, setSelectedScholarship] = useState<Scholarship | null>(null);
  const [showFullRoadmap, setShowFullRoadmap] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showTrackedView, setShowTrackedView] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    schoolSpecific: false,
    majorSpecific: false,
    categories: [],
    minAmount: 0,
    maxAmount: 1000000,
    showExpired: false,
  });

  // Load saved profile when auth resolves
  useEffect(() => {
    if (savedProfile && !submitted) {
      setProfile(savedProfile);
    }
  }, [savedProfile, submitted]);

  const [scrapedScholarships, setScrapedScholarships] = useState<Scholarship[]>([]);
  const [loadingScraped, setLoadingScraped] = useState(false);

  // Load scraped scholarships from Firestore when results are shown
  useEffect(() => {
    if (!submitted || scrapedScholarships.length > 0) return;
    setLoadingScraped(true);
    fetch("/api/scrape")
      .then((res) => res.json())
      .then((data) => {
        const mapped: Scholarship[] = (data.scholarships || []).map((s: Record<string, unknown>) => ({
          id: s.id as string,
          name: s.name as string,
          organization: s.organization as string,
          amount: s.amount as string,
          amountNumeric: (s.amountNumeric as number) || 2500,
          deadline: s.deadline as string,
          deadlineDate: s.deadlineDate as string,
          description: s.description as string,
          eligibility: { description: (s.eligibilityDescription as string) || "Visit application page for details." },
          essayPrompts: [],
          applicationUrl: s.applicationUrl as string,
          category: (s.category as string[]) || ["national"],
          renewable: false,
          whatMakesStrongCandidate: ["Visit the application page for full details"],
          tips: ["Check the official application page for requirements and deadlines"],
          schoolSpecific: false,
          majorSpecific: false,
          matchScore: 0,
        }));
        setScrapedScholarships(mapped);
      })
      .catch(() => {})
      .finally(() => setLoadingScraped(false));
  }, [submitted, scrapedScholarships.length]);

  // Combine static + scraped, then match
  const allScholarships = useMemo(() => {
    const staticIds = new Set(SCHOLARSHIPS.map((s) => s.id));
    const deduped = scrapedScholarships.filter((s) => !staticIds.has(s.id));
    return [...SCHOLARSHIPS, ...deduped];
  }, [scrapedScholarships]);

  const matchedScholarships = useMemo(() => {
    if (!submitted) return [];
    return matchScholarships(allScholarships, {
      gpa: profile.gpa,
      intendedMajor: profile.intendedMajor,
      ethnicity: profile.ethnicity,
      gender: profile.gender,
      state: profile.state,
      householdIncome: profile.householdIncome,
      firstGenCollegeStudent: profile.firstGenCollegeStudent,
      citizenshipStatus: profile.citizenshipStatus,
    });
  }, [submitted, profile, allScholarships]);

  // Search across name, org, description, majors, categories
  const searchScholarship = (s: Scholarship, q: string): boolean => {
    const ql = q.toLowerCase();
    return (
      s.name.toLowerCase().includes(ql) ||
      s.organization.toLowerCase().includes(ql) ||
      s.description.toLowerCase().includes(ql) ||
      s.category.some((c) => c.includes(ql)) ||
      (s.specificMajors || []).some((m) => m.toLowerCase().includes(ql)) ||
      s.whatMakesStrongCandidate.some((w) => w.toLowerCase().includes(ql)) ||
      s.eligibility.description.toLowerCase().includes(ql)
    );
  };

  const filteredScholarships = useMemo(() => {
    let results = matchedScholarships;

    if (searchQuery) {
      results = results.filter((s) => searchScholarship(s, searchQuery));
    }

    if (filters.majorSpecific) {
      results = results.filter((s) => s.majorSpecific);
    }

    if (filters.schoolSpecific) {
      results = results.filter((s) => s.schoolSpecific);
    }

    if (filters.categories.length > 0) {
      results = results.filter((s) =>
        filters.categories.some((cat) => s.category.includes(cat))
      );
    }

    if (!filters.showExpired) {
      results = results.filter((s) => {
        if (!s.deadlineDate) return true;
        return new Date(s.deadlineDate) >= new Date();
      });
    }

    results = results.filter(
      (s) => s.amountNumeric >= filters.minAmount && s.amountNumeric <= filters.maxAmount
    );

    return results;
  }, [matchedScholarships, searchQuery, filters]);

  const updateProfile = (field: keyof StudentProfile, value: unknown) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  const addActivity = () => {
    updateProfile("activities", [
      ...profile.activities,
      { name: "", role: "", yearsInvolved: "", description: "" },
    ]);
  };

  const updateActivity = (i: number, field: keyof Activity, value: string) => {
    const updated = [...profile.activities];
    updated[i] = { ...updated[i], [field]: value };
    updateProfile("activities", updated);
  };

  const removeActivity = (i: number) => {
    updateProfile("activities", profile.activities.filter((_, idx) => idx !== i));
  };

  const addAward = () => {
    updateProfile("awards", [...profile.awards, { name: "", year: "", description: "" }]);
  };

  const updateAward = (i: number, field: keyof Award, value: string) => {
    const updated = [...profile.awards];
    updated[i] = { ...updated[i], [field]: value };
    updateProfile("awards", updated);
  };

  const removeAward = (i: number) => {
    updateProfile("awards", profile.awards.filter((_, idx) => idx !== i));
  };

  const addProject = () => {
    updateProfile("projects", [...profile.projects, { name: "", description: "", skills: "" }]);
  };

  const updateProject = (i: number, field: keyof Project, value: string) => {
    const updated = [...profile.projects];
    updated[i] = { ...updated[i], [field]: value };
    updateProfile("projects", updated);
  };

  const removeProject = (i: number) => {
    updateProfile("projects", profile.projects.filter((_, idx) => idx !== i));
  };

  const toggleCategory = (cat: ScholarshipCategory) => {
    setFilters((prev) => ({
      ...prev,
      categories: prev.categories.includes(cat)
        ? prev.categories.filter((c) => c !== cat)
        : [...prev.categories, cat],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (user) {
      await saveProfile(profile);
    }
    setSubmitted(true);
    setTimeout(() => {
      document.getElementById("results")?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const SectionHeader = ({
    id,
    icon: Icon,
    title,
    subtitle,
  }: {
    id: ProfileSection;
    icon: React.ElementType;
    title: string;
    subtitle: string;
  }) => (
    <button
      type="button"
      onClick={() => setOpenSection(id)}
      className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors rounded-xl"
    >
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-indigo-100 flex items-center justify-center">
          <Icon className="w-4 h-4 text-indigo-600" />
        </div>
        <div className="text-left">
          <div className="text-sm font-semibold text-slate-800">{title}</div>
          <div className="text-xs text-slate-500">{subtitle}</div>
        </div>
      </div>
      {openSection === id ? (
        <ChevronUp className="w-4 h-4 text-slate-400" />
      ) : (
        <ChevronDown className="w-4 h-4 text-slate-400" />
      )}
    </button>
  );

  // Pagination
  const [page, setPage] = useState(1);
  const PER_PAGE = 12;
  const totalPages = Math.ceil(filteredScholarships.length / PER_PAGE);
  const paginatedScholarships = filteredScholarships.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  // Reset page when filters change
  useEffect(() => { setPage(1); }, [searchQuery, filters, submitted]);

  // Keyword suggestions for search
  const KEYWORD_SUGGESTIONS = [
    { label: "Environment & Sustainability", keywords: ["environment", "sustainability", "conservation", "ecology", "climate"] },
    { label: "Computer Science & Tech", keywords: ["computer", "technology", "software", "engineering", "coding"] },
    { label: "Business & Finance", keywords: ["business", "finance", "entrepreneur", "accounting", "marketing"] },
    { label: "Healthcare & Nursing", keywords: ["nursing", "health", "medicine", "medical", "pharmacy"] },
    { label: "Arts & Music", keywords: ["art", "music", "creative", "writing", "film", "poetry"] },
    { label: "STEM & Science", keywords: ["stem", "science", "math", "research", "biology", "chemistry", "physics"] },
    { label: "Law & Government", keywords: ["law", "government", "policy", "political", "justice"] },
    { label: "Education & Teaching", keywords: ["education", "teaching", "teacher", "tutor"] },
    { label: "Community Service", keywords: ["community", "service", "volunteer", "nonprofit"] },
    { label: "Leadership", keywords: ["leadership", "leader", "president", "officer"] },
    { label: "First-Generation", keywords: ["first-generation", "first gen", "first in family"] },
    { label: "No Essay Required", keywords: ["no essay", "no gpa", "sweepstakes", "monthly"] },
    { label: "Full Ride / High Value", keywords: ["full tuition", "full ride", "full cost"] },
    { label: "Athletics & Sports", keywords: ["athlete", "sports", "athletic", "ncaa"] },
    { label: "Military & ROTC", keywords: ["military", "rotc", "army", "navy", "air force"] },
    { label: "Psychology & Social Science", keywords: ["psychology", "social", "behavioral"] },
    { label: "Engineering", keywords: ["engineering", "mechanical", "electrical", "civil", "aerospace"] },
    { label: "International & Study Abroad", keywords: ["international", "abroad", "global"] },
  ];

  const [showSuggestions, setShowSuggestions] = useState(false);
  const filteredSuggestions = searchQuery.length > 0
    ? KEYWORD_SUGGESTIONS.filter((s) =>
        s.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.keywords.some((k) => k.includes(searchQuery.toLowerCase()))
      )
    : KEYWORD_SUGGESTIONS;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Nav */}
      <nav className={`sticky top-0 z-40 ${!submitted ? "bg-black/40 backdrop-blur-md border-b border-white/10" : "bg-white border-b border-slate-200"}`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
              <GraduationCap className="w-4 h-4 text-white" />
            </div>
            <span className={`font-bold text-lg tracking-tight ${!submitted ? "text-white" : "text-slate-900"}`}>Scholarship Route</span>
          </div>
          <div className="flex items-center gap-3">
            {submitted && (
              <button
                onClick={() => setSubmitted(false)}
                className="text-sm text-indigo-600 font-medium hover:text-indigo-700"
              >
                Edit Profile
              </button>
            )}
            {submitted && user && tracked.length > 0 && (
              <button
                onClick={() => setShowTrackedView(!showTrackedView)}
                className="flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-colors"
              >
                <Bookmark className="w-3.5 h-3.5" />
                My Scholarships ({tracked.length})
              </button>
            )}
            {!authLoading && (
              user ? (
                <div className="flex items-center gap-2">
                  <span className={`text-xs hidden sm:inline ${!submitted ? "text-white/70" : "text-slate-500"}`}>{user.email}</span>
                  <button
                    onClick={signOut}
                    className={`flex items-center gap-1.5 text-sm ${!submitted ? "text-white/70 hover:text-white" : "text-slate-500 hover:text-slate-700"}`}
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowAuthModal(true)}
                  className={`flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-lg transition-colors ${
                    !submitted
                      ? "bg-white text-indigo-700 hover:bg-white/90"
                      : "bg-indigo-600 text-white hover:bg-indigo-700"
                  }`}
                >
                  <LogIn className="w-3.5 h-3.5" />
                  Sign In
                </button>
              )
            )}
          </div>
        </div>
      </nav>

      {!submitted ? (
        /* ─── PROFILE VIEW WITH BACKGROUND IMAGE ─── */
        <div
          className="min-h-[calc(100vh-4rem)]"
          style={{
            backgroundImage: "url('/hero-bg.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundAttachment: "fixed",
          }}
        >
          <div className="min-h-[calc(100vh-4rem)] bg-black/45">
            <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
              {/* Hero */}
              <div className="text-center mb-10">
                <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4 tracking-tight drop-shadow-lg">
                  Find Scholarships Built for You
                </h1>
                <p className="text-white/90 text-lg max-w-xl mx-auto leading-relaxed">
                  {user
                    ? "Welcome back. Your profile is loaded and ready to go."
                    : "Fill out your profile once. Get matched with scholarships you can win, see a personalized roadmap to strengthen your applications, and Scholarship Route can even draft your essays for you."}
                </p>
                {!user && (
                  <button
                    onClick={() => setShowAuthModal(true)}
                    className="mt-5 inline-flex items-center gap-2 bg-white text-indigo-700 font-semibold px-6 py-3 rounded-xl text-base shadow-lg hover:bg-white/95 transition-colors"
                  >
                    <UserPlus className="w-4 h-4" />
                    Create Free Account
                  </button>
                )}
              </div>

            {/* Profile Form */}
            <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
              {/* Student type toggle */}
              <div className="flex justify-center mb-6">
                <div className="inline-flex bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
                  <button
                    type="button"
                    onClick={() => updateProfile("studentType", "high-school" as StudentType)}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      profile.studentType === "high-school"
                        ? "bg-indigo-600 text-white shadow-sm"
                        : "text-slate-600 hover:text-slate-800"
                    }`}
                  >
                    <School className="w-4 h-4" />
                    High School Student
                  </button>
                  <button
                    type="button"
                    onClick={() => updateProfile("studentType", "college" as StudentType)}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      profile.studentType === "college"
                        ? "bg-indigo-600 text-white shadow-sm"
                        : "text-slate-600 hover:text-slate-800"
                    }`}
                  >
                    <GraduationCap className="w-4 h-4" />
                    College Student
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden divide-y divide-slate-100">
                {/* SECTION: Personal */}
                <div>
                  <SectionHeader
                    id="personal"
                    icon={User}
                    title="Personal Information"
                    subtitle="Basic details about you"
                  />
                  {openSection === "personal" && (
                    <div className="px-6 pb-6 space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1.5">First Name</label>
                          <input
                            type="text"
                            value={profile.firstName}
                            onChange={(e) => updateProfile("firstName", e.target.value)}
                            placeholder="Jane"
                            className="input-field"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1.5">Last Name</label>
                          <input
                            type="text"
                            value={profile.lastName}
                            onChange={(e) => updateProfile("lastName", e.target.value)}
                            placeholder="Smith"
                            className="input-field"
                            required
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Email Address</label>
                        <input
                          type="email"
                          value={profile.email}
                          onChange={(e) => updateProfile("email", e.target.value)}
                          placeholder="jane@email.com"
                          className="input-field"
                        />
                      </div>
                      {profile.studentType === "high-school" ? (
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1.5">High School</label>
                          <input
                            type="text"
                            value={profile.highSchool}
                            onChange={(e) => updateProfile("highSchool", e.target.value)}
                            placeholder="e.g., Lincoln High School"
                            className="input-field"
                          />
                        </div>
                      ) : (
                        <>
                          <SchoolSearch
                            value={profile.currentCollege}
                            domain={profile.currentCollegeDomain}
                            onChange={(name, domain) => {
                              updateProfile("currentCollege", name);
                              updateProfile("currentCollegeDomain", domain);
                            }}
                            label="Current College"
                            placeholder="Search for your college..."
                          />
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Class Year</label>
                            <select
                              value={profile.classYear}
                              onChange={(e) => updateProfile("classYear", e.target.value)}
                              className="input-field"
                            >
                              <option value="">Select...</option>
                              <option value="Freshman">Freshman</option>
                              <option value="Sophomore">Sophomore</option>
                              <option value="Junior">Junior</option>
                              <option value="Senior">Senior</option>
                              <option value="Graduate">Graduate Student</option>
                            </select>
                          </div>
                        </>
                      )}
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">State of Residence</label>
                        <select
                          value={profile.state}
                          onChange={(e) => updateProfile("state", e.target.value)}
                          className="input-field"
                        >
                          <option value="">Select state...</option>
                          {US_STATES.map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1.5">
                            Ethnicity <span className="text-slate-400 font-normal">(optional)</span>
                          </label>
                          <select
                            value={profile.ethnicity}
                            onChange={(e) => updateProfile("ethnicity", e.target.value)}
                            className="input-field"
                          >
                            <option value="">Select...</option>
                            {ETHNICITIES.map((e) => (
                              <option key={e} value={e}>{e}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1.5">
                            Gender <span className="text-slate-400 font-normal">(optional)</span>
                          </label>
                          <select
                            value={profile.gender}
                            onChange={(e) => updateProfile("gender", e.target.value)}
                            className="input-field"
                          >
                            <option value="">Select...</option>
                            <option value="Female">Female</option>
                            <option value="Male">Male</option>
                            <option value="Non-binary">Non-binary</option>
                            <option value="Prefer not to say">Prefer not to say</option>
                          </select>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1.5">Citizenship Status</label>
                          <select
                            value={profile.citizenshipStatus}
                            onChange={(e) => updateProfile("citizenshipStatus", e.target.value)}
                            className="input-field"
                          >
                            <option value="">Select...</option>
                            {CITIZENSHIP_OPTIONS.map((c) => (
                              <option key={c} value={c}>{c}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1.5">Household Income</label>
                          <select
                            value={profile.householdIncome}
                            onChange={(e) => updateProfile("householdIncome", e.target.value)}
                            className="input-field"
                          >
                            <option value="">Select...</option>
                            {INCOME_RANGES.map((r) => (
                              <option key={r} value={r}>{r}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          id="firstGen"
                          checked={profile.firstGenCollegeStudent}
                          onChange={(e) => updateProfile("firstGenCollegeStudent", e.target.checked)}
                          className="w-4 h-4 accent-indigo-600 rounded"
                        />
                        <label htmlFor="firstGen" className="text-sm text-slate-700">
                          I will be the first in my family to attend college
                        </label>
                      </div>
                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={() => setOpenSection("academic")}
                          className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
                        >
                          Next: Academic Info
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* SECTION: Academic */}
                <div>
                  <SectionHeader
                    id="academic"
                    icon={BookOpen}
                    title="Academic Information"
                    subtitle="GPA, test scores, and your goals"
                  />
                  {openSection === "academic" && (
                    <div className="px-6 pb-6 space-y-4">
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1.5">GPA</label>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            max="4.0"
                            value={profile.gpa}
                            onChange={(e) => updateProfile("gpa", e.target.value)}
                            placeholder="3.8"
                            className="input-field"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1.5">SAT Score</label>
                          <input
                            type="number"
                            min="400"
                            max="1600"
                            value={profile.satScore}
                            onChange={(e) => updateProfile("satScore", e.target.value)}
                            placeholder="1280"
                            className="input-field"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1.5">ACT Score</label>
                          <input
                            type="number"
                            min="1"
                            max="36"
                            value={profile.actScore}
                            onChange={(e) => updateProfile("actScore", e.target.value)}
                            placeholder="28"
                            className="input-field"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">
                          {profile.studentType === "college" ? "Declared Major" : "Intended Major"}
                        </label>
                        <input
                          type="text"
                          value={profile.intendedMajor}
                          onChange={(e) => updateProfile("intendedMajor", e.target.value)}
                          placeholder="e.g., Computer Science, Nursing, Business Administration"
                          className="input-field"
                        />
                      </div>
                      <CollegeSearch
                        selected={profile.intendedColleges}
                        onChange={(colleges) => updateProfile("intendedColleges", colleges)}
                      />
                      <div className="flex justify-between pt-1">
                        <button
                          type="button"
                          onClick={() => setOpenSection("personal")}
                          className="text-sm text-slate-500 hover:text-slate-700"
                        >
                          Back
                        </button>
                        <button
                          type="button"
                          onClick={() => setOpenSection("activities")}
                          className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
                        >
                          Next: Activities & Awards
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* SECTION: Activities & Awards */}
                <div>
                  <SectionHeader
                    id="activities"
                    icon={Trophy}
                    title="Activities, Awards & Projects"
                    subtitle="Extracurriculars, honors, and personal work"
                  />
                  {openSection === "activities" && (
                    <div className="px-6 pb-6 space-y-6">
                      {/* Activities */}
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-sm font-semibold text-slate-700">Extracurricular Activities</h4>
                          <button
                            type="button"
                            onClick={addActivity}
                            className="text-xs font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            Add Activity
                          </button>
                        </div>
                        {profile.activities.length === 0 && (
                          <p className="text-sm text-slate-400 italic">No activities added yet.</p>
                        )}
                        <div className="space-y-3">
                          {profile.activities.map((act, i) => (
                            <div key={i} className="bg-slate-50 rounded-xl p-3 relative">
                              <button
                                type="button"
                                onClick={() => removeActivity(i)}
                                className="absolute top-3 right-3 text-slate-300 hover:text-red-400"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                              <div className="grid grid-cols-2 gap-2 mb-2">
                                <input
                                  type="text"
                                  value={act.name}
                                  onChange={(e) => updateActivity(i, "name", e.target.value)}
                                  placeholder="Activity name (e.g., Robotics Club)"
                                  className="input-field-sm"
                                />
                                <input
                                  type="text"
                                  value={act.role}
                                  onChange={(e) => updateActivity(i, "role", e.target.value)}
                                  placeholder="Your role (e.g., President)"
                                  className="input-field-sm"
                                />
                              </div>
                              <div className="grid grid-cols-3 gap-2">
                                <input
                                  type="text"
                                  value={act.yearsInvolved}
                                  onChange={(e) => updateActivity(i, "yearsInvolved", e.target.value)}
                                  placeholder="Years involved"
                                  className="input-field-sm"
                                />
                                <input
                                  type="text"
                                  value={act.description}
                                  onChange={(e) => updateActivity(i, "description", e.target.value)}
                                  placeholder="Brief description of impact"
                                  className="input-field-sm col-span-2"
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Community Service */}
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">
                          Community Service Hours (total)
                        </label>
                        <input
                          type="text"
                          value={profile.communityServiceHours}
                          onChange={(e) => updateProfile("communityServiceHours", e.target.value)}
                          placeholder="e.g., 150 hours"
                          className="input-field"
                        />
                      </div>

                      {/* Work Experience */}
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Work Experience</label>
                        <textarea
                          value={profile.workExperience}
                          onChange={(e) => updateProfile("workExperience", e.target.value)}
                          placeholder="Briefly describe any jobs, internships, or freelance work..."
                          rows={2}
                          className="input-field resize-none"
                        />
                      </div>

                      {/* Awards */}
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-sm font-semibold text-slate-700">Awards & Honors</h4>
                          <button
                            type="button"
                            onClick={addAward}
                            className="text-xs font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            Add Award
                          </button>
                        </div>
                        {profile.awards.length === 0 && (
                          <p className="text-sm text-slate-400 italic">No awards added yet.</p>
                        )}
                        <div className="space-y-2">
                          {profile.awards.map((award, i) => (
                            <div key={i} className="bg-slate-50 rounded-xl p-3 relative">
                              <button
                                type="button"
                                onClick={() => removeAward(i)}
                                className="absolute top-3 right-3 text-slate-300 hover:text-red-400"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                              <div className="grid grid-cols-3 gap-2 mb-2">
                                <input
                                  type="text"
                                  value={award.name}
                                  onChange={(e) => updateAward(i, "name", e.target.value)}
                                  placeholder="Award name"
                                  className="input-field-sm col-span-2"
                                />
                                <input
                                  type="text"
                                  value={award.year}
                                  onChange={(e) => updateAward(i, "year", e.target.value)}
                                  placeholder="Year"
                                  className="input-field-sm"
                                />
                              </div>
                              <input
                                type="text"
                                value={award.description}
                                onChange={(e) => updateAward(i, "description", e.target.value)}
                                placeholder="Brief description"
                                className="input-field-sm w-full"
                              />
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Projects */}
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-sm font-semibold text-slate-700">Personal Projects</h4>
                          <button
                            type="button"
                            onClick={addProject}
                            className="text-xs font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            Add Project
                          </button>
                        </div>
                        {profile.projects.length === 0 && (
                          <p className="text-sm text-slate-400 italic">
                            Research, apps, art, community initiatives — anything you are proud of.
                          </p>
                        )}
                        <div className="space-y-2">
                          {profile.projects.map((proj, i) => (
                            <div key={i} className="bg-slate-50 rounded-xl p-3 relative">
                              <button
                                type="button"
                                onClick={() => removeProject(i)}
                                className="absolute top-3 right-3 text-slate-300 hover:text-red-400"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                              <input
                                type="text"
                                value={proj.name}
                                onChange={(e) => updateProject(i, "name", e.target.value)}
                                placeholder="Project name"
                                className="input-field-sm w-full mb-2"
                              />
                              <textarea
                                value={proj.description}
                                onChange={(e) => updateProject(i, "description", e.target.value)}
                                placeholder="What did you build or do? What was the impact?"
                                rows={2}
                                className="input-field-sm w-full mb-2 resize-none"
                              />
                              <input
                                type="text"
                                value={proj.skills}
                                onChange={(e) => updateProject(i, "skills", e.target.value)}
                                placeholder="Skills or tools used"
                                className="input-field-sm w-full"
                              />
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex justify-between pt-1">
                        <button
                          type="button"
                          onClick={() => setOpenSection("academic")}
                          className="text-sm text-slate-500 hover:text-slate-700"
                        >
                          Back
                        </button>
                        <button
                          type="button"
                          onClick={() => setOpenSection("about")}
                          className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
                        >
                          Next: About You
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* SECTION: About */}
                <div>
                  <SectionHeader
                    id="about"
                    icon={GraduationCap}
                    title="About You"
                    subtitle="Your story, in your words"
                  />
                  {openSection === "about" && (
                    <div className="px-6 pb-6 space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">
                          Personal Statement / Bio
                        </label>
                        <p className="text-xs text-slate-500 mb-2">
                          Describe yourself, your background, challenges you have overcome, and what
                          motivates you. This helps the AI writing assistant personalize your essays.
                        </p>
                        <textarea
                          value={profile.personalStatement}
                          onChange={(e) => updateProfile("personalStatement", e.target.value)}
                          placeholder="Tell your story — your background, what drives you, challenges you've overcome, and where you're headed..."
                          rows={6}
                          className="input-field resize-none"
                        />
                      </div>
                      <div className="flex justify-between pt-1">
                        <button
                          type="button"
                          onClick={() => setOpenSection("activities")}
                          className="text-sm text-slate-500 hover:text-slate-700"
                        >
                          Back
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Submit */}
              <div className="mt-6">
                <button
                  type="submit"
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3.5 px-6 rounded-xl text-base transition-colors shadow-sm flex items-center justify-center gap-2"
                >
                  <Search className="w-4 h-4" />
                  Find My Scholarships
                </button>
                <p className="text-center text-xs text-white/60 mt-2">
                  Results are instant. No waiting.
                </p>
              </div>
            </form>
            </main>
          </div>
        </div>
      ) : (
        /* ─── RESULTS VIEW ─── */
        <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
          <div id="results">
            {/* Profile summary bar */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm px-5 py-4 mb-6 flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                  <span className="text-sm font-bold text-indigo-700">
                    {profile.firstName.charAt(0)}{profile.lastName.charAt(0)}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {profile.firstName} {profile.lastName}
                  </p>
                  <p className="text-xs text-slate-500">
                    {profile.studentType === "college"
                      ? (profile.currentCollege || "College Student")
                      : (profile.highSchool || "High School Student")}
                    {profile.gpa && ` · GPA ${profile.gpa}`}
                    {profile.intendedMajor && ` · ${profile.intendedMajor}`}
                  </p>
                </div>
              </div>
              <div className="ml-auto">
                <button
                  onClick={() => setSubmitted(false)}
                  className="text-sm font-medium text-indigo-600 hover:text-indigo-700 border border-indigo-200 hover:border-indigo-300 rounded-lg px-3 py-1.5 transition-colors"
                >
                  Edit Profile
                </button>
              </div>
            </div>

            {/* Lead opt-in */}
            <LeadOptIn profile={profile} matchedScholarships={matchedScholarships} />

            {/* Search + Filter bar */}
            <div className="flex items-center gap-3 mb-4 flex-wrap">
              <div className="relative flex-1 min-w-[220px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setShowSuggestions(true); }}
                  onFocus={() => setShowSuggestions(true)}
                  placeholder="Search by keyword (e.g., environment, nursing, leadership...)"
                  className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                />
                {searchQuery && (
                  <button onClick={() => { setSearchQuery(""); setShowSuggestions(false); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    <X className="w-4 h-4" />
                  </button>
                )}
                {/* Keyword suggestions dropdown */}
                {showSuggestions && filteredSuggestions.length > 0 && (
                  <div className="absolute z-30 mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-lg max-h-72 overflow-y-auto">
                    {filteredSuggestions.map((s) => {
                      const matchCount = matchedScholarships.filter((sch) =>
                        s.keywords.some((k) => searchScholarship(sch, k))
                      ).length;
                      return (
                        <button
                          key={s.label}
                          type="button"
                          onClick={() => {
                            setSearchQuery(s.keywords[0]);
                            setShowSuggestions(false);
                          }}
                          className="w-full text-left px-4 py-2.5 hover:bg-slate-50 border-b border-slate-100 last:border-0 flex items-center justify-between"
                        >
                          <span className="text-sm font-medium text-slate-700">{s.label}</span>
                          <span className="text-xs text-slate-400">{matchCount} scholarships</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-colors ${
                  showFilters || filters.categories.length > 0 || filters.majorSpecific
                    ? "bg-indigo-50 border-indigo-300 text-indigo-700"
                    : "bg-white border-slate-200 text-slate-700 hover:border-slate-300"
                }`}
              >
                <SlidersHorizontal className="w-4 h-4" />
                Filters
                {(filters.categories.length > 0 || filters.majorSpecific) && (
                  <span className="bg-indigo-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                    {filters.categories.length + (filters.majorSpecific ? 1 : 0)}
                  </span>
                )}
              </button>
            </div>

            {/* Filter panel */}
            {showFilters && (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 mb-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
                    <Filter className="w-4 h-4 text-indigo-500" />
                    Filter Scholarships
                  </h3>
                  {(filters.categories.length > 0 || filters.majorSpecific || filters.showExpired) && (
                    <button
                      onClick={() => setFilters({ schoolSpecific: false, majorSpecific: false, categories: [], minAmount: 0, maxAmount: 1000000, showExpired: false })}
                      className="text-xs text-slate-500 hover:text-slate-700"
                    >
                      Clear all
                    </button>
                  )}
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  <button
                    type="button"
                    onClick={() => setFilters((f) => ({ ...f, majorSpecific: !f.majorSpecific }))}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                      filters.majorSpecific
                        ? "bg-indigo-600 border-indigo-600 text-white"
                        : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                    }`}
                  >
                    Major-Specific Only
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilters((f) => ({ ...f, showExpired: !f.showExpired }))}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                      filters.showExpired
                        ? "bg-indigo-600 border-indigo-600 text-white"
                        : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                    }`}
                  >
                    Include Past Deadlines
                  </button>
                </div>

                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">Categories</p>
                <div className="flex flex-wrap gap-2">
                  {ALL_CATEGORIES.map(({ key, label }) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => toggleCategory(key)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                        filters.categories.includes(key)
                          ? "bg-indigo-600 border-indigo-600 text-white"
                          : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Results count + Full Roadmap CTA */}
            <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  {filteredScholarships.length} Scholarships Found
                </h2>
                <p className="text-sm text-slate-500">
                  Sorted by best match for your profile
                  {loadingScraped && " · Loading more scholarships..."}
                  {scrapedScholarships.length > 0 && ` · ${scrapedScholarships.length} additional from our database`}
                </p>
              </div>
              {matchedScholarships.length > 0 && (
                <button
                  onClick={() => setShowFullRoadmap(true)}
                  className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors shadow-sm flex-shrink-0"
                >
                  <MapPin className="w-4 h-4" />
                  View My Full Roadmap
                </button>
              )}
            </div>

            {/* Grid */}
            {paginatedScholarships.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {paginatedScholarships.map((scholarship) => (
                  <ScholarshipCard
                    key={scholarship.id}
                    scholarship={scholarship}
                    onClick={() => setSelectedScholarship(scholarship)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
                <GraduationCap className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-600 font-medium mb-1">No scholarships match the current filters</p>
                <p className="text-sm text-slate-400">Try adjusting your filters or search query</p>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <button
                  onClick={() => { setPage(Math.max(1, page - 1)); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                  disabled={page === 1}
                  className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      onClick={() => { setPage(p); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                      className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                        p === page
                          ? "bg-indigo-600 text-white"
                          : "text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => { setPage(Math.min(totalPages, page + 1)); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                  disabled={page === totalPages}
                  className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                  <ChevronRightIcon className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Affiliate resources */}
            {matchedScholarships.length > 0 && (
              <AffiliateResources scholarships={matchedScholarships} />
            )}
          </div>
        </main>
      )}

      <ScholarshipModal
        scholarship={selectedScholarship}
        profile={profile}
        onClose={() => setSelectedScholarship(null)}
      />

      {showFullRoadmap && (
        <FullRoadmap
          scholarships={matchedScholarships}
          profile={profile}
          onClose={() => setShowFullRoadmap(false)}
        />
      )}

      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}

      {/* Tracked scholarships panel */}
      {showTrackedView && user && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowTrackedView(false)} />
          <div className="relative w-full sm:max-w-lg h-[80vh] sm:h-auto sm:max-h-[80vh] bg-white sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-slideUp">
            <div className="px-6 pt-6 pb-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">My Scholarships</h2>
                <p className="text-sm text-slate-500">{tracked.length} scholarships tracked</p>
              </div>
              <button onClick={() => setShowTrackedView(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {tracked.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-8">
                  No scholarships tracked yet. Click on a scholarship and save or mark it as applied.
                </p>
              ) : (
                <div className="space-y-3">
                  {tracked.map((t) => {
                    const s = SCHOLARSHIPS.find((s) => s.id === t.scholarshipId);
                    if (!s) return null;
                    const statusColors: Record<string, string> = {
                      saved: "bg-blue-50 text-blue-700 border-blue-200",
                      applied: "bg-amber-50 text-amber-700 border-amber-200",
                      won: "bg-emerald-50 text-emerald-700 border-emerald-200",
                      rejected: "bg-slate-50 text-slate-500 border-slate-200",
                    };
                    const statusLabels: Record<string, string> = {
                      saved: "Saved",
                      applied: "Applied",
                      won: "Won",
                      rejected: "Not Selected",
                    };
                    return (
                      <button
                        key={t.scholarshipId}
                        onClick={() => { setSelectedScholarship(s); setShowTrackedView(false); }}
                        className="w-full text-left bg-white border border-slate-200 hover:border-indigo-300 rounded-xl p-4 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-sm font-semibold text-slate-800">{s.name}</p>
                            <p className="text-xs text-slate-500">{s.organization} &middot; {s.amount}</p>
                          </div>
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${statusColors[t.status]}`}>
                            {statusLabels[t.status]}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
