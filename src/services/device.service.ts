import { PrismaClient } from '@prisma/client';
import { DB_FAIL } from '../config/code/responseCode';
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
}

export default new DeviceService();
