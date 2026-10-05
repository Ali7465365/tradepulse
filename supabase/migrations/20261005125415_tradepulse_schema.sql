/*
# TradePulse - Market Intelligence & Global Trade Platform

## Overview
This migration creates the database schema for TradePulse, a market intelligence platform
with global trade mapping, market research, seller directories, an AI assistant, and a
tiered subscription system with an ad-gated PRO pass.

## New Tables

1. **ad_views** — Tracks simulated ad watches for the Ad Reward Center.
   - id (uuid, PK)
   - watched_at (timestamptz) — when the ad was watched
   - week_key (text) — ISO week identifier (e.g. "2026-W40") for weekly limit enforcement
   - created_at (timestamptz)

2. **pro_passes** — Tracks ad-unlocked PRO pass activations.
   - id (uuid, PK)
   - activated_at (timestamptz) — when the pass was activated
   - expires_at (timestamptz) — when the pass expires (1 day after activation)
   - week_key (text) — the week the pass was unlocked for (1 per week limit)
   - created_at (timestamptz)

3. **subscriptions** — Stores user subscription tier information.
   - id (uuid, PK)
   - tier (text) — 'free', 'pro', or 'platinum'
   - status (text) — 'active', 'cancelled', 'expired'
   - started_at (timestamptz)
   - expires_at (timestamptz, nullable)
   - created_at (timestamptz)
   - updated_at (timestamptz)

4. **chat_messages** — Stores AI assistant conversation history.
   - id (uuid, PK)
   - role (text) — 'user' or 'assistant'
   - content (text)
   - mode (text) — 'free' or 'pro'
   - created_at (timestamptz)

5. **api_usage** — Tracks API request counts per month for the API portal.
   - id (uuid, PK)
   - month_key (text) — e.g. "2026-10"
   - request_count (integer, default 0)
   - tier (text) — tier at time of request
   - created_at (timestamptz)

## Security
- RLS enabled on all tables.
- All tables use `TO anon, authenticated` policies (no-auth app, data is shared/public).
- Full CRUD access for anon + authenticated on all tables.
*/

CREATE TABLE IF NOT EXISTS ad_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  watched_at timestamptz NOT NULL DEFAULT now(),
  week_key text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE ad_views ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_ad_views" ON ad_views;
CREATE POLICY "anon_select_ad_views" ON ad_views FOR SELECT
TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_ad_views" ON ad_views;
CREATE POLICY "anon_insert_ad_views" ON ad_views FOR INSERT
TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_ad_views" ON ad_views;
CREATE POLICY "anon_delete_ad_views" ON ad_views FOR DELETE
TO anon, authenticated USING (true);

CREATE TABLE IF NOT EXISTS pro_passes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  activated_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL,
  week_key text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE pro_passes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_pro_passes" ON pro_passes;
CREATE POLICY "anon_select_pro_passes" ON pro_passes FOR SELECT
TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_pro_passes" ON pro_passes;
CREATE POLICY "anon_insert_pro_passes" ON pro_passes FOR INSERT
TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_pro_passes" ON pro_passes;
CREATE POLICY "anon_delete_pro_passes" ON pro_passes FOR DELETE
TO anon, authenticated USING (true);

CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tier text NOT NULL DEFAULT 'free',
  status text NOT NULL DEFAULT 'active',
  started_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_subscriptions" ON subscriptions;
CREATE POLICY "anon_select_subscriptions" ON subscriptions FOR SELECT
TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_subscriptions" ON subscriptions;
CREATE POLICY "anon_insert_subscriptions" ON subscriptions FOR INSERT
TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_subscriptions" ON subscriptions;
CREATE POLICY "anon_update_subscriptions" ON subscriptions FOR UPDATE
TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_subscriptions" ON subscriptions;
CREATE POLICY "anon_delete_subscriptions" ON subscriptions FOR DELETE
TO anon, authenticated USING (true);

CREATE TABLE IF NOT EXISTS chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role text NOT NULL,
  content text NOT NULL,
  mode text NOT NULL DEFAULT 'free',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_chat_messages" ON chat_messages;
CREATE POLICY "anon_select_chat_messages" ON chat_messages FOR SELECT
TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_chat_messages" ON chat_messages;
CREATE POLICY "anon_insert_chat_messages" ON chat_messages FOR INSERT
TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_chat_messages" ON chat_messages;
CREATE POLICY "anon_delete_chat_messages" ON chat_messages FOR DELETE
TO anon, authenticated USING (true);

CREATE TABLE IF NOT EXISTS api_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  month_key text NOT NULL,
  request_count integer NOT NULL DEFAULT 0,
  tier text NOT NULL DEFAULT 'free',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE api_usage ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_api_usage" ON api_usage;
CREATE POLICY "anon_select_api_usage" ON api_usage FOR SELECT
TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_api_usage" ON api_usage;
CREATE POLICY "anon_insert_api_usage" ON api_usage FOR INSERT
TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_api_usage" ON api_usage;
CREATE POLICY "anon_update_api_usage" ON api_usage FOR UPDATE
TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_api_usage" ON api_usage;
CREATE POLICY "anon_delete_api_usage" ON api_usage FOR DELETE
TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_ad_views_week_key ON ad_views(week_key);
CREATE INDEX IF NOT EXISTS idx_pro_passes_week_key ON pro_passes(week_key);
CREATE INDEX IF NOT EXISTS idx_pro_passes_expires_at ON pro_passes(expires_at);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_api_usage_month_key ON api_usage(month_key);