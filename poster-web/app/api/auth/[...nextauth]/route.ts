import NextAuth from "next-auth";
import CognitoProvider from "next-auth/providers/cognito";

const handler = NextAuth({
  providers: [
    CognitoProvider({
        clientId: process.env.COGNITO_CLIENT_ID!,
        // IMPORTANT: if your app client has no secret (generate_secret=false), omit this.
        // clientSecret: process.env.COGNITO_CLIENT_SECRET,
        issuer: process.env.COGNITO_ISSUER!,
        clientSecret: ""
    }),
  ],

  session: { strategy: "jwt" },

  callbacks: {
    async jwt({ token, account }) {
      // On first sign-in, NextAuth gives us tokens in `account`
      if (account) {
        // Save BOTH tokens
        if (account.id_token) token.idToken = account.id_token;
        if (account.access_token) token.accessToken = account.access_token;

        // Optional: store expiry if you want
        if (account.expires_at) token.expiresAt = account.expires_at;
      }
      return token;
    },

    async session({ session, token }) {
      // Attach to session so the frontend can call API Gateway
      // (You can choose to expose only accessToken if you prefer)
      (session as any).accessToken = token.accessToken as string | undefined;
      (session as any).idToken = token.idToken as string | undefined;
      (session as any).expiresAt = token.expiresAt as number | undefined;

      return session;
    },
  },
});

export { handler as GET, handler as POST };
