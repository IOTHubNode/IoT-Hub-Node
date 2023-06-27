
// 账户相关路由
const accountRouter = require('./account/account');


// 挂载路由
module.exports = (app) => {
    app.use(accountRouter.routes(), accountRouter.allowedMethods());
}


