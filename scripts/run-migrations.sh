#!/bin/bash
# Run Supabase migrations against self-hosted instance
# Usage: ./scripts/run-migrations.sh [migration_number]
# Example: ./scripts/run-migrations.sh 013
# Or run all new migrations: ./scripts/run-migrations.sh

set -e

# Load environment variables
if [ -f .env.local ]; then
  export $(grep -v '^#' .env.local | grep DATABASE_URL | xargs)
fi

# Default database URL (update if needed)
DB_URL="${DATABASE_URL:-postgresql://postgres:your-super-secret-and-long-postgres-password@supabase.megyk.com:5433/postgres}"

MIGRATIONS_DIR="supabase/migrations"

run_migration() {
  local file=$1
  echo "Running migration: $file"
  psql "$DB_URL" -f "$file"
  echo "Completed: $file"
  echo "---"
}

if [ -n "$1" ]; then
  # Run specific migration
  file=$(ls $MIGRATIONS_DIR/${1}*.sql 2>/dev/null | head -1)
  if [ -f "$file" ]; then
    run_migration "$file"
  else
    echo "Migration not found: $1"
    exit 1
  fi
else
  # Run all migrations in order
  for file in $(ls $MIGRATIONS_DIR/*.sql | sort); do
    run_migration "$file"
  done
fi

echo "All migrations completed!"
