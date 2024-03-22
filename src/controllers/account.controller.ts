//这个文件用户管理接口的业务逻辑
import AccountService from '../services/account.service';
import { bigIntToString } from '../utils/util';
import { hashPassword } from '../utils/crypto';
import { sign } from 'jsonwebtoken';
import { JWT, DEFAULT_AVATAR, SALT, DEFAULT_ROLE } from '../config/constant';
import { SUCCESS, PARAM_NOT_VALID } from '../config/code/responseCode';
import Casbin from '../middlewares/casbin';
class AccountController {
  //用户注册
  async register(ctx: any, next: any) {
    // 数据校验
    try {
      ctx.verifyParams({
        OrganizationId: {
          type: 'string',
          required: true,
          message: '团队Id不能为空',
        },
        Account: {
          type: 'string',
          required: true,
          message: '账户不能为空',
        },
        Password: {
          type: 'string',
          required: true,
          message: '密码不能为空',
        },
        Email: {
          type: 'string',
          required: true,
        },
        Phone: {
          type: 'string',
          required: false,
        },
      });
    } catch (error) {
      await PARAM_NOT_VALID(ctx, error.messagr, error);
    }
    // 获取数据
    const { OrganizationId, Roles, Account, Password, Email, Phone, IsDisabled } = ctx.request.body;
    const Name = Account;
    // 密码加密
    const hash = hashPassword(Password, SALT.saltRounds);
    // 生成操作人
    let CreatedBy = 'self';
    if (ctx.state.user && ctx.state.user.AccountId !== undefined) {
      CreatedBy = ctx.state.user.AccountId;
    }
    // 生成默认头像
    const randomIndex = Math.floor(Math.random() * DEFAULT_AVATAR.length);
    const AvatarUrl: string = DEFAULT_AVATAR[randomIndex].image;
    // 操作数据库
    const res = await AccountService.createAccount(
      ctx,
      OrganizationId,
      Account,
      hash,
      Name,
      AvatarUrl,
      Email,
      Phone,
      parseInt(IsDisabled, 10) !== 0,
      CreatedBy
    );
    if (Roles.length == 0) {
      // 生成默认用户
      await Casbin.addAccountRole(res.AccountId.toString(), DEFAULT_ROLE.ROLE_VALUE);
    } else {
      // 添加角色
      await Casbin.addAccountRoles(res.AccountId.toString(), Roles);
    }

    //返回数据
    await SUCCESS(ctx, bigIntToString(res), '用户注册成功');
  }

  //用户登录
  async login(ctx: any, next: any) {
    // 数据校验
    try {
      ctx.verifyParams({
        Account: {
          type: 'string',
          required: true,
        },
        Password: {
          type: 'string',
          required: true,
        },
      });
    } catch (error) {
      await PARAM_NOT_VALID(ctx, error.messagr, error);
    }
    // 获取数据
    const { Account, Password } = ctx.request.body;
    // 密码加密
    const hash = hashPassword(Password, SALT.saltRounds);
    // 操作数据库
    const res = await AccountService.login(ctx, Account, hash);

    // 颁发token
    const token = 'Bearer ' + sign({ AccountId: res.AccountId }, JWT.secret, { expiresIn: JWT.expires });

    // 返回数据
    await SUCCESS(ctx, { token: token }, '用户登录成功');
  }

  // 查询所有用户(无分页)
  async getAllAccountList(ctx: any, next: any) {
    // 操作数据库
    const res = await AccountService.getAllAccountList(ctx);
    for (let i = 0; i < res.length; i++) {
      const roles = await Casbin.getAccountRoles(res[i].AccountId.toString());
      (res[i] as any).Roles = roles;
    }
    // 返回数据
    await SUCCESS(ctx, bigIntToString(res), '查询成功');
  }

  // 查询用户列表(分页)
  async getAllAccount(ctx: any, next: any) {
    // 数据校验
    try {
      ctx.verifyParams({
        page: {
          type: 'string',
          required: true,
          message: '当前页数不能为空',
        },
        limit: {
          type: 'string',
          required: true,
          message: '每页记录数不能为空',
        },
      });
    } catch (error) {
      await PARAM_NOT_VALID(ctx, error.messagr, error);
    }
    // 数据提取
    const { page, limit } = ctx.params;
    // 操作数据库
    const res = await AccountService.getAllAccount(ctx, parseInt(page), parseInt(limit));
    const [accounts, totalCount] = res;
    // 补充查询角色
    for (let i = 0; i < accounts.length; i++) {
      const roles = await Casbin.getAccountRoles(accounts[i].AccountId.toString());
      (accounts[i] as any).Roles = roles;
    }
    // 返回数据)
    await SUCCESS(ctx, bigIntToString({ total: totalCount, records: accounts }), '查询成功');
  }

