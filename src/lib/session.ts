// Edge-safe session helpers (used by middleware and server code).
import { SignJWT, jwtVerify } from "jose";

export const SESSION_COOKIE = "naledi_session";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days

export type SessionPayload = { sub: string; email: string; name: string; role: string };

function secret() {
  const s = process.env.JWT_SECRET;
  if (!s || s.length < 16) throw new Error("JWT_SECRET is missing or too short — set it in .env");
  return new TextEncoder().encode(s);
}

export async function signSession(payload: SessionPayload) {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE_SECONDS}s`)
    .sign(secret());
}

export async function verifySession(token: string | undefined): Promise<SessionPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

export const sessionCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  // HTTPS-only cookies in production. Set COOKIE_SECURE=false only if the site is served over plain http.
  secure: process.env.NODE_ENV === "production" && process.env.COOKIE_SECURE !== "false",
  path: "/",
  maxAge: MAX_AGE_SECONDS,
};
