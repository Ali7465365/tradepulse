/*
# Add api_keys table for Developer API Portal

## Overview
Creates a table to manage API keys for the Developer API Portal, allowing users to
generate, view, revoke, and track usage of their API keys.

## New Tables
1. **api_keys** — Stores API keys for developer access.
   - id (uuid, PK)
   - key_prefix (text) — first 8 chars shown publicly for identification
   - key_hash (text) — full key hash for verification (simulated)
   - name (text) — user-given label for the key
   - status (text) — 'active' or 'revoked'
   - created_at (timestamptz)
   - last_used_at (timestamptz, nullable)
   - request_count (integer, default 0)

## Security
- RLS enabled, TO anon, authenticated (no-auth app, shared data).
*/

CREATE TABLE IF NOT EXISTS api_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key_prefix text NOT NULL,
  key_hash text NOT NULL,
  name text NOT NULL DEFAULT 'Default Key',
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  last_used_at timestamptz,
  request_count integer NOT NULL DEFAULT 0
);

ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_api_keys" ON api_keys;
CREATE POLICY "anon_select_api_keys" ON api_keys FOR SELECT
TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_api_keys" ON api_keys;
CREATE POLICY "anon_insert_api_keys" ON api_keys FOR INSERT
TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_api_keys" ON api_keys;
CREATE POLICY "anon_update_api_keys" ON api_keys FOR UPDATE
TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_api_keys" ON api_keys;
CREATE POLICY "anon_delete_api_keys" ON api_keys FOR DELETE
TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_api_keys_status ON api_keys(status);