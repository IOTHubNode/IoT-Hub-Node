import Koa from 'koa';
class SuccessModel {
  code: number;
  msg: any;
  data?: any;
  constructor(code: any, msg: any, data?: any) {
    this.code = code || 200;
    this.msg = msg || '操作成功';
    if (data) {
      this.data = data;
    }
  }
  success(ctx: Koa.Context) {
    ctx.body = this;
  }
}

export default SuccessModel;
