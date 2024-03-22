//casbin权限管理中间件

import { newEnforcer } from 'casbin';
import { PrismaAdapter } from 'casbin-prisma-adapter';
import { PublicRouter } from '../config/constant';
import { AUTH_PERMISSION_FAIL } from '../config/code/responseCode';

class Casbin {
  enforcer: any;
  constructor() {
    this.init();
  }
  async init() {
    const a = await PrismaAdapter.newAdapter();
    const enforcer = await newEnforcer('src/config/casbin.model.conf', a);
    //const enforcer = await newEnforcer('src/config/casbin.model.conf', 'src/config/policy.csv');
    console.log('Casbin初始化完成'); // 检查 enforcer 对象是否正确初始化
    this.enforcer = enforcer;
    //console.log(this.enforcer);
  }
  // 全局路由守卫
  authz = async (ctx: any, next: any) => {
    const { path, method } = ctx;
    // 检查当前请求的路径，如果匹配指定的路由，则跳过认证
    if (checkIgnore(ctx.path)) {
      await next();
      return;
    }
    // 提取参数
    const accountId = ctx.state.user.AccountId;
    //console.log('全局路由守卫');
    console.log(accountId, path, method);
    // 检查当前用户是否有权限访问该路径
    const res = await this.enforcer.enforce(accountId, path, method.toLowerCase());
    //const res = 1;
    //console.log(res);
    if (res) {
      await next();
    } else {
      await AUTH_PERMISSION_FAIL(ctx);
    }
  };

  // 查询用户的角色(根据accountId)
  async getAccountRoles(accountId: string) {
    return await this.enforcer.getRolesForUser(accountId.toString());
    //console.log(roles); // 输出该用户所拥有的角色
  }

  // 查询角色的用户(根据角色值)
  async getRolesAccount(Role: string) {
    return await this.enforcer.GetUsersForRole(Role);
  }
  // 为用户添加单个角色
  async addAccountRole(accountId: string, role: string) {
    return this.enforcer.addRoleForUser(accountId, role);
  }
  // 为用户添加多个角色。 如果用户已经拥有该角色，则返回false。
  async addAccountRoles(accountId: string, roles: string[]) {
    return roles.map((role) => this.enforcer.addRoleForUser(accountId, role));
  }

  // 删除用户的所有角色
  async deleteAccountRole(accountId: string) {
    return await this.enforcer.deleteRolesForUser(accountId);
  }

  // 为角色添加多个权限permissions = [["data1", "read"],["data2", "write"]];
  async addRolePermission(role: string, permissions: any) {
    return permissions.map((permission) => this.enforcer.addPermissionForUser(role, ...permission));
  }

  // 删除角色所有权限
  async deletePermissionsForUser(role: string) {
    // 删除角色所有权限
    return await this.enforcer.deletePermissionsForUser(role);
  }

  // 获取角色所有的权限
  async getPermissionsForUser(role: string) {
    return await this.enforcer.getPermissionsForUser(role);
  }
}

// 判断是否应该跳过认证的辅助函数
function checkIgnore(path: string): boolean {
  // 在这里添加需要跳过认证的路由规则
  const ignoreRoutes = PublicRouter;
  return ignoreRoutes.some((route) => route.test(path));
}

export default new Casbin();
