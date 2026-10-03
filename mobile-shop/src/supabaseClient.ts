import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, type Session, type User } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';
const hasSupabaseConfig = typeof supabaseUrl === 'string' && supabaseUrl.includes('supabase.co') && supabaseAnonKey.length > 0;

const storage = {
  async getItem(key: string) {
    return AsyncStorage.getItem(key);
  },
  async setItem(key: string, value: string) {
    await AsyncStorage.setItem(key, value);
  },
  async removeItem(key: string) {
    await AsyncStorage.removeItem(key);
  },
};

const noopQuery = () => ({
  select: async () => ({ data: [], error: null }),
  insert: async () => ({ data: [], error: null }),
  update: async () => ({ data: [], error: null }),
  delete: async () => ({ data: [], error: null }),
  upsert: async () => ({ data: [], error: null }),
  eq: () => noopQuery(),
  order: () => noopQuery(),
  limit: () => noopQuery(),
  maybeSingle: async () => ({ data: null, error: null }),
  single: async () => ({ data: null, error: null }),
  match: () => noopQuery(),
});

export const supabase = hasSupabaseConfig
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false,
        storage,
      },
    })
  : {
      from: () => noopQuery(),
      rpc: async () => ({ data: null, error: null }),
      auth: {
        getSession: async () => ({ data: { session: null as Session | null }, error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => undefined } } }),
        signInWithPassword: async () => ({ data: { session: null as Session | null, user: null as User | null }, error: null }),
        signUp: async () => ({ data: { user: null as User | null, session: null as Session | null }, error: null }),
        signOut: async () => ({ error: null }),
        getUser: async () => ({ data: { user: null as User | null }, error: null }),
      },
    } as any;

export const isSupabaseConfigured = hasSupabaseConfig;

export async function ensureCustomerProfile(user: { id: string; email?: string | null; user_metadata?: Record<string, any> } | null, overrides: Record<string, any> = {}) {
  if (!user?.id || !hasSupabaseConfig) return null;
  const profile = {
    id: user.id,
    email: user.email || overrides.email || null,
    first_name: user.user_metadata?.first_name || overrides.first_name || null,
    last_name: user.user_metadata?.last_name || overrides.last_name || null,
    full_name: user.user_metadata?.full_name || overrides.full_name || [overrides.first_name, overrides.last_name].filter(Boolean).join(' ') || user.email || null,
    phone: user.user_metadata?.phone || overrides.phone || null,
    updated_at: new Date().toISOString(),
    ...overrides,
  };

  const { error } = await supabase.from('customer_profiles').upsert(profile, { onConflict: 'id' });
  if (error) {
    console.warn('Customer profile sync failed:', error.message);
    return null;
  }
  return profile;
}
