import { NextResponse } from "next/server";
import { isAuthenticated } from "../../auth/route";
import path from "path";
import fs from "fs";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const authed = await isAuthenticated();
  if (!authed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  // Validate file type
  const allowed = ["image/png", "image/jpeg", "image/jpg", "image/gif", "image/webp"];
  if (!allowed.includes(file.type)) {
    return NextResponse.json(
      { error: "Invalid file type. Use PNG, JPG, GIF, or WebP." },
      { status: 400 }
    );
  }

  // Generate unique filename
  const ext = file.name.split(".").pop() || "png";
  const filename = `ad-${Date.now()}.${ext}`;
  const adsDir = path.join(process.cwd(), "public", "ads");

  // Ensure directory exists
  if (!fs.existsSync(adsDir)) {
    fs.mkdirSync(adsDir, { recursive: true });
  }

  // Write file
  const buffer = Buffer.from(await file.arrayBuffer());
  fs.writeFileSync(path.join(adsDir, filename), buffer);

  const url = `/ads/${filename}`;
  return NextResponse.json({ url });
}
