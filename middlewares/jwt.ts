// 请求头校验token中间件

import Koa from 'koa'

import { CODE } from '../config/code'

import { decodeToken } from '../utils/util'

//import { getUserInfoByIdService } from '../services/admin/user/user'

export const jwtMiddlewareDeal = async (ctx: Koa.Context, next: Koa.Next) => {

  const token = ctx.request.headers.token

  if (typeof token === 'string') {

    try {

      let userId = decodeToken(token)

      let userInfo = await getUserInfoByIdService(userId)

      if (!userInfo) {

        throw CODE.tokenFailed

      } else {

        ctx.userId = userId

        ctx.userInfo = userInfo

      }

    } catch (error) {

      throw CODE.tokenFailed

    }

  } else {

    throw CODE.tokenFailed

  }

  return next()

}
