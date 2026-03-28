import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

/**
 * This API is intentionally self-contained.
 * We avoid importing shared server helpers so Vercel always bundles everything
 * needed for this function and does not fail with runtime module resolution errors.
 */

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

/**
 * GET /api/user-state?userId=xxx
 *
 * 获取用户状态：hasPaid, lastResultType, lastAnswers
 * 如果用户不存在，自动创建记录并返回默认值
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const userId = req.query.userId as string;
  if (!userId) {
    return res.status(400).json({ error: 'Missing userId' });
  }

  try {
    const supabaseAdmin = getSupabaseAdmin();

    const { data, error } = await supabaseAdmin
      .from('poker_users')
      .select('has_paid, last_result_type, last_answers')
      .eq('user_id', userId)
      .single();

    if (error && error.code === 'PGRST116') {
      const { error: insertError } = await supabaseAdmin
        .from('poker_users')
        .insert({ user_id: userId });

      if (insertError) {
        console.error('Failed to create user:', insertError);
        return res.status(500).json({ error: 'Failed to create user' });
      }

      return res.status(200).json({
        hasPaid: false,
        lastResultType: null,
        lastAnswers: null,
      });
    }

    if (error) {
      console.error('Failed to fetch user state:', error);
      return res.status(500).json({ error: 'Failed to fetch user state' });
    }

    return res.status(200).json({
      hasPaid: data.has_paid,
      lastResultType: data.last_result_type,
      lastAnswers: data.last_answers,
    });
  } catch (err) {
    console.error('Unexpected error in user-state:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
