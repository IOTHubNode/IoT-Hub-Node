//全局通用配置参数
import dotenv from 'dotenv';

// 读取环境变量
dotenv.config();

export const ENV = {
  development: 'development',
  production: 'production',
};

// JWT配置参数
export const JWT = {
  secret: process.env.TOKEN_SECRET_KEY || 'SZw*QCX684K$d10JYWBpQFQ__pI)VAN@HZnmnjS', //token密钥
  expires: 60 * 60 * 24 * 30, // 30天
};

// 服务端口号
export const PORT = {
  http: process.env.SERVER_PORT_HTTP || 3000,
  https: process.env.SERVER_PORT_HTTPS || 3001,
};

// 公共路由(不用jwt验证)
export const PublicRouter = [
  /\/api-docs/,
  /\/test/,
  /\/example/,
  /\/docs/,
  /^\/public/,
  /\/account\/login/,
  /\/account\/register/,
  /\/favicon\.png/,
];

// 默认头像列表，注册随机分配
export const DEFAULT_AVATAR = [
  {
    image: 'https://image-1308319148.cos.ap-chengdu.myqcloud.com/main/1.png',
  },
  {
    image: 'https://image-1308319148.cos.ap-chengdu.myqcloud.com/main/2.png',
  },
  {
    image: 'https://image-1308319148.cos.ap-chengdu.myqcloud.com/main/3.png',
  },
  {
    image: 'https://image-1308319148.cos.ap-chengdu.myqcloud.com/main/4.png',
  },
  {
    image: 'https://image-1308319148.cos.ap-chengdu.myqcloud.com/main/5.png',
  },
  {
    image: 'https://image-1308319148.cos.ap-chengdu.myqcloud.com/main/6.png',
  },
  {
    image: 'https://image-1308319148.cos.ap-chengdu.myqcloud.com/main/7.png',
  },
  {
    image: 'https://image-1308319148.cos.ap-chengdu.myqcloud.com/main/8.png',
  },
  {
    image: 'https://image-1308319148.cos.ap-chengdu.myqcloud.com/main/9.png',
  },
  {
    image: 'https://image-1308319148.cos.ap-chengdu.myqcloud.com/main/10.png',
  },
  {
    image: 'https://image-1308319148.cos.ap-chengdu.myqcloud.com/main/11.png',
  },
  {
    image: 'https://image-1308319148.cos.ap-chengdu.myqcloud.com/main/12.png',
  },
  {
    image: 'https://image-1308319148.cos.ap-chengdu.myqcloud.com/main/13.png',
  },
  {
    image: 'https://image-1308319148.cos.ap-chengdu.myqcloud.com/main/14.png',
  },
  {
    image: 'https://image-1308319148.cos.ap-chengdu.myqcloud.com/main/15.png',
  },
  {
    image: 'https://image-1308319148.cos.ap-chengdu.myqcloud.com/main/16.png',
  },
  {
    image: 'https://image-1308319148.cos.ap-chengdu.myqcloud.com/main/17.png',
  },
  {
    image: 'https://image-1308319148.cos.ap-chengdu.myqcloud.com/main/18.png',
  },
  {
    image: 'https://image-1308319148.cos.ap-chengdu.myqcloud.com/main/19.png',
  },
  {
    image: 'https://image-1308319148.cos.ap-chengdu.myqcloud.com/main/20.png',
  },
  {
    image: 'https://image-1308319148.cos.ap-chengdu.myqcloud.com/main/21.png',
  },
  {
    image: 'https://image-1308319148.cos.ap-chengdu.myqcloud.com/main/22.png',
  },
  {
    image: 'https://image-1308319148.cos.ap-chengdu.myqcloud.com/main/23.png',
  },
  {
    image: 'https://image-1308319148.cos.ap-chengdu.myqcloud.com/main/24.png',
  },
  {
    image: 'https://image-1308319148.cos.ap-chengdu.myqcloud.com/main/25.png',
  },
  {
    image: 'https://image-1308319148.cos.ap-chengdu.myqcloud.com/main/26.png',
  },
  {
    image: 'https://image-1308319148.cos.ap-chengdu.myqcloud.com/main/27.png',
  },
  {
    image: 'https://image-1308319148.cos.ap-chengdu.myqcloud.com/main/28.png',
  },
  {
    image: 'https://image-1308319148.cos.ap-chengdu.myqcloud.com/main/29.png',
  },
  {
    image: 'https://image-1308319148.cos.ap-chengdu.myqcloud.com/main/30.png',
  },
  {
    image: 'https://image-1308319148.cos.ap-chengdu.myqcloud.com/main/31.png',
  },
  {
    image: 'https://image-1308319148.cos.ap-chengdu.myqcloud.com/main/32.png',
  },
  {
    image: 'https://image-1308319148.cos.ap-chengdu.myqcloud.com/main/33.png',
  },
  {
    image: 'https://image-1308319148.cos.ap-chengdu.myqcloud.com/main/34.png',
  },
  {
    image: 'https://image-1308319148.cos.ap-chengdu.myqcloud.com/main/35.png',
  },
  {
    image: 'https://image-1308319148.cos.ap-chengdu.myqcloud.com/main/36.png',
  },
  {
    image: 'https://image-1308319148.cos.ap-chengdu.myqcloud.com/main/37.png',
  },
  {
    image: 'https://image-1308319148.cos.ap-chengdu.myqcloud.com/main/38.png',
  },
  {
    image: 'https://image-1308319148.cos.ap-chengdu.myqcloud.com/main/39.png',
  },
  {
    image: 'https://image-1308319148.cos.ap-chengdu.myqcloud.com/main/40.png',
  },
  {
    image: 'https://image-1308319148.cos.ap-chengdu.myqcloud.com/main/41.png',
  },
  {
    image: 'https://image-1308319148.cos.ap-chengdu.myqcloud.com/main/42.png',
  },
  {
    image: 'https://image-1308319148.cos.ap-chengdu.myqcloud.com/main/43.png',
  },
  {
    image: 'https://image-1308319148.cos.ap-chengdu.myqcloud.com/main/44.png',
  },
  {
    image: 'https://image-1308319148.cos.ap-chengdu.myqcloud.com/main/45.png',
  },
  {
    image: 'https://image-1308319148.cos.ap-chengdu.myqcloud.com/main/46.png',
  },
  {
    image: 'https://image-1308319148.cos.ap-chengdu.myqcloud.com/main/47.png',
  },
  {
    image: 'https://image-1308319148.cos.ap-chengdu.myqcloud.com/main/48.png',
  },
  {
    image: 'https://image-1308319148.cos.ap-chengdu.myqcloud.com/main/49.png',
  },
  {
    image: 'https://image-1308319148.cos.ap-chengdu.myqcloud.com/main/50.png',
  },
];

// 用户密码加密盐
export const SALT = {
  saltRounds: process.env.SALT_SECRET_KEY || `1233`,
};

export const DEFAULT_ROLE = {
  ROLE_VALUE: 'default',
};
