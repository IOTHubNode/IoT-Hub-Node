import { Point } from '@influxdata/influxdb-client';
import InfluxClient from '../../db/influx/index';
import { DB_FAIL } from '../../config/code/responseCode';
import { INFLUXDB } from '../../config/constant';

class MqttService {
  // 写设备属性
  async writeDevice(data: any) {
    // 获取 InfluxDB 客户端的写入 API
    const writeClient = InfluxClient.client.getWriteApi(INFLUXDB.org, INFLUXDB.bucket, 'ms');
    try {
      // 解析 JSON 负载
      const payload = JSON.parse(data.payload);

      // 判断json层数
      // 遍历JSON数据
      for (const key in payload) {
        const value = payload[key];
        if (typeof value === 'object') {
          // 递归处理嵌套的JSON对象
          // 根据值的类型选择不同的方法添加字段
          if (typeof value === 'number') {
            // 创建一个点(measurement为物模型ID, tag为设备ID)
            // const point = new Point(data.id.split('-')[0]).tag('device_id', data.id.split('-')[1]);
            //point.floatField(key, value);
          } else if (typeof value === 'string') {
            //point.stringField(key, value);
          }
        }
      }
    } catch (error) {}
  }
  // 写入设备属性数据
  async writeMessage(data: any) {
    const org = INFLUXDB.org;
    const bucket = INFLUXDB.bucket;

    // 获取 InfluxDB 客户端的写入 API
    const writeClient = InfluxClient.client.getWriteApi(org, bucket, 'ns');

    try {
      // 创建一个点
      const point = new Point('test').tag('clientid', data.clientid).tag('topic', data.topic);

      // 解析 JSON 负载
      const payload = JSON.parse(data.payload);

      // 遍历 JSON 负载中的字段并将其作为字段添加到点中
      for (const key in payload) {
        const value = payload[key];

        // 根据值的类型选择不同的方法添加字段
        if (typeof value === 'number') {
          point.floatField(key, value);
        } else if (typeof value === 'string') {
          // 将字符串字段解析为合适的数据类型
          if (value.endsWith('%')) {
            // 将百分比字符串转换为数字
            const numValue = parseFloat(value.replace('%', ''));
            point.floatField(key, numValue);
          } else if (value.endsWith('°C') || value.endsWith('mv')) {
            // 去除后缀并转换为数字
            const numValue = parseFloat(value);
            point.floatField(key, numValue);
          } else {
            point.stringField(key, value);
          }
        }
      }

      // 将点写入数据库
      writeClient.writePoint(point);

      // 刷新缓存以确保数据写入数据库
      writeClient.flush();
    } catch (error) {
      console.log('数据库错误', error);
    }
  }
}

// 计算对象的深度
const calculateDepth = (obj) => {
  // 如果传入的不是对象，则返回 0
  if (typeof obj !== 'object') return 0;

  let maxDepth = 0;

  // 遍历对象的每个键值对
  for (const key in obj) {
    // 递归调用 calculateDepth 函数，计算子对象的深度
    let depth = calculateDepth(obj[key]);

    // 更新最大深度
    if (depth > maxDepth) {
      maxDepth = depth;
    }
  }

  // 返回最大深度加 1（因为当前层也算一层）
  return maxDepth + 1;
};
export default new MqttService();
