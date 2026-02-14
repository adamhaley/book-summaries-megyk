-- Create referral system tables
-- Migration 016: Referral system for sharing and earning credits

-- =============================================
-- Table: referral_codes
-- Unique referral code per user (auto-generated on signup)
-- =============================================
CREATE TABLE IF NOT EXISTS referral_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  code VARCHAR(8) NOT NULL,
  total_referrals INTEGER NOT NULL DEFAULT 0,
  successful_referrals INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id),
  UNIQUE(code),
  CONSTRAINT valid_referral_code CHECK (code ~ '^[A-HJ-NP-Z2-9]{8}$')
);

-- Index for fast code lookups
CREATE INDEX idx_referral_codes_code ON referral_codes(code);
CREATE INDEX idx_referral_codes_user_id ON referral_codes(user_id);

-- Enable RLS
ALTER TABLE referral_codes ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own referral code
CREATE POLICY "Users can read own referral code"
  ON referral_codes
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Allow public lookup of referral codes (for validation)
CREATE POLICY "Anyone can validate referral codes"
  ON referral_codes
  FOR SELECT
  USING (true);


-- =============================================
-- Table: referrals
-- Track referrer→referred relationships and activation status
-- =============================================
CREATE TYPE referral_status AS ENUM ('pending', 'completed', 'expired');
CREATE TYPE referral_activation_type AS ENUM ('chat', 'summary');

CREATE TABLE IF NOT EXISTS referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referred_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referral_code_id UUID NOT NULL REFERENCES referral_codes(id) ON DELETE CASCADE,
  status referral_status NOT NULL DEFAULT 'pending',
  activation_type referral_activation_type,
  activated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  -- Each user can only be referred once
  UNIQUE(referred_id),
  -- Prevent self-referral
  CONSTRAINT no_self_referral CHECK (referrer_id != referred_id)
);

-- Indexes for common queries
CREATE INDEX idx_referrals_referrer_id ON referrals(referrer_id);
CREATE INDEX idx_referrals_referred_id ON referrals(referred_id);
CREATE INDEX idx_referrals_status ON referrals(status);
CREATE INDEX idx_referrals_code_id ON referrals(referral_code_id);

-- Enable RLS
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read referrals where they are the referrer
CREATE POLICY "Users can read referrals as referrer"
  ON referrals
  FOR SELECT
  USING (auth.uid() = referrer_id);

-- Policy: Users can read referrals where they are the referred
CREATE POLICY "Users can read referrals as referred"
  ON referrals
  FOR SELECT
  USING (auth.uid() = referred_id);

-- Policy: Users can insert referrals where they are the referred
CREATE POLICY "Users can create own referral record"
  ON referrals
  FOR INSERT
  WITH CHECK (auth.uid() = referred_id);


-- =============================================
-- Function: Generate unique referral code
-- Uses alphanumeric chars excluding confusing ones (0,O,I,1,L)
-- =============================================
CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS VARCHAR(8) AS $$
DECLARE
  chars VARCHAR := 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  code VARCHAR(8) := '';
  i INTEGER;
BEGIN
  FOR i IN 1..8 LOOP
    code := code || substr(chars, floor(random() * length(chars) + 1)::int, 1);
  END LOOP;
  RETURN code;
END;
$$ LANGUAGE plpgsql;


-- =============================================
-- Function: Create referral code for new user
-- =============================================
CREATE OR REPLACE FUNCTION create_referral_code_for_user()
RETURNS TRIGGER AS $$
DECLARE
  new_code VARCHAR(8);
  attempts INTEGER := 0;
  max_attempts INTEGER := 10;
BEGIN
  -- Generate unique code with retry logic
  LOOP
    new_code := generate_referral_code();

    -- Check if code already exists
    IF NOT EXISTS (SELECT 1 FROM referral_codes WHERE code = new_code) THEN
      INSERT INTO referral_codes (user_id, code)
      VALUES (NEW.id, new_code);
      EXIT;
    END IF;

    attempts := attempts + 1;
    IF attempts >= max_attempts THEN
      RAISE EXCEPTION 'Failed to generate unique referral code after % attempts', max_attempts;
    END IF;
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- =============================================
-- Trigger: Auto-create referral code on user signup
-- =============================================
DROP TRIGGER IF EXISTS trigger_create_referral_code ON auth.users;
CREATE TRIGGER trigger_create_referral_code
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_referral_code_for_user();


