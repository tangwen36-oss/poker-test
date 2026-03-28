import { createHash } from 'crypto';

/**
 * ZPay MD5 签名算法
 *
 * 规则（来自 ZPay 文档）：
 * 1. 将参数按 ASCII 码从小到大排序
 * 2. sign、sign_type、空值不参与签名
 * 3. 拼接成 a=b&c=d 格式
 * 4. 末尾拼接商户密钥 KEY
 * 5. 对整个字符串做 MD5（小写）
 */
export function createZPaySign(params: Record<string, string>, key: string): string {
  // 过滤 sign、sign_type 和空值
  const filtered = Object.entries(params)
    .filter(([k, v]) => k !== 'sign' && k !== 'sign_type' && v !== '' && v !== undefined && v !== null)
    .sort(([a], [b]) => a.localeCompare(b));

  const str = filtered.map(([k, v]) => `${k}=${v}`).join('&');
  const signStr = str + key;

  return createHash('md5').update(signStr).digest('hex').toLowerCase();
}

/**
 * 验证 ZPay 异步通知的签名
 */
export function verifyZPaySign(params: Record<string, string>, key: string): boolean {
  const receivedSign = params.sign;
  if (!receivedSign) return false;

  const expectedSign = createZPaySign(params, key);
  return expectedSign === receivedSign.toLowerCase();
}

/**
 * 生成唯一的商户订单号
 * 格式：PKR + 时间戳 + 4位随机数
 */
export function generateOutTradeNo(): string {
  const now = new Date();
  const ts = now.getFullYear().toString() +
    String(now.getMonth() + 1).padStart(2, '0') +
    String(now.getDate()).padStart(2, '0') +
    String(now.getHours()).padStart(2, '0') +
    String(now.getMinutes()).padStart(2, '0') +
    String(now.getSeconds()).padStart(2, '0');
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `PKR${ts}${rand}`;
}
