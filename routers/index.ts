import fs from 'fs';
import path from 'path';
import Router from 'koa-router';

export const router = new Router();

fs.readdirSync(__dirname).forEach((file) => {
  if (file !== 'index.js') {
    try {
      const filePath = path.join(__dirname, file);
      const routeModule = require(filePath);
      router.use(routeModule.routes());
    } catch (error) {
      console.error(`Error while loading ${file}:`, error);
    }
  }
});


// 手动挂载路由

// // 账户相关路由
// const accountRouter = require('./account/account');


// // 挂载路由
// module.exports = (app) => {
//     app.use(accountRouter.routes(), accountRouter.allowedMethods());
// }