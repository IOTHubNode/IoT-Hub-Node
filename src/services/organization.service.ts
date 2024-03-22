import { PrismaClient } from '@prisma/client';
import { FAIL } from '../config/code/responseCode';
const prisma = new PrismaClient();

class OrganizationService {
  //增
  async createOrganization(ctx: any, Name: string, Description: string, Level: number, LevelName: string, ParentId: number) {
    try {
      const result = await prisma.organization.create({
        data: {
          Name,
          Description,
          Level,
          LevelName,
          ParentId,
          CreatedBy: ctx.state.user.AccountId,
          UpdatedBy: ctx.state.user.AccountId,
        },
        select: {
          OrganizationId: true,
          Name: true,
          Description: true,
          Level: true,
          LevelName: true,
          ParentId: true,
          CreatedBy: true,
          CreatedTime: true,
        },
      });
      return result;
    } catch (error) {
      // 失败
      await FAIL(ctx, '数据库错误:添加组织数据失败');
    }
  }

  // 删(逻辑删除)
  async deleteOrganization(ctx: any, OrganizationId: number) {
    try {
      const result = await prisma.organization.update({
        where: { OrganizationId },
        data: { IsDeleted: true },
      });
      return result;
    } catch (error) {
      console.log('error:', error);
      await FAIL(ctx, '数据库错误:删除组织数据失败');
    }
  }

  // 查询全部(树型数据)
  async getOrganizationTrees(ctx: any) {
    try {
      const result = await prisma.organization.findMany({
        where: { IsDeleted: false },
        select: {
          OrganizationId: true,
          Name: true,
          Description: true,
          Level: true,
          LevelName: true,
          ParentId: true,
          IsDisabled: true,
          CreatedTime: true,
          UpdatedTime: true,
        },
      });
      return result;
    } catch (error) {
      //console.log(error);
      await FAIL(ctx, '数据库错误:查询组织数据失败');
    }
  }

  // 改
  async put(
    ctx: any,
    id: number,
    Name: string,
    Description: string,
    Level: number,
    LevelName: string,
    ParentId: number,
    IsDisabled: boolean
  ) {
    try {
      const result = await prisma.organization.update({
        where: { OrganizationId: id },
        data: {
          Name,
          Description,
          Level,
          LevelName,
          ParentId,
          IsDisabled,
          UpdatedBy: ctx.state.user.AccountId,
        },
        select: {
          OrganizationId: true,
          Name: true,
          Description: true,
          Level: true,
          LevelName: true,
          ParentId: true,
          UpdatedBy: true,
          UpdatedTime: true,
        },
      });
      return result;
    } catch (error) {
      console.log(error);
      await FAIL(ctx, '数据库错误:更新组织数据失败');
    }
  }
}

export default new OrganizationService();
