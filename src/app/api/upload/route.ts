import { NextResponse } from "next/server";
import Papa from "papaparse";
import { importDealsFromCSV } from "@/lib/deals";
import { isAuthenticated } from "../auth/route";

export async function POST(request: Request) {
  const authed = await isAuthenticated();
  if (!authed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const text = await file.text();
    const { data, errors } = Papa.parse(text, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (h: string) => h.trim().toLowerCase(),
    });

    if (errors.length > 0) {
      return NextResponse.json(
        { error: `CSV parse errors: ${errors.map((e) => e.message).join(", ")}` },
        { status: 400 }
      );
    }

    const rows = data as Array<{
      title: string;
      firms: string;
      deal_value: string;
      summary: string;
      body?: string;
      deal_date: string;
    }>;

    const count = await importDealsFromCSV(rows);

    return NextResponse.json({ success: true, count });
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json(
      { error: "Failed to process CSV file" },
      { status: 500 }
    );
  }
}
