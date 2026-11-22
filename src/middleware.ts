import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySession } from "@/lib/session";

// Gate every /admin page except the login screen. (Server actions and the upload API
// re-check the session themselves, so this is a convenience redirect, not the only guard.)
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (pathname.startsWith("/admin/login")) return NextResponse.next();
  const session = await verifySession(req.cookies.get(SESSION_COOKIE)?.value);
  if (!session) {
    const url = new URL("/admin/login", req.url);
    if (pathname !== "/admin") url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = { matcher: ["/admin/:path*"] };
