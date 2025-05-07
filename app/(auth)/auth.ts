import NextAuth, { type User, type Session } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';

import { authConfig } from './auth.config';
import { decodeJwt } from '@/lib/utils';

interface ExtendedSession extends Session {
  user: User & { jwt?: string };
}

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {},
      async authorize(credentials: any) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }
        try {
          const response = await fetch(process.env.ETENDO_LOGIN_URL as string, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              username: credentials.email,
              password: credentials.password,
            }),
          });
          if (!response.ok) {
            return null;
          }
          const data = await response.json();
          const token = data.token;
          if (!token) {
            throw new Error('No JWT token received');
          }
          const decodedToken = decodeJwt(token);
          const userId = decodedToken.user || data.roleList?.[0]?.id || credentials.email;
          if (!userId) {
            return null;
          }
          return {
            id: userId,
            email: credentials.email,
            jwt: token,
            name: decodedToken.name,
            clientId: decodedToken.client,
            orgId: decodedToken.organization,
            createdBy: decodedToken.user,
            updatedBy: decodedToken.user,
          };
        } catch (error) {
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.jwt = user.jwt;
        token.email = user.email;
        token.name = user.name;
        token.clientId = user.clientId;
        token.orgId = user.orgId;
        token.createdBy = user.createdBy;
        token.updatedBy = user.updatedBy;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && token.id) {
        session.user.id = token.id as string;
        session.user.jwt = token.jwt as string;
        session.user.email = token.email ?? '';
        session.user.name = token.name;
        session.user.clientId = token.clientId as string;
        session.user.orgId = token.orgId as string;
        session.user.createdBy = token.createdBy as string;
        session.user.updatedBy = token.updatedBy as string;
      }
      return session;
    },
  },
});
