import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const LEADS_FILE = path.join(process.cwd(), "data", "leads.json");

// Simple password protection — set ADMIN_PASSWORD in .env.local
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "scholarpath-admin";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const password = searchParams.get("password");
  const format = searchParams.get("format") || "json";

  if (password !== ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const raw = fs.readFileSync(LEADS_FILE, "utf-8");
    const leads = JSON.parse(raw);

    if (format === "csv") {
      if (leads.length === 0) {
        return new Response("No leads yet.", {
          headers: { "Content-Type": "text/plain" },
        });
      }
      const headers = Object.keys(leads[0]).join(",");
      const rows = leads.map((l: Record<string, unknown>) =>
        Object.values(l)
          .map((v) =>
            typeof v === "string" && v.includes(",")
              ? `"${v}"`
              : Array.isArray(v)
              ? `"${v.join("; ")}"`
              : v
          )
          .join(",")
      );
      const csv = [headers, ...rows].join("\n");
      return new Response(csv, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="scholarpath-leads-${new Date().toISOString().split("T")[0]}.csv"`,
        },
      });
    }

    return NextResponse.json({
      total: leads.length,
      leads: leads.sort(
        (a: { submittedAt: string }, b: { submittedAt: string }) =>
          new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
      ),
    });
  } catch {
    return NextResponse.json({ error: "Could not read leads" }, { status: 500 });
  }
}
