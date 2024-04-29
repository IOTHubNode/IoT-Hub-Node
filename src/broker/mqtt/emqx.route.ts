/**
 * @swagger
 * tags:
 *   name: 桥接器入口
 *   description: Webhook桥接器(MQTT)
 *   baseurl: /v1/broker
 */

import Router from 'koa-router';
const router = new Router({ prefix: '/v1/broker' });

import Controller from './emqx.controller';

// 用于EMQX集成的Webhook接口
router.post('/mqtt/auth', Controller.Auth);

// 用于EMQX集成的Webhook接口
router.post('/mqtt/hook', Controller.Webhook);

export default router;
