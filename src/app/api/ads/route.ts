import { NextResponse } from "next/server";
import { getAllAds, createAd, updateAd, toggleAdActive, deleteAd } from "@/lib/ads";
import { isAuthenticated } from "../auth/route";

export const dynamic = "force-dynamic";

export async function GET() {
  const authed = await isAuthenticated();
  if (!authed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const ads = await getAllAds();
  return NextResponse.json({ ads });
}

export async function POST(request: Request) {
  const authed = await isAuthenticated();
  if (!authed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await request.json();
  const ad = await createAd({
    slot: body.slot,
    label: body.label || "",
    image_url: body.image_url || "",
    link_url: body.link_url || "",
  });
  return NextResponse.json({ ad });
}

export async function PATCH(request: Request) {
  const authed = await isAuthenticated();
  if (!authed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id, action, ...fields } = await request.json();
  if (action === "toggle") {
    await toggleAdActive(id);
  } else {
    await updateAd(id, fields);
  }
  return NextResponse.json({ success: true });
}

export async function DELETE(request: Request) {
  const authed = await isAuthenticated();
  if (!authed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await request.json();
  await deleteAd(id);
  return NextResponse.json({ success: true });
}
