import { PrismaClient } from '@prisma/client';
import { Point } from '@influxdata/influxdb-client'
import  InfluxClient  from '../../db/influx/index';
import { DB_FAIL } from '../../config/code/responseCode';

const prisma = new PrismaClient();

class MqttService {


  // 写入设备属性数据
  async writeMessage(data: any) {
    let org = `iot`
    let bucket = `test`

    let writeClient = InfluxClient.client.getWriteApi(org, bucket, 'ns')

    // 解析json数据


    let point = new Point('test')
      .tag(data.clientid, data.topic)
      .intField('a', JSON.parse(data.payload).a)
    
    writeClient.writePoint(point)

    //writeClient.flush()
    
  }
}

export default new MqttService();
