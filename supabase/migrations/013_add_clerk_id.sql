-- Add clerk_id column to user_profiles for Clerk authentication mapping
ALTER TABLE user_profiles ADD COLUMN clerk_id TEXT UNIQUE;
CREATE INDEX idx_user_profiles_clerk_id ON user_profiles(clerk_id);
