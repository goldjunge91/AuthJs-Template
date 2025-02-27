import { type Adapter } from '@auth/core/adapters';

declare global {
  // eslint-disable-next-line no-unused-vars
  var memoryAdapterStorage: {
    users: any[];
    accounts: any[];
    sessions: any[];
    verificationTokens: any[];
    authenticators: any[];
  };
}

// Initialize global storage - ensuring it persists across hot reloads
if (!global.memoryAdapterStorage) {
  console.log('🔄 Initializing memory adapter storage');
  global.memoryAdapterStorage = {
    users: [],
    accounts: [],
    sessions: [],
    verificationTokens: [],
    authenticators: [],
  };
} else {
  console.log('📦 Memory adapter storage already initialized', {
    users: global.memoryAdapterStorage.users.length,
    accounts: global.memoryAdapterStorage.accounts.length,
    sessions: global.memoryAdapterStorage.sessions.length,
  });
}

/**
 * Helper function for debugging memory storage state
 */
function logStorageState(title: string) {
  console.log(`\n🔍 MEMORY ADAPTER STATE: ${title} 🔍`);
  console.log(
    '👥 USERS:',
    global.memoryAdapterStorage.users.map((u) => ({
      id: u.id,
      email: u.email,
    })),
  );
  console.log(
    '🔑 ACCOUNTS:',
    global.memoryAdapterStorage.accounts.map((a) => ({
      provider: a.provider,
      providerAccountId: a.providerAccountId,
      userId: a.userId,
    })),
  );
  console.log('🎫 SESSIONS:', global.memoryAdapterStorage.sessions.length);
  console.log(
    '📝 VERIFICATION TOKENS:',
    global.memoryAdapterStorage.verificationTokens.length,
  );
  console.log('---------------------------\n');
}

