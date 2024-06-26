import NextAuth, { AuthError } from 'next-auth';
import Google from 'next-auth/providers/google';
import Github from 'next-auth/providers/github';
import Credentials from 'next-auth/providers/credentials';
import { DrizzleAdapter } from '@auth/drizzle-adapter';
import { db } from '@/db';
import {
  getUserById,
  getUserByProviderAccountId,
  getUserByUsername,
  getUserForTotp,
} from './db/query/User';
import bcrypt from 'bcryptjs';
import { encode, decode } from 'next-auth/jwt';
import {
  users,
  accounts,
  sessions,
  verificationTokens,
  authenticators,
} from '@/db/schema';
import { cookies } from 'next/headers';
import Passkey from 'next-auth/providers/passkey';

class InvalidCredentialsError extends AuthError {
  code = 'invalid-credentials';
  message = 'Invalid credentials';
}

class OauthError extends AuthError {
  code = 'OauthError';
  message = 'Please use Social Login to continue';
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  experimental: { enableWebAuthn: true },
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
    authenticatorsTable: authenticators,
  }),
  providers: [
    Passkey({
      enableConditionalUI: true,
      getRelayingParty: () => ({
        id: process.env.BASE_ID ? process.env.BASE_ID : '',
        name: 'AuthJs Template',
        origin: process.env.BASE_URL ? process.env.BASE_URL : '',
      }),
    }),
    Google({
      async profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
          username: profile.email,
          role: profile.email.endsWith('@patelvivek.dev') ? 'ADMIN' : 'USER',
        };
      },
      allowDangerousEmailAccountLinking: true,
    }),
    Github({
      async profile(profile) {
        return {
          id: profile.id.toString(),
          name: profile.name,
          email: profile.email,
          image: profile.avatar_url,
          username: profile.login,
          role: profile.email!.endsWith('@patelvivek.dev') ? 'ADMIN' : 'USER',
        };
      },
      allowDangerousEmailAccountLinking: true,
    }),
    Credentials({
      id: 'credentials',
      name: 'credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const user = await getUserByUsername(credentials.username as string);

        if (user.length === 0) {
          throw new InvalidCredentialsError();
        }

        if (user[0].password! === null) {
          throw new OauthError();
        }

        const isValid = await bcrypt.compare(
          credentials.password as string,
          user[0].password!,
        );

        if (!isValid) {
          throw new InvalidCredentialsError();
        }
        return user[0];
      },
    }),
    Credentials({
      id: 'TOTP',
      name: 'TOTP',
      credentials: {
        userId: { label: 'userId', type: 'text' },
        TOTP: { label: 'TOTP', type: 'text' },
      },
      async authorize(credentials) {
        const user = await getUserForTotp(credentials.userId as string);

        if (user.length === 0) {
          throw new InvalidCredentialsError();
        }
        return user[0];
      },
    }),
  ],
  callbacks: {
    async signIn({ user, credentials, account }) {
      const cookieStore = cookies();
      const sessionToken = cookieStore.get('authjs.session-token');
      console.log('sessionToken', sessionToken?.value);
      if (credentials) {
        // @ts-ignore
        if (credentials.TOTP === 'TOTP') {
          return true;
        }
      }

      // check if account is already linked or not after user is authenticated
      if (sessionToken?.value) {
        if (account) {
          const user = await getUserByProviderAccountId(
            account.providerAccountId,
          );
          if (!user) {
            return true;
          }
          return '/sign-in/?error=OAuthAccountNotLinked';
        }
      }

      // @ts-ignore
      if (user.isTotpEnabled) {
        cookies().set({
          name: 'authjs.two-factor',
          // @ts-ignore
          value: user.id!,
          httpOnly: true,
          path: '/',
        });
        return '/sign-in/two-factor';
      }
      return true;
    },
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const paths = ['/profile', '/dashboard'];
      const isProtected = paths.some((path) =>
        nextUrl.pathname.startsWith(path),
      );

      const publicPath = ['/sign-up'];
      const isPublic = publicPath.some((path) =>
        nextUrl.pathname.startsWith(path),
      );
      if (isPublic && isLoggedIn) {
        return Response.redirect(new URL('/profile', nextUrl.origin));
      }

      if (isProtected && !isLoggedIn) {
        const redirectUrl = new URL('/sign-in', nextUrl.origin);
        redirectUrl.searchParams.append('callbackUrl', nextUrl.href);
        return Response.redirect(redirectUrl);
      }
      return true;
    },
    jwt: async ({ token }) => {
      const user = await getUserById(token.sub!);
      if (user) {
        token.user = user;
        token.role = user.role;
        return token;
      } else {
        return null;
      }
    },
    session: async ({ session, token }) => {
      if (token) {
        // @ts-ignore
        session.role = token.role;
        // @ts-ignore
        session.user = token.user;
        session.user.id = token.sub!;
        return session;
      }
      return session;
    },
  },
  session: { strategy: 'jwt' },
  jwt: { encode, decode },
  secret: process.env.AUTH_SECRET,
  pages: {
    signIn: '/sign-in',
    error: '/error',
  },
});
