/**
 * @swagger
 * tags:
 *   name: 用户模块
 *   description: 用户管理模块
 *   baseurl: /v1/account
 */
import Router from 'koa-router';
const router = new Router({ prefix: '/v1/account' });
import Controller from '../controllers/account.controller';

//#region 用户注册
/**
 * @swagger
 * /account/register:
 *   post:
 *     summary: 用户注册
 *     description: 用户注册
 *     tags: [用户模块]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               OrganizationId:
 *                 description: 团队id
 *               Account:
 *                 description: 用户账号
 *               Password:
 *                 description: 用户密码
 *               Email:
 *                 description: 用户邮箱
 *               Phone:
 *                 description: 用户手机号
 *               IsDisabled:
 *                 description: 是否禁用
 *               Roles:
 *                 description: 用户角色列表,字符串数组
 *             example:
 *               OrganizationId: "1"
 *               Account: "1234567"
 *               Password: "3.1415926"
 *               Email: "123344@11.c0m"
 *               Phone: "12912781727818"
 *               IsDisabled: false
 *               Roles: ["admin","default"]
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
 *                 example: {"AccountId": "61a7125d-9439-4739-90f1-c4271a84d9d6","OrganizationId": "126626262","Account": "2626211","Name": "2626211","AvatarUrl": "https://image-1308319148.cos.ap-chengdu.myqcloud.com/main/%E4%B8%AA%E4%BA%BA%E5%A4%B4%E5%83%8F.png","Email": "146746747647","Phone": "1363636363","IsDeleted": false,"CreatedTime": "2024-03-11T10:21:53.823Z","UpdatedTime": "2024-03-11T10:21:53.823Z"}
 */
// #endregion
router.post('/register', Controller.register);

//#region 用户登陆
/**
 * @swagger
 * /account/login:
 *   post:
 *     summary: 用户登陆(用户名密码)
 *     description: 用户登陆
 *     tags: [用户模块]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               Account:
 *                 description: 用户账号
 *               Password:
 *                 description: 用户密码
 *             example:
 *               Account: "11"
 *               Password: "11"
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
 *                 description: 登陆信息
 *                 example: 用户登陆成功
 *                data:
 *                 type: object
 *                 description: 用户信息
 *                 example: {"token": "Bearer eyJhbGciOiJIUzIFJ354bxO7Dw"}
 */
// #endregion
router.post('/login', Controller.login);

//#region 删除用户
/**
 * @swagger
 * /account/accounts/{id}:
 *   delete:
 *     summary: 删除某个用户
 *     description: 删除某个用户
 *     tags: [用户模块]
 *     security:
 *      - token: {}
 *     parameters: # 请求参数：
 *      - name: id
 *        description: 用户id
 *        in: path
 *        required: true
 *     responses:
 *       200:
 *         description: 删除某个用户成功
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
 *             example: 删除某个用户成功
 *           data:
 *             type: object
 *             description: 用户信息
 *             example: {"AccountId": "2c41bb7d-c0b5-41e1-aa25-859619841154","Account": "123","Name": "123","AvatarUrl": "https://image-1308319148.cos.ap-chengdu.myqcloud.com/main/33.png","Email": "123344f@11.c0m","Phone": "129127d81727818"}
 */
// #endregion
router.delete('/accounts/:id', Controller.deleteAccount);

//#region 获取用户列表(不分页)
/**
 * @swagger
 * /account/accounts:
 *   get:
 *     summary: 获取全部用户列表(不分页)
 *     description: 查询用户列表
 *     tags: [用户模块]
 *     responses:
 *       200:
 *         description: 查询用户列表成功
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
router.get('/accounts', Controller.getAllAccountList);

//#region 获取用户列表(分页)
/**
 * @swagger
 * /account/accounts/{page}/{limit}:
 *   get:
 *     summary: 获取用户列表(分页)
 *     description: 查询用户列表
 *     tags: [用户模块]
 *     parameters: # 请求参数：
 *      - name: page
 *        description: 当前页数
 *        in: path
 *        type: number
 *        required: true
 *      - name: limit
 *        description: 每页记录数
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
 *                 description: 登陆信息
 *                 example: 查询用户列表成功
 *                data:
 *                 type: object
 *                 description: 用户信息
 *                 properties:
 *                   total:
 *                     type: number
 *                     description: 总记录数
 *                     example: 1
 *                   records:
 *                     type: array
 *                     description: 用户列表
 *                     example: [{"AccountId": "61a7125d-9439-4739-90f1-c4271a84d9d6","TeamId": "126626262","Account": "2626211","Password": "1126262","Name": "2626211","AvatarUrl": "https://image-1308319148.cos.ap-chengdu.myqcloud.com/main/%E4%B8%AA%E4%BA%BA%E5%A4%B4%E5%83%8F.png","Email": "146746747647","Phone": "1363636363","IsDeleted": false,"CreatedTime": "2024-03-11T10:21:53.823Z","UpdatedTime": "2024-03-11T10:21:53.823Z"}]
 *     security:
 *      - token: {}
 *      - server_auth:
 *        - authorization
 */
