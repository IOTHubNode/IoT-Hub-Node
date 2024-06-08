import SysViewService from '../services/sysview.service';
import { bigIntToString } from '../utils/util';
import { SUCCESS } from '../config/code/responseCode';

class SysViewController {
  //查
  async getSysInfo(ctx: any, next: any) {
    // 获取数据

    // 操作数据库
    //const res = await SysViewService.getExample(ctx);

    const res = {
      NumberModels: 30,
      // 设备数
      NumberDevices: 20,
      NumberOnlineDevices: 10,
      NumberAlarmDevices: 10,
      DevicesType: { 1: 10, 2: 10, 3: 10 },
      DeviceStatus: { 1: 10, 2: 10, 3: 10 },
      DeviceActivityRate: { 1: 10, 2: 10, 3: 10, 4: 10 },
      DeviceAddressStatistics: {
        X: ['北京', '上海', '陕西', '甘肃', '山东', '四川', '山西'],
        Y: [2120, 2200, 1150, 1301, 701, 1110, 1130],
      },
      MessageNumberStatistics: {
        X: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'],
        Y: [11820, 91132, 91101, 93114, 121190, 111330, 131120, 18101, 11102, 21130, 11321, 11129],
      },
    };

    await SUCCESS(ctx, res, '查询系统数据成功');
  }
}

export default new SysViewController();
