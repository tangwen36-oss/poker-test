import { createHash } from 'crypto';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

/**
 * This API is intentionally self-contained.
 * We avoid importing shared server helpers so Vercel always bundles everything
 * needed for this function and does not fail with runtime module resolution errors.
 */

function sanitizeEnv(value?: string) {
  return (value || '').replace(/[\r\n]+/g, '').trim();
}

const ZPAY_PID = sanitizeEnv(process.env.ZPAY_PID);
const ZPAY_KEY = sanitizeEnv(process.env.ZPAY_KEY);
const ZPAY_NOTIFY_URL = sanitizeEnv(process.env.ZPAY_NOTIFY_URL);
const ZPAY_RETURN_URL = sanitizeEnv(process.env.ZPAY_RETURN_URL);
const ZPAY_SUBMIT_URL = 'https://z-pay.cn/submit.php';

function getSupabaseAdmin() {
  const supabaseUrl = sanitizeEnv(process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL);
  const supabaseServiceKey = sanitizeEnv(process.env.SUPABASE_SERVICE_ROLE_KEY);

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false },
  });
}

function createZPaySign(params: Record<string, string>, key: string): string {
  const filtered = Object.entries(params)
    .filter(([k, v]) => k !== 'sign' && k !== 'sign_type' && v !== '' && v !== undefined && v !== null)
    .sort(([a], [b]) => a.localeCompare(b));

  const signStr = filtered.map(([k, v]) => `${k}=${v}`).join('&') + key;
  return createHash('md5').update(signStr).digest('hex').toLowerCase();
}

function generateOutTradeNo(): string {
  const now = new Date();
  const ts = now.getFullYear().toString()
    + String(now.getMonth() + 1).padStart(2, '0')
    + String(now.getDate()).padStart(2, '0')
    + String(now.getHours()).padStart(2, '0')
    + String(now.getMinutes()).padStart(2, '0')
    + String(now.getSeconds()).padStart(2, '0');
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `PKR${ts}${rand}`;
}

function getClientIp(req: VercelRequest): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim();
  }
  if (Array.isArray(forwarded)) {
    return forwarded[0];
  }
  return (req.headers['x-real-ip'] as string) || '127.0.0.1';
}

/**
 * POST /api/create-payment
 * Body: { userId }
 *
 * 1. 确保 poker_users 记录存在
 * 2. 检查是否已支付（已支付直接返回）
 * 3. 生成订单号，写入 payment_records (pending)
 * 4. 直接生成 ZPay submit.php 跳转地址
 * 5. 返回支付跳转地址给前端
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userId } = req.body || {};
  if (!userId) {
    return res.status(400).json({ error: 'Missing userId' });
  }

  if (!ZPAY_PID || !ZPAY_KEY || !ZPAY_NOTIFY_URL) {
    console.error('Missing ZPay configuration');
    return res.status(500).json({ error: 'Payment service not configured' });
  }

  try {
    const supabaseAdmin = getSupabaseAdmin();

    const { error: upsertError } = await supabaseAdmin
      .from('poker_users')
      .upsert({ user_id: userId }, { onConflict: 'user_id', ignoreDuplicates: true });

    if (upsertError) {
      console.error('Failed to upsert user before payment:', upsertError);
      return res.status(500).json({ error: 'Failed to prepare user state' });
    }

    const { data: user, error: userError } = await supabaseAdmin
      .from('poker_users')
      .select('has_paid')
      .eq('user_id', userId)
      .single();

    if (userError) {
      console.error('Failed to load user state before payment:', userError);
      return res.status(500).json({ error: 'Failed to load user state' });
    }

    if (user?.has_paid) {
      return res.status(200).json({ alreadyPaid: true });
    }

    const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    const { data: pendingOrder, error: pendingError } = await supabaseAdmin
      .from('payment_records')
      .select('out_trade_no')
      .eq('user_id', userId)
      .eq('status', 'pending')
      .gte('created_at', fiveMinAgo)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (pendingError) {
      console.error('Failed to query pending order:', pendingError);
      return res.status(500).json({ error: 'Failed to query pending order' });
    }

    const outTradeNo = pendingOrder?.out_trade_no || generateOutTradeNo();

    if (!pendingOrder) {
      const { error: insertError } = await supabaseAdmin
        .from('payment_records')
        .insert({
          user_id: userId,
          out_trade_no: outTradeNo,
          amount: 9.90,
          status: 'pending',
          payment_type: 'wxpay',
        });

      if (insertError) {
        console.error('Failed to create payment record:', insertError);
        return res.status(500).json({ error: 'Failed to create order' });
      }
    }

    const returnUrl = ZPAY_RETURN_URL
      ? `${ZPAY_RETURN_URL}${ZPAY_RETURN_URL.includes('?') ? '&' : '?'}out_trade_no=${outTradeNo}`
      : '';

    const payParams: Record<string, string> = {
      pid: ZPAY_PID,
      type: 'wxpay',
      out_trade_no: outTradeNo,
      notify_url: ZPAY_NOTIFY_URL,
      name: '德州扑克玩家画像-策略解锁',
      money: '9.90',
      clientip: getClientIp(req),
      device: 'mobile',
      param: userId,
    };

    if (returnUrl) {
      payParams.return_url = returnUrl;
    }

    const sign = createZPaySign(payParams, ZPAY_KEY);
    const submitUrl = `${ZPAY_SUBMIT_URL}?${new URLSearchParams({
      ...payParams,
      sign,
      sign_type: 'MD5',
    }).toString()}`;

    return res.status(200).json({
      outTradeNo,
      payurl: submitUrl,
      payurl2: submitUrl,
      qrcode: null,
      img: null,
      zpayOrderId: null,
    });
  } catch (err) {
    console.error('Unexpected error in create-payment:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
