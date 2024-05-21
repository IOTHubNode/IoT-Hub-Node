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
        select: {
          DeviceId: true,
          Name: true,
          Description: true,
          DeviceModelId: true,
          OrganizationId: true,
          AccountId: true,
          Status: true,
          CreatedTime: true,
          UpdatedTime: true,
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
        },
        select: {
          DeviceId: true,
          Name: true,
          Description: true,
          DeviceModelId: true,
          OrganizationId: true,
          AccountId: true,
          Status: true,
          Token: true,
          CreatedTime: true,
          UpdatedTime: true,
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
