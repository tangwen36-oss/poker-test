import { createHash } from 'crypto';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

/**
 * This API is intentionally self-contained.
 * We avoid importing shared server helpers so Vercel always bundles everything
 * needed for this function and does not fail with runtime module resolution errors.
 */

const ZPAY_KEY = process.env.ZPAY_KEY || '';

function getSupabaseAdmin() {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

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

function verifyZPaySign(params: Record<string, string>, key: string): boolean {
  const receivedSign = params.sign;
  if (!receivedSign) {
    return false;
  }

  return createZPaySign(params, key) === receivedSign.toLowerCase();
}

function parseNotifyParams(req: VercelRequest): Record<string, string> {
  const params: Record<string, string> = {};

  if (req.method === 'GET') {
    for (const [key, value] of Object.entries(req.query)) {
      params[key] = Array.isArray(value) ? String(value[0]) : String(value);
    }
    return params;
  }

  const body = req.body;
  if (typeof body === 'string') {
    const parsed = new URLSearchParams(body);
    for (const [key, value] of parsed.entries()) {
      params[key] = value;
    }
    return params;
  }

  if (body && typeof body === 'object') {
    for (const [key, value] of Object.entries(body)) {
      params[key] = Array.isArray(value) ? String(value[0]) : String(value);
    }
  }

  return params;
}

/**
 * POST /api/zpay-notify
 *
 * ZPay 异步支付结果通知回调
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).send('Method not allowed');
  }

  const params = parseNotifyParams(req);
  const { out_trade_no, trade_no, trade_status, money, param: userId } = params;

  console.log('ZPay notify received:', {
    out_trade_no,
    trade_no,
    trade_status,
    money,
    userId,
  });

  if (!ZPAY_KEY) {
    console.error('ZPAY_KEY not configured');
    return res.status(500).send('fail');
  }

  if (!verifyZPaySign(params, ZPAY_KEY)) {
    console.error('ZPay signature verification failed', params);
    return res.status(400).send('fail');
  }

  if (!out_trade_no) {
    console.error('Missing out_trade_no');
    return res.status(400).send('fail');
  }

  try {
    const supabaseAdmin = getSupabaseAdmin();

    const { data: order, error: queryError } = await supabaseAdmin
      .from('payment_records')
      .select('id, user_id, status, amount, notify_count')
      .eq('out_trade_no', out_trade_no)
      .single();

    if (queryError || !order) {
      console.error('Order not found:', out_trade_no, queryError);
      return res.status(400).send('fail');
    }

    if (order.status === 'success') {
      await supabaseAdmin
        .from('payment_records')
        .update({
          notify_count: order.notify_count + 1,
          updated_at: new Date().toISOString(),
        })
        .eq('out_trade_no', out_trade_no);

      return res.status(200).send('success');
    }

    if (trade_status !== 'TRADE_SUCCESS') {
      await supabaseAdmin
        .from('payment_records')
        .update({
          notify_count: order.notify_count + 1,
          raw_notify_data: params,
          updated_at: new Date().toISOString(),
        })
        .eq('out_trade_no', out_trade_no);

      return res.status(200).send('success');
    }

    const receivedMoney = parseFloat(money || '0').toFixed(2);
    const expectedMoney = parseFloat(String(order.amount)).toFixed(2);
    if (receivedMoney !== expectedMoney) {
      console.error('Amount mismatch!', {
        received: receivedMoney,
        expected: expectedMoney,
        out_trade_no,
      });
      return res.status(400).send('fail');
    }

    const now = new Date().toISOString();
    const { error: updateOrderError } = await supabaseAdmin
      .from('payment_records')
      .update({
        status: 'success',
        zpay_trade_no: trade_no || null,
        raw_notify_data: params,
        notify_count: order.notify_count + 1,
        paid_at: now,
        updated_at: now,
      })
      .eq('out_trade_no', out_trade_no);

    if (updateOrderError) {
      console.error('Failed to update payment record:', updateOrderError);
      return res.status(500).send('fail');
    }

    const targetUserId = userId || order.user_id;
    const { error: updateUserError } = await supabaseAdmin
      .from('poker_users')
      .update({
        has_paid: true,
        updated_at: now,
      })
      .eq('user_id', targetUserId);

    if (updateUserError) {
      console.error('Failed to update user paid status:', updateUserError);
    }

    console.log('Payment success processed:', { out_trade_no, userId: targetUserId });
    return res.status(200).send('success');
  } catch (err) {
    console.error('Unexpected error in zpay-notify:', err);
    return res.status(500).send('fail');
  }
}
