/**
 * @swagger
 * tags:
 *   name: Webhook桥接器(MQTT)
 *   description: Webhook桥接器(MQTT)
 *   baseurl: /v1
 */

import Router from 'koa-router';
const router = new Router({ prefix: '/v1' });

import Controller from './webhook.controller';


// 用于EMQX集成的Webhook接口
router.post('/mqtt/hook', Controller.Webhook);

export default router;
