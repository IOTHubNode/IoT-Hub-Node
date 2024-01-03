class UserController{

    async register(ctx: any, next: any){
        ctx.body ="用户注册成功"
    }

    async login(ctx: any, next: any){
        ctx.body ="用户登陆成功"
    }

}

export default new UserController();