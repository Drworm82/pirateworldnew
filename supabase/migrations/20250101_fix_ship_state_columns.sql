-- ============================================
-- Fix ship_state table (add missing columns)
-- ============================================

ALTER TABLE ship_state
ADD COLUMN IF NOT EXISTS current_lat numeric,
ADD COLUMN IF NOT EXISTS current_lng numeric,
ADD COLUMN IF NOT EXISTS speed_kmh numeric,
ADD COLUMN IF NOT EXISTS percent numeric;
