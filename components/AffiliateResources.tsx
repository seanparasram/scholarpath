"use client";

import { useState } from "react";
import { ExternalLink, ChevronDown, ChevronUp } from "lucide-react";
import { Scholarship } from "@/lib/types";

interface Resource {
  name: string;
  description: string;
  tag: string;
  tagColor: string;
  url: string;
  relevantFor: string[]; // scholarship category keywords that trigger this resource
  callToAction: string;
}

const RESOURCES: Resource[] = [
  {
    name: "Princeton Review SAT/ACT Prep",
    description: "Score higher on the SAT or ACT with structured courses, practice tests, and tutoring. Many scholarships have minimum score requirements.",
    tag: "Test Prep",
    tagColor: "bg-blue-50 text-blue-700",
    url: "https://www.princetonreview.com/college/sat-act-prep?ExternalLinkTracker=ScholarPath",
    relevantFor: ["merit", "stem", "science", "national"],
    callToAction: "View Courses",
  },
  {
    name: "Khan Academy SAT Prep",
    description: "Free, personalized SAT practice built with College Board. Links directly to your PSAT results to focus your studying.",
    tag: "Free · Test Prep",
    tagColor: "bg-green-50 text-green-700",
    url: "https://www.khanacademy.org/sat",
    relevantFor: ["merit", "national", "need-based"],
    callToAction: "Practice Free",
  },
  {
    name: "Kaplan Test Prep",
    description: "Higher score guaranteed or your money back. Offers SAT, ACT, AP, and subject test prep with live and on-demand options.",
    tag: "Test Prep",
    tagColor: "bg-blue-50 text-blue-700",
    url: "https://www.kaptest.com/sat?utm_source=scholarpath&utm_medium=referral",
    relevantFor: ["merit", "stem", "science"],
    callToAction: "View Plans",
  },
  {
    name: "College Essay Guy",
    description: "Top-rated college essay coaching platform. Free resources and paid workshops to help you write essays that stand out to scholarship committees.",
    tag: "Essay Help",
    tagColor: "bg-purple-50 text-purple-700",
    url: "https://www.collegeessayguy.com?ref=scholarpath",
    relevantFor: ["leadership", "community-service", "merit", "national"],
    callToAction: "Explore Resources",
  },
  {
    name: "Grammarly Premium",
    description: "Polish every scholarship essay with AI-powered grammar, clarity, and tone suggestions. Catches errors that cost you points.",
    tag: "Writing",
    tagColor: "bg-violet-50 text-violet-700",
    url: "https://www.grammarly.com?affiliateID=scholarpath",
    relevantFor: ["merit", "humanities", "arts", "leadership", "community-service"],
    callToAction: "Try Free",
  },
  {
    name: "Coursera — Free Certificates",
    description: "Add credible certifications to your profile from top universities. Data Science, Business, and CS courses can strengthen major-specific applications.",
    tag: "Skills",
    tagColor: "bg-orange-50 text-orange-700",
    url: "https://www.coursera.org/courses?query=free+certificate&ref=scholarpath",
    relevantFor: ["stem", "business", "science", "education"],
    callToAction: "Browse Free Courses",
  },
  {
    name: "Chegg Scholarships",
    description: "Search 25,000+ scholarships and get matched daily. Good companion tool alongside ScholarPath for expanding your search.",
    tag: "Scholarship Search",
    tagColor: "bg-yellow-50 text-yellow-700",
    url: "https://www.chegg.com/scholarships?ref=scholarpath",
    relevantFor: ["need-based", "first-generation", "ethnicity-specific"],
    callToAction: "Search Scholarships",
  },
  {
    name: "FAFSA Guide — Federal Student Aid",
    description: "File your FAFSA as early as possible. Most need-based scholarships and state grants require it. Opens October 1 each year.",
    tag: "Free · Financial Aid",
    tagColor: "bg-green-50 text-green-700",
    url: "https://studentaid.gov/h/apply-for-aid/fafsa",
    relevantFor: ["need-based", "first-generation", "state-specific"],
    callToAction: "File FAFSA",
  },
  {
    name: "Wyzant Tutoring",
    description: "Find a local or online tutor for any subject. Raising your GPA even 0.2 points can unlock scholarships with minimum GPA requirements.",
    tag: "Academics",
    tagColor: "bg-pink-50 text-pink-700",
    url: "https://www.wyzant.com?ref=scholarpath",
    relevantFor: ["merit", "stem", "science", "health"],
    callToAction: "Find a Tutor",
  },
];

interface Props {
  scholarships: Scholarship[];
}

export default function AffiliateResources({ scholarships }: Props) {
  const [expanded, setExpanded] = useState(false);

  // Pick resources relevant to the student's matched scholarships
  const relevantCategories = new Set(scholarships.flatMap((s) => s.category));

  const relevant = RESOURCES.filter((r) =>
    r.relevantFor.some((tag) => relevantCategories.has(tag as never))
  );

  const toShow = expanded ? relevant : relevant.slice(0, 4);

  if (relevant.length === 0) return null;

  return (
    <div className="mt-10">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            Tools to Strengthen Your Application
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Resources matched to the scholarships you are pursuing
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {toShow.map((resource) => (
          <a
            key={resource.name}
            href={resource.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group bg-white border border-slate-200 hover:border-indigo-300 hover:shadow-md rounded-2xl p-4 flex flex-col gap-2.5 transition-all duration-200"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${resource.tagColor}`}>
                  {resource.tag}
                </span>
                <h3 className="text-sm font-semibold text-slate-800 mt-1.5 group-hover:text-indigo-700 transition-colors">
                  {resource.name}
                </h3>
              </div>
              <ExternalLink className="w-4 h-4 text-slate-300 group-hover:text-indigo-400 transition-colors flex-shrink-0 mt-1" />
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">{resource.description}</p>
            <div className="mt-auto">
              <span className="text-xs font-semibold text-indigo-600 group-hover:text-indigo-700">
                {resource.callToAction} →
              </span>
            </div>
          </a>
        ))}
      </div>

      {relevant.length > 4 && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-3 w-full text-sm text-slate-500 hover:text-slate-700 flex items-center justify-center gap-1.5 py-2"
        >
          {expanded ? (
            <>Show less <ChevronUp className="w-4 h-4" /></>
          ) : (
            <>Show {relevant.length - 4} more resources <ChevronDown className="w-4 h-4" /></>
          )}
        </button>
      )}

      <p className="text-xs text-slate-400 text-center mt-3">
        Some links above are affiliate links. ScholarPath may earn a commission at no cost to you.
      </p>
    </div>
  );
}
