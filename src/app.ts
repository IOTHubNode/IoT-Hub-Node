import fs from 'fs';
import http from 'http';
import https from 'https';
import path from 'path';
import Koa from 'koa';
import Cors from 'koa2-cors';
import koaBody, { HttpMethodEnum } from 'koa-body';
import Static from 'koa-static';
import parameter from 'koa-parameter';
import { PORT } from './config/constant';
import { loggerMiddleware } from './middlewares/log';
import { errorHandler } from './middlewares/error';
import { corsHandler } from './middlewares/cors';
import { responseHandler } from './middlewares/response';
import { getIpAddress } from './utils/util';
import router from './routers/index';
import { koaSwagger } from 'koa2-swagger-ui';
import { PublicRouter } from './config/constant';
import { Jwtauth } from './middlewares/jwt';
import Casbin from './middlewares/casbin';

// 创建APP实例
const app = new Koa();

// 挂载日志中间件
app.use(loggerMiddleware);

// 挂载错误处理中间件
app.use(errorHandler);

// 挂载跨域中间件
app.use(Cors(corsHandler));

// 挂载jwt中间件
app.use(Jwtauth);

// 挂载body解析中间件
app.use(
  koaBody({ parsedMethods: [HttpMethodEnum.POST, HttpMethodEnum.PUT, HttpMethodEnum.PATCH, HttpMethodEnum.GET, HttpMethodEnum.DELETE] })
);

// 挂载权限中间件
app.use(Casbin.authz);

// 挂载参数校验中间件
app.use(parameter(app));

// 挂载静态资源中间件
app.use(Static(path.join(__dirname + '/../public')));

// 路由自动挂载
app.use(router.routes()).use(router.allowedMethods());

// 挂载swagger文档中间件
app.use(koaSwagger({ routePrefix: '/api-docs', swaggerOptions: { url: '/docs' } }));

// 挂载响应处理中间件
app.use(responseHandler);

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
  const localAddress = `http://localhost:${httpPort}`;
  console.log(`app started at address:${localAddress} or ${address}`);
});

//https 服务
const httpsPort = PORT.https;
const ACoptions = {
  key: fs.readFileSync(path.resolve(__dirname, './config/assets/example.com.key')), // SSL私钥文件路径
  cert: fs.readFileSync(path.resolve(__dirname, './config/assets/example.com_bundle.crt')), // SSL证书文件路径
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
  console.log(`app started at address:${localAddress} or ${address}`);
});
