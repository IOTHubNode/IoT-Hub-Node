/**
 * @swagger
 * tags:
 *   name: 物模型管理
 *   description: 物模型管理
 *   baseurl: /v1
 */
import Router from 'koa-router';
const router = new Router({ prefix: '/v1' });

import Controller from '../controllers/device.model.controller';

//#region 添加物模型
/**
 * @swagger
 * /devicemodel:
 *   post:
 *     summary: 添加物模型
 *     description: 添加物模型
 *     tags: [物模型管理]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               Name:
 *                 description: 物模型名称
 *               Description:
 *                 description: 物模型描述
 *               ConnectType:
 *                 description: 物模型连接类型
 *               Data:
 *                 description: 物模型内容(json)
 *             example:
 *               Name: "四路继电器模块"
 *               Description: "四路继电器模块"
 *               ConnectType: "1"
 *               Data: "{}"
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
router.post('/devicemodel', Controller.post);

//#region 查询全部物模型基本信息
/**
 * @swagger
 * /devicemodels:
 *   get:
 *     summary: 查询全部物模型基本信息
 *     description: 查询全部物模型基本信息
 *     tags: [物模型管理]
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
router.get('/devicemodels', Controller.getAll);

//#region 查询某个物模型的详细信息
/**
 * @swagger
 * /devicemodel/{id}:
 *   get:
 *     summary: 查询某个物模型的详细信息
 *     description: 查询某个物模型的详细信息
 *     tags: [物模型管理]
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
router.get('/devicemodel/:id', Controller.getModelData);

export default router;
