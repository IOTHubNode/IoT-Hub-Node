// 角色管理模块
/**
 * @swagger
 * tags:
 *   name: 角色管理
 *   description: 角色管理模块
 *   baseurl: /v1/role
 */
import Controller from '../controllers/role.controller';
import Router from 'koa-router';
const router = new Router({ prefix: '/v1/role' });

//#region 添加角色
/**
 * @swagger
 * /role/roles:
 *   post:
 *     summary: 添加角色
 *     description: 添加角色
 *     tags: [角色管理]
 *     security:
 *      - token: {}
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               Name:
 *                 description: 角色名称
 *               Description:
 *                 description: 描述
 *               Value:
 *                 description: 角色值(唯一)
 *             example:
 *               Name: "管理员"
 *               Description: "无"
 *               Value: "admin"
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
 *                 example: 添加角色成功
 *                data:
 *                 type: object
 *                 description: 信息
 *                 example: {"RoleId": "1","Name": "管理员","Value": "admin","Description": "无","IsDisabled": false,"IsDeleted": false,"CreatedTime": "2024-03-13T03:22:21.421Z","UpdatedTime": "2024-03-13T03:22:21.421Z","CreatedBy": "a450ce5f-6df3-42de-ba8f-34241f1462f1","UpdatedBy": "a450ce5f-6df3-42de-ba8f-34241f1462f1"}
 */
// #endregion
router.post('/roles', Controller.post);

//#region 删除角色
/**
 * @swagger
 * /role/roles/{id}:
 *   delete:
 *     summary: 删除角色
 *     description: 删除角色
 *     tags: [角色管理]
 *     security:
 *      - token: {}
 *     parameters:
 *      - name: id
 *        description: 角色ID
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
 *                 example: 删除角色成功
 *                data:
 *                 type: object
 *                 description: 信息
 *                 example: {"RoleId": "1","Name": "管理员","Value": "admin","Description": "无","IsDisabled": false,"IsDeleted": true,"CreatedTime": "2024-03-13T03:22:21.421Z","UpdatedTime": "2024-03-13T03:22:21.421Z","CreatedBy": "a450ce5f-6df3-42de-ba8f-34241f1462f1","UpdatedBy": "a450ce5f-6df3-42de-ba8f-34241f1462f1"}
 */
// #endregion
router.delete('/roles/:id', Controller.delete);

//#region 查询单个角色
/**
 * @swagger
 * /role/roles/{id}:
 *   get:
 *     summary: 查询单个角色
 *     description: 查询单个角色
 *     tags: [角色管理]
 *     security:
 *      - token: {}
 *     parameters:
 *      - name: id
 *        description: 角色ID
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
 *                 example: 查询角色成功
 *                data:
 *                 type: object
 *                 description: 信息
 *                 example: {"RoleId": "1","Name": "管理员","Value": "admin","Description": "无","IsDisabled": false,"IsDeleted": true,"CreatedTime": "2024-03-13T03:22:21.421Z","UpdatedTime": "2024-03-13T03:22:21.421Z","CreatedBy": "a450ce5f-6df3-42de-ba8f-34241f1462f1","UpdatedBy": "a450ce5f-6df3-42de-ba8f-34241f1462f1"}
 */
// #endregion
router.get('/roles/:id', Controller.get);

//#region 查询角色列表
/**
 * @swagger
 * /role/roles:
 *   get:
 *     summary: 查询所有角色
 *     description: 查询所有角色
 *     tags: [角色管理]
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
 *                 example: 删除角色成功
 *                data:
 *                 type: object
 *                 description: 信息
 *                 example: {"RoleId": "1","Name": "管理员","Value": "admin","Description": "无","IsDisabled": false,"IsDeleted": true,"CreatedTime": "2024-03-13T03:22:21.421Z","UpdatedTime": "2024-03-13T03:22:21.421Z","CreatedBy": "a450ce5f-6df3-42de-ba8f-34241f1462f1","UpdatedBy": "a450ce5f-6df3-42de-ba8f-34241f1462f1"}
 */
// #endregion
router.get('/roles', Controller.getAll);

//#region 更新角色本身
/**
 * @swagger
 * /role/roles/{id}:
 *   put:
 *     summary: 更新角色
 *     description: 更新角色
 *     tags: [角色管理]
 *     security:
 *      - token: {}
 *     parameters:
 *      - name: id
 *        description: 角色ID
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
 *                 description: 角色名称
 *               Description:
 *                 description: 描述
 *               Value:
 *                 description: 角色值(唯一)
 *               IsDisabled:
 *                 description: 是否禁用
 *             example:
 *               Name: "管理员"
 *               Description: "无"
 *               Value: "admin"
 *               IsDisabled: false
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
 *                 example: 删除角色成功
 *                data:
 *                 type: object
 *                 description: 信息
 *                 example: {"RoleId": "1","Name": "管理员","Value": "admin","Description": "无","IsDisabled": false,"IsDeleted": true,"CreatedTime": "2024-03-13T03:22:21.421Z","UpdatedTime": "2024-03-13T03:22:21.421Z","CreatedBy": "a450ce5f-6df3-42de-ba8f-34241f1462f1","UpdatedBy": "a450ce5f-6df3-42de-ba8f-34241f1462f1"}
 */
// #endregion
router.put('/roles/:id', Controller.put);

/**
 * @swagger
 * /v1/role/deleteRoleForAccount:
 *   delete:
 *     summary: 删除用户的角色 (待开发)
 *     description: 删除用户的角色
 *     tags: [角色管理]
 *
 */
// #endregion

export default router;
