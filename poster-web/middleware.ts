import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/api/auth/signin",
  },
});

export const config = {
  // Protect only what you list here (recommended)
  matcher: [
    "/generate/:path*",
    "/dashboard/:path*",
    "/account/:path*",
  ],
};
