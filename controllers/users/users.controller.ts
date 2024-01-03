import UserService from "../../services/users/user.service";
class UserController{

    async register(ctx: any, next: any){
        // 获取数据
        console.log(ctx.request.body)
        // 数据验证
        const {user_name , passward}  = ctx.request.body
        // 操作数据库
        const res = await UserService.createUser(user_name,passward);
        // 返回数据
        ctx.body =res
    }

    async login(ctx: any, next: any){
        ctx.body ="用户登陆成功"
    }

}

export default new UserController();