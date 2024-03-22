// 角色管理模块
//这个文件负责接口的业务逻辑
import PermissionService from '../services/permission.service';
import Casbin from '../middlewares/casbin';
import { bigIntToString } from '../utils/util';
import { SUCCESS, PARAM_NOT_VALID } from '../config/code/responseCode';
import { addRoutePermission, addMenuPermission } from '../utils/permission';
//增
class PermissionController {
  async Post(ctx: any, next: any) {
    // 数据验证
    try {
      ctx.verifyParams({
        Tag: {
          type: 'string',
          required: true,
          message: '权限名称不能为空',
        },
        Name: {
          type: 'string',
          required: true,
          message: '权限名称不能为空',
        },
        Type: {
          type: 'string',
          required: true,
          message: '权限类型不能为空',
        },
        RuleValue: {
          type: 'string',
          required: true,
          message: '权限值不能为空',
        },
      });
    } catch (error) {
      await PARAM_NOT_VALID(ctx, error.messagr, error);
    }
    // 获取数据
    const { Name, Tag, Type, RuleValue, Description, Action } = ctx.request.body;
    // 生成操作人
    let CreatedBy = 'self';
    if (ctx.state.user && ctx.state.user.AccountId !== undefined) {
      CreatedBy = ctx.state.user.AccountId;
    }
    // 操作数据库
    const res = await PermissionService.createPermission(ctx, Tag, Name, +Type, RuleValue, Description, Action, CreatedBy);
    // 返回数据
    await SUCCESS(ctx, bigIntToString(res), '添加权限成功');
  }

  // 查
  async Get(ctx: any, next: any) {
    // 数据校验
    try {
      ctx.verifyParams({
        type: {
          type: 'string',
          required: true,
          message: '权限类型不能为空',
        },
      });
    } catch (error) {
      await PARAM_NOT_VALID(ctx, error.messagr, error);
    }
    // 获取数据
    const type = ctx.params.type;
    const res = await PermissionService.getPermission(ctx, +type);

    //console.log('res', res);
    let data = {};
    //后端权限
    if (+type == 1) {
      data = RoutingPermission(res, 1);
    }
    // 后端权限
    if (+type == 2) {
      data = MenuPermission(res, 11);
    }
    //返回数据
    await SUCCESS(ctx, bigIntToString(data), '查询权限成功');
  }

  // 重启权限
  async Put(ctx: any, next: any) {
    // 数据校验
    try {
      ctx.verifyParams({
        type: {
          type: 'string',
          required: true,
          message: '权限类型不能为空',
        },
      });
    } catch (error) {
      await PARAM_NOT_VALID(ctx, error.messagr, error);
    }
    // 获取数据
    const type = ctx.params.type;
    let res = 0;
    if (+type == 1) {
      res = await addRoutePermission();
    }
    // 后端权限
    if (+type == 2) {
      res = await addMenuPermission();
    }
    if (res == 1) {
      await SUCCESS(ctx, {}, '更新权限成功');
    } else {
      await PARAM_NOT_VALID(ctx, '更新权限失败');
    }
  }

  // 删除
  async Delete(ctx: any, next: any) {
    // 数据校验
    try {
      ctx.verifyParams({
        id: {
          type: 'string',
          required: true,
          message: '权限ID不能为空',
        },
      });
    } catch (error) {
      await PARAM_NOT_VALID(ctx, error.messagr, error);
    }
    // 获取数据
    const PermissionId = ctx.params.id;
    // 操作数据库
    const res = await PermissionService.deletePermission(ctx, +PermissionId);
    // 返回数据
    await SUCCESS(ctx, bigIntToString(res), '删除权限成功');
  }

  //----------------RBAC+Casbin-----------------
  // 为用户添加多个角色
  async AssignRoles(ctx: any, next: any) {
    // 数据校验
    try {
      ctx.verifyParams({
        id: {
          type: 'string',
          required: true,
          message: '用户ID不能为空',
        },
      });
    } catch (error) {
      await PARAM_NOT_VALID(ctx, error.messagr, error);
    }
    // 获取数据
    const { Roles } = ctx.request.body;
    const id = ctx.params.id;
    // 操作数据
    // 删除
    await Casbin.deleteAccountRole(id);
    // 添加
    const res = await Casbin.addAccountRoles(id, Roles);
    if (res) {
      await SUCCESS(ctx, {}, '添加角色成功');
    } else {
      await PARAM_NOT_VALID(ctx, '添加角色失败');
    }
  }

  // 删除用户所有角色
  async DeleteRoles(ctx: any, next: any) {
    // 数据校验
    try {
      ctx.verifyParams({
        id: {
          type: 'string',
          required: true,
          message: '用户ID不能为空',
        },
      });
    } catch (error) {
      await PARAM_NOT_VALID(ctx, error.messagr, error);
    }
    // 获取数据
    const id = ctx.params.id;
    // 操作数据
    const res = await Casbin.deleteAccountRole(id);
    if (res) {
      await SUCCESS(ctx, {}, '删除角色成功');
    } else {
      await PARAM_NOT_VALID(ctx, '删除角色失败');
    }
  }

