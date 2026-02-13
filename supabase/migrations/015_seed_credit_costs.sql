-- Seed credit costs lookup table
-- Migration 015: Populate credit_costs with pricing data

-- =============================================
-- Summary generation costs
-- Based on style and length combinations
-- =============================================

-- Narrative style costs
INSERT INTO credit_costs (action_type, style, length, cost) VALUES
  ('summary', 'narrative', 'short', 200),
  ('summary', 'narrative', 'medium', 300),
  ('summary', 'narrative', 'long', 500)
ON CONFLICT (action_type, style, length) DO UPDATE SET
  cost = EXCLUDED.cost,
  updated_at = NOW();

-- Bullet points style costs
INSERT INTO credit_costs (action_type, style, length, cost) VALUES
  ('summary', 'bullet_points', 'short', 200),
  ('summary', 'bullet_points', 'medium', 400),
  ('summary', 'bullet_points', 'long', 600)
ON CONFLICT (action_type, style, length) DO UPDATE SET
  cost = EXCLUDED.cost,
  updated_at = NOW();

-- Workbook style costs
INSERT INTO credit_costs (action_type, style, length, cost) VALUES
  ('summary', 'workbook', 'short', 300),
  ('summary', 'workbook', 'medium', 500),
  ('summary', 'workbook', 'long', 800)
ON CONFLICT (action_type, style, length) DO UPDATE SET
  cost = EXCLUDED.cost,
  updated_at = NOW();


-- =============================================
-- Chat message cost
-- Flat rate per message
-- =============================================
INSERT INTO credit_costs (action_type, style, length, cost) VALUES
  ('chat_message', NULL, NULL, 10)
ON CONFLICT (action_type, style, length) DO UPDATE SET
  cost = EXCLUDED.cost,
  updated_at = NOW();


-- =============================================
-- Verify the seed data
-- =============================================
DO $$
DECLARE
  cost_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO cost_count FROM credit_costs WHERE is_active = true;

  IF cost_count < 10 THEN
    RAISE WARNING 'Expected at least 10 credit costs, found %', cost_count;
  ELSE
    RAISE NOTICE 'Credit costs seeded successfully: % active costs', cost_count;
  END IF;
END $$;
