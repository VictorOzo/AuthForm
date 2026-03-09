export type UserRecord = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  avatarUrl?: string;
};

type DbShape = {
  usersById: Map<string, UserRecord>;
  usersByEmail: Map<string, string>;
  sessions: Map<string, string>;
};

const globalForDb = globalThis as typeof globalThis & { __authFormDb?: DbShape };

const defaultUser: UserRecord = {
  id: 'demo-user',
  firstName: 'Demo',
  lastName: 'User',
  email: 'demo@example.com',
  username: 'demo-user',
  avatarUrl: '/avatars/demo.svg',
};

const db: DbShape =
  globalForDb.__authFormDb ?? {
    usersById: new Map([[defaultUser.id, defaultUser]]),
    usersByEmail: new Map([[defaultUser.email, defaultUser.id]]),
    sessions: new Map(),
  };

globalForDb.__authFormDb = db;

export const SESSION_COOKIE = 'auth_session';

export function toPublicUser(user: UserRecord) {
  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    username: user.username,
    avatarUrl: user.avatarUrl,
  };
}

export function getUserBySession(sessionId?: string | null) {
  if (!sessionId) return null;
  const userId = db.sessions.get(sessionId);
  if (!userId) return null;
  return db.usersById.get(userId) ?? null;
}

export function createSessionForUser(userId: string) {
  const sessionId = `${userId}-${crypto.randomUUID()}`;
  db.sessions.set(sessionId, userId);
  return sessionId;
}

export function clearSession(sessionId?: string | null) {
  if (!sessionId) return;
  db.sessions.delete(sessionId);
}

export function getOrCreateUserByEmail(email: string) {
  const normalizedEmail = email.trim().toLowerCase();
  const existingUserId = db.usersByEmail.get(normalizedEmail);
  if (existingUserId) {
    return db.usersById.get(existingUserId) ?? null;
  }

  const localPart = normalizedEmail.split('@')[0] ?? 'user';
  const newUser: UserRecord = {
    id: crypto.randomUUID(),
    firstName: localPart.charAt(0).toUpperCase() + localPart.slice(1),
    lastName: 'User',
    email: normalizedEmail,
    username: localPart,
    avatarUrl: '/avatars/demo.svg',
  };

  db.usersById.set(newUser.id, newUser);
  db.usersByEmail.set(newUser.email, newUser.id);
  return newUser;
}

export function updateUser(userId: string, updates: Partial<UserRecord>) {
  const existing = db.usersById.get(userId);
  if (!existing) return null;
  const nextUser = { ...existing, ...updates };
  db.usersById.set(userId, nextUser);
  if (nextUser.email !== existing.email) {
    db.usersByEmail.delete(existing.email);
    db.usersByEmail.set(nextUser.email, userId);
  }
  return nextUser;
}
