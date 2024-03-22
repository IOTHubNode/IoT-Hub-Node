import crypto from 'crypto';

// 密码加密(SHA-256,固定盐)
export function hashPassword(password: string, salt: string) {
  // 创建SHA-256哈希实例
  const hash = crypto.createHash('sha256');

  // 使用盐值和密码结合
  const saltedPassword = password + salt;

  // 更新哈希实例
  hash.update(saltedPassword);

  // 获取十六进制格式的哈希值
  const hashedPassword = hash.digest('hex');

  // 返回加盐哈希后的密码
  return hashedPassword;
}

// 示例用法
// const password = 'mySecurePassword';
// const fixedSalt = 'MyFixedSalt123!';
// const hashedPassword = hashPassword(password, fixedSalt);

// console.log(`Password: ${password}`);
// console.log(`Fixed salt: ${fixedSalt}`);
// console.log(`Salted and hashed password: ${hashedPassword}`);
