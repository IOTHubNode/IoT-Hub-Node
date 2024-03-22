import { Context } from 'vm';

import OS from 'os';
/*获取当前ip地址*/
export const getIpAddress = () => {
  const interfaces = OS.networkInterfaces();
  for (const devName in interfaces) {
    const temp = interfaces[devName];
    for (let i = 0; i < temp.length; i++) {
      const alias = temp[i];
      if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal) {
        return alias.address;
      }
    }
  }
};

// 获取客户端ip地址
export const getClientIpAddress = (ctx: Context) => {
  const headers = ctx.headers;
  if (headers['x-forwarded-for']) {
    const ipList = headers['x-forwarded-for'].split(',');
    return ipList[0];
  }
  return '0.0.0.0';
};

// 处理bigint类型的数据，将其转换成字符串(重要依赖)
export function bigIntToString(value: any) {
  // 直接处理基本类型和BigInt类型
  if (typeof value !== 'object' || value === null) {
    return typeof value === 'bigint' ? value.toString() : value;
  }
  // 处理数组类型
  if (Array.isArray(value)) {
    return value.map((item) => bigIntToString(item));
  }
  // 处理对象类型
  for (const key in value) {
    value[key] = bigIntToString(value[key]);
  }
  return value;
}
