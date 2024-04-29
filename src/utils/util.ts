import { Context } from 'vm';
import figlet from 'figlet';
import { PROJECT } from '../config/constant';
//上传图片使用的模块
import formidable from "formidable";
import path from "path";
import fs from "fs";

import OS from 'os';
import { constants } from 'buffer';
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

// 打印LOGO
export const printLogo = () => {
  try {
    // 使用figlet模块生成文本，并设置字体、布局、宽度、是否断行
    const data = figlet.textSync(PROJECT.name, {
      font: 'Standard',
      horizontalLayout: 'default',
      verticalLayout: 'default',
      width: 80,
      whitespaceBreak: true,
    });
    // 打印文本
    console.log(data);
  } catch (err) {
    // 捕获错误，并打印错误信息
    console.log('Something went wrong...');
    console.dir(err);
  }
};


// 向服务器上传图片
export const uploadPicture = (ctx: any, next: any) => {
  console.log("文件上传");
  const file = ctx.request.files.file; // 获取上传文件
  // 检查文件
  if (!file) {
    ctx.status = 400;
    ctx.body = {
      msg: '请选择要上传的文件',
    };
    return;
  }

  const fileType = ['image/jpeg', 'image/png', 'image/gif']

  // 确保文件类型为图片
  if (!fileType.includes(file.mimetype)) {
    // 删除文件
    fs.unlink(file.filepath, (err) => {
      if (err) {
        console.error(err);
      }
    })
    ctx.status = 400;
    ctx.body = {
      code: 400,
      msg: '只能上传图片文件(jpg, jpeg, png, gif)',
    };
    return;
  }

  // 截取路径
  const filePath = file.filepath.split(path.sep).slice(-3).join(path.sep);

  // 返回文件的路径
  ctx.body = {
    code: 200,
    msg: '文件上传成功',
    data: `/${filePath}`,
  }
}
