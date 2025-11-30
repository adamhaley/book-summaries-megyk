import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import type { SupabaseClient as SupabaseClientType } from '@supabase/supabase-js';

export type SupabaseClient = SupabaseClientType;

/**
 * Platform detection
 */
const isReactNative = typeof navigator !== 'undefined' && (navigator as any).product === 'ReactNative';

/**
 * AsyncStorage adapter for React Native
 * Dynamically import to avoid errors on web
 */
let AsyncStorage: any = null;
if (isReactNative) {
  try {
    AsyncStorage = require('@react-native-async-storage/async-storage').default;
  } catch (error) {
    console.warn('AsyncStorage not available. Install @react-native-async-storage/async-storage for React Native support.');
  }
}

/**
 * Create a cross-platform Supabase client
 * Works on both web (React Native Web) and native (iOS/Android)
 * 
 * @param supabaseUrl - Your Supabase project URL
 * @param supabaseAnonKey - Your Supabase anonymous key
 */
export function createClient(
  supabaseUrl: string,
  supabaseAnonKey: string
): SupabaseClient {
  const options: any = {
    auth: {
      storage: isReactNative && AsyncStorage ? AsyncStorage : undefined,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false, // Disable for React Native
    },
  };

  return createSupabaseClient(supabaseUrl, supabaseAnonKey, options);
}

/**
 * Create Supabase client with environment variables
 * Requires EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY
 */
export function createClientFromEnv(): SupabaseClient {
  const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Missing Supabase environment variables. ' +
      'Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY'
    );
  }

  return createClient(supabaseUrl, supabaseAnonKey);
}
