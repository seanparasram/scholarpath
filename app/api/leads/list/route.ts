import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, getDocs, orderBy, query } from "firebase/firestore";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "scholarpath-admin";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const password = searchParams.get("password");
  const format = searchParams.get("format") || "json";

  if (password !== ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const leadsRef = collection(db, "leads");
    const q = query(leadsRef, orderBy("submittedAt", "desc"));
    const snapshot = await getDocs(q);

    const leads = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

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

    return NextResponse.json({ total: leads.length, leads });
  } catch (err) {
    console.error("Leads list error:", err);
    return NextResponse.json({ error: "Could not read leads" }, { status: 500 });
  }
}
