import Anthropic from "@anthropic-ai/sdk";
import { NextRequest } from "next/server";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  const { messages, profile, scholarship, essayPrompt } = await req.json();

  const systemPrompt = `You are an expert college scholarship essay writing coach helping a high school student write a compelling scholarship essay.

STUDENT PROFILE:
- Name: ${profile.firstName} ${profile.lastName}
- GPA: ${profile.gpa}
- Intended Major: ${profile.intendedMajor}
- State: ${profile.state}
- Ethnicity: ${profile.ethnicity || "Not specified"}
- First-generation college student: ${profile.firstGenCollegeStudent ? "Yes" : "No"}
- SAT: ${profile.satScore || "Not provided"}, ACT: ${profile.actScore || "Not provided"}
- Extracurricular Activities: ${
    profile.activities
      ?.map((a: { name: string; role: string; description: string }) => `${a.role} in ${a.name}: ${a.description}`)
      .join("; ") || "None listed"
  }
- Awards & Honors: ${profile.awards?.map((a: { name: string; year: string }) => `${a.name} (${a.year})`).join(", ") || "None listed"}
- Community Service Hours: ${profile.communityServiceHours || "Not listed"}
- Work Experience: ${profile.workExperience || "None listed"}
- Personal Projects: ${
    profile.projects?.map((p: { name: string; description: string }) => `${p.name}: ${p.description}`).join("; ") || "None listed"
  }
- About Me: ${profile.personalStatement || "Not provided"}

SCHOLARSHIP: ${scholarship.name} by ${scholarship.organization}
ESSAY PROMPT: "${essayPrompt}"
WORD LIMIT: ${scholarship.essayPrompts?.find((p: { prompt: string }) => p.prompt === essayPrompt)?.wordLimit || "500"} words

INSTRUCTIONS:
- Write in the student's authentic voice — first person, genuine, specific
- Draw directly from the student's profile details provided above
- Make the essay personal and specific, not generic
- If writing a draft, aim for the word limit given
- If asked to revise, make targeted improvements
- If the student asks questions, give coaching advice
- Never use generic filler phrases like "I have always been passionate about..."
- Use concrete examples and specific details from the profile
- Keep advice actionable and direct`;

  const stream = await client.messages.stream({
    model: "claude-sonnet-4-6",
    max_tokens: 1500,
    system: systemPrompt,
    messages: messages,
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
