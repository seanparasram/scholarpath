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
    });
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  }
}

// Source 1: Scholarships.com — all 12 months + major categories + state pages
async function scrapeScholarshipsCom(): Promise<ScrapedScholarship[]> {
  const results: ScrapedScholarship[] = [];
  const pages = [
    // All 12 months
    ...["january","february","march","april","may","june","july","august","september","october","november","december"].map((m, i) => ({
      url: `https://www.scholarships.com/financial-aid/college-scholarships/scholarship-directory/deadline/deadline-in-${m}`,
      month: m.charAt(0).toUpperCase() + m.slice(1),
      monthNum: i + 1,
    })),
  ];

  // Major-specific pages
  const majorPages = [
    "academic-major/engineering", "academic-major/computer-science", "academic-major/business",
    "academic-major/nursing", "academic-major/biology", "academic-major/education",
    "academic-major/environmental-science", "academic-major/psychology", "academic-major/communications",
    "academic-major/art", "academic-major/music", "academic-major/mathematics",
    "academic-major/political-science", "academic-major/chemistry", "academic-major/physics",
    "academic-major/english", "academic-major/history", "academic-major/sociology",
    "academic-major/criminal-justice", "academic-major/economics", "academic-major/journalism",
    "academic-major/pre-med", "academic-major/pre-law", "academic-major/agriculture",
    "academic-major/architecture", "academic-major/finance", "academic-major/marketing",
    "academic-major/social-work", "academic-major/theater",
  ];

  // Ethnicity/background pages
  const backgroundPages = [
    "ethnicity/african-american", "ethnicity/hispanic", "ethnicity/asian",
    "ethnicity/native-american", "gender/female", "special-attributes/first-generation-college-students",
    "special-attributes/community-service", "special-attributes/leadership",
    "special-attributes/military", "special-attributes/disabilities",
    "special-attributes/lgbtq",
  ];

  // State pages
  const statePages = [
    "alabama","alaska","arizona","arkansas","california","colorado","connecticut","delaware",
    "florida","georgia","hawaii","idaho","illinois","indiana","iowa","kansas","kentucky",
    "louisiana","maine","maryland","massachusetts","michigan","minnesota","mississippi",
    "missouri","montana","nebraska","nevada","new-hampshire","new-jersey","new-mexico",
    "new-york","north-carolina","north-dakota","ohio","oklahoma","oregon","pennsylvania",
    "rhode-island","south-carolina","south-dakota","tennessee","texas","utah","vermont",
    "virginia","washington","west-virginia","wisconsin","wyoming",
  ].map((s) => `state/${s}`);

  const allUrls = [
    ...pages.map((p) => ({ url: p.url, month: p.month, monthNum: p.monthNum })),
    ...majorPages.map((p) => ({ url: `https://www.scholarships.com/financial-aid/college-scholarships/scholarship-directory/${p}`, month: "Varies", monthNum: 6 })),
    ...backgroundPages.map((p) => ({ url: `https://www.scholarships.com/financial-aid/college-scholarships/scholarship-directory/${p}`, month: "Varies", monthNum: 6 })),
    ...statePages.map((p) => ({ url: `https://www.scholarships.com/financial-aid/college-scholarships/scholarship-directory/${p}`, month: "Varies", monthNum: 6 })),
  ];

  // Process in batches of 5 to avoid overwhelming the server
  for (let i = 0; i < allUrls.length; i += 5) {
    const batch = allUrls.slice(i, i + 5);
    const htmls = await Promise.all(batch.map((b) => fetchPage(b.url)));

    htmls.forEach((html, idx) => {
      if (!html) return;
      const cat = batch[idx];
      const $ = cheerio.load(html);

      $("a").each((_, el) => {
        const name = $(el).text().trim();
        const href = $(el).attr("href") || "";
        if (!name || name.length < 8 || name.length > 150) return;
        if (!href.includes("/scholarship-directory/") && !href.includes("/scholarships/")) return;
        if (href.includes("/deadline/") || href.includes("/academic-major/") || href.includes("/ethnicity/") || href.includes("/state/") || href.includes("/gender/") || href.includes("/special-attributes/")) return;
        if (name.toLowerCase().includes("view all") || name.toLowerCase().includes("see more") || name.toLowerCase().includes("browse")) return;

        const id = `scraped-sc-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 60)}`;
        if (results.find((r) => r.id === id)) return;

        const stateFromUrl = cat.url.includes("/state/") ? detectState(cat.url.replace(/-/g, " ")) : detectState(name);

        results.push({
          id,
          name,
          organization: "Various",
          amount: "Varies",
          amountNumeric: 2500,
          deadline: cat.month,
          deadlineDate: `2026-${String(cat.monthNum).padStart(2, "0")}-15`,
          description: `Scholarship listed on Scholarships.com. Visit the application page for full details, eligibility, and deadlines.`,
          applicationUrl: href.startsWith("http") ? href : `https://www.scholarships.com${href}`,
          category: categorize(name, cat.url),
          eligibilityDescription: "Visit application page for full eligibility details.",
          source: "scholarships.com",
          scrapedAt: new Date().toISOString(),
          state: stateFromUrl,
        });
      });
    });
  }
  return results;
}

