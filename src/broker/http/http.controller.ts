// eook模块

import { SUCCESS, PARAM_NOT_VALID } from '../../config/code/responseCode';
//import { bigIntToString } from '../utils/util';

class HookController {
  // hook 处理
  async Webhook(ctx: any, next: any) {
    console.log('webhook');
    console.log(ctx.request);
    await SUCCESS(ctx, '1', 'Webhook成功');
  }
}

export default new HookController();
