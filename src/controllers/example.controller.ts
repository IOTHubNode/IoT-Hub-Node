//这个文件负责接口的业务逻辑
import ExampleService from '../services/example.service';
import { bigIntToString } from '../utils/util';
import { SUCCESS } from '../config/code/responseCode';
//增
class ExampleController {
  async post(ctx: any, next: any) {
    // 获取数据
    const { Name, Password, Email, Phone } = ctx.request.body;
    // 数据验证

    // 操作数据库
    const res = await ExampleService.createExample(ctx, Name, Password, Email, Phone);

    // 返回数据
    const newRes = { ...res };
    if (typeof res.ExampleId === 'bigint') newRes.ExampleId = bigIntToString(res.ExampleId);

    await SUCCESS(ctx, newRes, '添加数据成功');
  }

  //删
  async delete(ctx: any, next: any) {
    // 获取数据
    const { ExampleId } = ctx.request.body;

    // 数据验证
    // 操作数据库
    const res = await ExampleService.deleteExample(ctx, ExampleId);

    // 返回数据
    const newRes = { ...res };
    if (typeof res.ExampleId === 'bigint') newRes.ExampleId = bigIntToString(res.ExampleId);
    await SUCCESS(ctx, newRes, '删除数据成功');
  }

  //查
  async get(ctx: any, next: any) {
    // 获取数据

    // 操作数据库
    const res = await ExampleService.getExample(ctx);

    // 处理bigint类型的数据
    res.forEach((val, idx) => {
      if (typeof val.ExampleId === 'bigint') res[idx].ExampleId = bigIntToString(val.ExampleId);
    });

    await SUCCESS(ctx, res, '查询数据成功');
  }

  //改
  async put(ctx: any, next: any) {
    // 获取数据
    console.log(ctx.request.body);

    // 数据验证
    const { AccountId, Name, Password, Email, Phone } = ctx.request.body;

    // 操作数据库
    const res = await ExampleService.updateExample(ctx, AccountId, Name, Password, Email, Phone);

    // 返回数据
    const newRes = { ...res };
    if (typeof res.ExampleId === 'bigint') newRes.ExampleId = bigIntToString(res.ExampleId);
    await SUCCESS(ctx, newRes, '修改数据成功');
  }
}

export default new ExampleController();
