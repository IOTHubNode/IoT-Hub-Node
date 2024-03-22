import Koa from 'koa';
// 错误模型
export class ErrorModel {
  code: number;
  msg: string;
  statusCode: number;
  data: object;
  constructor(code = 500, msg = '未知服务器错误', statusCode = 500, data?: any) {
    this.code = code; //data携带的内部异常状态码
    this.msg = msg; // 消息
    this.statusCode = statusCode; //外层的状态码
    this.data = data || {};
  }
  throwErr(ctx: Koa.Context) {
    //抛出错误
    ctx.throw(this.statusCode, this.msg, {
      code: this.code,
      data: this.data,
      flag: 'ErrorModel',
    });
  }
}

// 400:请求无效，例如请求体或参数错误
export class ParameterError extends ErrorModel {
  constructor(code: number, msg = '请求错误', data?: any) {
    super(code, msg, 400, data);
  }
}

// 401:未通过服务端认证，API 密钥过期或不存在时可能会发生
export class AuthError extends ErrorModel {
  constructor(code: number, msg = '未通过服务端认证', data?: any) {
    super(code, msg, 401, data);
  }
}

// 403:无权操作，检查操作对象是否正在使用或有依赖约束
export class PermissionError extends ErrorModel {
  constructor(code: number, msg = '未通过服务端认证', data?: any) {
    super(code, msg, 403, data);
  }
}
// 404:找不到请求路径或请求的对象不存在
export class NotFoundError extends ErrorModel {
  constructor(code: number, msg = '未找到该api', data?: any) {
    super(code, msg, 404, data);
  }
}

// 404:请求的资源已存在或数量超过限制
export class ExcessiveError extends ErrorModel {
  constructor(code: number, msg = '未找到该api', data?: any) {
    super(code, msg, 404, data);
  }
}

// 500
export class InternalServerError extends ErrorModel {
  constructor(code: number, msg = '服务器内部错误', data?: any) {
    super(code, msg, 500, data);
  }
}
