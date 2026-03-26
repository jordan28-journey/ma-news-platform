import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "changeme";
const SESSION_TOKEN = "ma-admin-session";

export async function POST(request: Request) {
  const { password } = await request.json();

  if (password === ADMIN_PASSWORD) {
    // Simple session: set a cookie with a known token
    const token = Buffer.from(`authenticated:${Date.now()}`).toString("base64");
    const cookieStore = await cookies();
    cookieStore.set(SESSION_TOKEN, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24, // 24 hours
      path: "/",
    });

    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Invalid password" }, { status: 401 });
}

export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const session = cookieStore.get(SESSION_TOKEN);
  if (!session?.value) return false;
  try {
    const decoded = Buffer.from(session.value, "base64").toString();
    return decoded.startsWith("authenticated:");
  } catch {
    return false;
  }
}
