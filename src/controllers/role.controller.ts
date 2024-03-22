// 角色管理模块
import RoleService from '../services/role.service';
import { SUCCESS, PARAM_NOT_VALID } from '../config/code/responseCode';
import { bigIntToString } from '../utils/util';

class RoleController {
  // 添加角色
  async post(ctx: any, next: any) {
    // 数据校验
    try {
      ctx.verifyParams({
        Name: {
          type: 'string',
          required: true,
          message: '角色名称不能为空',
        },
        Value: {
          type: 'string',
          required: true,
          message: '角色值不能为空',
        },
      });
    } catch (error) {
      await PARAM_NOT_VALID(ctx, error.messagr, error);
    }
    // 获取数据
    const { Name, Value, Description } = ctx.request.body;
    // 操作数据库
    const res = await RoleService.createRole(ctx, Name, Value, Description);
    // 返回数据
    await SUCCESS(ctx, bigIntToString(res), '添加角色成功');
  }
  // 删除角色
  async delete(ctx: any, next: any) {
    // 数据校验
    try {
      ctx.verifyParams({
        id: {
          type: 'string',
          required: true,
          message: '角色id不能为空',
        },
      });
    } catch (error) {
      await PARAM_NOT_VALID(ctx, error.messagr, error);
    }
    // 获取数据
    const RoleId = ctx.params.id;
    // 操作数据库
    const res = await RoleService.deleteRole(ctx, RoleId);
    // 返回数据
    await SUCCESS(ctx, bigIntToString(res), '删除角色成功');
  }

  // 查单个
  async get(ctx: any, next: any) {
    // 数据校验
    try {
      ctx.verifyParams({
        id: {
          type: 'string',
          required: true,
          message: '角色id不能为空',
        },
      });
    } catch (error) {
      await PARAM_NOT_VALID(ctx, error.messagr, error);
    }
    // 获取数据
    const RoleId = ctx.params.id;
    // 操作数据库
    const res = await RoleService.getRole(ctx, RoleId);
    // 返回数据
    console.log('res:', res);
    if (!res) {
      await SUCCESS(ctx, {}, '添加角色成功');
    } else {
      await SUCCESS(ctx, bigIntToString(res), '添加角色成功');
    }
  }
  // 查所有
  async getAll(ctx: any, next: any) {
    // 操作数据库
    const res = await RoleService.getAllRoles(ctx);
    // 返回数据
    await SUCCESS(ctx, bigIntToString(res), '获取全部角色成功');
  }

  // 改
  async put(ctx: any, next: any) {
    // 数据校验
    try {
      ctx.verifyParams({
        id: {
          type: 'string',
          required: true,
          message: '角色id不能为空',
        },
        Name: {
          type: 'string',
          required: true,
          message: '角色名称不能为空',
        },
        Value: {
          type: 'string',
          required: true,
          message: '角色值不能为空',
        },
      });
    } catch (error) {
      await PARAM_NOT_VALID(ctx, error.messagr, error);
    }
    // 获取数据
    const RoleId = ctx.params.id;
    const { Name, Value, Description, IsDisabled } = ctx.request.body;
    // 操作数据库
    const res = await RoleService.updateRole(ctx, RoleId, Name, Value, Description, parseInt(IsDisabled, 10) !== 0);
    // 返回数据
    await SUCCESS(ctx, bigIntToString(res), '修改角色成功');
  }
}

export default new RoleController();
