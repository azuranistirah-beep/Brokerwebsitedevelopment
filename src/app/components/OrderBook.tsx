import { useEffect, useState } from 'react';
import { realTimeWebSocket, OrderBookData } from '../lib/realTimeWebSocket';

interface OrderBookProps {
  symbol: string;
}

export function OrderBook({ symbol }: OrderBookProps) {
  const [orderBook, setOrderBook] = useState<OrderBookData | null>(null);
  const [selectedView, setSelectedView] = useState<'all' | 'buy' | 'sell'>('all');

  useEffect(() => {
    console.log('📖 [OrderBook] Subscribing to order book for:', symbol);
    
    const unsubscribe = realTimeWebSocket.subscribeOrderBook(symbol, (data) => {
      setOrderBook(data);
    });

    return () => {
      console.log('📖 [OrderBook] Unsubscribing from:', symbol);
      unsubscribe();
    };
  }, [symbol]);

  if (!orderBook) {
    return (
      <div className="bg-slate-900 rounded-lg p-4 h-full flex items-center justify-center">
        <div className="text-slate-400">Loading order book...</div>
      </div>
    );
  }

  const { bids, asks } = orderBook;

  // Calculate total volumes for percentage bars
  const maxBidVolume = Math.max(...bids.slice(0, 10).map(b => parseFloat(b[1])));
  const maxAskVolume = Math.max(...asks.slice(0, 10).map(a => parseFloat(a[1])));
  const maxVolume = Math.max(maxBidVolume, maxAskVolume);

  return (
    <div className="bg-slate-900 rounded-lg h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-slate-800">
        <h3 className="text-sm font-semibold text-white">Order Book</h3>
        
        {/* View Toggle */}
        <div className="flex gap-1 bg-slate-800 rounded p-1">
          <button
            onClick={() => setSelectedView('all')}
            className={`px-2 py-1 text-xs rounded transition-colors ${
              selectedView === 'all' 
                ? 'bg-slate-700 text-white' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setSelectedView('buy')}
            className={`px-2 py-1 text-xs rounded transition-colors ${
              selectedView === 'buy' 
                ? 'bg-green-600 text-white' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Buy
          </button>
          <button
            onClick={() => setSelectedView('sell')}
            className={`px-2 py-1 text-xs rounded transition-colors ${
              selectedView === 'sell' 
                ? 'bg-red-600 text-white' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Sell
          </button>
        </div>
      </div>

      {/* Column Headers */}
      <div className="grid grid-cols-3 gap-2 px-3 py-2 border-b border-slate-800 text-xs text-slate-400">
        <div className="text-left">Price (USDT)</div>
        <div className="text-right">Amount</div>
        <div className="text-right">Total</div>
      </div>

      {/* Order Book Content */}
      <div className="flex-1 overflow-auto">
        {/* Asks (Sell Orders) - Show from lowest to highest */}
        {(selectedView === 'all' || selectedView === 'sell') && (
          <div className="relative">
            {asks.slice(0, 10).reverse().map((ask, idx) => {
              const price = parseFloat(ask[0]);
              const amount = parseFloat(ask[1]);
              const total = price * amount;
              const percentage = (amount / maxVolume) * 100;

              return (
                <div
                  key={`ask-${idx}`}
                  className="relative grid grid-cols-3 gap-2 px-3 py-1 hover:bg-slate-800/50 transition-colors"
                >
                  {/* Background bar */}
                  <div
                    className="absolute right-0 top-0 h-full bg-red-900/20"
                    style={{ width: `${percentage}%` }}
                  />
                  
                  {/* Content */}
                  <div className="text-sm text-red-500 z-10">
                    {price.toFixed(2)}
                  </div>
                  <div className="text-sm text-slate-300 text-right z-10">
                    {amount.toFixed(4)}
                  </div>
                  <div className="text-sm text-slate-400 text-right z-10">
                    {total.toFixed(2)}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Spread */}
        {selectedView === 'all' && bids.length > 0 && asks.length > 0 && (
          <div className="sticky top-0 z-20 bg-slate-800 px-3 py-2 flex items-center justify-between border-y border-slate-700">
            <div className="text-lg font-bold text-green-500">
              {parseFloat(bids[0][0]).toFixed(2)}
            </div>
            <div className="text-xs text-slate-400">
              Spread: {(parseFloat(asks[0][0]) - parseFloat(bids[0][0])).toFixed(2)}
            </div>
          </div>
        )}

        {/* Bids (Buy Orders) - Show from highest to lowest */}
        {(selectedView === 'all' || selectedView === 'buy') && (
          <div className="relative">
            {bids.slice(0, 10).map((bid, idx) => {
              const price = parseFloat(bid[0]);
              const amount = parseFloat(bid[1]);
              const total = price * amount;
              const percentage = (amount / maxVolume) * 100;

              return (
                <div
                  key={`bid-${idx}`}
                  className="relative grid grid-cols-3 gap-2 px-3 py-1 hover:bg-slate-800/50 transition-colors"
                >
                  {/* Background bar */}
                  <div
                    className="absolute right-0 top-0 h-full bg-green-900/20"
                    style={{ width: `${percentage}%` }}
                  />
                  
                  {/* Content */}
                  <div className="text-sm text-green-500 z-10">
                    {price.toFixed(2)}
                  </div>
                  <div className="text-sm text-slate-300 text-right z-10">
                    {amount.toFixed(4)}
                  </div>
                  <div className="text-sm text-slate-400 text-right z-10">
                    {total.toFixed(2)}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
