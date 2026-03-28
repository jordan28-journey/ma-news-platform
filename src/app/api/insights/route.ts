import { NextResponse } from "next/server";
import {
  getAllInsights,
  createInsight,
  updateInsight,
  toggleInsightPublished,
  deleteInsight,
} from "@/lib/insights";
import { isAuthenticated } from "../auth/route";

export const dynamic = "force-dynamic";

export async function GET() {
  const authed = await isAuthenticated();
  if (!authed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const insights = await getAllInsights(true);
  return NextResponse.json({ insights });
}

export async function POST(request: Request) {
  const authed = await isAuthenticated();
  if (!authed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = await request.json();
  const insight = await createInsight(data);
  return NextResponse.json({ insight });
}

export async function PATCH(request: Request) {
  const authed = await isAuthenticated();
  if (!authed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, action, ...fields } = await request.json();
  if (action === "toggle") {
    await toggleInsightPublished(id);
  } else {
    await updateInsight(id, fields);
  }
  return NextResponse.json({ success: true });
}

export async function DELETE(request: Request) {
  const authed = await isAuthenticated();
  if (!authed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await request.json();
  await deleteInsight(id);
  return NextResponse.json({ success: true });
}