  // 为角色分配权限
  async AssignPermission(ctx: any, next: any) {
    // 数据校验
    try {
      ctx.verifyParams({
        id: {
          type: 'string',
          required: true,
          message: '角色ID不能为空',
        },
      });
    } catch (error) {
      await PARAM_NOT_VALID(ctx, error.messagr, error);
    }
    // 获取数据
    const { Permissions } = ctx.request.body;
    const id = ctx.params.id;
    // 查询角色id对应的角色值
    const role = await PermissionService.getNameByRoleId(ctx, +id);
    // 查询权限id对应的权限值
    console.log(Permissions);
    const data = await PermissionService.getPermissions(ctx, Permissions);
    // 将每个对象转换为一个包含 RuleValue 和 Action 的数组
    const transformedArray = data.map((rule) => [rule.RuleValue, rule.Action]);
    // 操作权限数据库
    // 清除角色权限
    await Casbin.deletePermissionsForUser(role.Value);
    // 重新分配权限
    const res = await Casbin.addRolePermission(role.Value, transformedArray);
    if (res) {
      await SUCCESS(ctx, {}, '添加权限成功');
    }
  }

  // 获取某角色所有权限
  async getRolePermissions(ctx: any, next: any) {
    // 数据校验
    try {
      ctx.verifyParams({
        id: {
          type: 'string',
          required: true,
          message: '角色ID不能为空',
        },
      });
    } catch (error) {
      await PARAM_NOT_VALID(ctx, error.messagr, error);
    }
    // 获取数据
    const id = ctx.params.id;
    // 查询角色id对应的角色值
    const role = await PermissionService.getNameByRoleId(ctx, +id);
    // 查询角色值对应的权限值
    const res = await Casbin.getPermissionsForUser(role.Value);
    // 查询权限值对应的ID
    const data = await PermissionService.getPermissionsIdByValue(ctx, res);
    // 返回数据
    await SUCCESS(ctx, bigIntToString(data), '获取角色权限成功');
  }

  // 删除角色所有权限
  async DeletePermission(ctx: any, next: any) {}
}

// 工具函数:
/**
 * Organizes permissions by type and groups them by tag.
 * Moves child permissions under parent permissions based on their type.
 *
 * @param {Array} permissions - The array of permissions to organize.
 * @param {number} topLevelType - The type of the top-level permissions.
 * @returns {Array} An array of organized permissions.
 */
function RoutingPermission(permissions: any, topLevelType: any) {
  const organizedPermissions = [];
  const permissionMap = {};

  // Group permissions by tag and type
  permissions.forEach((permission: any) => {
    const tag = permission.Tag;
    const type = permission.Type;
    if (!(tag in permissionMap)) {
      permissionMap[tag] = {};
    }
    if (!(type in permissionMap[tag])) {
      permissionMap[tag][type] = [];
    }
    permissionMap[tag][type].push(permission);
  });
  //console.log('permissionMap:', permissionMap);

  // Organize permissions within each tag
  for (const tag in permissionMap) {
    const tagPermissions = permissionMap[tag];
    const topLevelPermissions = tagPermissions[topLevelType.toString()] || [];
    for (const type in tagPermissions) {
      if (type !== topLevelType.toString()) {
        const childPermissions = tagPermissions[type.toString()] || [];
        topLevelPermissions.forEach((parentPermission) => {
          parentPermission.children = parentPermission.children || [];
          parentPermission.children.push(...childPermissions);
        });
      }
    }
    organizedPermissions.push(...topLevelPermissions);
  }

  return organizedPermissions;
}

// 处理菜单权限数据结构
const MenuPermission = (permissions: any, topLevelType: any) => {
  // 遍历数组取出顶层权限
  const topLevelPermissions = permissions.filter((permission: any) => permission.Type === topLevelType);
  // 遍历顶层权限，取出二层权限
  const oneLevelPermissions = permissions.filter((permission: any) => permission.Type === topLevelType + 1);
  // 遍历顶层权限，取出三层权限
  const twoLevelPermissions = permissions.filter((permission: any) => permission.Type === topLevelType + 2);

  // 打印
  //console.log('topLevelPermissions:', topLevelPermissions);
  //console.log('oneLevelPermissions:', oneLevelPermissions);
  //console.log('twoLevelPermissions:', twoLevelPermissions);

  // 遍历二层权限，将三层权限挂载到二层权限下
  oneLevelPermissions.forEach((onePermission: any) => {
    onePermission.children = [];
    twoLevelPermissions.forEach((twoPermission: any) => {
      if (twoPermission.Tag === onePermission.Name) {
        onePermission.children.push(twoPermission);
      }
    });
  });

  // 遍历顶层权限，将二层权限挂载到顶层权限下
  topLevelPermissions.forEach((topPermission: any) => {
    topPermission.children = [];
    oneLevelPermissions.forEach((onePermission: any) => {
      if (onePermission.Tag === topPermission.Name) {
        topPermission.children.push(onePermission);
      }
    });
  });
  //console.log('topLevelPermissions:', topLevelPermissions);

  return topLevelPermissions;
};

export default new PermissionController();
