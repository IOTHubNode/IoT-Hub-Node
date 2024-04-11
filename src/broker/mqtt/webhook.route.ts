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

router.get('/mqtt/hook', Controller.Webhook);

export default router;
