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

// Parse dollar amounts from text
function parseAmount(text: string): number {
  const match = text.replace(/,/g, "").match(/\$?([\d]+(?:,\d{3})*)/g);
  if (!match) return 1000;
  const amounts = match.map((m) => parseInt(m.replace(/[$,]/g, "")));
  return Math.max(...amounts);
}

// Categorize based on keywords in name/description
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

// Detect state from text
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
    if (lower.includes(key + " resident") || lower.includes(key + " student") || lower.includes("state of " + key)) {
      return val;
    }
  }
  return undefined;
}

// Source 1: Scholarships.com listings
async function scrapeScholarshipsCom(): Promise<ScrapedScholarship[]> {
  const results: ScrapedScholarship[] = [];
  const categories = [
    { url: "https://www.scholarships.com/financial-aid/college-scholarships/scholarship-directory/deadline/deadline-in-january", month: "January" },
    { url: "https://www.scholarships.com/financial-aid/college-scholarships/scholarship-directory/deadline/deadline-in-february", month: "February" },
    { url: "https://www.scholarships.com/financial-aid/college-scholarships/scholarship-directory/deadline/deadline-in-march", month: "March" },
    { url: "https://www.scholarships.com/financial-aid/college-scholarships/scholarship-directory/deadline/deadline-in-april", month: "April" },
    { url: "https://www.scholarships.com/financial-aid/college-scholarships/scholarship-directory/deadline/deadline-in-may", month: "May" },
    { url: "https://www.scholarships.com/financial-aid/college-scholarships/scholarship-directory/deadline/deadline-in-june", month: "June" },
  ];

  for (const cat of categories) {
    try {
      const res = await fetch(cat.url, {
        headers: { "User-Agent": "ScholarshipRoute/1.0 (Educational Tool)" },
      });
      if (!res.ok) continue;
      const html = await res.text();
      const $ = cheerio.load(html);

      $("a[href*='/financial-aid/college-scholarships/scholarship-directory/']").each((_, el) => {
        const name = $(el).text().trim();
        const href = $(el).attr("href") || "";
        if (!name || name.length < 5 || name.length > 120) return;
        if (href.includes("/deadline/")) return; // Skip category links

        const id = `scraped-sc-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 50)}`;
        if (results.find((r) => r.id === id)) return;

        results.push({
          id,
          name,
          organization: "Various",
          amount: "Varies",
          amountNumeric: 2500,
          deadline: cat.month,
          deadlineDate: `2026-${String(categories.indexOf(cat) + 1).padStart(2, "0")}-15`,
          description: `Scholarship listed on Scholarships.com with a ${cat.month} deadline. Visit the application page for full details and eligibility requirements.`,
          applicationUrl: href.startsWith("http") ? href : `https://www.scholarships.com${href}`,
          category: categorize(name, ""),
          eligibilityDescription: "Visit application page for full eligibility details.",
          source: "scholarships.com",
          scrapedAt: new Date().toISOString(),
          state: detectState(name),
        });
      });
    } catch (err) {
      console.error(`Error scraping ${cat.url}:`, err);
    }
  }
  return results;
}

// Source 2: Bold.org public scholarships
async function scrapeBoldOrg(): Promise<ScrapedScholarship[]> {
  const results: ScrapedScholarship[] = [];
  try {
    const res = await fetch("https://bold.org/scholarships/", {
      headers: { "User-Agent": "ScholarshipRoute/1.0 (Educational Tool)" },
    });
    if (!res.ok) return results;
    const html = await res.text();
    const $ = cheerio.load(html);

    $("a[href*='/scholarships/']").each((_, el) => {
      const name = $(el).text().trim();
      const href = $(el).attr("href") || "";
      if (!name || name.length < 5 || name.length > 120) return;
      if (href === "/scholarships/" || !href.includes("/scholarships/")) return;

      const amountText = $(el).parent().text();
      const amount = parseAmount(amountText);

      const id = `scraped-bold-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 50)}`;
      if (results.find((r) => r.id === id)) return;

      results.push({
        id,
        name,
        organization: "Bold.org",
        amount: amount > 0 ? `$${amount.toLocaleString()}` : "Varies",
        amountNumeric: amount || 2500,
        deadline: "Ongoing",
        deadlineDate: "2026-06-30",
        description: `Scholarship available on Bold.org. Visit the application page for full details, eligibility, and essay prompts.`,
        applicationUrl: href.startsWith("http") ? href : `https://bold.org${href}`,
        category: categorize(name, ""),
        eligibilityDescription: "Visit Bold.org for full eligibility details.",
        source: "bold.org",
        scrapedAt: new Date().toISOString(),
        state: detectState(name),
      });
    });
  } catch (err) {
    console.error("Error scraping Bold.org:", err);
  }
  return results;
}

