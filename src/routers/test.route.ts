//测试路由

/**
 * @swagger
 * tags:
 *   name: 测试路由
 *   description: 测试路由
 *   baseurl: /v1/test
 */

import Router from 'koa-router';
import { SUCCESS } from '../config/code/responseCode';
const router = new Router({ prefix: '/v1/test' });
/**
 * @swagger
 * tags:
 *   name: 测试路由
 *   description: 用于测试最基本的路由功能
 */

/**
 * @swagger
 * /test/post:
 *   post:
 *     summary: 测试post请求
 *     description: 测试post请求
 *     tags: [测试路由]
 *     responses:
 *       200:
 *         description: 这是一个测试路由,post请求正常!
 *
 */
router.post('/post', async (ctx: any, next: any) => {
  console.log('测试路由:post');
  await SUCCESS(ctx, {}, '这是一个测试路由,post请求正常!');
});

/**
 * @swagger
 * /test/delete:
 *   delete:
 *     summary: 测试delete请求
 *     description: 测试delete请求
 *     tags: [测试路由]
 *     responses:
 *       200:
 *         description: 这是一个测试路由,delete请求正常!
 *
 */
router.delete('/delete', async (ctx: any, next: any) => {
  console.log('测试路由:delete');
  await SUCCESS(ctx, {}, '这是一个测试路由,delete请求正常!');
});

/**
 * @swagger
 * /test/get:
 *   get:
 *     summary: 测试get请求
 *     description: 测试get请求
 *     tags: [测试路由]
 *     responses:
 *       200:
 *         description: 这是一个测试路由,get请求正常!
 *
 */
router.get('/get', async (ctx: any, next: any) => {
  console.log('测试路由:get');
  await SUCCESS(ctx, {}, '这是一个测试路由,get请求正常!');
});

/**
 * @swagger
 * /test/put:
 *   put:
 *     summary: 测试put请求
 *     description: 测试put请求
 *     tags: [测试路由]
 *     responses:
 *       200:
 *         description: 这是一个测试路由,put请求正常!
 *
 */
router.put('/put', async (ctx: any, next: any) => {
  console.log('测试路由:put');
  await SUCCESS(ctx, {}, '这是一个测试路由,put请求正常!');
});

export default router;
