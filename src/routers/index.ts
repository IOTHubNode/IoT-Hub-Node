import fs from 'fs';
import path from 'path';
import Router from 'koa-router';
const router = new Router();

fs.readdirSync(__dirname).forEach((file) => {
  // console.log(file)
  if (file !== 'index.js') {
    import(path.join(__dirname, file))
      .then((r) => {
        router.use(r.default.routes());
      })
      .catch((error) => {
        // 处理导入错误
        console.log('路由自动加载错误' + error);
      });
  }
});

export default router;
