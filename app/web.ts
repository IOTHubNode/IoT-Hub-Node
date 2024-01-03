import fs from 'fs';
import http from 'http';
import https from 'https';
import path from 'path';
import Koa from 'koa';
import koaBody from 'koa-body';
import Static from 'koa-static';
import { loggerMiddleware } from '../logs/log';
import { errorHandler, responseHandler } from '../middlewares/response';
import Usersrouter  from '../routers/users/users.router';

const app = new Koa();
// log middlewaress
app.use(loggerMiddleware)
// Parse request body middleware
app.use(koaBody({ multipart: true }));



// Error Handler middleware
app.use(errorHandler);

// Static resources
app.use(Static(path.join(__dirname + '/public')));

// Routes
app.use(Usersrouter.routes())
   .use(Usersrouter.allowedMethods())

// Response
app.use(responseHandler);

export default app;