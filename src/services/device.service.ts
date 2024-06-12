import { PrismaClient } from '@prisma/client';
import { DB_FAIL } from '../config/code/responseCode';
import { INFLUXDB } from '../config/constant';
import InfluxClient from '../db/influx/index';

const prisma = new PrismaClient();

class DeviceService {
  // 添加物模型
  async add(
    ctx: any,
    Name: string,
    Description: string,
    DeviceModelId: number,
    DeviceGroupId: number,
    OrganizationId: number,
    AccountId: string,
    CreatedBy: string
  ) {
    try {
      const result = await prisma.device.create({
        data: {
          Name: Name,
          Description: Description,
          DeviceModelId: DeviceModelId,
          DeviceGroupId: DeviceGroupId,
          OrganizationId: OrganizationId,
          AccountId: AccountId,
          CreatedBy: CreatedBy,
          UpdatedBy: CreatedBy,
        },
      });
      return result;
    } catch (error) {
      console.log(error);
      await DB_FAIL(ctx);
    }
  }

  // 查询全部
  async getAll(ctx: any) {
    try {
      const result = await prisma.device.findMany({
        where: {
          IsDeleted: false,
        },
        select: {
          DeviceId: true,
          Name: true,
          Description: true,
          DeviceModelId: true,
          OrganizationId: true,
          AccountId: true,
          Status: true,
          DeviceModel: {
            select: {
              Name: true,
              Image: true,
            },
          },
        },
      });
      return result;
    } catch (error) {
      console.log(error);
      await DB_FAIL(ctx);
    }
  }

  // 查询某个
  async getData(ctx: any, id: number) {
    // console.log('查询某个物模型');
    try {
      const result = await prisma.device.findUnique({
        where: {
          DeviceId: id,
          IsDeleted: false,
        },
        select: {
          DeviceId: true,
          Name: true,
          Description: true,
          OrganizationId: true,
          Status: true,
          Token: true,
          CreatedTime: true,
          UpdatedTime: true,
          IsDisabled: true,
          DeviceModel: {
            select: {
              DeviceModelId: true,
              Content: true,
              Name: true,
              Image: true,
            },
          },
          Account: {
            select: {
              Name: true,
            },
          },
        },
      });
      return result;
    } catch (error) {
      console.log(error);
      await DB_FAIL(ctx);
    }
  }

  // 更改设备状态
  async updateStatus(ctx: any, id: number, status: number) {
    try {
      const result = await prisma.device.update({
        where: {
          DeviceId: id,
        },
        data: {
          Status: status,
        },
      });
      return result;
    } catch (error) {
      console.log(error);
      await DB_FAIL(ctx);
    }
  }

  // 查询设备最近数据
  async getAttributeData(ctx: any, id: number): Promise<any[]> {
    try {
      // 查询设备物模型ID
      const result = await prisma.device.findUnique({
        where: {
          DeviceId: id,
          IsDeleted: false,
        },
        select: {
          DeviceModelId: true,
        },
      });

      if (!result || !result.DeviceModelId) {
        await DB_FAIL(ctx);
        return [];
      }

      const deviceModelId = result.DeviceModelId;

      // 查询时序数据库
      const queryClient = InfluxClient.client.getQueryApi(INFLUXDB.bucket);

      // 构建查询字符串
      const fluxQuery = `
      from(bucket: "${INFLUXDB.bucket}")
        |> range(start: -24h)
        |> filter(fn: (r) => r._measurement == "${deviceModelId}")
        |> filter(fn: (r) => r.device_id == "${id}")
        |> limit(n: 50)
    `;

      return new Promise((resolve, reject) => {
        const results: any[] = [];

        // 执行查询
        queryClient.queryRows(fluxQuery, {
          next(row: any, tableMeta: any) {
            const o = tableMeta.toObject(row);
            const dataPoint = {
              time: o._time,
              field: o._field,
              value: o._value,
            };
            results.push(dataPoint);
          },
          error(error: any) {
            console.error('InfluxDB query error:', error);
            reject(error);
          },
          complete() {
            resolve(results);
          },
        });
      });
    } catch (error) {
      console.error('Database query error:', error);
      await DB_FAIL(ctx);
      throw error; // 确保错误被抛出
    }
  }
}

export default new DeviceService();