export function MemoryAdapter(): Adapter {
  console.log('⚙️ Memory adapter initialized');

  return {
    // User operations
    createUser: async (userData) => {
      console.log('🔵 createUser called with data:', {
        email: userData.email,
        name: userData.name,
        id: userData.id,
      });

      // Fix for "id is specified more than once" error
      const { id: providedId, ...userDataWithoutId } = userData;
      const user = {
        id: providedId || crypto.randomUUID(),
        ...userDataWithoutId,
      };

      global.memoryAdapterStorage.users.push(user);
      console.log(`✅ User created with ID: ${user.id}, email: ${user.email}`);
      logStorageState('After createUser');
      return user;
    },

    getUser: async (id) => {
      console.log(`🔵 getUser called with ID: ${id}`);

      const user =
        global.memoryAdapterStorage.users.find((user) => user.id === id) ||
        null;
      console.log(
        `${user ? '✅ User found' : '❌ User not found'} for ID: ${id}`,
      );

      if (user) {
        console.log('📋 User details:', {
          id: user.id,
          email: user.email,
          name: user.name,
        });
      }
      return user;
    },

    getUserByEmail: async (email) => {
      console.log(`🔵 getUserByEmail called with email: ${email}`);

      const user =
        global.memoryAdapterStorage.users.find(
          (user) => user.email === email,
        ) || null;

      console.log(
        `${user ? '✅ User found' : '❌ User not found'} for email: ${email}`,
      );

      if (user) {
        console.log('📋 User details:', {
          id: user.id,
          email: user.email,
          name: user.name,
        });
      }
      return user;
    },

    getUserByAccount: async ({ provider, providerAccountId }) => {
      console.log(
        `🔵 getUserByAccount called for ${provider} with ID: ${providerAccountId}`,
      );
      console.log(
        `📊 Storage state: ${global.memoryAdapterStorage.accounts.length} accounts, ${global.memoryAdapterStorage.users.length} users`,
      );

      // Dump all accounts for debugging
      console.log('📋 All accounts in storage:');
      global.memoryAdapterStorage.accounts.forEach((account, index) => {
        console.log(
          `  Account ${index + 1}: provider=${account.provider}, providerAccountId=${account.providerAccountId}, userId=${account.userId}`,
        );
      });

      const account = global.memoryAdapterStorage.accounts.find(
        (a) =>
          a.provider === provider && a.providerAccountId === providerAccountId,
      );

      if (!account) {
        console.log(
          `❌ No account found for provider: ${provider}, id: ${providerAccountId}`,
        );
        return null;
      }

      console.log(`✅ Account found with userId: ${account.userId}`);

      const user = global.memoryAdapterStorage.users.find(
        (user) => user.id === account.userId,
      );

      if (!user) {
        console.log(`❌ User not found for account userId: ${account.userId}`);
        return null;
      }

      console.log(`✅ User found for account:`, {
        id: user.id,
        email: user.email,
        name: user.name,
      });
      logStorageState('After getUserByAccount');
      return user;
    },

    updateUser: async (userData) => {
      console.log(`🔵 updateUser called for ID: ${userData.id}`, userData);

      const i = global.memoryAdapterStorage.users.findIndex(
        (u) => u.id === userData.id,
      );

      if (i === -1) {
        console.log(`❌ User not found for update: ${userData.id}`);
        throw new Error('User not found');
      }

      const originalUser = { ...global.memoryAdapterStorage.users[i] };
      global.memoryAdapterStorage.users[i] = {
        ...originalUser,
        ...userData,
      };

      console.log(`✅ User updated: ${userData.id}`, {
        before: {
          email: originalUser.email,
          name: originalUser.name,
        },
        after: {
          email: global.memoryAdapterStorage.users[i].email,
          name: global.memoryAdapterStorage.users[i].name,
        },
      });

      return global.memoryAdapterStorage.users[i];
    },

    deleteUser: async (userId) => {
      console.log(`🔵 deleteUser called for ID: ${userId}`);

      const index = global.memoryAdapterStorage.users.findIndex(
        (u) => u.id === userId,
      );

      if (index !== -1) {
        const deletedUser = global.memoryAdapterStorage.users[index];
        global.memoryAdapterStorage.users.splice(index, 1);
        console.log(`✅ User deleted: ${userId}`, { email: deletedUser.email });
      } else {
        console.log(`❓ deleteUser called but user not found: ${userId}`);
      }

      // Clean up related data
      const initialAccountsCount = global.memoryAdapterStorage.accounts.length;
      global.memoryAdapterStorage.accounts =
        global.memoryAdapterStorage.accounts.filter((a) => a.userId !== userId);

      console.log(
        `🧹 Removed ${initialAccountsCount - global.memoryAdapterStorage.accounts.length} associated accounts`,
      );

      const initialSessionsCount = global.memoryAdapterStorage.sessions.length;
      global.memoryAdapterStorage.sessions =
        global.memoryAdapterStorage.sessions.filter((s) => s.userId !== userId);

      console.log(
        `🧹 Removed ${initialSessionsCount - global.memoryAdapterStorage.sessions.length} associated sessions`,
      );

      const initialAuthenticatorsCount =
        global.memoryAdapterStorage.authenticators.length;
      global.memoryAdapterStorage.authenticators =
        global.memoryAdapterStorage.authenticators.filter(
          (a) => a.userId !== userId,
        );

      console.log(
        `🧹 Removed ${initialAuthenticatorsCount - global.memoryAdapterStorage.authenticators.length} associated authenticators`,
      );
      logStorageState('After deleteUser');
    },

    // Account operations
    getAccount: async (providerAccountId, provider) => {
      console.log(
        `🔵 getAccount called for ${provider} with ID: ${providerAccountId}`,
      );

      const account =
        global.memoryAdapterStorage.accounts.find(
          (a) =>
            a.providerAccountId === providerAccountId &&
            a.provider === provider,
        ) || null;

      console.log(
        `${account ? '✅ Account found' : '❌ Account not found'} for ${provider}:${providerAccountId}`,
      );

      return account;
    },

    // linkAccount: async (data) => {
    //   console.log(`🔵 linkAccount called:`, {
    //     provider: data.provider,
    //     providerAccountId: data.providerAccountId,
    //     userId: data.userId,
    //     type: data.type,
    //   });

    //   // Check if this account already exists
    //   const existingAccount = global.memoryAdapterStorage.accounts.find(
    //     (a) =>
    //       a.provider === data.provider &&
    //       a.providerAccountId === data.providerAccountId,
    //   );

    //   if (existingAccount) {
    //     console.log(
    //       `⚠️ Account already exists for ${data.provider}:${data.providerAccountId}, updating userId from ${existingAccount.userId} to ${data.userId}`,
    //     );
    //     existingAccount.userId = data.userId;
    //     logStorageState('After updating existing account');
    //     return existingAccount;
    //   }

    //   const account = { id: crypto.randomUUID(), ...data };
    //   global.memoryAdapterStorage.accounts.push(account);

    //   console.log(
    //     `✅ New account linked for ${data.provider}:${data.providerAccountId} to user ${data.userId}`,
    //   );
    //   logStorageState('After linking new account');
    //   return account;
    // },

    linkAccount: async (data) => {
      console.log(`🔵 linkAccount called:`, {
        provider: data.provider,
        providerAccountId: data.providerAccountId,
        userId: data.userId,
      });

      // Check if account already exists
      const existingAccount = global.memoryAdapterStorage.accounts.find(
        (a) =>
          a.provider === data.provider &&
          a.providerAccountId === data.providerAccountId,
      );

      if (existingAccount) {
        console.log(
          `Account already exists for ${data.provider}:${data.providerAccountId}`,
        );

        // This is the key fix: Instead of updating the existing account,
        // we'll return it as-is to maintain the original user association
        return existingAccount;
      }

      // Otherwise create new account
      const account = { id: crypto.randomUUID(), ...data };
      global.memoryAdapterStorage.accounts.push(account);
      console.log(
        `New account created: ${data.provider}:${data.providerAccountId}`,
      );
      return account;
    },

    unlinkAccount: async ({ provider, providerAccountId }) => {
      console.log(
        `🔵 unlinkAccount called for ${provider}:${providerAccountId}`,
      );

      const index = global.memoryAdapterStorage.accounts.findIndex(
        (a) =>
          a.provider === provider && a.providerAccountId === providerAccountId,
      );

      if (index !== -1) {
        const unlinkedAccount = global.memoryAdapterStorage.accounts[index];
        global.memoryAdapterStorage.accounts.splice(index, 1);
        console.log(
          `✅ Account unlinked: ${provider}:${providerAccountId}, belonged to userId: ${unlinkedAccount.userId}`,
        );
      } else {
        console.log(
          `❓ unlinkAccount called but account not found: ${provider}:${providerAccountId}`,
        );
      }

      logStorageState('After unlinkAccount');
    },

    // // Session operations
    // createSession: async (data) => {
    //   console.log(`🔵 createSession called for user: ${data.userId}`);

    //   const session = { id: crypto.randomUUID(), ...data };
    //   global.memoryAdapterStorage.sessions.push(session);

    //   console.log(
    //     `✅ Session created with token: ${session.sessionToken.substring(0, 8)}...`,
    //   );
    //   console.log(
    //     `📊 Total sessions: ${global.memoryAdapterStorage.sessions.length}`,
    //   );

    //   return session;
    // },
    // Modify the createSession function:
    createSession: async (data) => {
      console.log(`🔵 createSession called for user: ${data.userId}`);

      // Force creation of a new session with guaranteed unique ID
      const session = {
        id: crypto.randomUUID(),
        ...data,
        // Ensure the expires field is properly set
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      };

      // Check if session already exists and remove it first
      const existingSessionIndex =
        global.memoryAdapterStorage.sessions.findIndex(
          (s) => s.userId === data.userId,
        );

      if (existingSessionIndex !== -1) {
        global.memoryAdapterStorage.sessions.splice(existingSessionIndex, 1);
        console.log(`🧹 Removed existing session for user: ${data.userId}`);
      }

      // Add the new session
      global.memoryAdapterStorage.sessions.push(session);

      console.log(
        `✅ Session created with token: ${session.sessionToken.substring(0, 8)}...`,
      );
      console.log(
        `📊 Total sessions: ${global.memoryAdapterStorage.sessions.length}`,
      );

      return session;
    },

    getSessionAndUser: async (sessionToken) => {
      console.log(
        `🔵 getSessionAndUser called for token: ${sessionToken.substring(0, 8)}...`,
      );

      const session = global.memoryAdapterStorage.sessions.find(
        (s) => s.sessionToken === sessionToken,
      );

      if (!session) {
        console.log('❌ Session not found');
        return null;
      }

      console.log(`✅ Session found for user: ${session.userId}`);

      const user = global.memoryAdapterStorage.users.find(
        (u) => u.id === session.userId,
      );

      if (!user) {
        console.log(
          `❌ User not found for session's userId: ${session.userId}`,
        );
        return null;
      }

      console.log(`✅ User found for session: ${user.email}`);
      return { session, user };
    },

    updateSession: async (data) => {
      console.log(
        `🔵 updateSession called for token: ${data.sessionToken.substring(0, 8)}...`,
      );

      const index = global.memoryAdapterStorage.sessions.findIndex(
        (s) => s.sessionToken === data.sessionToken,
      );

      if (index === -1) {
        console.log('❌ Session not found for update');
        return null;
      }

      global.memoryAdapterStorage.sessions[index] = {
        ...global.memoryAdapterStorage.sessions[index],
        ...data,
      };

      console.log('✅ Session updated');
      return global.memoryAdapterStorage.sessions[index];
    },

    deleteSession: async (sessionToken) => {
      console.log(
        `🔵 deleteSession called for token: ${sessionToken.substring(0, 8)}...`,
      );

      const index = global.memoryAdapterStorage.sessions.findIndex(
        (s) => s.sessionToken === sessionToken,
      );

      if (index !== -1) {
        global.memoryAdapterStorage.sessions.splice(index, 1);
        console.log('✅ Session deleted');
      } else {
        console.log('❓ deleteSession called but session not found');
      }

      console.log(
        `📊 Remaining sessions: ${global.memoryAdapterStorage.sessions.length}`,
      );
    },

    // Rest of the methods with added logging...
    createVerificationToken: async (data) => {
      console.log(`🔵 createVerificationToken called for ${data.identifier}`);
      global.memoryAdapterStorage.verificationTokens.push(data);
      console.log(`✅ Verification token created, expires: ${data.expires}`);
      return data;
    },

    useVerificationToken: async ({ identifier, token }) => {
      console.log(`🔵 useVerificationToken called for ${identifier}`);

      const index = global.memoryAdapterStorage.verificationTokens.findIndex(
        (v) => v.identifier === identifier && v.token === token,
      );

      if (index === -1) {
        console.log('❌ Verification token not found');
        return null;
      }

      const verificationToken =
        global.memoryAdapterStorage.verificationTokens[index];
      global.memoryAdapterStorage.verificationTokens.splice(index, 1);
      console.log(`✅ Verification token found and used for ${identifier}`);
      return verificationToken;
    },

    // WebAuthn (Passkey) methods
    getAuthenticator: async (credentialID) => {
      console.log(
        `🔵 getAuthenticator called for credentialID: ${credentialID}`,
      );

      const authenticator =
        global.memoryAdapterStorage.authenticators.find(
          (a) => a.credentialID === credentialID,
        ) || null;

      console.log(
        `${authenticator ? '✅ Authenticator found' : '❌ Authenticator not found'} for credentialID: ${credentialID}`,
      );
      return authenticator;
    },

    createAuthenticator: async (data) => {
      console.log(`🔵 createAuthenticator called for user: ${data.userId}`);

      const authenticator = { id: crypto.randomUUID(), ...data };
      global.memoryAdapterStorage.authenticators.push(authenticator);

      console.log(
        `✅ Authenticator created for user: ${data.userId}, credentialID: ${data.credentialID}`,
      );
      console.log(
        `📊 Total authenticators: ${global.memoryAdapterStorage.authenticators.length}`,
      );

      return authenticator;
    },

    listAuthenticatorsByUserId: async (userId) => {
      console.log(`🔵 listAuthenticatorsByUserId called for user: ${userId}`);

      const authenticators = global.memoryAdapterStorage.authenticators.filter(
        (a) => a.userId === userId,
      );

      console.log(
        `✅ Found ${authenticators.length} authenticators for user: ${userId}`,
      );

      if (authenticators.length > 0) {
        console.log(
          '📋 First few authenticators:',
          authenticators.slice(0, 2).map((a) => ({
            credentialID: a.credentialID,
            transports: a.transports,
          })),
        );
      }

      return authenticators;
    },

    updateAuthenticatorCounter: async (credentialID, counter) => {
      console.log(
        `🔵 updateAuthenticatorCounter called for credentialID: ${credentialID}, counter: ${counter}`,
      );

      const index = global.memoryAdapterStorage.authenticators.findIndex(
        (a) => a.credentialID === credentialID,
      );

      if (index === -1) {
        console.log(
          `❌ Authenticator not found for updating counter: ${credentialID}`,
        );
        return null;
      }

      const oldCounter =
        global.memoryAdapterStorage.authenticators[index].counter;
      global.memoryAdapterStorage.authenticators[index].counter = counter;

      console.log(
        `✅ Authenticator counter updated from ${oldCounter} to ${counter}`,
      );
      return global.memoryAdapterStorage.authenticators[index];
    },
  };
}
