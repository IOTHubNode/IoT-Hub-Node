import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { z } from 'zod';
import { createAuthMiddleware, type AuthVariables } from '../middleware/auth.middleware.js';
import type { AuthService } from '../services/auth.service.js';

const CredentialsSchema = z.object({
  username: z.string().min(2).max(64),
  password: z.string().min(6).max(128),
});

export function createAuthRoutes(authService: AuthService) {
  const router = new Hono<{ Variables: AuthVariables }>();
  const requireAuth = createAuthMiddleware(authService);

  router.get('/status', (c) => {
    return c.json({ initialized: authService.isInitialized() });
  });

  router.post('/setup', zValidator('json', CredentialsSchema), (c) => {
    const { username, password } = c.req.valid('json');
    try {
      const result = authService.setupAdmin(username, password);
      return c.json(result, 201);
    } catch (err) {
      return c.json({ error: err instanceof Error ? err.message : '初始化失败' }, 409);
    }
  });

  router.post('/login', zValidator('json', CredentialsSchema), (c) => {
    const { username, password } = c.req.valid('json');
    const result = authService.login(username, password);
    if (!result) {
      return c.json({ error: '用户名或密码错误' }, 401);
    }
    return c.json(result);
  });

  router.get('/me', requireAuth, (c) => {
    return c.json({ user: c.get('user') });
  });

  router.post('/rotate-key', requireAuth, (c) => {
    const user = c.get('user');
    const apiKey = authService.rotateApiKey(user.id);
    return c.json({ apiKey });
  });

  return router;
}
