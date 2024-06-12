import { Point } from '@influxdata/influxdb-client';
import InfluxClient from '../../db/influx/index';
import { DB_FAIL, FAIL } from '../../config/code/responseCode';
import { INFLUXDB } from '../../config/constant';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
class MqttService {
  // 验证设备连接
  async authDevice(ctx: any, DeviceModelId: string, DeviceId: number, PassWord: string) {
    try {
      const result = await prisma.device.findUnique({
        where: { DeviceId: DeviceId, IsDeleted: false },
      });
      if (result) {
        if (result.Token === PassWord) {
          return 1;
        } else {
          await FAIL(ctx, '设备通行证错误');
        }
      } else {
        await FAIL(ctx, '设备ID未知错误');
      }
    } catch (error) {
      console.log(error);
      await DB_FAIL(ctx);
    }
  }

  // 写设备属性
  async writeDevice(ctx: any, DeviceModelId: string, DeviceId: string, PayLoad: JSON) {
    // 获取 InfluxDB 客户端的写入 API
    const writeClient = InfluxClient.client.getWriteApi(INFLUXDB.org, INFLUXDB.bucket, 'ns');
    let point: any;
    try {
      // 不同层数分层处理
      switch (calculateDepth(PayLoad)) {
        case 1: {
          //创建一个点(measurement为物模型ID, tag为设备ID)
          point = new Point(DeviceModelId).tag('device_id', DeviceId);
          // 遍历 JSON 负载中的字段并将其作为字段添加到点中
          for (const key in PayLoad) {
            const value = PayLoad[key];
            // 根据值的类型选择不同的方法添加字段
            if (typeof value === 'number') {
              point.floatField(key.toString(), value);
            } else if (typeof value === 'string') {
              point.stringField(key.toString(), value);
            }
          }
          // 将点写入数据库
          writeClient.writePoint(point);
          console.log(point);
          break;
        }
        case 2: {
          // 遍历数据
          for (const id in PayLoad) {
            const value = PayLoad[id];
            //创建一个点(measurement为物模型ID, tag为设备ID)
            point = new Point(id.split('-')[0].toString()).tag('device_id', id.split('-')[1].toString());
            for (const key in value) {
              const data = value[key];
              // 根据值的类型选择不同的方法添加字段
              if (typeof data === 'number') {
                point.floatField(key.toString(), data);
              } else if (typeof data === 'string') {
                point.stringField(key.toString(), data);
              }
            }
            // 将点写入数据库
            writeClient.writePoint(point);
            console.log(point);
          }

          break;
        }
        default: {
          break;
        }
      }
      // 刷新缓存以确保数据写入数据库
      writeClient.flush();
    } catch (error) {
      console.log('数据库错误', error);
    }
  }
}

// 计算对象的深度
const calculateDepth = (obj: any) => {
  // 如果传入的不是对象，则返回 0
  if (typeof obj !== 'object') return 0;

  let maxDepth = 0;

  // 遍历对象的每个键值对
  for (const key in obj) {
    // 递归调用 calculateDepth 函数，计算子对象的深度
    const depth = calculateDepth(obj[key]);

    // 更新最大深度
    if (depth > maxDepth) {
      maxDepth = depth;
    }
  }

  // 返回最大深度加 1（因为当前层也算一层）
  return maxDepth + 1;
};
export default new MqttService();