  // 根据组织查询用户列表(分页)
  async getAllAccountInOrg(ctx: any, next: any) {
    // 数据校验
    try {
      ctx.verifyParams({
        organizationid: {
          type: 'string',
          required: true,
          message: '当前页数不能为空',
        },
        page: {
          type: 'string',
          required: true,
          message: '当前页数不能为空',
        },
        limit: {
          type: 'string',
          required: true,
          message: '每页记录数不能为空',
        },
      });
    } catch (error) {
      await PARAM_NOT_VALID(ctx, error.messagr, error);
    }
    // 数据提取
    const { organizationid, page, limit } = ctx.params;
    let accounts: any, totalCount: any;
    if (organizationid == '0') {
      // 操作数据库
      const res = await AccountService.getAllAccount(ctx, parseInt(page), parseInt(limit));
      [accounts, totalCount] = res;
    } else {
      // 操作数据库
      const res = await AccountService.getAllAccountInOrg(ctx, organizationid, parseInt(page), parseInt(limit));
      [accounts, totalCount] = res;
    }
    // 补充查询角色
    for (let i = 0; i < accounts.length; i++) {
      const roles = await Casbin.getAccountRoles(accounts[i].AccountId.toString());
      (accounts[i] as any).Roles = roles;
    }
    // 返回数据)
    await SUCCESS(ctx, bigIntToString({ total: totalCount, records: accounts }), '查询成功');
  }
  // 查询单个用户(id)
  async getAccount(ctx: any, next: any) {
    // 数据校验
    try {
      ctx.verifyParams({
        id: {
          type: 'string',
          required: true,
          message: '用户id不能为空',
        },
      });
    } catch (error) {
      await PARAM_NOT_VALID(ctx, error.messagr, error);
    }
    // 数据提取
    const id = ctx.params.id;
    // 操作数据库
    const res = await AccountService.getAccount(ctx, id);

    // 返回数据
    // 返回数据
    await SUCCESS(ctx, bigIntToString(res), '查询成功');
  }

  // 查询单个用户(token)
  async getSelfAccount(ctx: any, next: any) {
    // 数据提取
    const id = ctx.state.user.AccountId;
    // 操作数据库
    const res: any = await AccountService.getAccount(ctx, id);
    // 查询角色
    const role = await Casbin.getAccountRoles(id);
    // 查询前端权限
    // 查询角色值对应的权限值
    const Permissions = await Casbin.getPermissionsForUser(role.toString());
    console.log(Permissions);
    // 查询权限值对应的ID
    const data = await AccountService.getPermissionsIdByValue(ctx, Permissions);
    console.log(data);
    // 为resz添加roles
    res.Roles = role;
    res.Routes = data;
    // 返回数据
    await SUCCESS(ctx, bigIntToString(res), '查询成功');
  }

  // 删除用户
  async deleteAccount(ctx: any, next: any) {
    // 数据校验
    try {
      ctx.verifyParams({
        id: {
          type: 'string',
          required: true,
          message: '用户id不能为空',
        },
      });
    } catch (error) {
      await PARAM_NOT_VALID(ctx, error.messagr, error);
    }
    // 数据提取
    const id = ctx.params.id;
    // 操作数据库
    const res = await AccountService.deleteAccount(ctx, id);
    // 返回数据
    await SUCCESS(ctx, bigIntToString(res), '删除成功');
  }

  // 修改用户
  async putAccount(ctx: any, next: any) {
    // 数据校验
    // try {
    //   ctx.verifyParams({
    //     id: {
    //       type: 'string',
    //       required: true,
    //       message: '用户id不能为空',
    //     },
    //     Name: {
    //       type: 'string',
    //       required: true,
    //       message: '用户名不能为空',
    //     },
    //     Email: {
    //       type: 'string',
    //       required: true,
    //       message: '邮箱不能为空',
    //     },
    //     Phone: {
    //       type: 'string',
    //       required: false,
    //     },
    //   });
    // } catch (error) {
    //   await PARAM_NOT_VALID(ctx, error.messagr, error);
    // }
    // 数据提取
    const { OrganizationId, Roles, Name, Password, Email, Phone, IsDisabled } = ctx.request.body;
    const id = ctx.params.id;
    // 密码加密
    // 密码加密
    const hash = hashPassword(Password, SALT.saltRounds);
    // 操作数据库
    const res = await AccountService.putAccount(ctx, id, OrganizationId, Name, Email, Phone, hash, parseInt(IsDisabled, 10) !== 0);
    // 修改角色映射
    await Casbin.deleteAccountRole(id);
    await Casbin.addAccountRoles(res.AccountId.toString(), Roles);
    // 返回数据
    await SUCCESS(ctx, bigIntToString(res), '修改成功');
  }
}
export default new AccountController();
