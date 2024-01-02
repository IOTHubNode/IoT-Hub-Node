// log4js.js

const path = require('path')
const log4js = require('log4js')

const { isProd } = require('../utils/index')


// 日志配置对象
log4js.configure({
    // 日志记录方式
    appenders: {
        // 自定义category为error，记录服务器报错信息
        error: {
            type: 'file',  //日志类型 指定单一文件存储
            filename: path.join('logs/', 'error/error.log'), //日志输出位置，当目录文件或文件夹不存在时自动创建
            maxLogSize: 1024 * 1000 * 100, // 文件最大存储空间，单位是字节 1024k 1m
            backups: 100 //当文件内容超过文件存储空间时，备份文件的数量
        },

        // 自定义category为response，记录服务器的响应情况 用户访问服务的情况
        response: {
            type: 'dateFile', // 以日期命名的文件记录日志
            filename: path.join('logs/', 'access/response'),
            pattern: 'yyyy-MM-dd.log', //日志输出模式
            alwaysIncludePattern: true,

            // dateFile类型的appender没有这个选项
            maxLogSize: 1024 * 1000 * 100,
            // dateFile类型的appender没有这个选项
            backups: 1
        },

        console: {
            type: "console",
            layout: {
                // 开发环境下带颜色输出，生产环境下使用基本输出
                type: isProd ? 'basic' : 'coloured'
            }
        }
    },

    // log4js.getLogger(type)：就是读取这里的key
    categories: {
        error: { appenders: ['error'], level: 'error' },
        response: { appenders: ['response'], level: 'info' },
        default: { appenders: ['console'], level: 'all' }
    },

    replaceConsole: true
})

let logger = {}

// 自定义输出格式，确定哪些内容输出到日志文件中
const formatError = (ctx, err) => {
    const { method, url } = ctx
    let body = ctx.request.body
    const user = ctx.state.user

    // 将请求方法，请求路径，请求体，登录用户，错误信息
    return { method, url, body, user, err }
}

const formatRes = (ctx, costTime) => {
    // const { method, url, response: { status, message, body: { success } }, request: { header: { authorization } } } = ctx
    const { ip, method, url, response: { status, message }, request: { header: { authorization } } } = ctx
    let body = ctx.request.body
    const user = ctx.state.user

    // 将请求方法，请求路径，请求体，登录用户，请求消耗时间，请求头中的authorization字段即token，响应体中的状态码，消息，以及自定义的响应状态
    return { ip, method, url, body, user, costTime, authorization, response: { status, message } }
}

// 生成一个error类型的日志记录器
let errorLogger = log4js.getLogger('error')

// 生成一个response类型的日志记录器
let resLogger = log4js.getLogger('response')

// 生成一个控制台类型的日志记录器
let console = log4js.getLogger()

// 封装错误日志
logger.errLogger = (ctx, error) => {
    if (ctx && error) {
        errorLogger.error(formatError(ctx, error))
    }
}

// 封装响应日志
logger.resLogger = (ctx, resTime) => {
    if (ctx) {
        resLogger.info(formatRes(ctx, resTime))
    }
}

// 控制台输出
logger.log = console

