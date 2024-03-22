//koa集成swagger生成接口文档

import Router from 'koa-router';
import { Context } from 'koa';
import swaggerJSDoc from '../middlewares/swagger.config';
const router = new Router();

router.get('/docs', (ctx: Context) => {
  ctx.body = swaggerJSDoc;
});
export default router;