// Source 2: Bold.org — multiple pages
async function scrapeBoldOrg(): Promise<ScrapedScholarship[]> {
  const results: ScrapedScholarship[] = [];
  const pages = [
    "https://bold.org/scholarships/",
    "https://bold.org/scholarships/?page=2",
    "https://bold.org/scholarships/?page=3",
    "https://bold.org/scholarships/?page=4",
    "https://bold.org/scholarships/?page=5",
    "https://bold.org/scholarships/by-major/",
    "https://bold.org/scholarships/by-state/",
    "https://bold.org/scholarships/no-essay/",
  ];

  for (const pageUrl of pages) {
    const html = await fetchPage(pageUrl);
    if (!html) continue;
    const $ = cheerio.load(html);

    $("a[href*='/scholarships/']").each((_, el) => {
      const name = $(el).text().trim();
      const href = $(el).attr("href") || "";
      if (!name || name.length < 5 || name.length > 120) return;
      if (href === "/scholarships/" || href.includes("?page") || href.includes("/by-")) return;
      if (name.toLowerCase().includes("view all") || name.toLowerCase().includes("see all") || name.toLowerCase() === "scholarships") return;

      const amountText = $(el).closest("div").text();
      const amount = parseAmount(amountText);

      const id = `scraped-bold-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 60)}`;
      if (results.find((r) => r.id === id)) return;

      results.push({
        id,
        name,
        organization: "Bold.org",
        amount: amount > 100 ? `$${amount.toLocaleString()}` : "Varies",
        amountNumeric: amount > 100 ? amount : 2500,
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
  }
  return results;
}

// Source 3: Scholarships360
async function scrapeScholarships360(): Promise<ScrapedScholarship[]> {
  const results: ScrapedScholarship[] = [];
  const pages = [
    "https://scholarships360.org/scholarships/",
    "https://scholarships360.org/scholarships/no-essay-scholarships/",
    "https://scholarships360.org/scholarships/easy-scholarships/",
    "https://scholarships360.org/scholarships/scholarships-for-high-school-seniors/",
    "https://scholarships360.org/scholarships/scholarships-for-college-students/",
    "https://scholarships360.org/scholarships/stem-scholarships/",
    "https://scholarships360.org/scholarships/nursing-scholarships/",
    "https://scholarships360.org/scholarships/engineering-scholarships/",
    "https://scholarships360.org/scholarships/business-scholarships/",
    "https://scholarships360.org/scholarships/scholarships-for-women/",
    "https://scholarships360.org/scholarships/scholarships-for-african-americans/",
    "https://scholarships360.org/scholarships/scholarships-for-hispanics/",
    "https://scholarships360.org/scholarships/first-generation-college-student-scholarships/",
    "https://scholarships360.org/scholarships/community-service-scholarships/",
    "https://scholarships360.org/scholarships/environmental-scholarships/",
    "https://scholarships360.org/scholarships/art-scholarships/",
    "https://scholarships360.org/scholarships/music-scholarships/",
    "https://scholarships360.org/scholarships/full-ride-scholarships/",
    "https://scholarships360.org/scholarships/computer-science-scholarships/",
    "https://scholarships360.org/scholarships/psychology-scholarships/",
  ];

  for (let i = 0; i < pages.length; i += 3) {
    const batch = pages.slice(i, i + 3);
    const htmls = await Promise.all(batch.map(fetchPage));

    htmls.forEach((html) => {
      if (!html) return;
      const $ = cheerio.load(html);

      $("a").each((_, el) => {
        const name = $(el).text().trim();
        const href = $(el).attr("href") || "";
        if (!name || name.length < 10 || name.length > 120) return;
        if (!name.toLowerCase().includes("scholarship") && !name.toLowerCase().includes("award") && !name.toLowerCase().includes("grant") && !name.toLowerCase().includes("fellowship") && !name.toLowerCase().includes("program")) return;
        if (name.toLowerCase().includes("best scholarships") || name.toLowerCase().includes("top scholarships") || name.toLowerCase().includes("how to")) return;

        const id = `scraped-s360-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 60)}`;
        if (results.find((r) => r.id === id)) return;

        const parentText = $(el).parent().text().toLowerCase();
        const detectedAmount = parseAmount(parentText);

        results.push({
          id,
          name,
          organization: "Various",
          amount: detectedAmount > 100 ? `$${detectedAmount.toLocaleString()}` : "Varies",
          amountNumeric: detectedAmount > 100 ? detectedAmount : 2500,
          deadline: "Varies",
          deadlineDate: "2026-06-30",
          description: `Scholarship featured on Scholarships360. Visit the application page for complete details and eligibility.`,
          applicationUrl: href.startsWith("http") ? href : `https://scholarships360.org${href}`,
          category: categorize(name, parentText),
          eligibilityDescription: "Visit application page for full details.",
          source: "scholarships360.org",
          scrapedAt: new Date().toISOString(),
          state: detectState(name),
        });
      });
    });
  }
  return results;
}

// Source 4: Chegg scholarships
async function scrapeChegg(): Promise<ScrapedScholarship[]> {
  const results: ScrapedScholarship[] = [];
  const pages = [
    "https://www.chegg.com/scholarships",
    "https://www.chegg.com/scholarships/stem",
    "https://www.chegg.com/scholarships/business",
    "https://www.chegg.com/scholarships/arts",
    "https://www.chegg.com/scholarships/education",
    "https://www.chegg.com/scholarships/health",
  ];

  for (const pageUrl of pages) {
    const html = await fetchPage(pageUrl);
    if (!html) continue;
    const $ = cheerio.load(html);

    $("a").each((_, el) => {
      const name = $(el).text().trim();
      const href = $(el).attr("href") || "";
      if (!name || name.length < 8 || name.length > 120) return;
      if (!name.toLowerCase().includes("scholarship") && !name.toLowerCase().includes("award") && !name.toLowerCase().includes("grant")) return;
      if (name.toLowerCase().includes("search") || name.toLowerCase().includes("find") || name.toLowerCase().includes("browse")) return;

      const id = `scraped-chegg-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 60)}`;
      if (results.find((r) => r.id === id)) return;

      results.push({
        id,
        name,
        organization: "Various",
        amount: "Varies",
        amountNumeric: 2500,
        deadline: "Varies",
        deadlineDate: "2026-06-30",
        description: `Scholarship listed on Chegg. Visit the application page for complete details.`,
        applicationUrl: href.startsWith("http") ? href : `https://www.chegg.com${href}`,
        category: categorize(name, pageUrl),
        eligibilityDescription: "Visit application page for details.",
        source: "chegg.com",
        scrapedAt: new Date().toISOString(),
        state: detectState(name),
      });
    });
  }
  return results;
}

// Source 5: Cappex / Appily
async function scrapeCappex(): Promise<ScrapedScholarship[]> {
  const results: ScrapedScholarship[] = [];
  const pages = [
    "https://www.appily.com/scholarships",
    "https://www.appily.com/scholarships/no-essay",
    "https://www.appily.com/scholarships/easy",
  ];

  for (const pageUrl of pages) {
    const html = await fetchPage(pageUrl);
    if (!html) continue;
    const $ = cheerio.load(html);

    $("a").each((_, el) => {
      const name = $(el).text().trim();
      const href = $(el).attr("href") || "";
      if (!name || name.length < 8 || name.length > 120) return;
      if (!name.toLowerCase().includes("scholarship") && !name.toLowerCase().includes("award") && !name.toLowerCase().includes("grant")) return;

      const id = `scraped-appily-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 60)}`;
      if (results.find((r) => r.id === id)) return;

      results.push({
        id,
        name,
        organization: "Various",
        amount: "Varies",
        amountNumeric: 2500,
        deadline: "Varies",
        deadlineDate: "2026-06-30",
        description: `Scholarship listed on Appily. Visit the application page for full details.`,
        applicationUrl: href.startsWith("http") ? href : `https://www.appily.com${href}`,
        category: categorize(name, ""),
        eligibilityDescription: "Visit application page for details.",
        source: "appily.com",
        scrapedAt: new Date().toISOString(),
        state: detectState(name),
      });
    });
  }
  return results;
}

// Source 6: CollegeBoard BigFuture
async function scrapeCollegeBoard(): Promise<ScrapedScholarship[]> {
  const results: ScrapedScholarship[] = [];
  const html = await fetchPage("https://bigfuture.collegeboard.org/scholarship-search");
  if (!html) return results;
  const $ = cheerio.load(html);

  $("a").each((_, el) => {
    const name = $(el).text().trim();
    const href = $(el).attr("href") || "";
    if (!name || name.length < 8 || name.length > 120) return;
    if (!name.toLowerCase().includes("scholarship") && !name.toLowerCase().includes("award") && !name.toLowerCase().includes("grant") && !name.toLowerCase().includes("fund")) return;

    const id = `scraped-cb-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 60)}`;
    if (results.find((r) => r.id === id)) return;

    results.push({
      id,
      name,
      organization: "Various",
      amount: "Varies",
      amountNumeric: 2500,
      deadline: "Varies",
      deadlineDate: "2026-06-30",
      description: `Scholarship from College Board BigFuture. Visit the application page for full details.`,
      applicationUrl: href.startsWith("http") ? href : `https://bigfuture.collegeboard.org${href}`,
      category: categorize(name, ""),
      eligibilityDescription: "Visit application page for details.",
      source: "collegeboard.org",
      scrapedAt: new Date().toISOString(),
      state: detectState(name),
    });
  });
  return results;
}

export async function POST(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const password = searchParams.get("password");

  if (password !== ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const allResults: ScrapedScholarship[] = [];

  // Run all scrapers in parallel groups
  const [scholarshipsCom, bold, s360, chegg, cappex, cb] = await Promise.allSettled([
    scrapeScholarshipsCom(),
    scrapeBoldOrg(),
    scrapeScholarships360(),
    scrapeChegg(),
    scrapeCappex(),
    scrapeCollegeBoard(),
  ]);

  const sources: Record<string, number> = {};
  const scrapers = [
    { name: "scholarships.com", result: scholarshipsCom },
    { name: "bold.org", result: bold },
    { name: "scholarships360.org", result: s360 },
    { name: "chegg.com", result: chegg },
    { name: "appily.com", result: cappex },
    { name: "collegeboard.org", result: cb },
  ];

  for (const s of scrapers) {
    if (s.result.status === "fulfilled") {
      allResults.push(...s.result.value);
      sources[s.name] = s.result.value.length;
    } else {
      sources[s.name] = 0;
    }
  }

  // Deduplicate by name similarity
  const unique = allResults.filter((s, i, arr) =>
    arr.findIndex((x) => x.name.toLowerCase().trim() === s.name.toLowerCase().trim()) === i
  );

  // Save to Firestore in batches
  let saved = 0;
  const scrapedRef = collection(db, "scraped_scholarships");

  for (const scholarship of unique) {
    try {
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
    already_existed: unique.length - saved,
    sources,
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
