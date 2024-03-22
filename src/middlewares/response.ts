//返回统一出口中间件

import { Context, Next } from 'koa';

// 这个middleware用于将ctx.result中的内容最终回传给客户端
export const responseHandler = async (ctx: Context, next: Next) => {
  console.log('responseHandler');
  if (ctx.result !== undefined) {
    ctx.type = 'json';
    ctx.body = {
      code: 200,
      msg: ctx.msg || '成功',
      data: ctx.result,
    };
    await next();
  }
};
