//这个文件负责接口的业务逻辑
import OrganizationService from '../services/organization.service';
import { bigIntToString } from '../utils/util';
import { SUCCESS, PARAM_NOT_VALID } from '../config/code/responseCode';
//增
class OrganizationController {
  // 添加组织
  async post(ctx: any, next: any) {
    // 数据校验
    // 数据校验
    try {
      ctx.verifyParams({
        Name: {
          type: 'string',
          required: true,
          message: '组织名称不能为空',
        },
        Level: {
          type: 'string',
          required: true,
          message: '组织等级不能为空',
        },
        LevelName: {
          type: 'string',
          required: true,
          message: '组织等级名称不能为空',
        },
        ParentId: {
          type: 'string',
          required: true,
          message: '上级组织id不能为空',
        },
      });
    } catch (error) {
      await PARAM_NOT_VALID(ctx, error.messagr, error);
    }
    // 获取数据
    const { Name, Description, Level, LevelName, ParentId } = ctx.request.body;
    // 操作数据库
    const res = await OrganizationService.createOrganization(ctx, Name, Description, +Level, LevelName, ParentId);
    // 返回数据
    await SUCCESS(ctx, bigIntToString(res), '添加组织成功');
  }

  //删
  async delete(ctx: any, next: any) {
    // 数据校验
    try {
      ctx.verifyParams({
        id: {
          type: 'string',
          required: true,
          message: '组织id不能为空',
        },
      });
    } catch (error) {
      await PARAM_NOT_VALID(ctx, error.messagr, error);
    }
    // 获取数据
    const OrganizationId = ctx.params.id;
    // 操作数据库
    const res = await OrganizationService.deleteOrganization(ctx, OrganizationId);
    // 返回数据
    await SUCCESS(ctx, bigIntToString(res), '删除组织成功');
  }

  // 查询全部(树型数据)
  async getOrganizationTrees(ctx: any, next: any) {
    // 操作数据库
    const res = await OrganizationService.getOrganizationTrees(ctx);
    const data = buildOrganizationTree(bigIntToString(res));
    // 返回数据
    await SUCCESS(ctx, data, '查询数据成功');
  }

  //改
  async put(ctx: any, next: any) {
    // 数据校验
    ctx.verifyParams({
      id: {
        type: 'string',
        required: true,
        message: '组织ID不能为空',
      },
      Name: {
        type: 'string',
        required: true,
        message: '组织名称不能为空',
      },
      Level: {
        type: 'string',
        required: true,
        message: '组织等级不能为空',
      },
      LevelName: {
        type: 'string',
        required: true,
        message: '组织等级名称不能为空',
      },
      ParentId: {
        type: 'string',
        required: true,
        message: '上级组织id不能为空',
      },
    });
    // 获取数据
    const id = ctx.params.id;
    const { Name, Description, Level, LevelName, ParentId, IsDisabled } = ctx.request.body;
    console.log('IsDeleted:', IsDisabled);
    console.log('!IsDeleted:', !IsDisabled);
    // 操作数据库
    const res = await OrganizationService.put(ctx, id, Name, Description, +Level, LevelName, ParentId, parseInt(IsDisabled, 10) !== 0);
    // 返回数据
    await SUCCESS(ctx, bigIntToString(res), '修改数据成功');
  }
}

// 工具函数:构建部门树型数据
function buildOrganizationTree(data: any) {
  const idMap = {};
  data.forEach((item: any) => {
    idMap[item.OrganizationId] = { ...item, children: [] };
  });

  // 构建树形结构
  const tree = [];
  data.forEach((item: any) => {
    if (item.ParentId && idMap[item.ParentId]) {
      idMap[item.ParentId].children.push(idMap[item.OrganizationId]);
    } else {
      tree.push(idMap[item.OrganizationId]);
    }
  });

  // 遍历树，删除子节点为空的情况
  const removeEmptyChildren = (node: any) => {
    if (node.children.length === 0) {
      delete node.children;
    } else {
      node.children.forEach((child: any) => {
        removeEmptyChildren(child);
      });
    }
  };

  tree.forEach((item: any) => {
    removeEmptyChildren(item);
  });

  return tree;
}

export default new OrganizationController();
