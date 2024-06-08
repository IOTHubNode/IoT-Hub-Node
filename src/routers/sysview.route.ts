//系统数据概览模块，监控系统数据
/**
 * @swagger
 * tags:
 *   name: 系统数据概览
 *   description: 系统数据概览
 *   baseurl: /v1/sysview
 */
import Router from 'koa-router';
const router = new Router({ prefix: '/v1/sysview' });
import Controllers from '../controllers/sysview.controller';

/**
 * @swagger
 * /sysview/sysinfo:
 *   get:
 *     summary: 获取系统数据概览
 *     description: 获取系统数据概览
 *     tags: [系统数据概览]
 *     security:
 *      - token: {}
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                code:
 *                 type: number
 *                 description: 状态码
 *                 example: 200
 *                massage:
 *                 type: string
 *                 description: 信息
 *                 example: 添加物模型成功
 *                data:
 *                 type: object
 *                 description: 用户信息
 *                 example: {"code":200,"msg":"查询系统数据成功","data":{"NumberModels":30,"NumberDevices":20,"NumberOnlineDevices":10,"NumberAlarmDevices":10,"DevicesType":{"1":10,"2":10,"3":10 },"DeviceStatus":{"1":10,"2":10,"3":10 },"DeviceActivityRate":{"1":10,"2":10,"3":10,"4":10 },"DeviceAddressStatistics":{"X":["北京","上海","陕西","甘肃","山东","四川","山西"],"Y":[2120,2200,1150,1301,701,1110,1130 ]},"MessageNumberStatistics":{"X":["一月","二月","三月","四月","五月","六月","七月","八月","九月","十月","十一月","十二月"],"Y":[11820,91132,91101,93114,121190,111330,131120,18101,11102,21130,11321,11129 ]}}}
 *
 */
router.get('/sysinfo', Controllers.getSysInfo);

export default router;
