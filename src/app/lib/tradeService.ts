/**
 * ✅ TRADE SERVICE - Works 100% without Edge Functions
 * Uses Supabase KV Store directly from frontend
 */

import { supabase } from './supabaseClient';

export interface Trade {
  id: string;
  userId: string;
  symbol: string;
  type: 'buy' | 'sell';
  amount: number;
  entry_price: number;
  exit_price?: number;
  result?: 'win' | 'loss';
  profit?: number;
  duration?: number;
  status: 'open' | 'closed';
  created_at: string;
  closed_at?: string;
}

/**
 * Save trade to KV store
 */
export async function saveTrade(trade: Trade): Promise<boolean> {
  try {
    const key = `trade_${trade.userId}_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    
    const { error } = await supabase
      .from('kv_store_20da1dab')
      .upsert({
        key: key,
        value: {
          ...trade,
          id: key
        }
      });

    if (error) {
      console.error('Error saving trade:', error);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Exception saving trade:', err);
    return false;
  }
}

/**
 * Get all trades for a user
 */
export async function getUserTrades(userId: string): Promise<Trade[]> {
  try {
    const { data, error } = await supabase
      .from('kv_store_20da1dab')
      .select('key, value')
      .like('key', `trade_${userId}_%`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching trades:', error);
      return [];
    }

    return (data || []).map(d => d.value as Trade);
  } catch (err) {
    console.error('Exception fetching trades:', err);
    return [];
  }
}

/**
 * Get all trades (admin only)
 */
export async function getAllTrades(): Promise<Trade[]> {
  try {
    const { data, error } = await supabase
      .from('kv_store_20da1dab')
      .select('key, value')
      .like('key', 'trade_%')
      .order('created_at', { ascending: false })
      .limit(1000);

    if (error) {
      console.error('Error fetching all trades:', error);
      return [];
    }

    return (data || []).map(d => d.value as Trade);
  } catch (err) {
    console.error('Exception fetching all trades:', err);
    return [];
  }
}

/**
 * Update trade (close position)
 */
export async function updateTrade(tradeId: string, updates: Partial<Trade>): Promise<boolean> {
  try {
    const { data, error: fetchError } = await supabase
      .from('kv_store_20da1dab')
      .select('value')
      .eq('key', tradeId)
      .single();

    if (fetchError || !data) {
      console.error('Error fetching trade for update:', fetchError);
      return false;
    }

    const updatedTrade = {
      ...data.value,
      ...updates
    };

    const { error: updateError } = await supabase
      .from('kv_store_20da1dab')
      .update({ value: updatedTrade })
      .eq('key', tradeId);

    if (updateError) {
      console.error('Error updating trade:', updateError);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Exception updating trade:', err);
    return false;
  }
}