// #endregion
router.get('/accounts/:page/:limit', Controller.getAllAccount);

//#region 获取用户列表(分页)
/**
 * @swagger
 * /account/accounts/{organizationid}/{page}/{limit}:
 *   get:
 *     summary: 根据组织获取用户列表
 *     description: 根据组织获取用户列表
 *     tags: [用户模块]
 *     parameters: # 请求参数：
 *      - name: organizationid
 *        description: 组织id(全部组织为0)
 *        in: path
 *        type: number
 *        required: true
 *      - name: page
 *        description: 当前页数
 *        in: path
 *        type: number
 *        required: true
 *      - name: limit
 *        description: 每页记录数
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
 *                 description: 登陆信息
 *                 example: 查询用户列表成功
 *                data:
 *                 type: object
 *                 description: 用户信息
 *                 properties:
 *                   total:
 *                     type: number
 *                     description: 总记录数
 *                     example: 1
 *                   records:
 *                     type: array
 *                     description: 用户列表
 *                     example: [{"AccountId": "61a7125d-9439-4739-90f1-c4271a84d9d6","TeamId": "126626262","Account": "2626211","Password": "1126262","Name": "2626211","AvatarUrl": "https://image-1308319148.cos.ap-chengdu.myqcloud.com/main/%E4%B8%AA%E4%BA%BA%E5%A4%B4%E5%83%8F.png","Email": "146746747647","Phone": "1363636363","IsDeleted": false,"CreatedTime": "2024-03-11T10:21:53.823Z","UpdatedTime": "2024-03-11T10:21:53.823Z"}]
 *     security:
 *      - token: {}
 *      - server_auth:
 *        - authorization
 */
// #endregion
router.get('/accounts/:organizationid/:page/:limit', Controller.getAllAccountInOrg);

//#region 获取某用户信息
/**
 * @swagger
 * /account/accounts/{id}:
 *   get:
 *     summary: 查询单个用户信息
 *     description: 查询单个用户信息
 *     tags: [用户模块]
 *     security:
 *      - token: {}
 *     parameters: # 请求参数：
 *      - name: Id
 *        description: 用户id
 *        in: path
 *        required: true
 *     responses:
 *       200:
 *         description: 查询用户信息成功
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
 *             example: 查询用户信息成功
 *           data:
 *             type: object
 *             description: 用户信息
 */
// #endregion
router.get('/accounts/:id', Controller.getAccount);

//#region 获取某用户信息(token验证)
/**
 * @swagger
 * /account/account:
 *   get:
 *     summary: 查询单个用户信息(token验证)
 *     description: 查询单个用户信息
 *     tags: [用户模块]
 *     security:
 *      - token: {}
 *     responses:
 *       200:
 *         description: 查询用户信息成功
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
 *             example: 查询用户信息成功
 *           data:
 *             type: object
 *             description: 用户信息
 */
// #endregion
router.get('/account', Controller.getSelfAccount);

//#region 更新用户信息
/**
 * @swagger
 * /account/accounts/{id}:
 *   put:
 *     summary: 更新用户信息
 *     description: 更新用户信息
 *     tags: [用户模块]
 *     security:
 *      - token: {}
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               OrganizationId:
 *                 description: 团队id
 *               Name:
 *                 description: 用户名
 *               Email:
 *                 description: 用户邮箱
 *               Phone:
 *                 description: 用户手机号
 *             example:
 *               OrganizationId: "1"
 *               Name: "杜若甫"
 *               Email: "123344@11.c0m"
 *               Phone: "12912781727818"
 *     responses:
 *       200:
 *         description: 查询用户信息成功
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
 *             example: 查询用户信息成功
 *           data:
 *             type: object
 *             description: 用户信息
 */
// #endregion
router.put('/accounts/:id', Controller.putAccount);

export default router;

//Reference:
//https://blog.csdn.net/qq_40188459/article/details/113772660
//https://blog.csdn.net/qq_38734862/article/details/107715579
