-- Create credit triggers
-- Migration 014: Auto-create balance on signup with 300 MC starter credits

-- =============================================
-- Function: Create credit balance on user signup
-- Gives new users 300 MC starter credits
-- =============================================
CREATE OR REPLACE FUNCTION handle_new_user_credits()
RETURNS TRIGGER AS $$
DECLARE
  starter_credits INTEGER := 300;
BEGIN
  -- Insert credit balance for new user
  INSERT INTO public.credit_balances (
    user_id,
    current_balance,
    lifetime_earned,
    lifetime_spent
  ) VALUES (
    NEW.id,
    starter_credits,
    starter_credits,
    0
  );

  -- Record the signup bonus transaction
  INSERT INTO public.credit_transactions (
    user_id,
    amount,
    transaction_type,
    description,
    balance_before,
    balance_after,
    metadata
  ) VALUES (
    NEW.id,
    starter_credits,
    'signup_bonus',
    'Welcome bonus - starter credits for new users',
    0,
    starter_credits,
    jsonb_build_object(
      'bonus_type', 'signup',
      'granted_at', NOW()
    )
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create credit balance when new user signs up
-- This runs AFTER the handle_new_user trigger for user_profiles
CREATE TRIGGER on_auth_user_created_credits
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user_credits();


-- =============================================
-- Function: Validate credit deduction
-- Ensures user has sufficient balance before deduction
-- =============================================
CREATE OR REPLACE FUNCTION validate_credit_deduction()
RETURNS TRIGGER AS $$
BEGIN
  -- Only validate deductions (negative amounts)
  IF NEW.amount < 0 THEN
    -- Check if balance_after would be negative
    IF NEW.balance_after < 0 THEN
      RAISE EXCEPTION 'Insufficient credits: balance would be negative';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to validate credit transactions before insert
CREATE TRIGGER validate_credit_transaction
  BEFORE INSERT ON credit_transactions
  FOR EACH ROW
  EXECUTE FUNCTION validate_credit_deduction();


-- =============================================
-- Function: Sync credit balance after transaction
-- Updates credit_balances table after each transaction
-- =============================================
CREATE OR REPLACE FUNCTION sync_credit_balance()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the user's credit balance
  UPDATE public.credit_balances
  SET
    current_balance = NEW.balance_after,
    lifetime_earned = CASE
      WHEN NEW.amount > 0 THEN lifetime_earned + NEW.amount
      ELSE lifetime_earned
    END,
    lifetime_spent = CASE
      WHEN NEW.amount < 0 THEN lifetime_spent + ABS(NEW.amount)
      ELSE lifetime_spent
    END,
    updated_at = NOW()
  WHERE user_id = NEW.user_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to sync balance after transaction insert
CREATE TRIGGER sync_balance_after_transaction
  AFTER INSERT ON credit_transactions
  FOR EACH ROW
  EXECUTE FUNCTION sync_credit_balance();


-- =============================================
-- Grant credits for existing users who don't have credit_balances
-- This ensures existing users get the starter credits
-- =============================================
DO $$
DECLARE
  user_record RECORD;
  starter_credits INTEGER := 300;
BEGIN
  -- Find users without credit balances
  FOR user_record IN
    SELECT au.id
    FROM auth.users au
    LEFT JOIN public.credit_balances cb ON au.id = cb.user_id
    WHERE cb.id IS NULL
  LOOP
    -- Insert credit balance
    INSERT INTO public.credit_balances (
      user_id,
      current_balance,
      lifetime_earned,
      lifetime_spent
    ) VALUES (
      user_record.id,
      starter_credits,
      starter_credits,
      0
    );

    -- Record the transaction
    INSERT INTO public.credit_transactions (
      user_id,
      amount,
      transaction_type,
      description,
      balance_before,
      balance_after,
      metadata
    ) VALUES (
      user_record.id,
      starter_credits,
      'signup_bonus',
      'Welcome bonus - starter credits for existing users',
      0,
      starter_credits,
      jsonb_build_object(
        'bonus_type', 'migration_grant',
        'granted_at', NOW()
      )
    );
  END LOOP;
END $$;
