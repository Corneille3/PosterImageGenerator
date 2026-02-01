import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

type TokenWithGroups = {
  groups?: string[];
};

export async function proxy(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  const callbackPath = `${pathname}${search ?? ""}`;

  // Only run on matched routes, but we’ll keep explicit intent here too
  const isDashboard = pathname.startsWith("/dashboard");
  const isAdmin = pathname.startsWith("/admin");
  const needsAuth = isDashboard || isAdmin;

  // Read JWT from NextAuth cookie
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // Require login
  if (needsAuth && !token) {
    const url = req.nextUrl.clone();
    url.pathname = "/api/auth/signin";
    url.searchParams.set("callbackUrl", callbackPath);
    return NextResponse.redirect(url);
  }

  // Admin-only gate
  if (isAdmin) {
    const groups = (token as TokenWithGroups | null)?.groups ?? [];
    if (!groups.includes("admin")) {
      // Pick ONE behavior:
      // 1) Send to an Unauthorized page (clearer)
      const url = req.nextUrl.clone();
      url.pathname = "/unauthorized";
      url.searchParams.set("from", callbackPath);
      return NextResponse.redirect(url);

      // 2) Or keep your original:
      // return NextResponse.redirect(new URL("/dashboard", req.url));
      // 3) Or return 403:
      // return new NextResponse("Unauthorized", { status: 403 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/generate/:path*",
    "/account/:path*",
    "/admin/:path*",
  ],
};

