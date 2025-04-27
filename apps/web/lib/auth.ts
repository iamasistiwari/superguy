import { NextAuthOptions } from "next-auth";
import { prisma } from "@repo/db/index";
import { JWT } from "next-auth/jwt";
import jwt from "jsonwebtoken";
import GoogleProvider from "next-auth/providers/google";


async function refreshAccessToken(token: JWT) {
  try {
    const url = "https://oauth2.googleapis.com/token";

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        grant_type: "refresh_token",
        refresh_token: token.refreshToken as string,
      }),
    });

    const refreshedTokens = await res.json();

    if (!res.ok) {
      throw refreshedTokens;
    }

    return {
      ...token,
      accessToken: refreshedTokens.access_token,
      accessTokenExpires: Date.now() + refreshedTokens.expires_in * 1000,
      refreshToken: refreshedTokens.refresh_token ?? token.refreshToken,
    };
  } catch (error) {
    console.error("Error refreshing access token:", error);
    return {
      ...token,
      error: "RefreshAccessTokenError",
    };
  }
}


export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  pages: {
    // signIn: "/signup",
    // error: "/",
  },
  secret: process.env.NEXTAUTH_SECRET,
  jwt: {
    secret: process.env.NEXTAUTH_SECRET!,
    encode: async ({ token, secret }) => {
      return jwt.sign(token!, secret, { algorithm: "HS256" });
    },
    decode: async ({ token, secret }) => {
      return jwt.verify(token!, secret) as Promise<JWT | null>;
    },
  },

  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          access_type: "offline",
          prompt: "consent",
          response_type: "code",
          include_granted_scopes: "true",
          scope:
            "openid email profile https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/gmail.send https://www.googleapis.com/auth/gmail.modify",
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (account) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.picture = user.image;
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        return token;
      }
      if (Date.now() < (token.accessTokenExpires as number)) {
        return token;
      }

      return await refreshAccessToken(token);
    },

    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.name = token.name;
        session.user.email = token.email;
        session.accessToken = token.accessToken;
        session.refreshToken = token.refreshToken;
      }
      return session;
    },
    async signIn({ user, account }) {
      try {
        if (
          account?.provider === "google" &&
          user &&
          user.id &&
          user.email &&
          user.name
        ) {
          await prisma.user.upsert({
            where: { id: user.id },
            update: {
              name: user.name,
            },
            create: {
              id: user.id,
              email: user.email,
              name: user.name,
              joinDate: new Date(Date.now()),
              provider: "google",
            },
          });
        }
        return true;
      } catch (e) {
        console.log(e)
        return false;
      }
    },
  },
};
