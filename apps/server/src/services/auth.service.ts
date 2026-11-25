import crypto from 'node:crypto';
import { eq } from 'drizzle-orm';
import type { AppDatabase } from '../db/index.js';
import { users } from '../db/schema.js';

export interface AuthUser {
  id: number;
  username: string;
  apiKey: string;
  createdAt: number;
}

interface JwtPayload {
  sub: number;
  username: string;
  exp: number;
}

const TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export class AuthService {
  constructor(
    private readonly db: AppDatabase,
    private readonly jwtSecret: string,
  ) {}

  isInitialized(): boolean {
    const existing = this.db.select({ id: users.id }).from(users).limit(1).get();
    return Boolean(existing);
  }

  setupAdmin(username: string, password: string): { token: string; user: AuthUser } {
    if (this.isInitialized()) {
      throw new Error('系统已完成初始化，请直接登录');
    }
    const passwordHash = this.hashPassword(password);
    const apiKey = this.generateApiKey();
    const createdAt = Date.now();

    const inserted = this.db
      .insert(users)
      .values({ username, passwordHash, apiKey, createdAt })
      .returning()
      .get();

    const user: AuthUser = {
      id: inserted.id,
      username: inserted.username,
      apiKey: inserted.apiKey,
      createdAt: inserted.createdAt,
    };

    return {
      token: this.signToken({ sub: user.id, username: user.username, exp: Date.now() + TOKEN_TTL_MS }),
      user,
    };
  }

  login(username: string, password: string): { token: string; user: AuthUser } | null {
    const record = this.db.select().from(users).where(eq(users.username, username)).get();
    if (!record || !this.verifyPassword(password, record.passwordHash)) {
      return null;
    }
    const user: AuthUser = {
      id: record.id,
      username: record.username,
      apiKey: record.apiKey,
      createdAt: record.createdAt,
    };
    return {
      token: this.signToken({ sub: user.id, username: user.username, exp: Date.now() + TOKEN_TTL_MS }),
      user,
    };
  }

  verifySessionToken(token: string): AuthUser | null {
    const payload = this.verifyToken(token);
    if (!payload) return null;
    const record = this.db.select().from(users).where(eq(users.id, payload.sub)).get();
    if (!record) return null;
    return {
      id: record.id,
      username: record.username,
      apiKey: record.apiKey,
      createdAt: record.createdAt,
    };
  }

  verifyApiKey(apiKey: string): AuthUser | null {
    if (!apiKey) return null;
    const record = this.db.select().from(users).where(eq(users.apiKey, apiKey)).get();
    if (!record) return null;
    return {
      id: record.id,
      username: record.username,
      apiKey: record.apiKey,
      createdAt: record.createdAt,
    };
  }

  rotateApiKey(userId: number): string {
    const nextKey = this.generateApiKey();
    this.db.update(users).set({ apiKey: nextKey }).where(eq(users.id, userId)).run();
    return nextKey;
  }

  private generateApiKey(): string {
    return `ih_${crypto.randomBytes(24).toString('hex')}`;
  }

  private hashPassword(password: string): string {
    const salt = crypto.randomBytes(16).toString('hex');
    const derived = crypto.scryptSync(password, salt, 64).toString('hex');
    return `${salt}:${derived}`;
  }

  private verifyPassword(password: string, storedHash: string): boolean {
    const [salt, keyHex] = storedHash.split(':');
    if (!salt || !keyHex) return false;
    const derived = crypto.scryptSync(password, salt, 64);
    const keyBuf = Buffer.from(keyHex, 'hex');
    if (derived.length !== keyBuf.length) return false;
    return crypto.timingSafeEqual(derived, keyBuf);
  }

  private signToken(payload: JwtPayload): string {
    const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
    const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
    const sig = crypto
      .createHmac('sha256', this.jwtSecret)
      .update(`${header}.${body}`)
      .digest('base64url');
    return `${header}.${body}.${sig}`;
  }

  private verifyToken(token: string): JwtPayload | null {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const [header, body, sig] = parts;
    if (!header || !body || !sig) return null;
    const expected = crypto
      .createHmac('sha256', this.jwtSecret)
      .update(`${header}.${body}`)
      .digest('base64url');
    const sigBuf = Buffer.from(sig);
    const expBuf = Buffer.from(expected);
    if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
      return null;
    }
    try {
      const parsed = JSON.parse(Buffer.from(body, 'base64url').toString('utf8')) as JwtPayload;
      if (typeof parsed.exp !== 'number' || parsed.exp < Date.now()) {
        return null;
      }
      return parsed;
    } catch {
      return null;
    }
  }
}
