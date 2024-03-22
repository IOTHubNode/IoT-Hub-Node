// 权限管理模块
/**
 * @swagger
 * tags:
 *   name: 权限管理
 *   description: 权限管理模块
 *   baseurl: /v1/permission
 */
import Router from 'koa-router';
const router = new Router({ prefix: '/v1/permission' });
import Controllers from '../controllers/permission.controller';

//#region 添加一条权限(通用)
/**
 * @swagger
 * /permission/permissions:
 *   post:
 *     summary: 添加一条权限
 *     description: 添加一条权限
 *     tags: [权限管理]
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
 *                 description: 权限名称
 *               Tag:
 *                 description: 权限标签
 *               Type:
 *                 description: 权限类型
 *               RuleValue:
 *                 description: 权限值
 *               Description:
 *                 description: 描述
 *               Action:
 *                 description: 行为
 *             example:
 *               Name: "添加用户"
 *               Tag: "用户管理"
 *               Type: "1"
 *               RuleValue: "/v1/user/users"
 *               Description: "添加用户"
 *               Action: "post"
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
 *                 example: 用户注册成功
 *                data:
 *                 type: object
 *                 description: 用户信息
 *                 example:
 */
// #endregion
router.post('/permissions', Controllers.Post);

//#region 按类型获取系统权限列表【Type-->1:后端,2:前端】
/**
 * @swagger
 * /permission/permissions/{type}:
 *   get:
 *     summary: 获取系统权限列表
 *     description: 按类型获取权限列表
 *     tags: [权限管理]
 *     security:
 *      - token: {}
 *     parameters: # 请求参数：
 *      - name: type
 *        description: 类型【Type-->1:后端,2:前端】
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
 *                 example: 获取权限成功
 *                data:
 *                 type: object
 *                 description: 权限信息
 *                 example:
 */
// #endregion
router.get('/permissions/:type', Controllers.Get);

//#region 按类型重置系统权限列表【1:后端,2:前端】
/**
 * @swagger
 * /permission/permissions/{type}:
 *   put:
 *     summary: 重置系统权限列表
 *     description: 按类型获取权限列表
 *     tags: [权限管理]
 *     security:
 *      - token: {}
 *     parameters: # 请求参数：
 *      - name: type
 *        description: 类型【Type-->1:后端,2:前端】
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
 *                 example: 获取权限成功
 *                data:
 *                 type: object
 *                 description: 权限信息
 *                 example:
 */
// #endregion
router.put('/permissions/:type', Controllers.Put);

//#region 删除权限
/**
 * @swagger
 * /permission/permission/{id}:
 *   delete:
 *     summary: 删除某个权限
 *     description: 删除某个权限
 *     tags: [权限管理]
 *     security:
 *      - token: {}
 *     parameters: # 请求参数：
 *      - name: id
 *        description: 权限id
 *        in: path
 *        required: true
 *     responses:
 *       200:
 *         description: 删除成功
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
 *             example: 删除成功
 *           data:
 *             type: object
 *             description: 用户信息
 */
// #endregion
router.delete('/permission/:id', Controllers.Delete);

//#region 为用户添加角色
/**
 * @swagger
 * /permission/permissions/roles/{id}:
 *   post:
 *     summary: 为用户添加角色
 *     description: 为用户添加角色
 *     tags: [权限管理]
 *     security:
 *      - token: {}
 *     parameters: # 请求参数：
 *      - name: id
 *        description: 用户id
 *        in: path
 *        required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               Roles:
 *                 description: 角色值数组
 *             example:
 *               Roles: ["admin","admin1","admin2"]
 *     responses:
 *       200:
 *         description: 删除成功
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
 *             example: 删除成功
 *           data:
 *             type: object
 *             description: 用户信息
 */
// #endregion
router.post('/permissions/roles/:id', Controllers.AssignRoles);

//#region 删除用户所有角色
/**
 * @swagger
 * /permission/permissions/roles/{id}:
 *   delete:
 *     summary: 删除用户所有角色
 *     description: 删除用户所有角色
 *     tags: [权限管理]
 *     security:
 *      - token: {}
 *     parameters: # 请求参数：
 *      - name: id
 *        description: 权限id
 *        in: path
 *        required: true
 *     responses:
 *       200:
 *         description: 删除成功
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
 *             example: 删除成功
 *           data:
 *             type: object
 *             description: 用户信息
 */
// #endregion
router.delete('/permissions/roles/:id', Controllers.DeleteRoles);

//#region 为角色添加权限
/**
 * @swagger
 * /permission/permissions/{id}:
 *   post:
 *     summary: 为角色添加权限
 *     description: 为角色添加权限
 *     tags: [权限管理]
 *     security:
 *      - token: {}
 *     parameters: # 请求参数：
 *      - name: id
 *        description: 角色id
 *        in: path
 *        required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               Permissions:
 *                 description: 权限ID数组
 *             example:
 *               Permissions: ["1","2","3","4","5","6","7","8","9"]
 *     responses:
 *       200:
 *         description: 删除成功
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
 *             example: 删除成功
 *           data:
 *             type: object
 *             description: 用户信息
 */
// #endregion
router.post('/permissions/:id', Controllers.AssignPermission);

//#region 删除角色所有权限
/**
 * @swagger
 * /permission/permissions/{id}:
 *   delete:
 *     summary: 删除角色所有权限
 *     description: 删除角色所有权限
 *     tags: [权限管理]
 *     security:
 *      - token: {}
 *     parameters: # 请求参数：
 *      - name: id
 *        description: 角色id
 *        in: path
 *        required: true
 *     responses:
 *       200:
 *         description: 删除成功
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
 *             example: 删除成功
 *           data:
 *             type: object
 *             description: 用户信息
 */
// #endregion
router.delete('/permissions/:id', Controllers.DeletePermission);

//#region 获取角色权限列表
/**
 * @swagger
 * /permission/permissions/roles/{id}:
 *   get:
 *     summary: 获取角色权限列表
 *     description: 获取角色权限列表
 *     tags: [权限管理]
 *     security:
 *      - token: {}
 *     parameters: # 请求参数：
 *      - name: id
 *        description: 角色id
 *        in: path
 *        required: true
 *     responses:
 *       200:
 *         description: 删除成功
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
 *             example: 删除成功
 *           data:
 *             type: object
 *             description: 用户信息
 */
// #endregion
router.get('/permissions/roles/:id', Controllers.getRolePermissions);

export default router;
