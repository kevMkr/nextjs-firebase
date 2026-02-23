import { adminAuth } from "@/lib/firebase-admin";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const authorization = req.headers.get("Authorization");

  if (!authorization?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const idToken = authorization.split("Bearer ")[1];

  try {
    await adminAuth.verifyIdToken(idToken, true);

    const response = NextResponse.json({ status: "success" });

    // Only set secure cookies in production (localhost/dev won't support secure cookies over http)
    const isProduction = process.env.NODE_ENV === "production";

    response.cookies.set("session", idToken, {
      httpOnly: true,
      secure: isProduction,
      path: "/",
      sameSite: "lax",
    });

    return response;
  } catch (err: any) {
    // Return useful error message for debugging (do not leak sensitive info in production)
    const message = err?.message || "Failed to verify token";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}