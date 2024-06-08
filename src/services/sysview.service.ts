import { PrismaClient } from '@prisma/client';
import { DB_FAIL } from '../config/code/responseCode';
const prisma = new PrismaClient();

class SysViewService {
  // 查
  async getSysInfo(ctx) {
    try {
      // 查询物模型数量(不算删除的)
      const count = await prisma.deviceModel.count({
        where: {
          IsDeleted: false,
        },
      });

      // 获取所有设备及其对应的物模型信息
      const devices = await prisma.device.findMany({
        where: {
          IsDeleted: false,
        },
        select: {
          Status: true,
          UpdatedTime: true,
          DeviceModel: {
            select: {
              ConnectType: true,
            },
          },
        },
      });

      // 使用 Prisma 聚合函数进行设备数量统计
      const deviceCountByStatus = await prisma.device.groupBy({
        by: ['Status'],
        where: {
          IsDeleted: false,
        },
        _count: {
          Status: true,
        },
      });

      const deviceCountByConnectType = await prisma.deviceModel.groupBy({
        by: ['ConnectType'],
        where: {
          IsDeleted: false,
        },
        _count: {
          ConnectType: true,
        },
      });

      // 使用 Prisma 聚合函数统计设备更新时间
      const now = new Date();
      const tenMinutesAgo = new Date(now.getTime() - 10 * 60 * 1000);
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
      const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      const deviceCountByUpdateTime = {
        within10Minutes: await prisma.device.count({
          where: {
            IsDeleted: false,
            UpdatedTime: {
              gte: tenMinutesAgo,
            },
          },
        }),
        within1Hour: await prisma.device.count({
          where: {
            IsDeleted: false,
            UpdatedTime: {
              gte: oneHourAgo,
            },
          },
        }),
        within24Hours: await prisma.device.count({
          where: {
            IsDeleted: false,
            UpdatedTime: {
              gte: twentyFourHoursAgo,
            },
          },
        }),
        within1Week: await prisma.device.count({
          where: {
            IsDeleted: false,
            UpdatedTime: {
              gte: oneWeekAgo,
            },
          },
        }),
      };

      const result = { count, deviceCountByStatus, deviceCountByConnectType, deviceCountByUpdateTime };
      return result;
    } catch (error) {
      console.log(error);
      await DB_FAIL(ctx);
    }
  }
}

export default new SysViewService();
