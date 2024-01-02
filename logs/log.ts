// 日志模块
import Koa from 'koa'

import log4js from 'log4js'

import { getClientIpAddress } from '../utils/util'


export const logger = log4js.getLogger()