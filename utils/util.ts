import { Context } from 'vm'

import { JWT } from '../config/constant'

import jwt from 'jsonwebtoken'

/*获取当前ip地址*/

export const getIpAddress = () => {

  const interfaces = require('os').networkInterfaces()

  for (const devName in interfaces) {

    const temp = interfaces[devName]

    for (let i = 0; i < temp.length; i++) {

      const alias = temp[i]

      if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal) {

        return alias.address

      }

    }

  }

}

// 获取客户端ip地址

export const getClientIpAddress = (ctx: Context) => {

  const headers = ctx.headers

  if (headers['x-forwarded-for']) {

    const ipList = headers['x-forwarded-for'].split(',')

    return ipList[0]

  }

  return '0.0.0.0'

}

// 通过token解析userId

export const decodeToken = (token: string) => {

  let jwtInfo = jwt.verify(token, JWT.secret) as any

  try {

    return jwtInfo.userId

  } catch (err) {

    return 'token不合法'

  }

}

// 根据userId生成token

export const generatorToken = (userId: number) => {

  return jwt.sign({ userId }, JWT.secret, { expiresIn: JWT.expires })

}
