-- Phase 1 Foundation: Islands, Store Items, User Inventory
-- Migration: 20251127_0000__phase1_foundation.sql

-- Create islands table
CREATE TABLE islands (
  key text PRIMARY KEY,
  name text NOT NULL,
  description text,
  lat double precision NOT NULL,
  lng double precision NOT NULL,
  level_required int DEFAULT 1 CHECK (level_required >= 1),
  is_discoverable boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Create store_items table
CREATE TABLE store_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  price int NOT NULL CHECK (price >= 0),
  rarity text DEFAULT 'common' CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
  category text DEFAULT 'general' CHECK (category IN ('weapon', 'tool', 'cosmetic', 'consumable')),
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create user_inventory table
CREATE TABLE user_inventory (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  item_id uuid REFERENCES store_items(id) ON DELETE CASCADE,
  acquired_at timestamptz DEFAULT now(),
  quantity int DEFAULT 1 CHECK (quantity > 0),
  UNIQUE(user_id, item_id)
);

-- Create performance indexes
CREATE INDEX idx_user_inventory_user_id ON user_inventory(user_id);
CREATE INDEX idx_store_items_is_active ON store_items(is_active);
CREATE INDEX idx_islands_is_discoverable ON islands(is_discoverable);

-- RPC: Get all active store items
CREATE OR REPLACE FUNCTION get_store_items()
RETURNS TABLE(id uuid, name text, description text, price int, rarity text, category text)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  RETURN QUERY
  SELECT si.id, si.name, si.description, si.price, si.rarity, si.category
  FROM store_items si
  WHERE si.is_active = true
  ORDER BY si.price, si.name;
END;
$$;

-- RPC: Purchase item from store
CREATE OR REPLACE FUNCTION buy_item(p_user uuid, p_item_id uuid)
RETURNS TABLE(ok boolean, new_balance int, error text, item_name text)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_item_price int;
  v_item_name text;
  v_user_coins int;
BEGIN
  -- Get item price and name
  SELECT price, name INTO v_item_price, v_item_name
  FROM store_items
  WHERE id = p_item_id AND is_active = true;
  
  IF v_item_price IS NULL THEN
    RETURN QUERY SELECT false, 0, 'item_not_found', NULL::text;
    RETURN;
  END IF;
  
  -- Get user coins
  SELECT soft_coins INTO v_user_coins
  FROM users
  WHERE id = p_user;
  
  IF v_user_coins < v_item_price THEN
    RETURN QUERY SELECT false, v_user_coins, 'insufficient_funds', v_item_name;
    RETURN;
  END IF;
  
  -- Update user balance
  UPDATE users
  SET soft_coins = soft_coins - v_item_price
  WHERE id = p_user;
  
  -- Add to inventory (or increase quantity)
  INSERT INTO user_inventory (user_id, item_id, quantity)
  VALUES (p_user, p_item_id, 1)
  ON CONFLICT (user_id, item_id)
  DO UPDATE SET quantity = user_inventory.quantity + 1;
  
  -- Return success
  SELECT soft_coins INTO v_user_coins
  FROM users
  WHERE id = p_user;
  
  RETURN QUERY SELECT true, v_user_coins, NULL::text, v_item_name;
END;
$$;

-- RPC: Get user's inventory with item details
CREATE OR REPLACE FUNCTION get_user_inventory(p_user uuid)
RETURNS TABLE(
  id uuid, 
  item_id uuid, 
  name text, 
  description text, 
  rarity text, 
  category text,
  acquired_at timestamptz, 
  quantity int
)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  RETURN QUERY
  SELECT ui.id, ui.item_id, si.name, si.description, si.rarity, si.category, 
         ui.acquired_at, ui.quantity
  FROM user_inventory ui
  JOIN store_items si ON ui.item_id = si.id
  WHERE ui.user_id = p_user
  ORDER BY ui.acquired_at DESC;
END;
$$;

-- RPC: Get all discoverable islands
CREATE OR REPLACE FUNCTION get_islands()
RETURNS TABLE(key text, name text, description text, lat double precision, lng double precision, level_required int)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  RETURN QUERY
  SELECT i.key, i.name, i.description, i.lat, i.lng, i.level_required
  FROM islands i
  WHERE i.is_discoverable = true
  ORDER BY i.level_required, i.name;
END;
$$;

-- RPC: Get islands discovered by user
CREATE OR REPLACE FUNCTION get_user_discovered_islands(p_user uuid)
RETURNS TABLE(key text, name text, description text, discovered_at timestamptz)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  RETURN QUERY
  SELECT i.key, i.name, i.description, uid.discovered_at
  FROM islands i
  JOIN user_island_discovery uid ON i.key = uid.island_key
  WHERE uid.user_id = p_user
  ORDER BY uid.discovered_at DESC;
END;
$$;

-- Enable RLS on all tables
ALTER TABLE islands ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_inventory ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Islands (SELECT only)
CREATE POLICY "Islands are viewable by everyone" ON islands 
FOR SELECT USING (is_discoverable = true);

-- RLS Policies: Store Items (SELECT only)
CREATE POLICY "Store items are viewable by everyone" ON store_items 
FOR SELECT USING (is_active = true);

-- RLS Policies: User Inventory (SELECT only)
CREATE POLICY "Users can view their own inventory" ON user_inventory 
FOR SELECT USING (auth.uid() = user_id);