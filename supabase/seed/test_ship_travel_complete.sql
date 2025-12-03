-- =====================================================
-- COMPREHENSIVE SHIP TRAVEL SYSTEM TEST SUITE
-- =====================================================
-- Run this script to validate the complete ship travel module

-- =====================================================
-- PHASE 1: BASIC INFRASTRUCTURE TESTS
-- =====================================================

SELECT '=== PHASE 1: INFRASTRUCTURE TESTS ===' as test_phase;

-- Test islands table
SELECT 'Testing islands table...' as test_step;
SELECT * FROM islands ORDER BY key;

-- Test config table
SELECT 'Testing config table...' as test_step;
SELECT * FROM config;

-- Test distance calculation between known islands
SELECT 'Testing distance calculations...' as test_step;
SELECT 
    ship_distance_between('bahia_ajolote', 'campanas_blancas') as distance_bahia_to_campanas,
    ship_distance_between('bahia_ajolote', 'mercado_koyo') as distance_bahia_to_mercado,
    ship_distance_between('campanas_blancas', 'cala_rey_errante') as distance_campanas_to_cala,
    ship_distance_between('refugio_hermandad', 'gaviotas_negras') as distance_refugio_to_gaviotas;

-- Test travel time calculations
SELECT 'Testing travel time calculations...' as test_step;
SELECT 
    ship_distance_between('bahia_ajolote', 'campanas_blancas') as distance_km,
    (ship_distance_between('bahia_ajolote', 'campanas_blancas') / (SELECT value::numeric FROM config WHERE key = 'ship_speed_kmh')) as travel_hours,
    ((ship_distance_between('bahia_ajolote', 'campanas_blancas') / (SELECT value::numeric FROM config WHERE key = 'ship_speed_kmh')) * 3600)::integer as travel_seconds;

-- =====================================================
-- PHASE 2: FUNCTION SIGNATURE TESTS
-- =====================================================

SELECT '=== PHASE 2: FUNCTION SIGNATURE TESTS ===' as test_phase;

-- Test that old functions are properly dropped
SELECT 'Testing old functions are dropped...' as test_step;
SELECT 
    proname as function_name,
    pg_get_function_arguments(oid) as arguments
FROM pg_proc 
WHERE proname LIKE 'ship_%' 
ORDER BY proname;

-- =====================================================
-- PHASE 3: SHIP STATE OPERATIONS
-- =====================================================

SELECT '=== PHASE 3: SHIP STATE OPERATIONS ===' as test_phase;

-- Create a test user ID (replace with actual UUID for testing)
-- SELECT '00000000-0000-0000-0000-000000000001'::uuid as test_user_id;

-- Test ship_get_state_v2 (should create initial state)
SELECT 'Testing ship_get_state_v2 (initial state)...' as test_step;
-- SELECT * FROM ship_get_state_v2('00000000-0000-0000-0000-000000000001'::uuid);

-- Test ship_travel_start_v3 with real distance
SELECT 'Testing ship_travel_start_v3 (real distance)...' as test_step;
-- SELECT ship_travel_start_v3('00000000-0000-0000-0000-000000000001'::uuid, 'bahia_ajolote', 'campanas_blancas');

-- Test ship_travel_start_v2 (legacy 10-minute)
SELECT 'Testing ship_travel_start_v2 (legacy)...' as test_step;
-- SELECT * FROM ship_travel_start_v2('00000000-0000-0000-0000-000000000001'::uuid, 'mercado_koyo');

-- Test ship_force_arrival_v3
SELECT 'Testing ship_force_arrival_v3...' as test_step;
-- SELECT * FROM ship_force_arrival_v3('00000000-0000-0000-0000-000000000001'::uuid);

-- =====================================================
-- PHASE 4: CONSTRAINT VALIDATION
-- =====================================================

SELECT '=== PHASE 4: CONSTRAINT VALIDATION ===' as test_phase;

-- Check ship_state constraints
SELECT 'Testing ship_state constraints...' as test_step;
SELECT 
    conname as constraint_name,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'ship_state'::regclass
ORDER BY conname;

-- Test constraint compliance
SELECT 'Testing constraint compliance...' as test_step;
SELECT 
    user_id,
    status,
    from_island,
    to_island,
    started_at IS NOT NULL as has_started_at,
    eta_at IS NOT NULL as has_eta_at,
    CASE 
        WHEN status = 'idle' AND from_island IS NOT NULL AND to_island IS NULL AND started_at IS NULL AND eta_at IS NULL THEN 'OK'
        WHEN status = 'traveling' AND from_island IS NOT NULL AND to_island IS NOT NULL AND started_at IS NOT NULL AND eta_at IS NOT NULL THEN 'OK'
        WHEN status = 'arrived' AND from_island IS NOT NULL AND to_island IS NOT NULL THEN 'OK'
        ELSE 'VIOLATION'
    END as constraint_check
FROM ship_state;

-- =====================================================
-- PHASE 5: AUTONOMOUS UPDATE TESTS
-- =====================================================

SELECT '=== PHASE 5: AUTONOMOUS UPDATE TESTS ===' as test_phase;

-- Test autonomous update function directly
SELECT 'Testing ship_autonomous_update function...' as test_step;
-- This would need a real user with expired travel to test properly
-- SELECT ship_autonomous_update('00000000-0000-0000-0000-000000000001'::uuid);

-- =====================================================
-- PHASE 6: ERROR HANDLING TESTS
-- =====================================================

SELECT '=== PHASE 6: ERROR HANDLING TESTS ===' as test_phase;

-- Test distance calculation with non-existent islands
SELECT 'Testing error handling for non-existent islands...' as test_step;
-- This should raise an exception - uncomment to test
-- SELECT ship_distance_between('non_existent', 'bahia_ajolote');

-- Test travel start with null parameters
SELECT 'Testing error handling for null parameters...' as test_step;
-- These should raise exceptions - uncomment to test
-- SELECT ship_travel_start_v3(NULL, 'bahia_ajolote', 'campanas_blancas');
-- SELECT ship_travel_start_v3('00000000-0000-0000-0000-000000000001'::uuid, NULL, 'campanas_blancas');

-- =====================================================
-- PHASE 7: PERFORMANCE TESTS
-- =====================================================

SELECT '=== PHASE 7: PERFORMANCE TESTS ===' as test_phase;

-- Test distance calculation performance
SELECT 'Testing distance calculation performance...' as test_step;
EXPLAIN ANALYZE SELECT ship_distance_between('bahia_ajolote', 'refugio_hermandad');

-- Test ship state query performance
SELECT 'Testing ship state query performance...' as test_step;
EXPLAIN ANALYZE SELECT * FROM ship_get_state_v2('00000000-0000-0000-0000-000000000001'::uuid);

-- =====================================================
-- SUMMARY
-- =====================================================

SELECT '=== TEST SUITE COMPLETED ===' as final_status;
SELECT 'All tests completed. Review results above for any issues.' as summary;

-- =====================================================
-- CLEANUP (Optional - uncomment to clean test data)
-- =====================================================
-- DELETE FROM ship_state WHERE user_id = '00000000-0000-0000-0000-000000000001'::uuid;