-- =============================================
-- Function: Activate referral and award credits
-- =============================================
CREATE OR REPLACE FUNCTION activate_referral(
  p_referred_user_id UUID,
  p_activation_type referral_activation_type
)
RETURNS BOOLEAN AS $$
DECLARE
  v_referral RECORD;
  v_referrer_balance RECORD;
  v_referred_balance RECORD;
  v_referrer_reward INTEGER := 1500;
  v_referred_reward INTEGER := 1000;
BEGIN
  -- Find pending referral for this user
  SELECT * INTO v_referral
  FROM referrals
  WHERE referred_id = p_referred_user_id
    AND status = 'pending'
  FOR UPDATE;

  -- No pending referral found
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;

  -- Get current balances
  SELECT * INTO v_referrer_balance
  FROM credit_balances
  WHERE user_id = v_referral.referrer_id
  FOR UPDATE;

  SELECT * INTO v_referred_balance
  FROM credit_balances
  WHERE user_id = p_referred_user_id
  FOR UPDATE;

  -- Update referral status
  UPDATE referrals
  SET
    status = 'completed',
    activation_type = p_activation_type,
    activated_at = NOW(),
    updated_at = NOW()
  WHERE id = v_referral.id;

  -- Update referral code stats
  UPDATE referral_codes
  SET
    successful_referrals = successful_referrals + 1,
    updated_at = NOW()
  WHERE id = v_referral.referral_code_id;

  -- Award credits to referrer
  IF v_referrer_balance IS NOT NULL THEN
    INSERT INTO credit_transactions (
      user_id,
      amount,
      transaction_type,
      reference_id,
      reference_type,
      description,
      balance_before,
      balance_after,
      metadata
    ) VALUES (
      v_referral.referrer_id,
      v_referrer_reward,
      'referral_bonus',
      v_referral.id,
      'referral',
      'Referral bonus: friend activated their account',
      v_referrer_balance.current_balance,
      v_referrer_balance.current_balance + v_referrer_reward,
      jsonb_build_object('referred_user_id', p_referred_user_id, 'activation_type', p_activation_type)
    );
  END IF;

  -- Award credits to referred user
  IF v_referred_balance IS NOT NULL THEN
    INSERT INTO credit_transactions (
      user_id,
      amount,
      transaction_type,
      reference_id,
      reference_type,
      description,
      balance_before,
      balance_after,
      metadata
    ) VALUES (
      p_referred_user_id,
      v_referred_reward,
      'referral_bonus',
      v_referral.id,
      'referral',
      'Referral welcome bonus: activated your account',
      v_referred_balance.current_balance,
      v_referred_balance.current_balance + v_referred_reward,
      jsonb_build_object('referrer_id', v_referral.referrer_id, 'activation_type', p_activation_type)
    );
  END IF;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- =============================================
-- updated_at triggers
-- =============================================

-- Trigger for referral_codes
CREATE TRIGGER update_referral_codes_updated_at
  BEFORE UPDATE ON referral_codes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for referrals
CREATE TRIGGER update_referrals_updated_at
  BEFORE UPDATE ON referrals
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();


-- =============================================
-- Backfill referral codes for existing users
-- =============================================
DO $$
DECLARE
  user_record RECORD;
  new_code VARCHAR(8);
  attempts INTEGER;
  max_attempts INTEGER := 10;
BEGIN
  FOR user_record IN
    SELECT id FROM auth.users
    WHERE id NOT IN (SELECT user_id FROM referral_codes)
  LOOP
    attempts := 0;
    LOOP
      new_code := generate_referral_code();

      IF NOT EXISTS (SELECT 1 FROM referral_codes WHERE code = new_code) THEN
        INSERT INTO referral_codes (user_id, code)
        VALUES (user_record.id, new_code);
        EXIT;
      END IF;

      attempts := attempts + 1;
      IF attempts >= max_attempts THEN
        RAISE WARNING 'Failed to generate unique referral code for user % after % attempts', user_record.id, max_attempts;
        EXIT;
      END IF;
    END LOOP;
  END LOOP;
END $$;
