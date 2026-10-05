import { createClient } from '@supabase/supabase-js';
import { ApiKey, Tier } from './types';

export type { Tier, ApiKey };

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface ProPassStatus {
  hasActivePass: boolean;
  expiresAt: Date | null;
  adsWatchedThisWeek: number;
  proPassUnlockedThisWeek: boolean;
  weekKey: string;
}

export function getWeekKey(date: Date = new Date()): string {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNum = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(weekNum).padStart(2, '0')}`;
}

export async function fetchProPassStatus(): Promise<ProPassStatus> {
  const weekKey = getWeekKey();

  const [{ data: adData }, { data: passData }] = await Promise.all([
    supabase.from('ad_views').select('id').eq('week_key', weekKey),
    supabase.from('pro_passes').select('expires_at, week_key').eq('week_key', weekKey).maybeSingle(),
  ]);

  const adsWatchedThisWeek = adData?.length ?? 0;
  const proPassUnlockedThisWeek = !!passData;

  let hasActivePass = false;
  let expiresAt: Date | null = null;

  if (passData?.expires_at) {
    const exp = new Date(passData.expires_at);
    if (exp > new Date()) {
      hasActivePass = true;
      expiresAt = exp;
    }
  }

  return { hasActivePass, expiresAt, adsWatchedThisWeek, proPassUnlockedThisWeek, weekKey };
}

export async function recordAdWatch(): Promise<{ adsWatched: number; passUnlocked: boolean }> {
  const weekKey = getWeekKey();
  await supabase.from('ad_views').insert({ week_key: weekKey });

  const { data } = await supabase.from('ad_views').select('id').eq('week_key', weekKey);
  const adsWatched = data?.length ?? 0;

  let passUnlocked = false;
  if (adsWatched >= 5) {
    const { data: existing } = await supabase
      .from('pro_passes')
      .select('id')
      .eq('week_key', weekKey)
      .maybeSingle();

    if (!existing) {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 1);
      await supabase.from('pro_passes').insert({
        week_key: weekKey,
        activated_at: new Date().toISOString(),
        expires_at: expiresAt.toISOString(),
      });
      passUnlocked = true;
    }
  }

  return { adsWatched, passUnlocked };
}

export async function fetchSubscriptionTier(): Promise<Tier> {
  const { data } = await supabase
    .from('subscriptions')
    .select('tier, status, expires_at')
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!data) return 'free';
  if (data.expires_at && new Date(data.expires_at) < new Date()) return 'free';
  return data.tier as Tier;
}

export async function setSubscriptionTier(tier: Tier): Promise<void> {
  await supabase.from('subscriptions').update({ status: 'expired' }).neq('status', 'expired');

  const expiresAt = new Date();
  expiresAt.setMonth(expiresAt.getMonth() + 1);

  await supabase.from('subscriptions').insert({
    tier,
    status: 'active',
    started_at: new Date().toISOString(),
    expires_at: expiresAt.toISOString(),
  });
}

export interface ChatMessageRow {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  mode: 'free' | 'pro';
  created_at: string;
}

export async function fetchChatHistory(): Promise<ChatMessageRow[]> {
  const { data, error } = await supabase
    .from('chat_messages')
    .select('*')
    .order('created_at', { ascending: true })
    .limit(50);

  if (error || !data) return [];
  return data as ChatMessageRow[];
}

export async function saveChatMessage(role: 'user' | 'assistant', content: string, mode: 'free' | 'pro'): Promise<void> {
  await supabase.from('chat_messages').insert({ role, content, mode });
}

export async function clearChatHistory(): Promise<void> {
  await supabase.from('chat_messages').delete().neq('id', '00000000-0000-0000-0000-000000000000');
}

export async function fetchApiUsage(): Promise<{ monthKey: string; count: number; limit: number }> {
  const now = new Date();
  const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  const { data } = await supabase
    .from('api_usage')
    .select('request_count')
    .eq('month_key', monthKey)
    .maybeSingle();

  return { monthKey, count: data?.request_count ?? 0, limit: 1000 };
}

export async function incrementApiUsage(): Promise<void> {
  const now = new Date();
  const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  const { data: existing } = await supabase
    .from('api_usage')
    .select('id, request_count')
    .eq('month_key', monthKey)
    .maybeSingle();

  if (existing) {
    await supabase
      .from('api_usage')
      .update({ request_count: (existing.request_count ?? 0) + 1 })
      .eq('id', existing.id);
  } else {
    await supabase.from('api_usage').insert({ month_key: monthKey, request_count: 1, tier: 'free' });
  }
}

// --- API Key management ---

export async function fetchApiKeys(): Promise<ApiKey[]> {
  const { data, error } = await supabase
    .from('api_keys')
    .select('*')
    .order('created_at', { ascending: false });

  if (error || !data) return [];
  return data as ApiKey[];
}

export async function createApiKey(name: string): Promise<ApiKey | null> {
  const fullKey = `tp_${generateRandomString(32)}`;
  const keyPrefix = fullKey.substring(0, 11);
  const keyHash = btoa(fullKey).substring(0, 48);

  const { data, error } = await supabase
    .from('api_keys')
    .insert({ key_prefix: keyPrefix, key_hash: keyHash, name })
    .select('*')
    .maybeSingle();

  if (error || !data) return null;
  return { ...data, full_key: fullKey } as ApiKey;
}

export async function revokeApiKey(id: string): Promise<void> {
  await supabase.from('api_keys').update({ status: 'revoked' }).eq('id', id);
}

export async function deleteApiKey(id: string): Promise<void> {
  await supabase.from('api_keys').delete().eq('id', id);
}

function generateRandomString(length: number): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const crypto = window.crypto;
  const values = new Uint32Array(length);
  crypto.getRandomValues(values);
  for (let i = 0; i < length; i++) {
    result += chars[values[i] % chars.length];
  }
  return result;
}
