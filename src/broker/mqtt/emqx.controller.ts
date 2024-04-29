// eook模块

import { SUCCESS, PARAM_NOT_VALID } from '../../config/code/responseCode';
//import { bigIntToString } from '../utils/util';


class HookController {

  // webhook接口
  async Webhook(ctx: any, next: any) {
    //console.log('webhook');
    //console.log(ctx.request.body);

    const { event } = ctx.request.body;
    switch (event) {
      case 'client.connected':
        console.log('事件: 连接建立');
        break;
      case 'client.disconnected':
        console.log('事件: 连接断开');
        break;
      case 'client.connack':
        console.log('事件: 连接确认');
        break;
      case 'client.check_authz_complete':
        console.log('事件: 授权结果');
        break;
      case 'session.subscribed':
        console.log('事件: 会话订阅完成');
        break;
      case 'session.unsubscribed':
        console.log('事件: 会话取消订阅完成');
        break;
      case 'message.publish':
        console.log('事件: 消息发布');
        console.log(ctx.request.body.payload);
        break;
      case 'message.delivered':
        console.log('事件: 消息已投递');
        break;
      case 'message.acked':
        console.log('事件: 消息应答');
        break;
      case 'message.dropped':
        console.log('事件: 消息丢弃');
        break;
      default:
        console.log('未知事件');
    }

    await SUCCESS(ctx, '1', 'Webhook成功');
  }
}


export default new HookController();
