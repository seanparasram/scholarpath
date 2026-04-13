import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const LEADS_FILE = path.join(process.cwd(), "data", "leads.json");

function readLeads(): Lead[] {
  try {
    const raw = fs.readFileSync(LEADS_FILE, "utf-8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function writeLeads(leads: Lead[]) {
  fs.writeFileSync(LEADS_FILE, JSON.stringify(leads, null, 2));
}

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

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { profile, matchedScholarshipNames } = body;

    const leads = readLeads();

    // Check for duplicate email
    const existing = leads.find(
      (l) => l.email.toLowerCase() === profile.email.toLowerCase()
    );
    if (existing) {
      // Update existing lead with fresh data
      const updated = leads.map((l) =>
        l.email.toLowerCase() === profile.email.toLowerCase()
          ? {
              ...l,
              submittedAt: new Date().toISOString(),
              gpa: profile.gpa,
              intendedMajor: profile.intendedMajor,
              matchedScholarships: matchedScholarshipNames,
            }
          : l
      );
      writeLeads(updated);
      return NextResponse.json({ success: true, updated: true });
    }

    const lead: Lead = {
      id: crypto.randomUUID(),
      submittedAt: new Date().toISOString(),
      firstName: profile.firstName,
      lastName: profile.lastName,
      email: profile.email,
      highSchool: profile.highSchool,
      state: profile.state,
      gpa: profile.gpa,
      intendedMajor: profile.intendedMajor,
      intendedColleges: profile.intendedColleges || [],
      satScore: profile.satScore,
      actScore: profile.actScore,
      ethnicity: profile.ethnicity,
      householdIncome: profile.householdIncome,
      firstGenCollegeStudent: profile.firstGenCollegeStudent,
      communityServiceHours: profile.communityServiceHours,
      activitiesCount: profile.activities?.length || 0,
      awardsCount: profile.awards?.length || 0,
      matchedScholarships: matchedScholarshipNames,
    };

    leads.push(lead);
    writeLeads(leads);

    return NextResponse.json({ success: true, id: lead.id });
  } catch (err) {
    console.error("Lead save error:", err);
    return NextResponse.json({ error: "Failed to save lead" }, { status: 500 });
  }
}
