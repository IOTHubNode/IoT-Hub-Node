const fs = require("fs");
const path = require("path");

// 动态挂载路由
module.exports = (app) => {
  const routesDir = path.join(__dirname);

  fs.readdirSync(routesDir).forEach((file) => {
    const routePath = path.join(routesDir, file);
    const stat = fs.statSync(routePath);

    if (!stat.isDirectory()) return false;

    const routerModule = require(path.join(routePath, file));
    const router = typeof routerModule === 'function' ? routerModule(app) : routerModule;

    app.use(router.routes()).use(router.allowedMethods());
  });
};






// 手动挂载路由

// // 账户相关路由
// const accountRouter = require('./account/account');


// // 挂载路由
// module.exports = (app) => {
//     app.use(accountRouter.routes(), accountRouter.allowedMethods());
// }