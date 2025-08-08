import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { prisma } from './prisma';
import { username } from 'better-auth/plugins';
import { comparePassword, hashPassword } from './bcrypt';
import {
  sendEmailVerification,
  sendPasswordResetEmail,
} from './mail';

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL,
  trustedOrigins: [process.env.FRONT_URL as string],

  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          await prisma.user.update({
            where: {
              id: user.id,
            },
            data: {
              username: user.name,
            },
          });
        },
      },
    },
    session: {
      create: {
        before: async (session) => {
          await prisma.session.deleteMany({
            where: { userId: session.userId },
          });
        },
      },
    },
  },

  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, token, url }) => {
      await sendEmailVerification({ email: user.email, token });
    },
    expiresIn: 15 * 60, // 15 mins
  },

  user: {
    additionalFields: {
      emailVerified: {
        type: 'boolean',
        input: false,
        required: false,
        defaultValue: false,
      },
      isActive: {
        type: 'boolean',
        required: false,
        input: false,
        defaultValue: false,
      },
    },
  },

  emailAndPassword: {
    enabled: true,
    disableSignUp: false,
    requireEmailVerification: true,
    minPasswordLength: 8,
    maxPasswordLength: 128,
    autoSignIn: false,

    sendResetPassword: async ({ user, token }) => {
      await sendPasswordResetEmail({ email: user.email, token });
    },
    resetPasswordTokenExpiresIn: 15 * 60, // 15 mins
    password: {
      hash: async (password: string): Promise<string> => {
        return await hashPassword(password);
      },
      verify: async ({ hash, password }): Promise<boolean> => {
        return await comparePassword({ password, hash });
      },
    },
  },

  advanced: {
    useSecureCookies: true,
    disableCSRFCheck: false,
    defaultCookieAttributes: {
      httpOnly: true,
      secure: true,
    },
    cookiePrefix: 'sport-app',
  },

  session: {
    modelName: 'session',
    fields: {
      userId: 'userId',
    },
    expiresIn: 604800,
    updateAge: 86400,
    disableSessionRefresh: true,
    storeSessionInDatabase: true,
    preserveSessionInDatabase: false,
    cookieCache: {
      enabled: true,
      maxAge: 300, // 5 minutes
    },
  },

  account: {
    modelName: 'account',
    fields: {
      userId: 'userId',
    },
    encryptOAuthTokens: true,
    accountLinking: {
      trustedProviders: ['email-password', 'strava'],
      allowDifferentEmails: false,
    },
  },

  plugins: [
    username({
      usernameValidator: async (username: string) => {
        const existingUsername = await prisma.user.findFirst({
          where: {
            username: {
              equals: username,
              mode: 'insensitive',
            },
          },
        });

        return !!existingUsername;
      },
      minUsernameLength: 2,
      maxUsernameLength: 40,

      usernameNormalization: (username: string) => {
        return username.trim();
      },
    }),
  ],

  //database config
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
});
