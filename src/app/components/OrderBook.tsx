import { useEffect, useState } from 'react';

interface OrderBookProps {
  symbol: string;
}

export function OrderBook({ symbol }: OrderBookProps) {
  // TODO: Implement order book when API is ready
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
      <h3 className="text-sm font-medium text-slate-400 mb-4">Order Book</h3>
      <div className="text-slate-500 text-center py-8">
        Order book feature coming soon
      </div>
    </div>
  );
}