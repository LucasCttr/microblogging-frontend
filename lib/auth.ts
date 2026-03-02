import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

function decodeJwtPayload(token: string | undefined | null) {
  if (!token) return null;
  try {
    const parts = token.split('.');
    if (parts.length < 2) return null;
    const payload = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const json = Buffer.from(payload, 'base64').toString('utf8');
    return JSON.parse(json);
  } catch (err) {
    return null;
  }
}

function isTokenExpired(token: string | undefined | null, leewaySeconds = 60) {
  const payload = decodeJwtPayload(token);
  if (!payload || !payload.exp) return true;
  const now = Math.floor(Date.now() / 1000);
  return payload.exp < now + leewaySeconds;
}

async function refreshAccessToken(refreshToken: string) {
  try {
    // Call local proxy which will use httpOnly refresh cookie
    const res = await fetch('/api/auth/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });
    if (!res.ok) return null;
    const data = await res.json();
    return {
      accessToken: data.token ?? data.accessToken,
      refreshToken: data.refreshToken ?? data.refresh_token ?? null,
    };
  } catch (err) {
    return null;
  }
}

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials) return null;
        try {
          const res = await fetch(`${process.env.BACKEND_URL}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: credentials.email, password: credentials.password }),
          });
          const data = await res.json();
          if (!res.ok) return null;

          // Expect backend to return { token, refreshToken, user }
          const accessToken = data.token ?? data.accessToken ?? null;
          const refreshToken = data.refreshToken ?? data.refresh_token ?? null;
          const user = data.user ?? null;
          if (!accessToken) return null;

          return { accessToken, refreshToken, id: user?.id ?? null, name: user?.name ?? user?.username ?? null };
        } catch (err) {
          // Network or other fetch error — log and fail authentication gracefully
          console.error("NextAuth authorize error:", err);
          return null;
        }
      },
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user }: { token: any; user?: any }) {
      // Initial sign in
      if (user) {
        token.accessToken = (user as any).accessToken ?? (user as any).accessToken ?? (user as any).accessToken;
        token.refreshToken = (user as any).refreshToken ?? (user as any).refresh_token ?? token.refreshToken;
        token.id = (user as any).id ?? token.id;
        return token;
      }

      // If access token still valid, just return
      if (token.accessToken && !isTokenExpired(token.accessToken)) {
        return token;
      }

      // Access token expired, try refresh
      if (token.refreshToken) {
        const refreshed = await refreshAccessToken(token.refreshToken as string);
        if (refreshed?.accessToken) {
          token.accessToken = refreshed.accessToken;
          if (refreshed.refreshToken) token.refreshToken = refreshed.refreshToken;
          return token;
        }
      }

      // Unable to refresh, return token as-is (will be unauthenticated)
      return token;
    },
    async session({ session, token }: { session: any; token: any }) {
      (session as any).accessToken = token.accessToken;
      (session.user as any).id = token.id;
      return session;
    },
  },
  pages: { signIn: "/auth/login", error: "/auth/login" },
};

export default authOptions;
