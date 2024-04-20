import { PrismaClient } from '@prisma/client';
import { DB_FAIL } from '../config/code/responseCode';

const prisma = new PrismaClient();

class DeviceModelService {
  // 添加物模型
  async add(ctx: any, Name: string, Description: string, ConnectType: number, CommunicationType: number, ProtocolType: number, Content: any, Image: string, CreatedBy: string) {
    console.log('添加物模型');
    try {
      const result = await prisma.deviceModel.create({
        data: {
          Name: Name,
          Description: Description,
          ConnectType: +ConnectType,
          CommunicationType: +CommunicationType,
          ProtocolType: +ProtocolType,
          Content: Content,
          Image: Image,
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
    console.log('查询全部物模型');
    try {
      const result = await prisma.deviceModel.findMany({
        select: {
          DeviceModelId: true,
          Name: true,
          Image: true,
          Description: true,
          ConnectType: true,
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
  async getModelData(ctx: any, id: number) {
    // console.log('查询某个物模型');
    try {
      const result = await prisma.deviceModel.findUnique({
        where: {
          DeviceModelId: id,
        },
        select: {
          DeviceModelId: true,
          Name: true,
          Description: true,
          ConnectType: true,
          Content: true,
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

export default new DeviceModelService();
