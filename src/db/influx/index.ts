import { InfluxDB, FluxTableMetaData } from '@influxdata/influxdb-client';
import { INFLUXDB } from '../../config/constant';

class InfluxClient {
  client: any;
  constructor() {
    this.init();
  }
  async init() {
    const url = INFLUXDB.url;
    const token = INFLUXDB.token;
    this.client = new InfluxDB({ url, token });
    this.testConnect();
  }

  // 测试连接
  async testConnect() {
    const org = INFLUXDB.org;
    const bucket = INFLUXDB.bucket;
    const query = `from(bucket: "${bucket}") |> range(start: -1h) |> limit(n: 1)`;
    const queryApi = this.client.getQueryApi(org);

    queryApi.queryRows(query, {
      next(row: any, tableMeta: FluxTableMetaData) {
        //console.log(row, tableMeta);
      },
      error(error: Error) {
        console.error('Error connecting to InfluxDB:', error);
      },
      complete() {
        console.log('InfluxDB connection completed:', INFLUXDB.url);
      },
    });
  }
  async write(data: any) {}

  async query(query: string) {}
}

export default new InfluxClient();
