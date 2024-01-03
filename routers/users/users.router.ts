import Router from 'koa-router';
const router = new Router();
import  Controllers from '../../controllers/users/users.controller';

// 用户注册
router.post('/register',Controllers.register)


// 用户登陆
router.get('/login',Controllers.login)


export default  router;