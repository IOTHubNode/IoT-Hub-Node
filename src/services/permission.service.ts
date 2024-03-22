// 权限管理模块
import { PrismaClient } from '@prisma/client';
import { DB_FAIL } from '../config/code/responseCode';
const prisma = new PrismaClient();

class PermissionService {
  // 增(单个)
  async createPermission(
    ctx,
    Tag: string,
    Name: string,
    Type: number,
    RuleValue: string,
    Description: string,
    Action: string,
    CreatedBy: string
  ) {
    try {
      const result = await prisma.permission.create({
        data: {
          Tag,
          Name,
          Type,
          RuleValue,
          Action,
          Description,
          CreatedBy,
          UpdatedBy: CreatedBy,
        },
      });
      return result;
    } catch (error) {
      await DB_FAIL(ctx);
    }
  }

  // 查
  async getPermission(ctx, type: number) {
    let whereCondition: any;

    console.log('type:', type);
    if (type == 1) {
      whereCondition = {
        Type: { in: [1, 2] },
      };
    }
    if (type == 2) {
      whereCondition = {
        Type: { in: [11, 12, 13, 14, 15, 16, 17, 18, 19] },
      };
    }
    if (!whereCondition) {
      console.log('type参数错误');
      return [];
    }
    try {
      const result = await prisma.permission.findMany({
        where: whereCondition,
        select: {
          PermissionId: true,
          Tag: true,
          Name: true,
          Description: true,
          Type: true,
          RuleValue: true,
          IsDisabled: true,
          Action: true,
          CreatedTime: true,
          UpdatedTime: true,
        },
      });
      return result;
    } catch (error) {
      await DB_FAIL(ctx);
    }
  }

  // 查(多个)
  async getPermissions(ctx, Permissions: any) {
    try {
      const result = await prisma.permission.findMany({
        where: {
          PermissionId: {
            in: Permissions,
          },
          IsDisabled: false,
          IsDeleted: false,
        },
        select: {
          RuleValue: true,
          Action: true,
        },
        orderBy: {
          CreatedTime: 'desc',
        },
      });
      return result;
    } catch (error) {
      await DB_FAIL(ctx);
    }
  }

  // 删除
  async deletePermission(ctx, id: number) {
    try {
      const result = await prisma.permission.delete({
        where: {
          PermissionId: id,
        },
      });
      return result;
    } catch (error) {
      await DB_FAIL(ctx);
    }
  }
  // 工具：查询角色id对应的值
  async getNameByRoleId(ctx, roleId: number) {
    try {
      const result = await prisma.role.findUnique({
        where: {
          RoleId: roleId,
        },
        select: {
          Value: true,
        },
      });
      return result;
    } catch (error) {
      await DB_FAIL(ctx);
    }
  }

  // 根据权限值查询权限
  async getPermissionsIdByValue(ctx, data: any) {
    try {
      const permissionIds = [];
      for (const [_, ruleValue, action] of data) {
        const permissions = await prisma.permission.findMany({
          where: {
            RuleValue: ruleValue,
            Action: action,
            IsDeleted: false,
            IsDisabled: false,
          },
          select: {
            PermissionId: true,
          },
        });
        const ids = permissions.map((permission) => permission.PermissionId);
        permissionIds.push(...ids);
      }
      return permissionIds;
    } catch (error) {
      await DB_FAIL(ctx);
    }
  }
}

export default new PermissionService();
