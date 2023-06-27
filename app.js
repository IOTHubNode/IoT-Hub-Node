const path = require("path");
const http = require('http');
const https = require('https');
const Koa = require("koa");
const static = require("koa-static");
const router = require('./routers/index');

const app = new Koa();

// 错误处理(最外层中间件)
app.use(async (ctx, next) => {
    try {
        await next();
    } catch (err) {
        ctx.body = {
            code: err.status || 500,
            message: err.message
        }
    }
})

// 静态资源挂载
app.use(static(path.join(__dirname + "/public")));

//  路由挂载
router(app)

// app.use(async (ctx) => {
//   ctx.body = "hello koa2";
// });


http.createServer(app.callback(
    console.log("服务器开启: http://localhost:3000/")
)).listen(3000);
https.createServer(app.callback(
    console.log("服务器开启: https://localhost:3001/")
)).listen(3001);