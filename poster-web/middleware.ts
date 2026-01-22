import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export default withAuth({
  pages: {
    signIn: "/api/auth/signin",
  },
});


export async function middleware(req: NextRequest) {
  const token = await getToken({ req });
  const { pathname } = req.nextUrl;

  // 1) Require authentication for protected routes
  const protectedPaths = ["/dashboard", "/generate", "/account", "/admin"];
  const isProtected = protectedPaths.some((p) => pathname.startsWith(p));

  if (isProtected && !token) {
    const signInUrl = new URL("/api/auth/signin", req.url);
    signInUrl.searchParams.set("callbackUrl", req.nextUrl.pathname);
    return NextResponse.redirect(signInUrl);
  }

  // 2) Require admin group for /admin
  if (pathname.startsWith("/admin")) {
    const groups = (token?.groups as string[]) ?? [];
    if (!groups.includes("admin")) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  // Protect only what you list here (recommended)
  matcher: [
    "/generate/:path*",
    "/dashboard/:path*",
    "/account/:path*",
  ],
};
