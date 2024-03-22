// 错误处理中间件

import { ErrorModel } from '../config/code/errCode';

export const errorHandler = async (ctx: any, next: any) => {
  try {
    await next();
  } catch (err) {
    console.log(err);
    //判断是否为已知错误
    if (err.flag === 'ErrorModel') {
      return format(err, ctx);
    } else {
      //对于未知的错误返回统一的消息
      return format(new ErrorModel(), ctx);
    }
  }
};

// 格式化错误响应
const format = (err: any, ctx: any) => {
  ctx.status = err.statusCode;
  ctx.body = {
    code: err.code,
    msg: err.message || err.msg,
    data: err.data || { request: ctx.method + ' >> ' + ctx.url },
  };
};
