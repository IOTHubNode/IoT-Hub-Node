import dotenv from 'dotenv';

// 读取环境变量
dotenv.config();


//全局通用配置参数
export const ENV = {
    development: 'development',
    production: 'production'
}

// JWT配置参数
export const JWT = {
    secret: '',//token密钥
    expires: 60 * 60 * 24 * 30 // 30天
}


// 服务端口号
export const PORT = {
    http:  3000,
    https: 3001
}

