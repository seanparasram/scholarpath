import { NextRequest, NextResponse } from "next/server";
import * as cheerio from "cheerio";
import { db } from "@/lib/firebase";
import { collection, doc, setDoc, getDocs, query, where } from "firebase/firestore";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "scholarpath-admin";

interface ScrapedScholarship {
  id: string;
  name: string;
  organization: string;
  amount: string;
  amountNumeric: number;
  deadline: string;
  deadlineDate: string;
  description: string;
  applicationUrl: string;
  category: string[];
  eligibilityDescription: string;
  source: string;
  scrapedAt: string;
  state?: string;
}

function parseAmount(text: string): number {
  const match = text.replace(/,/g, "").match(/\$?([\d]+(?:,\d{3})*)/g);
  if (!match) return 1000;
  const amounts = match.map((m) => parseInt(m.replace(/[$,]/g, "")));
  return Math.max(...amounts);
}

function categorize(name: string, desc: string): string[] {
  const text = `${name} ${desc}`.toLowerCase();
  const cats: string[] = ["national"];
  if (/stem|science|math|engineering|tech|computer|physics|chemistry|biology/i.test(text)) cats.push("stem");
  if (/nurs|health|medic|pharma|dental/i.test(text)) cats.push("health");
  if (/business|entrepreneur|financ|account|market/i.test(text)) cats.push("business");
  if (/art|music|creative|writ|film|photo|design/i.test(text)) cats.push("arts");
  if (/leader/i.test(text)) cats.push("leadership");
  if (/communit|service|volunteer/i.test(text)) cats.push("community-service");
  if (/first.gen|first.in.famil/i.test(text)) cats.push("first-generation");
  if (/need.based|financial.need|low.income/i.test(text)) cats.push("need-based");
  if (/merit|academ|gpa|honor/i.test(text)) cats.push("merit");
  if (/environ|sustainab|eco|climate|conservation/i.test(text)) cats.push("science");
  if (/law|legal|justice/i.test(text)) cats.push("law");
  if (/education|teach/i.test(text)) cats.push("education");
  if (/african.american|black|hispanic|latino|asian|native|minority|diverse/i.test(text)) cats.push("ethnicity-specific");
  if (/women|female/i.test(text)) cats.push("ethnicity-specific");
  if (/athlet|sport/i.test(text)) cats.push("athletics");
  if (/military|rotc|veteran/i.test(text)) cats.push("military");
  if (/humanit|english|histor|philos/i.test(text)) cats.push("humanities");
  return [...new Set(cats)];
}

function detectState(text: string): string | undefined {
  const states: Record<string, string> = {
    "alabama": "Alabama", "alaska": "Alaska", "arizona": "Arizona", "arkansas": "Arkansas",
    "california": "California", "colorado": "Colorado", "connecticut": "Connecticut", "delaware": "Delaware",
    "florida": "Florida", "georgia": "Georgia", "hawaii": "Hawaii", "idaho": "Idaho",
    "illinois": "Illinois", "indiana": "Indiana", "iowa": "Iowa", "kansas": "Kansas",
    "kentucky": "Kentucky", "louisiana": "Louisiana", "maine": "Maine", "maryland": "Maryland",
    "massachusetts": "Massachusetts", "michigan": "Michigan", "minnesota": "Minnesota",
    "mississippi": "Mississippi", "missouri": "Missouri", "montana": "Montana", "nebraska": "Nebraska",
    "nevada": "Nevada", "new hampshire": "New Hampshire", "new jersey": "New Jersey",
    "new mexico": "New Mexico", "new york": "New York", "north carolina": "North Carolina",
    "north dakota": "North Dakota", "ohio": "Ohio", "oklahoma": "Oklahoma", "oregon": "Oregon",
    "pennsylvania": "Pennsylvania", "rhode island": "Rhode Island", "south carolina": "South Carolina",
    "south dakota": "South Dakota", "tennessee": "Tennessee", "texas": "Texas", "utah": "Utah",
    "vermont": "Vermont", "virginia": "Virginia", "washington": "Washington",
    "west virginia": "West Virginia", "wisconsin": "Wisconsin", "wyoming": "Wyoming",
  };
  const lower = text.toLowerCase();
  for (const [key, val] of Object.entries(states)) {
    if (lower.includes(key)) return val;
  }
  return undefined;
}

async function fetchPage(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  }
}

