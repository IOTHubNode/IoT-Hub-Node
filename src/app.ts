import fs from 'fs';
import http from 'http';
import https from 'https';
import path from 'path';
import Koa from 'koa';
import Cors from 'koa2-cors';
import koaBody, { HttpMethodEnum } from 'koa-body';
import Static from 'koa-static';
import mount from 'koa-mount';
import parameter from 'koa-parameter';
import Casbin from './middlewares/casbin';
import router from './routers/index';
import broker_router from './broker/index';
import { PORT, DOMAIN } from './config/constant';
import { loggerMiddleware } from './middlewares/log';
import { errorHandler } from './middlewares/error';
import { corsHandler } from './middlewares/cors';
import { responseHandler } from './middlewares/response';
import { getIpAddress, printLogo } from './utils/util';
import { koaSwagger } from 'koa2-swagger-ui';
import { Jwtauth } from './middlewares/jwt';

// 创建APP实例
const app = new Koa();

// 挂载日志中间件
app.use(loggerMiddleware);

// 挂载错误处理中间件
app.use(errorHandler);

// 挂载跨域中间件
app.use(Cors(corsHandler));

// 挂载jwt中间件,token认证拦截
app.use(Jwtauth);

// 挂载body解析中间件
app.use(
  // 设置body解析中间件
  koaBody({
    parsedMethods: [HttpMethodEnum.POST, HttpMethodEnum.PUT, HttpMethodEnum.PATCH, HttpMethodEnum.GET, HttpMethodEnum.DELETE],
    multipart: true,
    formidable: {
      maxFileSize: 200 * 1024 * 1024, // 设置文件上传大小限制，默认2M
      uploadDir: path.join(__dirname, '../public/upload'), // 设置文件上传目录
      keepExtensions: true, // 保持文件的后缀
    },
  })
);

// 挂载权限中间件
app.use(Casbin.authz);

// 挂载参数校验中间件
app.use(parameter(app));

// 挂载Web网页
app.use(Static(path.join(__dirname) + '/../web/dist'));

// 挂载静态资源中间件
app.use(mount('/public', Static(path.join(__dirname) + '/../public/')));

// 业务路由自动挂载
app.use(router.routes()).use(router.allowedMethods());

// 挂载broker路由
app.use(broker_router.routes()).use(broker_router.allowedMethods());

// 挂载swagger文档中间件
app.use(koaSwagger({ routePrefix: '/api-docs', swaggerOptions: { url: '/docs' } }));

// 挂载响应处理中间件
app.use(responseHandler);

// 打印logo
printLogo();

// //https 服务
const httpsPort = PORT.https;
const ACoptions = {
  key: fs.readFileSync(path.resolve(__dirname, './config/assets/duruofu.xyz.key')), // SSL私钥文件路径
  cert: fs.readFileSync(path.resolve(__dirname, './config/assets/duruofu.xyz_bundle.crt')), // SSL证书文件路径
};
const httpsServer = https.createServer(ACoptions, app.callback());
httpsServer.listen(httpsPort);
httpsServer.on('error', (err) => {
  console.log(err);
});

httpsServer.on('listening', () => {
  const ip = getIpAddress();
  const address = `https://${ip}:${httpsPort}`;
  const localAddress = `https://localhost:${httpsPort}`;
  console.log(`App started at address:${localAddress} or ${address}`);
});

//http 服务
const httpPort = PORT.http;
const httpServer = http.createServer(app.callback());
httpServer.listen(httpPort);
httpServer.on('error', (err: Error) => {
  console.log(err);
});
httpServer.on('listening', () => {
  const ip = getIpAddress();
  const address = `http://${ip}:${httpPort}`;
  const localAddress = `http://${DOMAIN.domain}:${httpPort}`;
  console.log(`App started at address:${localAddress} or ${address}`);
  console.log(`API documentation:${localAddress}/api-docs or ${address}/api-docs`);
});

// 创建用于单独提供 Web 网页的应用程序实例
const webApp = new Koa();

// 挂载跨域中间件
webApp.use(Cors(corsHandler));

// 挂载静态资源中间件用于 Web 网页
webApp.use(Static(path.join(__dirname) + '/../web/dist'));

// 路由重定向(根目录定向为Web网页)
webApp.use(async (ctx, next) => {
  // 根目录重定向
  if (ctx.path === '/') {
    ctx.redirect('/index.html');
  } else {
    await next();
  }
  // 404
  if (ctx.status === 404) {
    ctx.redirect('/index.html');
  }
});

// 启动单独的 HTTPS 服务器用于 Web 网页
const webPort = PORT.webhttps;
const httpsWebServer = https.createServer(ACoptions, webApp.callback());
httpsWebServer.listen(webPort);
httpsWebServer.on('error', (err) => {
  console.log(err);
});

httpsWebServer.on('listening', () => {
  const ip = getIpAddress();
  const address = `https://${ip}:${webPort}`;
  const localAddress = `https://${DOMAIN.domain}:${webPort}`;
  console.log(`Webapp started at address:${localAddress} or ${address}`);
});
