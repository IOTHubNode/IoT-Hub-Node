# Io-Hb-Node

![](docs/attachments/logo.png)
用不同的语言阅读：[English](./README-EN.md) | [繁体中文](./docREADME-CHT.md)

## 介绍

IoT-Hub-Node是一个基于 Node.js 的开源物联网设备接入管理平台，提供设备接入，设备管理，数据存储，指令下发，规则引擎等主流功能，旨在连接物联网设备和应用程序。它提供了一系列基于 HTTP 的REST API，用于实现设备接入、消息发送和接收，物模型管理和事件告警等。它还提供基于 MQTT，REST/HTTP，TCP/IP，websocket的通信接口，用于设备与物联网的连接(MQTT Broker使用开源版本的EMQX )。未来，我们还计划开发其他接口，例如基于CoAP的接口，以提供更多选择。

本项目使用Ts +Node.js 进行开发，支持云端或本地私有部署，并能在不同平台上运行。使用 MySQL 作为默认数据库，使用Redis做数据缓存，并采用 prisma 作为 ORM 框架，降低用户二次开发的门槛。采集的设备数据通过InfluxDB时序数据库存储，满足大量数据存储需求。此外，Node.js 本身的的异步非阻塞特性也使得其能够处理大量并发请求，具备高效处理能力。

项目主要分为三个部分，[IoT-Hub-Node](https://github.com/IOTHubNode/IoT-Hub-Node/blob/0.01/README.md)是物联网平台的后端部分，[IoT-Hub-Node-Web](https://github.com/IOTHubNode/IoT-Hub-Node-Web)是物联网平台的后台管理网站项目，
[IOT-Hub-Embedded](https://github.com/IOTHubNode/IOT-Hub-Embedded-Support)是一系列适配本平台的嵌入式项目集合。目前[IoT-Hub-Node](https://github.com/IOTHubNode/IoT-Hub-Node/blob/0.01/README.md)和[IoT-Hub-Node-Web](https://github.com/IOTHubNode/IoT-Hub-Node-Web)均以开源。

通过优化和不断改进，IoT-Hub-Node 可以支持各种物联网应用程序的开发，例如智能家居、智能工厂和智能农业等领域。它提供了强大的功能和灵活性，使得开发人员能够构建出高性能、可靠的物联网应用程序。

目前，IoT-Hub-Node还处于开发阶段，后续会逐步完善功能。

## 功能架构

![IOT-Hub-Node系统架构](./docs/attachments/IOT-Hub-Node架构v2.png)

## 目的

本项目旨在提供一个基于 node.js 的物联网设备管理平台：实现设备接入、消息发送和接收，物模型管理和事件告警。希望通过这个平台让没有物联网开发经验的开发者能够快速开发物联网应用程序，并让前端开发者更轻松地接触物联网领域。希望通过这个项目，让物联网开发者和嵌入式开发者能够更容易地接触物联网，体会 web 技术在嵌入式领域的使用。

## 当前状态

我的专业是电气工程及智能控制，对于 web 开发及服务器技术并不熟悉。因此，通过这个项目，我希望能够帮助其他人更轻松地开发和理解物联网应用程序,欢迎与我共同开发。

我会在开发日志中记录学习过程中遇到的问题和解决方案，并在我的个人博客上发布一些学习笔记。你可以在[DuRuofu的个人博客](https://www.duruofu.xyz/)找到这些内容。我将以一个初学者的角度开始这个项目，并欢迎你在 issue 中提出你的想法。我会尽可能完善这个项目。

如果你对这个项目感兴趣，欢迎加入我们一起开发。我们欢迎你提供建议和帮助。

您想贡献吗？阅读我们的[贡献指南](./docs/CONTRIBUTING.md)以了解更多信息。有很多方法可以提供帮助！😃

## 项目结构

下面是项目的项目结构示意：

```
- .husky            // lint-staged自动格式化工具目录
- app               // 应用程序层
- bcroker           // 消息代理层
- config            // 配置文件夹
- controllers       // 控制器，处理路由逻辑
- docs              // 文档目录
   - CONTRIBUTING.md   // 包含关于如何为项目做出贡献的准则和说明。
   - API.md            // 包含项目的应用程序编程接口（API）的文档。
   - TUTORIAL.md       // 一个教程，提供关于如何使用项目的详细指南。
   - DESIGN.md         // 项目的设计文档，描述了项目的架构、组件、数据流和交互过程等细节。
- logs              // 日志文件夹
- middlewares       // 中间件，请求预处理逻辑，例如权限验证
- prisma            // 数据库访问ORM层
- routers            // 路由定义
- public            // 静态资源文件夹
- services          // 数据服务层，处理数据库业务
- tests             // 测试文件夹
- utils             // 工具函数或类
- .env              // 环境变量文件参考
- .gitignore        // git忽略文件
- app.ts            // 项目入口文件
- package.json      // 项目配置文件
- README.md         // 项目的入口文件，通常提供项目的概述、背景信息、安装指南、使用说明和贡献指南等信息。

```



## 开始使用

参考[快速开始](https://iothubnode.top/docs/02.tutorial/%E5%87%86%E5%A4%87%E5%B7%A5%E4%BD%9C.html)以了解如何在本地运行项目。

## 更新日志

详细版本更新日志记录在[更新日志](https://iothubnode.top/docs/05.service/%E6%9B%B4%E6%96%B0%E8%AE%B0%E5%BD%95.html)中。

## 后续计划

关于项目开发计划记录在[产品计划](https://iothubnode.top/docs/05.service/%E4%BA%A7%E5%93%81%E8%AE%A1%E5%88%92.html)中。

## 联系我

如果你想了解更多关于此项目的信息,请阅读[项目文档](https://iothubnode.top/),或者通过邮箱联系我: [duruofu@qq.com]
