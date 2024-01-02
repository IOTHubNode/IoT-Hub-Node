//全局通用配置参数

export const ENV = {
    development: 'development',
    production: 'production'
}

export const JWT = {

    secret: '',//token密钥

    expires: 60 * 60 * 24 * 30 // 30天
}