//这个文件用户管理接口的业务逻辑
import DeviceService from '../services/device.service';
import { bigIntToString } from '../utils/util';
import { JWT, DEFAULT_AVATAR, SALT, DEFAULT_ROLE } from '../config/constant';
import { SUCCESS, PARAM_NOT_VALID } from '../config/code/responseCode';
import { formatISO, parseISO } from 'date-fns';

class DeviceModelController {
  // 添加
  async post(ctx: any, next: any) {
    // 数据校验
    try {
      ctx.verifyParams({
        Name: {
          type: 'string',
          required: true,
          message: '物模型名称不能为空',
        },
        DeviceModelId: {
          type: 'string',
          required: true,
          message: '物模型连接类型不能为空',
        },
        DeviceGroupId: {
          type: 'string',
          required: true,
          message: '物模型设备通信类型不能为空',
        },
        OrganizationId: {
          type: 'string',
          required: true,
          message: '物模型设备接入协议不能为空',
        },
      });
    } catch (error) {
      await PARAM_NOT_VALID(ctx, error.messagr, error);
    }
    // 提取数据
    const { Name, Description, DeviceModelId, DeviceGroupId, OrganizationId } = ctx.request.body;
    const AccountId = ctx.state.user.AccountId;
    const CreatedBy = AccountId;

    const result = await DeviceService.add(ctx, Name, Description, DeviceModelId, DeviceGroupId, OrganizationId, AccountId, CreatedBy);
    await SUCCESS(ctx, bigIntToString(result), '添加设备成功');
  }

  //查询全部
  async getAll(ctx: any, next: any) {
    //console.log('查询全部物模型');
    const result = await DeviceService.getAll(ctx);
    await SUCCESS(ctx, bigIntToString(result), '查询全部设备成功');
  }

  //查询某个
  async getData(ctx: any, next: any) {
    const { id } = ctx.params;
    const result = await DeviceService.getData(ctx, id);
    if (!result) {
      await PARAM_NOT_VALID(ctx, '查询的设备不存在');
    }
    await SUCCESS(ctx, bigIntToString(result), '查询某个设备成功');
  }

  // 查询某个设备存储的属性信息
  async getAttributeData(ctx: any, next: any) {
    const { id } = ctx.params;
    const results = await DeviceService.getAttributeData(ctx, id);
    // 查询设备物模型ID
    console.log(results);
    // 将结果根据 field 分类且格式化时间
    const groupedResults = results.reduce((acc, curr) => {
      const { field, time, ...rest } = curr;
      const formattedTime = formatISO(parseISO(time), { representation: 'date' }) + ' ' + time.split('T')[1].split('Z')[0]; // 格式化时间
      if (!acc[field]) {
        acc[field] = [];
      }
      acc[field].push({ field, time: formattedTime, ...rest });
      return acc;
    }, {});
    console.log(groupedResults);
    await SUCCESS(ctx, bigIntToString(groupedResults), '查询设备属性成功');
  }
}
export default new DeviceModelController();