function extractScholarships(html: string, source: string, baseUrl: string, defaults: Partial<ScrapedScholarship> = {}): ScrapedScholarship[] {
  const results: ScrapedScholarship[] = [];
  const $ = cheerio.load(html);

  $("a").each((_, el) => {
    const name = $(el).text().trim().replace(/\s+/g, " ");
    const href = $(el).attr("href") || "";
    if (!name || name.length < 8 || name.length > 140) return;

    // Must look like a scholarship name
    const nameLower = name.toLowerCase();
    const isScholarship = nameLower.includes("scholarship") || nameLower.includes("award") ||
      nameLower.includes("grant") || nameLower.includes("fellowship") || nameLower.includes("fund") ||
      nameLower.includes("prize") || nameLower.includes("program");
    if (!isScholarship) return;

    // Skip navigation links
    if (/view all|see more|browse|search|find|sign up|log in|how to|best scholarships|top \d/i.test(nameLower)) return;

    const id = `scraped-${source.replace(/\./g, "")}-${nameLower.replace(/[^a-z0-9]+/g, "-").slice(0, 60)}`;
    if (results.find((r) => r.id === id)) return;

    const parentText = $(el).parent().text() || "";
    const detectedAmount = parseAmount(parentText);
    const fullUrl = href.startsWith("http") ? href : `${baseUrl}${href.startsWith("/") ? "" : "/"}${href}`;

    results.push({
      id,
      name,
      organization: defaults.organization || "Various",
      amount: detectedAmount > 100 ? `$${detectedAmount.toLocaleString()}` : "Varies",
      amountNumeric: detectedAmount > 100 ? detectedAmount : 2500,
      deadline: defaults.deadline || "Varies",
      deadlineDate: defaults.deadlineDate || "2026-06-30",
      description: `Scholarship found on ${source}. Visit the application page for full details, eligibility, and deadlines.`,
      applicationUrl: fullUrl,
      category: categorize(name, parentText),
      eligibilityDescription: "Visit application page for full eligibility details.",
      source,
      scrapedAt: new Date().toISOString(),
      state: detectState(name + " " + parentText),
      ...defaults,
    });
  });
  return results;
}

// Individual source scrapers — each designed to run within ~8 seconds

async function scrapeScholarshipsCom(): Promise<ScrapedScholarship[]> {
  const results: ScrapedScholarship[] = [];
  const months = ["january","february","march","april","may","june","july","august","september","october","november","december"];

  // Fetch 4 month pages in parallel (quick)
  const batch1 = await Promise.all(
    months.slice(0, 4).map((m) =>
      fetchPage(`https://www.scholarships.com/financial-aid/college-scholarships/scholarship-directory/deadline/deadline-in-${m}`)
    )
  );
  const batch2 = await Promise.all(
    months.slice(4, 8).map((m) =>
      fetchPage(`https://www.scholarships.com/financial-aid/college-scholarships/scholarship-directory/deadline/deadline-in-${m}`)
    )
  );

  [...batch1, ...batch2].forEach((html, i) => {
    if (!html) return;
    const month = months[i];
    const monthNum = i + 1;
    results.push(...extractScholarships(html, "scholarships.com", "https://www.scholarships.com", {
      deadline: month.charAt(0).toUpperCase() + month.slice(1),
      deadlineDate: (() => {
        const now = new Date();
        const year = monthNum > now.getMonth() + 1 ? now.getFullYear() : now.getFullYear() + 1;
        return `${year}-${String(monthNum).padStart(2, "0")}-15`;
      })(),
    }));
  });

  return results;
}

async function scrapeScholarshipsComMajors(): Promise<ScrapedScholarship[]> {
  const results: ScrapedScholarship[] = [];
  const majors = [
    "engineering", "computer-science", "business", "nursing", "biology", "education",
    "environmental-science", "psychology", "communications", "art", "music", "mathematics",
    "political-science", "chemistry", "physics", "english", "pre-med", "pre-law",
    "criminal-justice", "finance", "social-work",
  ];

  for (let i = 0; i < majors.length; i += 4) {
    const batch = majors.slice(i, i + 4);
    const htmls = await Promise.all(
      batch.map((m) =>
        fetchPage(`https://www.scholarships.com/financial-aid/college-scholarships/scholarship-directory/academic-major/${m}`)
      )
    );
    htmls.forEach((html) => {
      if (html) results.push(...extractScholarships(html, "scholarships.com", "https://www.scholarships.com"));
    });
  }
  return results;
}

async function scrapeScholarshipsComStates(): Promise<ScrapedScholarship[]> {
  const results: ScrapedScholarship[] = [];
  const states = [
    "alabama","alaska","arizona","arkansas","california","colorado","connecticut","delaware",
    "florida","georgia","hawaii","idaho","illinois","indiana","iowa","kansas","kentucky",
    "louisiana","maine","maryland","massachusetts","michigan","minnesota","mississippi",
    "missouri","montana","nebraska","nevada","new-hampshire","new-jersey","new-mexico",
    "new-york","north-carolina","north-dakota","ohio","oklahoma","oregon","pennsylvania",
    "rhode-island","south-carolina","south-dakota","tennessee","texas","utah","vermont",
    "virginia","washington","west-virginia","wisconsin","wyoming",
  ];

  // Process 6 states at a time
  for (let i = 0; i < states.length; i += 6) {
    const batch = states.slice(i, i + 6);
    const htmls = await Promise.all(
      batch.map((s) =>
        fetchPage(`https://www.scholarships.com/financial-aid/college-scholarships/scholarship-directory/state/${s}`)
      )
    );
    htmls.forEach((html) => {
      if (html) results.push(...extractScholarships(html, "scholarships.com", "https://www.scholarships.com"));
    });
  }
  return results;
}