// Source 3: Fastweb featured scholarships
async function scrapeFastweb(): Promise<ScrapedScholarship[]> {
  const results: ScrapedScholarship[] = [];
  try {
    const res = await fetch("https://www.fastweb.com/directory/scholarships", {
      headers: { "User-Agent": "ScholarshipRoute/1.0 (Educational Tool)" },
    });
    if (!res.ok) return results;
    const html = await res.text();
    const $ = cheerio.load(html);

    $("a").each((_, el) => {
      const name = $(el).text().trim();
      const href = $(el).attr("href") || "";
      if (!name || name.length < 8 || name.length > 120) return;
      if (!name.toLowerCase().includes("scholarship") && !name.toLowerCase().includes("award") && !name.toLowerCase().includes("grant") && !name.toLowerCase().includes("fellowship")) return;

      const id = `scraped-fw-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 50)}`;
      if (results.find((r) => r.id === id)) return;

      results.push({
        id,
        name,
        organization: "Various",
        amount: "Varies",
        amountNumeric: 2500,
        deadline: "Varies",
        deadlineDate: "2026-06-30",
        description: `Scholarship listed on Fastweb. Visit the application page for full details and eligibility.`,
        applicationUrl: href.startsWith("http") ? href : `https://www.fastweb.com${href}`,
        category: categorize(name, ""),
        eligibilityDescription: "Visit application page for details.",
        source: "fastweb.com",
        scrapedAt: new Date().toISOString(),
        state: detectState(name),
      });
    });
  } catch (err) {
    console.error("Error scraping Fastweb:", err);
  }
  return results;
}

export async function POST(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const password = searchParams.get("password");

  if (password !== ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const allResults: ScrapedScholarship[] = [];

  // Run all scrapers
  const [scholarshipsCom, bold, fastweb] = await Promise.allSettled([
    scrapeScholarshipsCom(),
    scrapeBoldOrg(),
    scrapeFastweb(),
  ]);

  if (scholarshipsCom.status === "fulfilled") allResults.push(...scholarshipsCom.value);
  if (bold.status === "fulfilled") allResults.push(...bold.value);
  if (fastweb.status === "fulfilled") allResults.push(...fastweb.value);

  // Deduplicate by name similarity
  const unique = allResults.filter((s, i, arr) =>
    arr.findIndex((x) => x.name.toLowerCase() === s.name.toLowerCase()) === i
  );

  // Save to Firestore
  let saved = 0;
  const scrapedRef = collection(db, "scraped_scholarships");

  for (const scholarship of unique) {
    try {
      // Check if already exists
      const existing = await getDocs(
        query(scrapedRef, where("name", "==", scholarship.name))
      );
      if (existing.empty) {
        await setDoc(doc(scrapedRef, scholarship.id), scholarship);
        saved++;
      }
    } catch (err) {
      console.error(`Error saving ${scholarship.name}:`, err);
    }
  }

  return NextResponse.json({
    success: true,
    total_found: unique.length,
    new_saved: saved,
    sources: {
      "scholarships.com": scholarshipsCom.status === "fulfilled" ? scholarshipsCom.value.length : 0,
      "bold.org": bold.status === "fulfilled" ? bold.value.length : 0,
      "fastweb.com": fastweb.status === "fulfilled" ? fastweb.value.length : 0,
    },
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
