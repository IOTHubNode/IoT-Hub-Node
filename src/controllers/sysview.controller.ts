import SysViewService from '../services/sysview.service';
import { bigIntToString } from '../utils/util';
import { SUCCESS } from '../config/code/responseCode';
class SysViewController {
  // 查
  async getSysInfo(ctx: any, next: any) {
    // 操作数据库，获取系统信息
    const sysInfo = await SysViewService.getSysInfo(ctx);

    // 构造数据对象，准备返回
    const data = {
      // 物模型数量
      NumberModels: sysInfo.count,

      // 设备总数量，通过状态分类累加
      NumberDevices: sysInfo.deviceCountByStatus.reduce((acc, deviceStatus) => acc + deviceStatus._count.Status, 0),

      // 在线设备数量，状态为 1
      NumberOnlineDevices: sysInfo.deviceCountByStatus.find((status) => status.Status === 1)?._count.Status || 0,

      // 报警设备数量，状态为 3
      NumberAlarmDevices: sysInfo.deviceCountByStatus.find((status) => status.Status === 3)?._count.Status || 0,

      // 设备连接类型，初始化为 [0, 0, 0]
      DevicesType: [0, 0, 0],

      // 设备状态，初始化为 [0, 0, 0]
      DeviceStatus: [0, 0, 0],

      // 设备活动率，按照更新时间分类
      DeviceActivityRate: [
        sysInfo.deviceCountByUpdateTime.within10Minutes || 0,
        sysInfo.deviceCountByUpdateTime.within1Hour || 0,
        sysInfo.deviceCountByUpdateTime.within24Hours || 0,
        sysInfo.deviceCountByUpdateTime.within1Week || 0,
      ],

      // 设备地址统计，示例数据
      DeviceAddressStatistics: {
        X: ['北京', '上海', '陕西', '甘肃', '山东', '四川', '山西'],
        Y: [2120, 2200, 1150, 1301, 701, 1110, 1130],
      },

      // 消息数量统计，示例数据
      MessageNumberStatistics: {
        X: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'],
        Y: [11820, 91132, 91101, 93114, 121190, 111330, 131120, 18101, 11102, 21130, 11321, 11129],
      },
    };

    // 填充设备连接类型数据，根据 ConnectType
    sysInfo.deviceCountByConnectType.forEach((connectType) => {
      data.DevicesType[connectType.ConnectType - 1] = connectType._count.ConnectType;
    });

    // 填充设备状态数据，根据 Status
    sysInfo.deviceCountByStatus.forEach((deviceStatus) => {
      data.DeviceStatus[deviceStatus.Status - 1] = deviceStatus._count.Status;
    });

    // 返回成功响应，包含数据和消息
    await SUCCESS(ctx, data, '查询系统数据成功');
  }
}

export default new SysViewController();
