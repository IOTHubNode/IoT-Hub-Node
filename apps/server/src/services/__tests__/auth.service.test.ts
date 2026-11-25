import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createDatabase, type DatabaseHandle } from '../../db/index.js';
import { AuthService } from '../auth.service.js';

describe('AuthService', () => {
  let handle: DatabaseHandle;
  let auth: AuthService;

  beforeEach(() => {
    handle = createDatabase(':memory:');
    auth = new AuthService(handle.db, 'test-secret-key');
  });

  afterEach(() => {
    handle.close();
  });

  it('completes initial admin setup and rejects duplicate setup', () => {
    expect(auth.isInitialized()).toBe(false);

    const { token, user } = auth.setupAdmin('admin', 'secret123');
    expect(auth.isInitialized()).toBe(true);
    expect(user.username).toBe('admin');
    expect(user.apiKey).toMatch(/^ih_[a-f0-9]{48}$/);
    expect(auth.verifySessionToken(token)?.username).toBe('admin');

    expect(() => auth.setupAdmin('admin2', 'secret123')).toThrow('系统已完成初始化');
  });

  it('verifies login credentials and rejects invalid passwords', () => {
    auth.setupAdmin('admin', 'secret123');

    const ok = auth.login('admin', 'secret123');
    expect(ok).not.toBeNull();
    expect(ok?.user.username).toBe('admin');

    expect(auth.login('admin', 'wrongpass')).toBeNull();
    expect(auth.login('nobody', 'secret123')).toBeNull();
  });

  it('verifies and rotates API/MCP Bearer keys', () => {
    const { user } = auth.setupAdmin('admin', 'secret123');
    expect(auth.verifyApiKey(user.apiKey)?.id).toBe(user.id);
    expect(auth.verifyApiKey('ih_invalid')).toBeNull();

    const rotated = auth.rotateApiKey(user.id);
    expect(rotated).not.toBe(user.apiKey);
    expect(auth.verifyApiKey(user.apiKey)).toBeNull();
    expect(auth.verifyApiKey(rotated)?.id).toBe(user.id);
  });
});
