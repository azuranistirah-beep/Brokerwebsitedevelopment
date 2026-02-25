import { useState, useEffect } from "react";
import { RealOrderPanel } from "./RealOrderPanel";
import { RealTradesList } from "./RealTradesList";
import { Search, Star } from "lucide-react";
import { projectId } from "../../../utils/supabase/info";

interface RealTradeAreaProps {
  accessToken: string;
  wallet: any;
  onWalletUpdate: () => void;
  userProfile: any;
}

export function RealTradeArea({ accessToken, wallet, onWalletUpdate, userProfile }: RealTradeAreaProps) {
  const [selectedSymbol, setSelectedSymbol] = useState("BTCUSD");
  const [assets, setAssets] = useState<any[]>([]);
  const [showAssetSearch, setShowAssetSearch] = useState(false);
  const [activeTrades, setActiveTrades] = useState<any[]>([]);
  const [closedTrades, setClosedTrades] = useState<any[]>([]);

  useEffect(() => {
    fetchAssets();
    fetchActiveTrades();
    fetchClosedTrades();
    
    // ✅ REDUCED: Poll active trades every 15 seconds (was 2s - too aggressive!)
    const interval = setInterval(() => {
      fetchActiveTrades();
      checkExpiredTrades();
    }, 15000); // ✅ Changed from 2000ms to 15000ms

    return () => clearInterval(interval);
  }, []);

  const fetchAssets = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-20da1dab/assets`
      );
      if (response.ok) {
        const data = await response.json();
        setAssets(data.assets);
      }
    } catch (error) {
      console.error("Failed to fetch assets:", error);
    }
  };

  const fetchActiveTrades = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-20da1dab/trades/real/active`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      if (response.ok) {
        const data = await response.json();
        setActiveTrades(data.trades);
      }
    } catch (error) {
      console.error("Failed to fetch active trades:", error);
    }
  };

  const fetchClosedTrades = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-20da1dab/trades/real/closed`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      if (response.ok) {
        const data = await response.json();
        setClosedTrades(data.trades);
      }
    } catch (error) {
      console.error("Failed to fetch closed trades:", error);
    }
  };

  const checkExpiredTrades = async () => {
    try {
      await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-20da1dab/trades/real/check-expired`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      
      // Refresh wallet and trades if any were closed
      onWalletUpdate();
      fetchClosedTrades();
    } catch (error) {
      console.error("Failed to check expired trades:", error);
    }
  };

  const handleTradeSuccess = () => {
    onWalletUpdate();
    fetchActiveTrades();
  };

  const selectedAsset = assets.find((a) => a.symbol === selectedSymbol);

  return (
    <div className="flex h-full">
      {/* Main Chart Area */}
      <div className="flex-1 flex flex-col bg-slate-950">
        {/* Asset Selector & Timeframe */}
        <div className="h-14 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-4">
          {/* Asset Selector */}
          <div className="relative">
            <button
              onClick={() => setShowAssetSearch(!showAssetSearch)}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
            >
              <Star className="w-4 h-4 text-yellow-500" />
              <span className="font-bold text-white">{selectedSymbol}</span>
              <span className="text-slate-400 text-sm">
                {selectedAsset?.name || ''}
              </span>
            </button>

            {showAssetSearch && (
              <div className="absolute top-full left-0 mt-2 w-80 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-50">
                <div className="p-3 border-b border-slate-700">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search assets..."
                      className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {assets.map((asset) => (
                    <button
                      key={asset.symbol}
                      onClick={() => {
                        setSelectedSymbol(asset.symbol);
                        setShowAssetSearch(false);
                      }}
                      className={`w-full flex items-center justify-between px-4 py-3 hover:bg-slate-700 transition-colors ${
                        selectedSymbol === asset.symbol ? 'bg-slate-700' : ''
                      }`}
                    >
                      <div>
                        <p className="font-semibold text-white">{asset.symbol}</p>
                        <p className="text-sm text-slate-400">{asset.name}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-slate-400">Payout</p>
                        <p className="text-sm font-semibold text-green-400">{asset.payout}%</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Timeframe Selector */}
          <div className="flex items-center gap-2">
            {['5s', '10s', '15s', '30s', '1m', '2m', '5m', '15m', '30m', '1h', '2h', '4h', '1d'].map((tf) => (
              <button
                key={tf}
                className="px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
              >
                {tf}
              </button>
            ))}
          </div>
        </div>

        {/* TradingView Chart Embed */}
        <div className="flex-1 bg-slate-950 p-4">
          <div className="w-full h-full bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-center">
            <iframe
              src={`https://s.tradingview.com/widgetembed/?frameElementId=tradingview_chart&symbol=${selectedSymbol}&interval=1&hidesidetoolbar=0&symboledit=1&saveimage=1&toolbarbg=f1f3f6&studies=[]&theme=dark&style=1&timezone=Etc%2FUTC&withdateranges=1&studies_overrides={}&overrides={}&enabled_features=[]&disabled_features=[]&locale=en`}
              className="w-full h-full rounded-xl"
              frameBorder="0"
              allowTransparency
              scrolling="no"
            />
          </div>
        </div>

        {/* Bottom Panel: Open/Closed Trades */}
        <RealTradesList
          activeTrades={activeTrades}
          closedTrades={closedTrades}
        />
      </div>

      {/* Right Panel: Order Panel */}
      <RealOrderPanel
        accessToken={accessToken}
        selectedSymbol={selectedSymbol}
        selectedAsset={selectedAsset}
        wallet={wallet}
        userProfile={userProfile}
        onTradeSuccess={handleTradeSuccess}
      />
    </div>
  );
}