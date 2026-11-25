import type { MiddlewareHandler } from 'hono';
import type { AuthService, AuthUser } from '../services/auth.service.js';

export interface AuthVariables {
  user: AuthUser;
}

export function createAuthMiddleware(authService: AuthService): MiddlewareHandler<{
  Variables: AuthVariables;
}> {
  return async (c, next) => {
    const header = c.req.header('Authorization');
    const bearer = header?.startsWith('Bearer ') ? header.slice(7).trim() : '';

    if (!bearer) {
      return c.json({ error: '未授权，请先登录' }, 401);
    }

    const user = bearer.startsWith('ih_')
      ? authService.verifyApiKey(bearer)
      : authService.verifySessionToken(bearer);

    if (!user) {
      return c.json({ error: '登录态或 API Token 无效' }, 401);
    }

    c.set('user', user);
    await next();
  };
}
