import { PrismaClient } from '@prisma/client';
import { DB_FAIL } from '../config/code/responseCode';
const prisma = new PrismaClient();

class DeviceModelService {
  // 添加物模型
  async add(
    ctx: any,
    Name: string,
    Description: string,
    ConnectType: number,
    CommunicationType: number,
    ProtocolType: number,
    Content: any,
    Image: string,
    CreatedBy: string
  ) {
    console.log('添加物模型');
    try {
      const result = await prisma.$transaction(async (prisma) => {
        // 添加设备模型
        const newDeviceModel = await prisma.deviceModel.create({
          data: {
            Name: Name,
            Description: Description,
            ConnectType: +ConnectType,
            CommunicationType: +CommunicationType,
            ProtocolType: +ProtocolType,
            Content: JSON.stringify(Content), // 确保 Content 是 JSON 字符串
            Image: Image,
            CreatedBy: CreatedBy,
            UpdatedBy: CreatedBy,
          },
        });

        // 更新 Content 字段中的 productKey
        const updatedContent = JSON.parse(newDeviceModel.Content);
        updatedContent.productKey = String(newDeviceModel.DeviceModelId);

        const updatedDeviceModel = await prisma.deviceModel.update({
          where: { DeviceModelId: newDeviceModel.DeviceModelId }, // 这里指定了要更新的设备模型的 id
          data: {
            Content: updatedContent, // 直接传入更新后的对象
          },
        });

        return updatedDeviceModel;
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
          Device: {
            // 查询总数
            select: {
              DeviceId: true,
            },
          },
        },
      });

      // 优化返回值格式
      const data = result.map((model) => {
        return {
          ...model,
          Device: model.Device.map((device) => Number(device.DeviceId)),
        };
      });

      return data;

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
          Image: true,
          Description: true,
          ConnectType: true,
          Content: true,
          CreatedTime: true,
          UpdatedTime: true,

          Device: {
            select: {
              DeviceId: true,
              Name: true,
              Description: true,
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

  // 查询某个物模型下的设备列表
  async getDevicesData(ctx: any, id: number) {
    console.log('查询某个物模型下的设备列表');
    try {
      const result = await prisma.deviceModel.findMany({
        where: {
          DeviceModelId: id,
        },
        select: {
          Device: {
            select: {
              DeviceId: true,
              Name: true,
              Description: true,
            },
          },
        },
      });

      return result;
    } catch (error) {
      console.log(error);
    }
  }
}

export default new DeviceModelService();
