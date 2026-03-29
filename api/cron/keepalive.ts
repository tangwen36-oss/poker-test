import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

function sanitizeEnv(value?: string) {
  return (value || '').replace(/[\r\n]+/g, '').trim();
}

function getRequiredEnv(name: 'CRON_SECRET' | 'SUPABASE_URL' | 'SUPABASE_SERVICE_ROLE_KEY') {
  const value = sanitizeEnv(process.env[name]);
  if (!value) {
    throw new Error(`Missing ${name}`);
  }
  return value;
}

function getSupabaseAdmin() {
  const supabaseUrl = getRequiredEnv('SUPABASE_URL');
  const supabaseServiceKey = getRequiredEnv('SUPABASE_SERVICE_ROLE_KEY');

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false },
  });
}

async function selectFromExistingTable(supabase: SupabaseClient) {
  const candidates = [
    { table: 'questions', column: 'id' },
    { table: 'poker_users', column: 'user_id' },
    { table: 'payment_records', column: 'id' },
  ] as const;

  for (const candidate of candidates) {
    const { data, error } = await supabase
      .from(candidate.table)
      .select(candidate.column)
      .limit(1);

    if (!error) {
      return data?.length ?? 0;
    }

    const normalizedMessage = error.message.toLowerCase();
    const relationMissing =
      error.code === '42P01' ||
      normalizedMessage.includes('relation') ||
      normalizedMessage.includes('does not exist');

    if (!relationMissing) {
      throw error;
    }
  }

  throw new Error('No selectable table found. Checked: questions, poker_users, payment_records');
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const expectedSecret = getRequiredEnv('CRON_SECRET');
    const authHeader = sanitizeEnv(req.headers.authorization);
    const expectedHeader = `Bearer ${expectedSecret}`;

    if (authHeader !== expectedHeader) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const supabaseAdmin = getSupabaseAdmin();
    const insertedAt = new Date().toISOString();
    const selected = await selectFromExistingTable(supabaseAdmin);

    const { error: insertError } = await supabaseAdmin.from('keepalive').insert({
      pinged_at: insertedAt,
    });

    if (insertError) {
      throw insertError;
    }

    return res.status(200).json({
      ok: true,
      selected,
      inserted: true,
      insertedAt,
    });
  } catch (error) {
    console.error('Keepalive cron failed:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
