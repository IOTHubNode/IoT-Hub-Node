import {PrismaClient} from "@prisma/client";

const prisma = new PrismaClient()
class UserService {
  async createUser(user: any,password:any){
    
    return '写入数据库成功'
  }

  //读取用户信息
  async getUserInfo(){
    const result = await prisma.user.findMany();
    return result;
  }

}

export default new UserService();