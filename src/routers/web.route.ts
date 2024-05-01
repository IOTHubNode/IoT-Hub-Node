
import Router from 'koa-router';
const router = new Router({ prefix: '' });


// 重定向根目录到 /index.html
router.get('/', async (ctx: any, next: any) => {
  ctx.redirect('/index.html');
});

// 重定向根目录到 /index.html
router.get('/login', async (ctx: any, next: any) => {
  ctx.redirect('/index.html');
});

export default router;
