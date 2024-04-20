//常具路由

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
 *     summary: 图片上传
 *     description: 图片上传
 *     tags: [工具路由]
 *     responses:
 *       200:
 *         description: 图片上传
 *
 */
router.post('/local_picture', uploadPicture);

export default router;
