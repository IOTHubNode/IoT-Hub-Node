import fs from 'fs';
import http from 'http';
import https from 'https';
import path from 'path';
import Koa from 'koa';
import koaBody from 'koa-body';
import Static from 'koa-static';
import { PORT } from '../config/constant';
import { getIpAddress } from '../utils/util';
import { loggerMiddleware } from '../logs/log';
import { errorHandler, responseHandler } from '../middlewares/response';

import Usersrouter  from '../routers/users/users';

const app = new Koa();

// log middlewaress
app.use(loggerMiddleware)

// Error Handler middleware
app.use(errorHandler);

// Parse request body middleware
app.use(koaBody({ multipart: true }));

// Static resources
app.use(Static(path.join(__dirname + '/public')));

// Routes
app.use(Usersrouter.routes())
   .use(Usersrouter.allowedMethods())

// Response
app.use(responseHandler);

export default app;