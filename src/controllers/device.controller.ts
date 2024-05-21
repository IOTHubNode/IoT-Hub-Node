//这个文件用户管理接口的业务逻辑
import DeviceService from '../services/device.service';
import { bigIntToString } from '../utils/util';
import { JWT, DEFAULT_AVATAR, SALT, DEFAULT_ROLE } from '../config/constant';
import { SUCCESS, PARAM_NOT_VALID } from '../config/code/responseCode';

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
    await SUCCESS(ctx, bigIntToString(result), '添加物模型成功');
  }

  //查询全部
  async getAll(ctx: any, next: any) {
    console.log('查询全部物模型');
    const result = await DeviceService.getAll(ctx);
    await SUCCESS(ctx, bigIntToString(result), '查询全部物模型成功');
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
}
export default new DeviceModelController();
