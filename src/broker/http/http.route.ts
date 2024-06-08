/**
 * @swagger
 * tags:
 *   name: 桥接器入口
 *   description: HTTP/HTTPS桥接器
 *   baseurl: /v1/broker
 */

import Router from 'koa-router';
const router = new Router({ prefix: '/v1/broker' });

import Controller from './http.controller';

// 用于EMQX集成的Webhook接口
router.post('/http/', Controller.Webhook);

export default router;
