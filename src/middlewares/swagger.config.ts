// swaggerAPI配置文件  参考：https://swagger.io/specification/

import path from 'path';
import fs from 'fs';
import swaggerJSDoc from 'swagger-jsdoc';
import AddressIp from 'ip';
import { PORT } from '../config/constant';

const swaggerDefinition = {
  // 版本
  openapi: '3.0.0',
  // 信息
  info: {
    title: 'IOT-Hub-Node API', // Title (required)
    version: '1.0.0', // Version (required)
    summary: 'test',
    description: '基于node.js的通用物联网平台', // Description (optional)
    // 开源协议
    license: {
      name: 'MIT',
      url: 'https://github.com/saisilinus/node-express-mongoose-typescript-boilerplate.git',
    },
    contact: {
      name: 'API Support',
      url: 'https://github.com/DuRuofu',
      email: 'duruofu@qq.com',
    },
  },
  // 定义服务器
  servers: [
    {
      url: `http://${AddressIp.address()}:${PORT.http}/v1`,
      description: 'API V1',
    },
  ],
  // 安全
  components: {
    schemas: {},
    responses: {},
    parameters: {},
    securitySchemes: {
      token: {
        type: 'apiKey',
        name: 'authorization',
        in: 'header',
      },
    },
  },
};

const options = {
  swaggerDefinition,
  apis: [path.join(__dirname, '/../routers/*.ts')], // all api
};

const jsonSpc = swaggerJSDoc(options);

fs.writeFileSync('src/config/swagger.json', JSON.stringify(jsonSpc, null, 2));

export default jsonSpc;
