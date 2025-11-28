-- Phase 1 Foundation Seed Data
-- Islands, Store Items, and Test Inventory

-- Insert islands
INSERT INTO islands (key, name, description, lat, lng, level_required) VALUES
('port_royal', 'Port Royal', 'Famous pirate haven and trading hub', 17.9456, -76.7891, 1),
('tortuga', 'Tortuga', 'Pirate stronghold in the Caribbean', 19.9333, -72.8333, 3),
('nassau', 'Nassau', 'Pirate republic of the Bahamas', 25.0344, -77.3963, 5),
('havana', 'Havana', 'Spanish colonial port', 23.1136, -82.3666, 7),
('kingston', 'Kingston', 'British naval base', 17.9715, -76.7931, 10);

-- Insert store items
INSERT INTO store_items (name, description, price, rarity, category) VALUES
('Cutlass', 'Sharp pirate sword for close combat', 100, 'common', 'weapon'),
('Compass', 'Navigation tool for finding treasure', 50, 'common', 'tool'),
('Pirate Hat', 'Stylish tricorn hat for captains', 75, 'rare', 'cosmetic'),
('Spyglass', 'Telescope for spotting distant ships', 120, 'common', 'tool'),
('Gold Earring', 'Golden earring showing wealth', 200, 'rare', 'cosmetic'),
('Flintlock Pistol', 'Single-shot pistol for duels', 250, 'epic', 'weapon'),
('Treasure Map', 'Map leading to hidden treasure', 300, 'epic', 'consumable'),
('Captain''s Coat', 'Fancy coat for ship captains', 500, 'legendary', 'cosmetic'),
('Ship Cannon', 'Heavy cannon for naval battles', 800, 'legendary', 'weapon'),
('Rum Barrel', 'Barrel of fine Caribbean rum', 60, 'common', 'consumable');

-- Note: User inventory will be populated when users purchase items
-- Test inventory can be added manually for testing:
-- INSERT INTO user_inventory (user_id, item_id, quantity) VALUES 
-- ('test-user-id', (SELECT id FROM store_items WHERE name = 'Cutlass'), 1);
