// 用于创建路由模块的脚本
import fs from 'fs';
import path from 'path';

if (process.argv.length < 3) {
  console.log('需要一个参数作为模块名');
  console.log('例如:npm run addmodule -- test');
  process.exit();
}
if (process.argv.length > 3) {
  console.log('只能有一个参数作为模块名');
  process.exit();
}

const moduleName = process.argv.pop();

console.log(moduleName);

// 读取模板
let routerContent = fs.readFileSync(path.resolve(__dirname, './template/router.template')).toString();
let controllerContent = fs.readFileSync(path.resolve(__dirname, './template/controller.template')).toString();
let serviceContent = fs.readFileSync(path.resolve(__dirname, './template/service.template')).toString();

// 替换模板中的变量
routerContent = routerContent.replace(/{{moduleName}}/g, moduleName);
controllerContent = controllerContent.replace(/{{moduleName}}/g, moduleName);
serviceContent = serviceContent.replace(/{{moduleName}}/g, moduleName);

// 生成文件
fs.writeFileSync(path.resolve(__dirname, `../controllers/${moduleName}.controller.ts`), controllerContent);
fs.writeFileSync(path.resolve(__dirname, `../services/${moduleName}.service.ts`), serviceContent);
fs.writeFileSync(path.resolve(__dirname, `../routers/${moduleName}.route.ts`), routerContent);

console.log(`模块 ${moduleName} 创建完成！`);
