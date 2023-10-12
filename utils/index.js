// index.js

// 假设通过环境变量来确定当前应用程序的运行环境，比如 process.env.NODE_ENV
// 可以根据实际情况进行修改

const isProd = process.env.NODE_ENV === 'basic';

module.exports = {
  isProd
};