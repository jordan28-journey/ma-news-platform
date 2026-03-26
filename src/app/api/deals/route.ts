import { NextResponse } from "next/server";
import { getAllDeals, toggleDealPublished, deleteDeal, seedIfEmpty } from "@/lib/deals";
import { isAuthenticated } from "../auth/route";

export const dynamic = "force-dynamic";

export async function GET() {
  const authed = await isAuthenticated();
  if (!authed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  seedIfEmpty();
  const deals = getAllDeals(true); // include unpublished for admin
  return NextResponse.json({ deals });
}

export async function PATCH(request: Request) {
  const authed = await isAuthenticated();
  if (!authed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, action } = await request.json();
  if (action === "toggle") {
    toggleDealPublished(id);
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}

export async function DELETE(request: Request) {
  const authed = await isAuthenticated();
  if (!authed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await request.json();
  deleteDeal(id);
  return NextResponse.json({ success: true });
}
