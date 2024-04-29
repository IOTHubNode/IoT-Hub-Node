import { InfluxDB, Point } from '@influxdata/influxdb-client'

class InfluxClient {
	client: any;
	constructor() {
		this.init();
	}
	async init() {
		const token = process.env.INFLUXDB_TOKEN
		const url = process.env.INFLUXDB_URL
		this.client = new InfluxDB({ url, token })
		console.log('influxdb connected')
	}

	async write(data: any) {

	}

	async query(query: string) {

	}
}

export default new InfluxClient();
