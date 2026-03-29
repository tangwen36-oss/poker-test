/**
 * 前端 API 客户端
 *
 * 所有数据操作都通过 /api/* 路由中转，
 * 前端不直接操作 Supabase。
 */

const API_BASE = '/api';

/**
 * 获取用户状态
 */
export async function fetchUserState(userId: string): Promise<{
  hasPaid: boolean;
  lastResultType: string | null;
  lastAnswers: Record<string, number>[] | null;
}> {
  const res = await fetch(`${API_BASE}/user-state?userId=${encodeURIComponent(userId)}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch user state: ${res.status}`);
  }
  return res.json();
}

/**
 * 保存测试结果
 */
export async function saveTestResult(
  userId: string,
  finalType: string,
  answers: Record<string, number>[]
): Promise<void> {
  const res = await fetch(`${API_BASE}/save-result`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, finalType, answers }),
  });
  if (!res.ok) {
    console.error('Failed to save test result:', res.status);
  }
}

/**
 * 创建支付订单
 */
export async function createPayment(userId: string): Promise<{
  alreadyPaid?: boolean;
  outTradeNo?: string;
  payurl?: string | null;
  payurl2?: string | null;
  qrcode?: string | null;
  img?: string | null;
  error?: string;
  message?: string;
}> {
  const res = await fetch(`${API_BASE}/create-payment`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId }),
  });
  const text = await res.text();

  try {
    return JSON.parse(text);
  } catch {
    return {
      error: 'Payment creation failed',
      message: res.ok ? '支付服务返回了异常响应' : `支付服务暂时不可用（${res.status}）`,
    };
  }
}

/**
 * 查询订单支付状态（兜底）
 */
export async function checkPaymentStatus(outTradeNo: string): Promise<{
  orderStatus: string;
  hasPaid: boolean;
}> {
  const res = await fetch(`${API_BASE}/check-payment?outTradeNo=${encodeURIComponent(outTradeNo)}`);
  if (!res.ok) {
    throw new Error(`Failed to check payment: ${res.status}`);
  }
  return res.json();
}

/**
 * 检测当前是否在微信浏览器中
 */
export function isWechatBrowser(): boolean {
  const ua = navigator.userAgent.toLowerCase();
  return ua.includes('micromessenger');
}

export function isMobileBrowser(): boolean {
  const ua = navigator.userAgent.toLowerCase();
  return /android|iphone|ipad|ipod|mobile/.test(ua);
}
