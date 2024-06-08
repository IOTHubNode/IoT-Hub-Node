/**
 * @swagger
 * tags:
 *   name: 设备管理
 *   description: 设备管理
 *   baseurl: /v1/device
 */
import Router from 'koa-router';
const router = new Router({ prefix: '/v1/device' });
import Controller from '../controllers/device.controller';

//#region 添加设备
/**
 * @swagger
 * /device/device:
 *   post:
 *     summary: 添加设备
 *     description: 添加设备
 *     tags: [设备管理]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               Name:
 *                 description: 设备名称
 *               Description:
 *                 description: 设备描述
 *               DeviceModelId:
 *                 description: 物模型型号
 *               DeviceGroupId:
 *                 description: 设备组
 *               OrganizationId:
 *                 description: 所属组织
 *               Status:
 *                 description: 设备状态
 *             example:
 *               Name: "四路继电器模块"
 *               Description: "四路继电器模块"
 *               DeviceModelId: "1"
 *               DeviceGroupId: "1"
 *               OrganizationId: "1"
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
 *                 example: {"OrganizationId": "3","Name": "南方分部","Description": "无","Level": 1,"LevelName": "二级","ParentId": "1","CreatedBy": "4e1bb3f5-8c0b-4573-8e6f-abf93bdc4224","CreatedTime": "2024-03-12T04:41:18.326Z"}
 *     security:
 *      - token: {}
 *      - server_auth:
 *        - authorization
 */
// #endregion
router.post('/device', Controller.post);

//#region 查询全部设备基本信息
/**
 * @swagger
 * /device/device:
 *   get:
 *     summary: 查询全部设备基本信息
 *     description: 查询全部设备基本信息
 *     tags: [设备管理]
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
 *                 example: {"OrganizationId": "3","Name": "南方分部","Description": "无","Level": 1,"LevelName": "二级","ParentId": "1","CreatedBy": "4e1bb3f5-8c0b-4573-8e6f-abf93bdc4224","CreatedTime": "2024-03-12T04:41:18.326Z"}
 *     security:
 *      - token: {}
 *      - server_auth:
 *        - authorization
 */
// #endregion
router.get('/device', Controller.getAll);

//#region 查询某个物模型的详细信息
/**
 * @swagger
 * /device/device/{id}:
 *   get:
 *     summary: 查询某个设备的详细信息
 *     description: 查询某个设备的详细信息
 *     tags: [设备管理]
 *     parameters: # 请求参数：
 *      - name: id
 *        description: 物模型id
 *        in: path
 *        required: true
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
 *                 example: {"OrganizationId": "3","Name": "南方分部","Description": "无","Level": 1,"LevelName": "二级","ParentId": "1","CreatedBy": "4e1bb3f5-8c0b-4573-8e6f-abf93bdc4224","CreatedTime": "2024-03-12T04:41:18.326Z"}
 *     security:
 *      - token: {}
 *      - server_auth:
 *        - authorization
 */
// #endregion
router.get('/device/:id', Controller.getData);

export default router;
