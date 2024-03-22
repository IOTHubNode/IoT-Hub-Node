//JWT认证中间件

import { verify } from 'jsonwebtoken';
import { JWT } from '../config/constant';
import Koa from 'koa';
import { TOKEN_EXPIRED, TOKEN_INVALID } from '../config/code/responseCode';
import { PublicRouter } from '../config/constant';

export const Jwtauth = async (ctx: Koa.Context, next: Koa.Next) => {
  // 检查当前请求的路径，如果匹配指定的路由，则跳过认证
  if (checkIgnore(ctx.path)) {
    await next();
    return;
  }
  const { authorization = '' } = ctx.request.header;
  const token = authorization.replace('Bearer ', '');
  // console.log(token)
  try {
    // user中包含了payload的信息(id)
    const user = verify(token, JWT.secret);
    ctx.state.user = user;
  } catch (err) {
    switch (err.name) {
      // token过期
      case 'TokenExpiredError':
        return await TOKEN_EXPIRED(ctx);
      // token错误
      case 'JsonWebTokenError':
        return await TOKEN_INVALID(ctx);
    }
  }

  await next();
};

// 判断是否应该跳过认证的辅助函数
function checkIgnore(path: string): boolean {
  // 在这里添加需要跳过认证的路由规则
  const ignoreRoutes = PublicRouter;
  return ignoreRoutes.some((route) => route.test(path));
}
