import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q");

  if (!query || query.length < 2) {
    return NextResponse.json([]);
  }

  try {
    const res = await fetch(
      `https://api.data.gov/ed/collegescorecard/v1/schools?school.name=${encodeURIComponent(query)}&_fields=school.name,school.city,school.state,school.school_url,school.alias&_per_page=8&api_key=DEMO_KEY`,
      { next: { revalidate: 3600 } }
    );

    if (!res.ok) throw new Error("API error");

    const data = await res.json();
    const results = (data.results || []).map((school: Record<string, string>) => {
      const domain = school["school.school_url"]
        ? school["school.school_url"].replace(/^https?:\/\//, "").replace(/\/.*$/, "")
        : null;
      return {
        name: school["school.name"],
        city: school["school.city"],
        state: school["school.state"],
        domain: domain,
        logoUrl: domain ? `https://logo.clearbit.com/${domain}` : null,
      };
    });

    return NextResponse.json(results);
  } catch {
    return NextResponse.json([]);
  }
}
