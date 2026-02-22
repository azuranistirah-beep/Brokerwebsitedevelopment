/**
 * ✅ PROFILE SERVICE - Works 100% without Edge Functions
 * Uses Supabase KV Store directly from frontend
 */

import { supabase } from './supabaseClient';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  balance: number;
  demo_balance: number;
  role: 'admin' | 'member';
  status: 'active' | 'inactive';
  created_at: string;
}

/**
 * Get user profile from KV store
 */
export async function getProfile(userId: string): Promise<UserProfile | null> {
  try {
    const { data, error } = await supabase
      .from('kv_store_20da1dab')
      .select('value')
      .eq('key', `profile_${userId}`)
      .maybeSingle();

    if (error) {
      console.error('Error fetching profile:', error);
      return null;
    }

    return data?.value as UserProfile || null;
  } catch (err) {
    console.error('Exception fetching profile:', err);
    return null;
  }
}

/**
 * Create or update user profile in KV store
 */
export async function saveProfile(profile: UserProfile): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('kv_store_20da1dab')
      .upsert({
        key: `profile_${profile.id}`,
        value: profile
      });

    if (error) {
      console.error('Error saving profile:', error);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Exception saving profile:', err);
    return false;
  }
}

/**
 * Get current user profile (auto-create if not exists)
 */
export async function getCurrentProfile(): Promise<UserProfile | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return null;
    }

    let profile = await getProfile(user.id);

    // Auto-create profile if not exists
    if (!profile) {
      profile = {
        id: user.id,
        email: user.email || '',
        name: user.user_metadata?.name || user.email?.split('@')[0] || 'Member',
        balance: 0,
        demo_balance: 10000,
        role: user.user_metadata?.role || 'member',
        status: 'active',
        created_at: new Date().toISOString()
      };

      await saveProfile(profile);
    }

    return profile;
  } catch (err) {
    console.error('Exception getting current profile:', err);
    return null;
  }
}

/**
 * Update demo balance
 */
export async function updateDemoBalance(userId: string, newBalance: number): Promise<boolean> {
  try {
    const profile = await getProfile(userId);
    
    if (!profile) {
      return false;
    }

    profile.demo_balance = newBalance;
    return await saveProfile(profile);
  } catch (err) {
    console.error('Exception updating demo balance:', err);
    return false;
  }
}
