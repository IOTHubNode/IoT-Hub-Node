//organization路由模块
/**
 * @swagger
 * tags:
 *   name: 组织管理
 *   description: 组织路由模块
 *   baseurl: /v1/organization
 */
import Router from 'koa-router';
const router = new Router({ prefix: '/v1/organization' });
import Controllers from '../controllers/organization.controller';

//#region 添加组织
/**
 * @swagger
 * /organization/organizations:
 *   post:
 *     summary: 添加组织
 *     description: 添加组织
 *     tags: [组织管理]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               Name:
 *                 description: 组织名称
 *               Description:
 *                 description: 组织描述
 *               Level:
 *                 description: 组织等级
 *               LevelName:
 *                 description: 组织等级名称
 *               ParentId:
 *                 description: 上级组织id
 *             example:
 *               Name: "南方分部"
 *               Description: "无"
 *               Level: "1"
 *               LevelName: "二级"
 *               ParentId: "1"
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
 *                 description: 注册信息
 *                 example: 添加组织成功
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
router.post('/organizations', Controllers.post);

//#region 删除组织
/**
 * @swagger
 * /organization/organizations/{id}:
 *   delete:
 *     summary: 删除组织
 *     description: 删除组织
 *     tags: [组织管理]
 *     parameters:
 *      - name: id
 *        description: 组织ID
 *        in: path
 *        type: number
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
 *                 example: 删除组织成功
 *                data:
 *                 type: object
 *                 description: 用户信息
 *                 example: {"OrganizationId": "2","Name": "南方分部","Description": "无","Level": 1,"LevelName": "二级","ParentId": "1","ISDisabled": false,"IsDeleted": true,"CreatedTime": "2024-03-12T04:39:39.869Z","UpdatedTime": "2024-03-12T04:49:45.146Z","CreatedBy": "4e1bb3f5-8c0b-4573-8e6f-abf93bdc4224","UpdatedBy": "4e1bb3f5-8c0b-4573-8e6f-abf93bdc4224"}
 *     security:
 *      - token: {}
 */
// #endregion
router.delete('/organizations/:id', Controllers.delete);

//#region 获取全部组织列表
/**
 * @swagger
 * /organization/organizations:
 *   get:
 *     summary: 获取组织列表(树形数据)
 *     description: 获取组织列表
 *     tags: [组织管理]
 *     responses:
 *       200:
 *         description: 查询组织列表成功
 *         schema:
 *          type: object
 *          properties:
 *           code:
 *             type: number
 *             description: 状态码
 *             example: 200
 *           massage:
 *             type: string
 *             description: 查询信息
 *             example: 查询用户列表成功
 *           data:
 *             type: object
 *             description: 用户列表信息
 *     security:
 *      - token: {}
 *      - server_auth:
 *        - authorization
 */
// #endregion
router.get('/organizations', Controllers.getOrganizationTrees);

//#region 修改组织
/**
 * @swagger
 * /organization/organizations/{id}:
 *   put:
 *     summary: 修改组织
 *     description: 修改组织
 *     tags: [组织管理]
 *     parameters:
 *      - name: id
 *        description: 组织ID
 *        in: path
 *        type: number
 *        required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               Name:
 *                 description: 组织名称
 *               Description:
 *                 description: 组织描述
 *               Level:
 *                 description: 组织等级
 *               LevelName:
 *                 description: 组织等级名称
 *               ParentId:
 *                 description: 上级组织id
 *             example:
 *               Name: "南方分部"
 *               Description: "无"
 *               Level: "1"
 *               LevelName: "二级"
 *               ParentId: "1"
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
 *                 example: 更新组织成功
 *                data:
 *                 type: object
 *                 description: 用户信息
 *                 example: {"OrganizationId": "11","Name": "南方分部","Description": "无","Level": 1,"LevelName": "二级","ParentId": "1","UpdatedBy": "a450ce5f-6df3-42de-ba8f-34241f1462f1","UpdatedTime": "2024-03-12T13:01:06.767Z"}
 *     security:
 *      - token: {}
 *      - server_auth:
 *        - authorization
 */
// #endregion
router.put('/organizations/:id', Controllers.put);

export default router;
