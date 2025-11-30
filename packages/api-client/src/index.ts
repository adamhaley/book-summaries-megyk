/**
 * @megyk/api-client
 * Cross-platform Supabase client and API utilities
 */

// Supabase client
export { createClient, createClientFromEnv } from './supabase';
export type { SupabaseClient } from './supabase';

// API client for Next.js backend
export { createApiClient, createApiClientFromEnv } from './api';
export type { ApiClientConfig, ApiError } from './api';

// Type-safe route helpers
export { createRoutes } from './routes';
export type { SummaryGenerationRequest, SummaryGenerationResponse } from './routes';
