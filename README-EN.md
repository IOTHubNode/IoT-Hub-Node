# IoT-Hub-Node 

![](./logo.png)

Read in different languages: [English](./docs/README-EN.md) | [Simplified Chinese](./README.md) | [Traditional Chinese](./docs/README-CHT.md)

## Introduction

IoT-Hub-Node is a Node.js-based IoT platform designed to connect IoT devices and applications.It provides a set of HTTP-based APIs for device management, message sending and receiving, and querying device registries and metadata.In addition, it provides MQTT-based hardware interfaces for connecting devices to the IoT.In the future, we also plan to develop other interfaces, such as a Websocket-based interface, to provide more options.

Developed using Node.js, it can be deployed in the cloud or locally and can run on different platforms, such as Windows, Linux, MacOS, etc.The platform uses MySQL as the default database and Sequelize as the ORM framework, which makes it easy to switch databases when needed.In addition, the asynchronous, non-blocking nature of Node.js allows it to handle large numbers of concurrent requests with efficient processing capabilities.

Through optimization and continuous improvement, IoT-Hub-Node can support the development of various IoT applications in areas such as smart homes, smart factories, and smart agriculture.It provides powerful features and flexibility, enabling developers to build high-performance and reliable IoT applications.

Currently, IoT-Hub-Node is still in the development stage, and the features will be gradually improved.

## Initial Intent

The initial purpose of this project has two main goals:

1.to record personal learning process of node.js: to record detailed problems and solutions encountered during the learning process in the development log, hoping to help others.

2.to provide a node.js-based IoT device management platform: to achieve device management, message sending and receiving, querying device registry and metadata, and other functions.We hope to use this platform to enable developers with no IoT development experience to quickly develop IoT applications, and to make it easier for front-end developers to access the IoT space.Through this project, we hope to make it easier for IoT developers and embedded developers to get access to IoT and experience the use of web technologies in the embedded domain.


## Current Status
I am currently a student and I am not familiar with web development as my major is electrical engineering and intelligent control.I have encountered a lot of difficulties in learning the field of IoT.Therefore, through this project, I hope to help others to develop and understand IoT applications more easily.

I will record the problems and solutions I encountered during the learning process in my development log, and post some learning notes on my personal blog.You can find these at [DuRuofu's personal blog](https://www.duruofu.xyz/).I will start this project from a beginner's point of view, and you are welcome to submit your ideas in the issue.I will try to improve this project as much as possible.

If you are interested in this project, feel free to join us in developing it together.We welcome your suggestions and help.

Do you want to contribute? Read our [Contribution Guidelines](./docs/CONTRIBUTING.md) for more information.There are many ways to help! 😃

## Project Structure

The following is an illustration of the project structure of the project:

```
- controllers // controllers, handling routing logic
- models // data model, database interaction
- services // business logic layer, dealing with complex business
- middlewares // middleware, request pre-processing logic, such as permission validation
- routes // route definitions
- config // configuration folder
- utils // utility functions or classes
- public // Static resources folder
- views // view folder
- routes // routes folder
- logs // logs folder
- tests // test folder
- docs // documentation directory
   - CONTRIBUTING.md // Contains guidelines and instructions on how to contribute to the project.
   - API.md // Contains documentation for the project's Application Programming Interface (API).
   - TUTORIAL.md // A tutorial that provides detailed guidelines on how to use the project.
   - DESIGN.md // The project's design documentation, describing details of the project's architecture, components, data flow, and interaction processes.
- .gitignore // git ignore file
- package.json // project configuration file
- app.js // entry file
- README.md // The project's entry file, which usually provides an overview of the project, background information, installation instructions, usage instructions, and contribution guidelines.

```


and [design documentation](./docs/DESIGN.md)|[development_log](./docs/DEVELOPMENT_LOG.md) and other documents.


## Getting Started

Refer to [QUICK START](./docs/TUTORIAL.md) to learn how to run the project locally.

For details, please refer to [API documentation](./docs/API.md)

## Update Log


Detailed version update log is recorded in [changelog](./docs/CHANGELOG.md).

## Follow-up plan
About the project development plan is recorded in [development log](./docs/TODO.md).


## Contact me
If you want to know more about this project, please read the [design document](./docs/DESIGN.md), [development log](./docs/DEVELOPMENT_LOG.md).Or contact me via email: [duruofu@qq.com]