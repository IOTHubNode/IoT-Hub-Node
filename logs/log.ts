import Koa from 'koa';
import log4js from 'log4js';
import { getClientIpAddress } from '../utils/util';


log4js.configure({
	pm2: true,
	appenders: {
		everything: {
			type: 'dateFile',
			filename: 'logs\\log',
			pattern: 'yyyy-MM-dd.log',
			alwaysIncludePattern: true ,     // 设置文件名称为 filename + pattern
			keepFileExt: true,
			numBackups: 30, // 保留最近20个历史日志文件，可根据需求调整
			compress: true, // 压缩历史日志文件
		},
	},
	categories: {
		default: { appenders: ['everything'], level: 'debug' },
	},
});

export const logger = log4js.getLogger();



export const loggerMiddleware = async (ctx: Koa.Context, next: Koa.Next) => {
	// 请求开始时间
	const start = new Date();

	await next();

	// 结束时间
	const ms = Number(new Date()) - Number(start);

	// 打印出请求相关参数
	const remoteAddress = getClientIpAddress(ctx);

	let logText = `${ctx.method} ${ctx.status} ${ctx.url} 请求参数： ${JSON.stringify(ctx.request.body)} 响应参数： ${JSON.stringify(
		ctx.body
	)} - ${remoteAddress} - ${ms}ms`;

	logger.info(logText);
};
