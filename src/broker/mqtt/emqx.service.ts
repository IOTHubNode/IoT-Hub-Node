import { Point } from '@influxdata/influxdb-client';
import InfluxClient from '../../db/influx/index';
import { DB_FAIL } from '../../config/code/responseCode';

class MqttService {
  // 写入设备属性数据
  async writeMessage(data: any) {
    const org = 'iot';
    const bucket = 'test';

    console.log('写入数据:', data);

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

export default new MqttService();
