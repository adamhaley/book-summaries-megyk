-- Create credit system tables
-- Migration 013: Core credit system tables

-- =============================================
-- Table: credit_balances
-- User credit balance tracking
-- =============================================
CREATE TABLE IF NOT EXISTS credit_balances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  current_balance INTEGER NOT NULL DEFAULT 0,
  lifetime_earned INTEGER NOT NULL DEFAULT 0,
  lifetime_spent INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id),
  CONSTRAINT positive_balance CHECK (current_balance >= 0),
  CONSTRAINT positive_lifetime_earned CHECK (lifetime_earned >= 0),
  CONSTRAINT positive_lifetime_spent CHECK (lifetime_spent >= 0)
);

-- Index for fast lookups
CREATE INDEX idx_credit_balances_user_id ON credit_balances(user_id);

-- Enable RLS
ALTER TABLE credit_balances ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own balance
CREATE POLICY "Users can read own credit balance"
  ON credit_balances
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: System can insert/update (via service role or triggers)
-- Users cannot directly modify their balance
CREATE POLICY "Service role can manage credit balances"
  ON credit_balances
  FOR ALL
  USING (auth.uid() = user_id OR auth.role() = 'service_role');


-- =============================================
-- Table: credit_transactions
-- Immutable ledger of all credit movements
-- =============================================
CREATE TYPE credit_transaction_type AS ENUM (
  'signup_bonus',
  'summary_generation',
  'chat_message',
  'subscription_credit',
  'subscription_rollover',
  'top_up_purchase',
  'referral_bonus',
  'referral_milestone',
  'admin_adjustment',
  'refund'
);

CREATE TABLE IF NOT EXISTS credit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL, -- Positive = credit, Negative = debit
  transaction_type credit_transaction_type NOT NULL,
  reference_id UUID, -- Optional: link to summary, chat_session, subscription, etc.
  reference_type TEXT, -- 'summary', 'chat_session', 'subscription', 'top_up', 'referral'
  description TEXT,
  balance_before INTEGER NOT NULL,
  balance_after INTEGER NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT valid_balance_change CHECK (balance_after = balance_before + amount)
);

-- Indexes for common queries
CREATE INDEX idx_credit_transactions_user_id ON credit_transactions(user_id);
CREATE INDEX idx_credit_transactions_created_at ON credit_transactions(created_at DESC);
CREATE INDEX idx_credit_transactions_type ON credit_transactions(transaction_type);
CREATE INDEX idx_credit_transactions_reference ON credit_transactions(reference_type, reference_id);

-- Enable RLS
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own transactions
CREATE POLICY "Users can read own credit transactions"
  ON credit_transactions
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own transactions (for deductions)
CREATE POLICY "Users can insert own credit transactions"
  ON credit_transactions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);


-- =============================================
-- Table: credit_costs
-- Lookup table for action costs
-- =============================================
CREATE TABLE IF NOT EXISTS credit_costs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action_type TEXT NOT NULL, -- 'summary' or 'chat_message'
  style TEXT, -- For summaries: 'narrative', 'bullet_points', 'workbook'
  length TEXT, -- For summaries: 'short', 'medium', 'long'
  cost INTEGER NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(action_type, style, length)
);

-- Enable RLS (read-only for authenticated users)
ALTER TABLE credit_costs ENABLE ROW LEVEL SECURITY;

-- Policy: Authenticated users can read costs
CREATE POLICY "Authenticated users can read credit costs"
  ON credit_costs
  FOR SELECT
  TO authenticated
  USING (is_active = true);


-- =============================================
-- Table: chat_sessions
-- Track chat usage per book for credit deduction
-- =============================================
CREATE TABLE IF NOT EXISTS chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  message_count INTEGER NOT NULL DEFAULT 0,
  total_credits_spent INTEGER NOT NULL DEFAULT 0,
  last_message_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, book_id)
);

-- Indexes
CREATE INDEX idx_chat_sessions_user_id ON chat_sessions(user_id);
CREATE INDEX idx_chat_sessions_book_id ON chat_sessions(book_id);
CREATE INDEX idx_chat_sessions_last_message ON chat_sessions(last_message_at DESC);

-- Enable RLS
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own chat sessions
CREATE POLICY "Users can read own chat sessions"
  ON chat_sessions
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own chat sessions
CREATE POLICY "Users can insert own chat sessions"
  ON chat_sessions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own chat sessions
CREATE POLICY "Users can update own chat sessions"
  ON chat_sessions
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);


-- =============================================
-- updated_at triggers
-- =============================================

-- Trigger for credit_balances
CREATE TRIGGER update_credit_balances_updated_at
  BEFORE UPDATE ON credit_balances
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for credit_costs
CREATE TRIGGER update_credit_costs_updated_at
  BEFORE UPDATE ON credit_costs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for chat_sessions
CREATE TRIGGER update_chat_sessions_updated_at
  BEFORE UPDATE ON chat_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
