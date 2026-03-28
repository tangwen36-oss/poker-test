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
 * POST /api/save-result
 * Body: { userId, finalType, answers }
 *
 * 保存用户最近一次测试结果到 Supabase
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userId, finalType, answers } = req.body || {};

  if (!userId || !finalType) {
    return res.status(400).json({ error: 'Missing userId or finalType' });
  }

  try {
    const supabaseAdmin = getSupabaseAdmin();

    const { error } = await supabaseAdmin
      .from('poker_users')
      .upsert(
        {
          user_id: userId,
          last_result_type: finalType,
          last_answers: answers || null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' }
      );

    if (error) {
      console.error('Failed to save result:', error);
      return res.status(500).json({ error: 'Failed to save result' });
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Unexpected error in save-result:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
