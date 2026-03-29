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

/**
 * GET /api/check-payment?outTradeNo=xxx
 *
 * 兜底查询订单状态（前端支付返回后调用）
 * 同时返回用户的 has_paid 状态
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const outTradeNo = req.query.outTradeNo as string;
  if (!outTradeNo) {
    return res.status(400).json({ error: 'Missing outTradeNo' });
  }

  try {
    const supabaseAdmin = getSupabaseAdmin();

    const { data: order, error } = await supabaseAdmin
      .from('payment_records')
      .select('status, user_id')
      .eq('out_trade_no', outTradeNo)
      .single();

    if (error || !order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const { data: user } = await supabaseAdmin
      .from('poker_users')
      .select('has_paid')
      .eq('user_id', order.user_id)
      .single();

    return res.status(200).json({
      orderStatus: order.status,
      hasPaid: user?.has_paid || false,
    });
  } catch (err) {
    console.error('Unexpected error in check-payment:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
