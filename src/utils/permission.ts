// 从swagger.json 自动生成权限列表
import path from 'path';
import { readFileSync } from 'fs';
import { PrismaClient } from '@prisma/client';
import { asnycRoute } from '../config/menu.config';
const prisma = new PrismaClient();
import util from 'util';
// 定义权限接口
interface Permission {
  Tag: string;
  Name: string;
  Type: number;
  RuleValue: string;
  Action: string;
  Description: string;
  CreatedBy: string;
  UpdatedBy: string;
}

// 从swagger.json 自动生成后端权限列表
export const addRoutePermission = async () => {
  // 读取swagger.json
  const swaggerJsonPath = path.join(__dirname, '../config/swagger.json');
  const swaggerJson = readFileSync(swaggerJsonPath, 'utf-8');
  //console.log(swaggerJson);
  // 解析swagger.json
  const swagger = JSON.parse(swaggerJson);
  //console.log(swagger.tags);

  // 定义权限列表
  const permissions: Permission[] = [];
  // 遍历tags(顶层权限)
  swagger.tags.forEach((tag: { name: string; description: string; baseurl: string }) => {
    permissions.push({
      Tag: tag.name,
      Name: tag.name + '(顶层)',
      Description: tag.description,
      Type: 1,
      RuleValue: `${tag.baseurl}/*`,
      Action: '*',
      CreatedBy: 'system_generated',
      UpdatedBy: 'system_generated',
    });
  });

  // 暂存顶级权限
  const topPermissions = permissions;

  // 遍历paths(次层权限)
  for (const path in swagger.paths) {
    for (const method in swagger.paths[path]) {
      const methodObj = swagger.paths[path][method];
      const tags = methodObj.tags;
      if (tags) {
        // 为子路由添加顶级路由的版本前缀
        let url = addVersionPrefix(tags[0], path, topPermissions);
        tags.forEach((tag: string) => {
          // 将大括号替换为冒号
          url = convertToRouteParam(url);
          permissions.push({
            Tag: tag,
            Name: methodObj.summary,
            Description: methodObj.description,
            Type: 2,
            RuleValue: `${url}`,
            Action: method,
            CreatedBy: 'system_generated',
            UpdatedBy: 'system_generated',
          });
        });
      }
    }
  }
  console.log(permissions);

  try {
    await prisma.$transaction([
      // 删除
      prisma.permission.deleteMany({
        where: {
          Type: { in: [1, 2] },
          CreatedBy: 'system_generated',
        },
      }),
      // 将权限列表写入数据库
      ...permissions.map((permission) =>
        prisma.permission.create({
          data: permission,
        })
      ),
    ]);
    return 1;
  } catch (error) {
    return 0;
  }
};

// 从menu.config.ts自动生成后端权限列表
export const addMenuPermission = async () => {
  // 定义权限列表
  const data = processData(asnycRoute);
  console.log(util.inspect(data, { showHidden: false, depth: null }));
  const permissions = flattenData(data);
  console.log(permissions);
  try {
    await prisma.$transaction([
      // 删除
      prisma.permission.deleteMany({
        where: {
          Type: { in: [11, 12, 13, 14, 15, 16, 17, 18, 19] },
          CreatedBy: 'system_generated',
        },
      }),
      // 将权限列表写入数据库
      ...permissions.map((permission) =>
        prisma.permission.create({
          data: permission,
        })
      ),
    ]);
    return 1;
  } catch (error) {
    return 0;
  }
};

//addRoutePermission();
//addMenuPermission();

// 工具函数
// 从menu.config.ts自动生成后端权限列表(处理数据字段)
function processData(data: any, type = 10, parentTag = null) {
  return data.map((item: any) => {
    const newItem = {
      Name: item.name,
      Type: type + 1, // Default type for top-level items
      RuleValue: item.path,
      Tag: parentTag || item.name, // Tag is either parentTag for nested items or item.name for top-level items
      Description: `${item.meta.title}(${item.name})`,
      Action: '*',
      CreatedBy: 'system_generated',
      UpdatedBy: 'system_generated',
    } as {
      Name: string;
      Type: number;
      RuleValue: string;
      Tag: string;
      Description: string;
      Action: string;
      CreatedBy: string;
      UpdatedBy: string;
      children?: any[];
    };

    if (item.children && item.children.length > 0) {
      newItem.children = processData(item.children, newItem.Type, item.name); // Recursively process children
    }

    return newItem;
  });
}

// 从menu.config.ts自动生成后端权限列表(扁平化数据)
function flattenData(data: any[]) {
  const result = [];

  function flatten(item: any) {
    const newItem = { ...item };
    delete newItem.children;
    result.push(newItem);

    if (item.children && item.children.length > 0) {
      item.children.forEach((child) => flatten(child));
    }
  }

  data.forEach((item) => flatten(item));

  return result;
}

// 使用正则表达式替换大括号为冒号 `/account/accounts/{id}` --> '/account/accounts/:id'
function convertToRouteParam(path: string): string {
  // 使用正则表达式替换大括号为冒号
  const convertedPath = path.replace(/\{(\w+)\}/g, ':$1');
  return convertedPath;
}
// 示例用法
// const originalPath = '/account/accounts/{id}';
// const convertedPath = convertToRouteParam(originalPath);
// console.log('Original Path:', originalPath);
// console.log('Converted Path:', convertedPath);

// 工具函数:为子路由添加顶级路由的版本前缀
function addVersionPrefix(tags: string, subRoute: string, topPermissions: Permission[]): string {
  // 遍历顶级权限列表
  for (const permission of topPermissions) {
    const topTags = permission.Name.replace('(顶层)', '');
    if (topTags == tags) {
      // console.log('找到匹配的顶级权限');
      // console.log(permission.RuleValue);
      // console.log(subRoute);
      const regex = /^\/(v\d+)\//; // 匹配顶层目录的版本号，例如 /v1/
      const matches = regex.exec(permission.RuleValue);
      if (matches && matches.length > 1) {
        const version = matches[1]; // 提取版本号
        return `/${version}${subRoute}`;
      } else {
        console.log('No version number found in the top level route.');
        return subRoute;
      }
    }
  }

  // 如果没有匹配到顶级权限，则直接返回子路由
  return subRoute;
}
// // 示例用法
// const topPermissions = [
//   {
//     Name: '用户模块(顶层权限)',
//     Description: '用户管理模块',
//     Type: 1,
//     RuleValue: '/v1/account/*',
//     Action: '*',
//     CreatedBy: 'system_generated',
//     UpdatedBy: 'system_generated',
//   },
//   // 其他顶级权限对象...
// ];

// const subRoute = '/account/accounts/{id}';
// const tags = '用户模块';
// const topLevelRoute = addVersionPrefix(tags, subRoute, topPermissions);
// console.log('Top Level Route:', topLevelRoute);
