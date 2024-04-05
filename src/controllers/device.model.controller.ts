//这个文件用户管理接口的业务逻辑
import DeviceModelService from '../services/device.model.service';
import { bigIntToString } from '../utils/util';
import { JWT, DEFAULT_AVATAR, SALT, DEFAULT_ROLE } from '../config/constant';
import { SUCCESS, PARAM_NOT_VALID } from '../config/code/responseCode';

class DeviceModelController {
  // 数据校验

  // 添加
  async post(ctx: any, next: any) {
    console.log('添加物模型');
    try {
      ctx.verifyParams({
        Name: {
          type: 'string',
          required: true,
          message: '物模型名称不能为空',
        },
        ConnectType: {
          type: 'string',
          required: true,
          message: '物模型连接类型不能为空',
        },
        Data: {
          type: 'object',
          required: true,
          message: '物模型内容不能为空',
        },
      });
    } catch (error) {
      await PARAM_NOT_VALID(ctx, error.messagr, error);
    }
    // 提取数据
    const { Name, Description, ConnectType, Data } = ctx.request.body;
    const CreatedBy = ctx.state.user.AccountId;
    // Date转换为json
    //const Data = ctx.request.body.Data;
    const result = await DeviceModelService.add(ctx, Name, Description, ConnectType, Data, CreatedBy);
    await SUCCESS(ctx, bigIntToString(result), '添加物模型成功');
  }

  // 查询全部
  async getAll(ctx: any, next: any) {
    console.log('查询全部物模型');
    const result = await DeviceModelService.getAll(ctx);
    await SUCCESS(ctx, bigIntToString(result), '查询全部物模型成功');
  }

  // 查询某个物模型
  async getModelData(ctx: any, next: any) {
    console.log('查询某个物模型');
    const { id } = ctx.params;
    const result = await DeviceModelService.getModelData(ctx, id);
    if (!result) {
      await PARAM_NOT_VALID(ctx, '查询的物模型不存在');
    }
    await SUCCESS(ctx, bigIntToString(result), '查询某个物模型成功');
  }
}
export default new DeviceModelController();
