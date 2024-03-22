// 角色管理模块
import { PrismaClient } from '@prisma/client';
import { DB_FAIL } from '../config/code/responseCode';
const prisma = new PrismaClient();

class RoleService {
  // 增
  async createRole(ctx: any, Name: string, Value: string, Description: string) {
    try {
      const result = await prisma.role.create({
        data: {
          Name,
          Value,
          Description,
          CreatedBy: ctx.state.user.AccountId,
          UpdatedBy: ctx.state.user.AccountId,
        },
      });
      return result;
    } catch (error) {
      await DB_FAIL(ctx);
    }
  }

  // 删
  async deleteRole(ctx: any, RoleId: number) {
    try {
      const result = await prisma.role.update({
        where: { RoleId },
        data: { IsDeleted: true },
      });
      return result;
    } catch (error) {
      await DB_FAIL(ctx);
    }
  }

  // 查一个
  async getRole(ctx: any, RoleId: number) {
    try {
      const result = await prisma.role.findUnique({
        where: { RoleId, IsDeleted: false },
      });
      return result;
    } catch (error) {
      await DB_FAIL(ctx);
    }
  }

  // 查全部
  async getAllRoles(ctx: any) {
    try {
      const result = await prisma.role.findMany({
        where: { IsDeleted: false },
        select: {
          RoleId: true,
          Name: true,
          Value: true,
          IsDisabled: true,
          Description: true,
          CreatedTime: true,
          UpdatedTime: true,
        },
      });
      return result;
    } catch (error) {
      await DB_FAIL(ctx);
    }
  }

  // 更新
  async updateRole(ctx: any, RoleId: number, Name: string, Value: string, Description: string, IsDisabled: boolean) {
    try {
      const result = await prisma.role.update({
        where: { RoleId },
        data: {
          Name,
          Value,
          Description,
          IsDisabled,
          UpdatedBy: ctx.state.user.AccountId,
        },
      });
      return result;
    } catch (error) {
      console.log(error);
      await DB_FAIL(ctx);
    }
  }
}

export default new RoleService();
