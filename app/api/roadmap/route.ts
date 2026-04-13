import Anthropic from "@anthropic-ai/sdk";
import { NextRequest } from "next/server";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  const { profile, scholarship, mode } = await req.json();

  // mode: "single" = one scholarship deep-dive | "multi" = overview of multiple scholarships
  const isMulti = mode === "multi";

  const profileSummary = `
STUDENT PROFILE:
- Name: ${profile.firstName} ${profile.lastName}
- GPA: ${profile.gpa || "Not provided"}
- SAT: ${profile.satScore || "Not provided"} / ACT: ${profile.actScore || "Not provided"}
- Intended Major: ${profile.intendedMajor || "Undecided"}
- State: ${profile.state || "Not specified"}
- Ethnicity: ${profile.ethnicity || "Not specified"}
- Gender: ${profile.gender || "Not specified"}
- Citizenship: ${profile.citizenshipStatus || "Not specified"}
- Household Income: ${profile.householdIncome || "Not specified"}
- First-Generation: ${profile.firstGenCollegeStudent ? "Yes" : "No"}
- Activities: ${
    profile.activities?.length
      ? profile.activities.map((a: { role: string; name: string; yearsInvolved: string; description: string }) => `${a.role} in ${a.name} (${a.yearsInvolved} years) — ${a.description}`).join("; ")
      : "None listed"
  }
- Awards: ${
    profile.awards?.length
      ? profile.awards.map((a: { name: string; year: string }) => `${a.name} (${a.year})`).join(", ")
      : "None listed"
  }
- Community Service: ${profile.communityServiceHours || "Not listed"}
- Work Experience: ${profile.workExperience || "None listed"}
- Projects: ${
    profile.projects?.length
      ? profile.projects.map((p: { name: string; description: string }) => `${p.name}: ${p.description}`).join("; ")
      : "None listed"
  }
- Personal Statement: ${profile.personalStatement ? profile.personalStatement.substring(0, 400) : "Not provided"}`;

  let systemPrompt: string;
  let userMessage: string;

  if (!isMulti) {
    // Single scholarship deep-dive
    const s = scholarship;
    systemPrompt = `You are a college scholarship counselor giving a high school student a personalized, honest roadmap for a specific scholarship. Be direct, specific, and actionable. Reference the student's actual profile details — do not give generic advice.

Format your response using these exact section headers (use ## for headers):

## Current Standing
One paragraph assessing how competitive this student is RIGHT NOW for this scholarship, using specific numbers and details from their profile.

## Strengths Working in Your Favor
Bullet list of things from the student's profile that genuinely help their chances. Be specific (e.g., "Your 3.8 GPA exceeds the 3.5 minimum" not just "strong GPA").

## Gaps to Close
Bullet list of specific, honest gaps between their current profile and what strong applicants typically have. Give measurable targets (e.g., "Aim for 80+ community service hours — you currently have none listed").

## Your 90-Day Action Plan
Numbered list of the 3–5 most important things they should do in the next 90 days to improve their chances. Be specific and actionable.

## Long-Term Goals (6–18 months)
Numbered list of deeper investments that will pay off when application time comes.

## Honest Assessment
One paragraph with a readiness rating out of 10 and when you think they should realistically apply — this cycle, next cycle, or build for 1–2 more years.

Keep the entire response under 600 words. No filler phrases. Be honest even if that means telling them they are not yet ready.`;

    userMessage = `${profileSummary}

SCHOLARSHIP: ${s.name} by ${s.organization}
AMOUNT: ${s.amount}
DEADLINE: ${s.deadline}
ELIGIBILITY: ${s.eligibility?.description}
MIN GPA: ${s.eligibility?.minGpa || "Not specified"}
INCOME LIMIT: ${s.eligibility?.maxHouseholdIncome || "None"}
ETHNICITY REQUIREMENTS: ${s.eligibility?.ethnicities?.join(", ") || "None"}
STATE REQUIREMENTS: ${s.eligibility?.states?.join(", ") || "None"}
WHAT MAKES A STRONG CANDIDATE: ${s.whatMakesStrongCandidate?.join("; ")}

Give me the full roadmap for this student and this scholarship.`;
  } else {
    // Multi-scholarship overview
    const scholarships = scholarship; // array in multi mode
    systemPrompt = `You are a college scholarship counselor giving a high school student an honest, strategic roadmap across their top scholarship matches. Be specific to the student's actual profile. No generic advice.

Format your response using these exact section headers:

## Your Scholarship Profile at a Glance
2–3 sentences summarizing what type of applicant this student is right now and what their biggest strengths and biggest gaps are across all scholarships.

## Where You Are Competitive Right Now
List each scholarship they are realistically competitive for today, with one sentence explaining why. If none, say so honestly.

## Your Single Biggest Lever
One paragraph on the single thing that would have the greatest impact across ALL these scholarships — the one thing to prioritize above everything else.

## Priority Action Plan
Numbered list of the top 5 actions, ordered by impact. Each action should say which scholarships it helps and what specifically to do.

## Build Toward These (Long-Term)
List scholarships where they have a real path but need 1–2 more years of development, with 1–2 sentences on what to build.

## Scholarships to Skip
Honest list of any scholarships in their results that are unlikely fits, with one sentence on why.

Keep it under 700 words. Be direct. Reference specific scholarship names and specific numbers from the student's profile.`;

    userMessage = `${profileSummary}

MATCHED SCHOLARSHIPS (analyze all of these):
${scholarships
  .slice(0, 8)
  .map(
    (s: { name: string; organization: string; amount: string; eligibility: { minGpa?: number; ethnicities?: string[]; states?: string[] }; whatMakesStrongCandidate: string[] }, i: number) =>
      `${i + 1}. ${s.name} (${s.organization}) — ${s.amount}
   Min GPA: ${s.eligibility?.minGpa || "None"} | Ethnicity: ${s.eligibility?.ethnicities?.join(", ") || "Open"} | State: ${s.eligibility?.states?.join(", ") || "Any"}
   Strong candidate: ${s.whatMakesStrongCandidate?.slice(0, 2).join("; ")}`
  )
  .join("\n\n")}

Give me the full multi-scholarship roadmap for this student.`;
  }

  const stream = await client.messages.stream({
    model: "claude-sonnet-4-6",
    max_tokens: 1200,
    system: systemPrompt,
    messages: [{ role: "user", content: userMessage }],
  });

  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      for await (const chunk of stream) {
        if (
          chunk.type === "content_block_delta" &&
          chunk.delta.type === "text_delta"
        ) {
          controller.enqueue(encoder.encode(chunk.delta.text));
        }
      }
      controller.close();
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Transfer-Encoding": "chunked",
    },
  });
}