async function scrapeBoldOrg(): Promise<ScrapedScholarship[]> {
  const results: ScrapedScholarship[] = [];
  const pages = [
    "https://bold.org/scholarships/",
    "https://bold.org/scholarships/?page=2",
    "https://bold.org/scholarships/?page=3",
    "https://bold.org/scholarships/?page=4",
    "https://bold.org/scholarships/?page=5",
    "https://bold.org/scholarships/no-essay/",
  ];

  const htmls = await Promise.all(pages.map(fetchPage));
  htmls.forEach((html) => {
    if (html) results.push(...extractScholarships(html, "bold.org", "https://bold.org", { organization: "Bold.org" }));
  });
  return results;
}

async function scrapeScholarships360(): Promise<ScrapedScholarship[]> {
  const results: ScrapedScholarship[] = [];
  const pages = [
    "https://scholarships360.org/scholarships/",
    "https://scholarships360.org/scholarships/no-essay-scholarships/",
    "https://scholarships360.org/scholarships/scholarships-for-high-school-seniors/",
    "https://scholarships360.org/scholarships/scholarships-for-college-students/",
    "https://scholarships360.org/scholarships/stem-scholarships/",
    "https://scholarships360.org/scholarships/nursing-scholarships/",
    "https://scholarships360.org/scholarships/environmental-scholarships/",
    "https://scholarships360.org/scholarships/scholarships-for-women/",
    "https://scholarships360.org/scholarships/first-generation-college-student-scholarships/",
    "https://scholarships360.org/scholarships/community-service-scholarships/",
    "https://scholarships360.org/scholarships/full-ride-scholarships/",
    "https://scholarships360.org/scholarships/computer-science-scholarships/",
  ];

  for (let i = 0; i < pages.length; i += 3) {
    const batch = pages.slice(i, i + 3);
    const htmls = await Promise.all(batch.map(fetchPage));
    htmls.forEach((html) => {
      if (html) results.push(...extractScholarships(html, "scholarships360.org", "https://scholarships360.org"));
    });
  }
  return results;
}

async function saveResults(results: ScrapedScholarship[]): Promise<{ saved: number; total: number }> {
  const unique = results.filter((s, i, arr) =>
    arr.findIndex((x) => x.name.toLowerCase().trim() === s.name.toLowerCase().trim()) === i
  );

  let saved = 0;
  const scrapedRef = collection(db, "scraped_scholarships");

  for (const scholarship of unique) {
    try {
      const existing = await getDocs(query(scrapedRef, where("name", "==", scholarship.name)));
      if (existing.empty) {
        await setDoc(doc(scrapedRef, scholarship.id), scholarship);
        saved++;
      }
    } catch {
      // Skip individual save errors
    }
  }
  return { saved, total: unique.length };
}

// POST: Run a specific scraper source (or all sequentially)
export async function POST(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const password = searchParams.get("password");
  const source = searchParams.get("source") || "all";

  if (password !== ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let results: ScrapedScholarship[] = [];
  let sourceName = source;

  try {
    switch (source) {
      case "scholarships-deadlines":
        sourceName = "Scholarships.com (Deadlines)";
        results = await scrapeScholarshipsCom();
        break;
      case "scholarships-majors":
        sourceName = "Scholarships.com (Majors)";
        results = await scrapeScholarshipsComMajors();
        break;
      case "scholarships-states":
        sourceName = "Scholarships.com (States)";
        results = await scrapeScholarshipsComStates();
        break;
      case "bold":
        sourceName = "Bold.org";
        results = await scrapeBoldOrg();
        break;
      case "scholarships360":
        sourceName = "Scholarships360";
        results = await scrapeScholarships360();
        break;
      default:
        // Run one quick source as default
        sourceName = "Scholarships.com (Deadlines)";
        results = await scrapeScholarshipsCom();
    }
  } catch (err) {
    return NextResponse.json({
      success: false,
      error: `Scraper failed: ${err instanceof Error ? err.message : "Unknown error"}`,
      source: sourceName,
    });
  }

  const { saved, total } = await saveResults(results);

  return NextResponse.json({
    success: true,
    source: sourceName,
    total_found: total,
    new_saved: saved,
    already_existed: total - saved,
  });
}

// GET: Return all scraped scholarships from Firestore
export async function GET() {
  try {
    const scrapedRef = collection(db, "scraped_scholarships");
    const snapshot = await getDocs(scrapedRef);
    const scholarships = snapshot.docs.map((d) => d.data());
    return NextResponse.json({ total: scholarships.length, scholarships });
  } catch (err) {
    console.error("Error reading scraped scholarships:", err);
    return NextResponse.json({ total: 0, scholarships: [] });
  }
}
