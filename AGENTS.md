# AGENTS.md — IoT-Hub-Node 主仓开发规范

本仓库遵循上层工作区 [../AGENTS.md](../AGENTS.md) 的全部架构红线与滴答清单看板约定。

## 目录结构

- `packages/shared` (`@iothub/shared`)：前后端共享 Zod Schema、物模型与 API 类型
- `apps/server` (`@iothub/server`)：Node 22+ / Hono / Drizzle(SQLite WAL) / Aedes MQTT / MCP Server / WebSocket
- `apps/web` (`@iothub/web`)：Vue 3.5 / Vite 6 / Pinia / Tailwind CSS / ECharts 极简工作台

## 常用命令

- 安装依赖：`pnpm install`
- 启动全栈开发：`pnpm dev`（Server `:3000` + MQTT `:1883` + Web `:5173`）
- 类型检查：`pnpm typecheck`
- 运行测试：`pnpm test`
- 构建生产产物：`pnpm build`

## 提交约定

- 使用 Conventional Commits（中文提交信息），如：`feat(server): 实现 SQLite 核心表与管理员鉴权`。
- 严禁提交 `.env`、`data/*.db*`、真实密钥与 `.DS_Store`。
