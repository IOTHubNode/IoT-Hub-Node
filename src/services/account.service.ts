import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
import { FAIL, DB_FAIL, USER_ACCOUNT_ALREADY_EXIST, USER_PWD_ERROR } from '../config/code/responseCode';
class AccountService {
  // 用户注册
  async createAccount(
    ctx: any,
    OrganizationId: number,
    Account: string,
    Password: string,
    Name: string,
    AvatarUrl: string,
    Email: string,
    Phone: string,
    IsDisabled: boolean,
    CreatedBy: string
  ) {
    try {
      const result = await prisma.account.create({
        data: {
          OrganizationId,
          Account,
          Password,
          Name,
          AvatarUrl,
          Email,
          Phone,
          IsDisabled,
          CreatedBy: CreatedBy,
          UpdatedBy: CreatedBy,
        },
        select: {
          OrganizationId: true,
          AccountId: true,
          Account: true,
          Name: true,
          AvatarUrl: true,
          Email: true,
          Phone: true,
        },
      });
      return result;
    } catch (error) {
      await FAIL(ctx, '数据库错误:添加用户数据失败');
    }
  }

  // 用户登录
  async login(ctx: any, Account: string, Password: string) {
    try {
      const result = await prisma.account.findUnique({
        where: { Account: Account, IsDeleted: false },
      });
      if (result) {
        if (result.Password === Password) {
          return result;
        } else {
          await USER_PWD_ERROR(ctx);
        }
      } else {
        await USER_ACCOUNT_ALREADY_EXIST(ctx);
      }
    } catch (error) {
      console.log(error);
      await FAIL(ctx, '数据库错误:查询用户数据失败');
    }
  }

  // 获取所有用户
  async getAllAccountList(ctx: any) {
    try {
      const result = await prisma.account.findMany({
        select: {
          OrganizationId: true,
          AccountId: true,
          Account: true,
          Name: true,
          AvatarUrl: true,
          Email: true,
          Phone: true,
        },
      });
      return result;
    } catch (error) {
      //console.log(error);
      await FAIL(ctx, '数据库错误:查询用户数据失败');
    }
  }

  // 分页查询用户
  async getAllAccount(ctx: any, page: number, pageSize: number) {
    try {
      const result = await prisma.$transaction([
        // 查询数据
        prisma.account.findMany({
          skip: (page - 1) * pageSize,
          take: pageSize,
          select: {
            OrganizationId: true,
            AccountId: true,
            Account: true,
            Name: true,
            AvatarUrl: true,
            Email: true,
            Phone: true,
            IsDisabled: true,
          },
        }),
        // 查询总数
        prisma.account.count(),
      ]);
      return result;
    } catch (error) {
      console.log(error);
      //console.log(error);
      await FAIL(ctx, '数据库错误:查询用户数据失败');
    }
  }

  // 查询用户（根据组织）
  async getAllAccountInOrg(ctx: any, OrganizationId: number, page: number, pageSize: number) {
    try {
      const result = await prisma.$transaction([
        // 查询数据
        prisma.account.findMany({
          skip: (page - 1) * pageSize,
          take: pageSize,
          where: { OrganizationId },
          select: {
            OrganizationId: true,
            AccountId: true,
            Account: true,
            Name: true,
            AvatarUrl: true,
            Email: true,
            Phone: true,
            IsDisabled: true,
          },
        }),
        // 查询总数
        prisma.account.count({ where: { OrganizationId } }),
      ]);
      return result;
    } catch (error) {
      console.log(error);
      //console.log(error);
      await FAIL(ctx, '数据库错误:查询用户数据失败');
    }
  }

  // 获取单个用户
  async getAccount(ctx: any, id: string) {
    try {
      const result = await prisma.account.findUnique({
        where: { AccountId: id, IsDeleted: false },
        select: {
          AccountId: true,
          Account: true,
          Name: true,
          AvatarUrl: true,
          Email: true,
          Phone: true,
        },
      });
      return result;
    } catch (error) {
      //console.log(error);
      await FAIL(ctx, '数据库错误:查询用户数据失败');
    }
  }

  // 删除用户
  async deleteAccount(ctx: any, id: string) {
    try {
      const result = await prisma.account.update({
        where: { AccountId: id },
        data: { IsDeleted: true },
        select: {
          AccountId: true,
          Account: true,
          Name: true,
          AvatarUrl: true,
          Email: true,
          Phone: true,
        },
      });
      return result;
    } catch (error) {
      console.log(error);
      await FAIL(ctx, '数据库错误:删除用户数据失败');
    }
  }
  // 更新用户信息
  async putAccount(
    ctx: any,
    id: string,
    OrganizationId: number,
    Name: string,
    Email: string,
    Phone: string,
    Password: string,
    IsDisabled: boolean
  ) {
    try {
      const result = await prisma.account.update({
        where: { AccountId: id },
        data: {
          OrganizationId,
          Name,
          Email,
          Phone,
          Password: Password !== undefined ? Password : undefined,
          IsDisabled,
          UpdatedBy: ctx.state.user.AccountId,
        },
        select: {
          AccountId: true,
          Account: true,
          Name: true,
          AvatarUrl: true,
          Email: true,
          Phone: true,
        },
      });
      return result;
    } catch (error) {
      console.log(error);
      await FAIL(ctx, '数据库错误:更新用户数据失败');
    }
  }

  // 查询用户前端权限
  async getPermissionsIdByValue(ctx, data: any) {
    try {
      const permissionIds = [];
      for (const [_, ruleValue, action] of data) {
        const permissions = await prisma.permission.findMany({
          where: {
            Type: { in: [11, 12, 13, 14, 15, 16, 17, 18, 19] },
            RuleValue: ruleValue,
            Action: action,
            IsDeleted: false,
            IsDisabled: false,
          },
          select: {
            //RuleValue: true,
            Name: true,
          },
        });
        const ids = permissions.map((permission) => permission.Name);
        permissionIds.push(...ids);
      }
      return permissionIds;
    } catch (error) {
      await DB_FAIL(ctx);
    }
  }
}

export default new AccountService();
