import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  updateDoc,
} from "firebase/firestore";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { profile, matchedScholarshipNames } = body;

    const leadsRef = collection(db, "leads");

    // Check for duplicate email
    const q = query(leadsRef, where("email", "==", profile.email.toLowerCase()));
    const existing = await getDocs(q);

    if (!existing.empty) {
      // Update existing lead
      const docRef = existing.docs[0].ref;
      await updateDoc(docRef, {
        submittedAt: new Date().toISOString(),
        gpa: profile.gpa,
        intendedMajor: profile.intendedMajor,
        matchedScholarships: matchedScholarshipNames,
      });
      return NextResponse.json({ success: true, updated: true });
    }

    // Create new lead
    const docRef = await addDoc(leadsRef, {
      submittedAt: new Date().toISOString(),
      firstName: profile.firstName,
      lastName: profile.lastName,
      email: profile.email.toLowerCase(),
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
    });

    return NextResponse.json({ success: true, id: docRef.id });
  } catch (err) {
    console.error("Lead save error:", err);
    return NextResponse.json({ error: "Failed to save lead" }, { status: 500 });
  }
}
