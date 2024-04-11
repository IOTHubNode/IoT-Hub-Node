import fs from 'fs';
import path from 'path';
import Router from 'koa-router';
const router = new Router();

// 导入MQTT路由
import mqtt from './mqtt/webhook.route';

// 挂载MQTT路由
router.use(mqtt.routes());

export default router;
