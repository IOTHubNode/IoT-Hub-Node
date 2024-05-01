impt { InfluxDB, Point } from '@influxdata/influxdb-client'

class InfluxClient {
	client: any;
	constructor() {
		this.init();
	}
	async init() {
		//const token = process.env.INFLUXDB_TOKEN
		//const url = process.env.INFLUXDB_URL
		const token = 'zh-__WUxpkLjE-3VcGbDGDgOmpcudj0JY2AA4bDma34ZruXtGchVY1SkMpYCltwqvRrSdxF8DrQtSmPxUcJDsg=='
		
		const url = 'http://www.duruofu.xyz:8086'
		this.client = new InfluxDB({ url, token })
	}

	async write(data: any) {

	}

	async query(query: string) {

	}
}

export default new InfluxClient();
