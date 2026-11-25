# IoT-Hub-Node v2

> **IoT 界的 PocketBase + AI MCP 中枢** —— 基于 **Node.js 22+ & Vue 3** 的极致轻量、10 秒零依赖启动、AI-Native（原生内置 MCP Server 与物理安全护栏）开源物联网中枢。

*(旧版 v1 代码已归档于 `legacy/v1` 分支与 `v0.3.0-legacy` 标签。)*

## 特性

- **10 秒零依赖启动**：内置 MQTT Broker（Aedes）+ 单文件 SQLite（WAL 模式），无需安装 MySQL / InfluxDB / Redis / EMQX。
- **AI-Native 原生 MCP**：内置 Streamable HTTP `/mcp` 接口，自动将设备语义、时序聚合统计与可控能力暴露为 MCP Tools，并带物理世界安全护栏（`readonly` / `allow` / `confirm`）与审计日志。
- **零配置接入**：支持极简 JSON 自动推断字段（MQTT / HTTP）以及原生兼容 Home Assistant MQTT Discovery 自动发现。
- **开发者友好**：内置网页虚拟设备模拟器、一键生成 ESP32 / MicroPython / `curl` 接入代码。

## 快速开始

```bash
pnpm install
pnpm dev
```

访问 Web 控制台：`http://localhost:5173`（生产模式由后端 `:3000` 统一托管），内嵌 MQTT Broker 监听 `:1883`。
