import SuccessModel from './successCode';
import { ParameterError, AuthError, NotFoundError, InternalServerError, PermissionError } from './errCode';
import Koa from 'koa';

// 成功
// 200 请求成功
export const SUCCESS = async (ctx: Koa.Context, data: any, msg: any) => new SuccessModel(200, msg, data).success(ctx);

// 失败
// 400
export const PARAM_NOT_VALID = async (ctx: Koa.Context, msg = '请求参数无效', data?: any) =>
  new ParameterError(40001, msg, data).throwErr(ctx);
export const PARAM_IS_BLANK = async (ctx: Koa.Context, msg = '请求参数为空') => new ParameterError(40002, msg).throwErr(ctx);
export const PARAM_TYPE_ERROR = async (ctx: Koa.Context, msg = '请求参数类型错误') => new ParameterError(40003, msg).throwErr(ctx);
export const PARAM_NOT_COMPLETE = async (ctx: Koa.Context, msg = '请求参数缺失') => new ParameterError(40004, msg).throwErr(ctx);
export const USER_NOT_LOGIN = async (ctx: Koa.Context, msg = '用户未登录') => new ParameterError(40005, msg).throwErr(ctx);
export const USER_ACCOUNT_NOT_EXIST = async (ctx: Koa.Context, msg = '账号不存在') => new ParameterError(40006, msg).throwErr(ctx);
export const USER_ACCOUNT_ALREADY_EXIST = async (ctx: Koa.Context, msg = '账号已存在') => new ParameterError(40007, msg).throwErr(ctx);
export const USER_PWD_ERROR = async (ctx: Koa.Context, msg = '密码错误') => new ParameterError(40008, msg).throwErr(ctx);

// 401 未通过服务端认证
export const TOKEN_IS_BLANK = async (ctx: Koa.Context) => new AuthError(40101, 'token为空').throwErr(ctx);
export const TOKEN_EXPIRED = async (ctx: Koa.Context) => new AuthError(40102, 'token过期').throwErr(ctx);
export const TOKEN_INVALID = async (ctx: Koa.Context) => new AuthError(40103, 'token无效').throwErr(ctx);
export const AUTHENTICATION_FAIL = async (ctx: Koa.Context, msg = '认证失败') => new AuthError(40104, msg).throwErr(ctx);

// 403 权限限制
export const AUTH_PERMISSION_FAIL = async (ctx: Koa.Context) => new PermissionError(40301, '权限认证失败').throwErr(ctx);

// 404 未找到请求路径或请求的对象不存在
export const NotFound = async (ctx: Koa.Context) => new NotFoundError(40401, '未找到api,请检查请求路径以及请求方法是否出错').throwErr(ctx);

// 500 服务器内部错误
export const FAIL = async (ctx: Koa.Context, msg) => new InternalServerError(50001, msg).throwErr(ctx);
export const FILE_UPLOAD_FAIL = async (ctx: Koa.Context) => new InternalServerError(50002, '文件上传失败').throwErr(ctx);
export const DB_FAIL = async (ctx: Koa.Context) => new InternalServerError(50003, '数据库操作失败').throwErr(ctx);

//参考链接：https://juejin.cn/post/6847902223138029581
