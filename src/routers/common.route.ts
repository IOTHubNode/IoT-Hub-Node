//常用具路由

/**
 * @swagger
 * tags:
 *   name: 工具路由
 *   description: 工具路由
 *   baseurl: /v1/util
 */

import Router from 'koa-router';
import { SUCCESS } from '../config/code/responseCode';
import { uploadPicture } from '../utils/util';

const router = new Router({ prefix: '/v1/util' });
/**
 * @swagger
 * tags:
 *   name: 工具路由
 *   description: 用于测试最基本的路由功能
 */


/**
 * @swagger
 * /util/local_picture:
 *   post:
 *     summary: 测试post请求
 *     description: 测试post请求
 *     tags: [工具路由]
 *     responses:
 *       200:
 *         description: 这是一个工具路由,post请求正常!
 *
 */
router.post('/local_picture', uploadPicture);

export default router;
