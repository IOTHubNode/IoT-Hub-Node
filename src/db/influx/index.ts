import { InfluxDB, Point } from '@influxdata/influxdb-client'

const token = process.env.INFLUXDB_TOKEN
const url = process.env.INFLUXDB_URL

const client = new InfluxDB({ url, token })


