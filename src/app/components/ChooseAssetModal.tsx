import { X, Search } from "lucide-react";
import { useState } from "react";

interface Asset {
  symbol: string;
  name: string;
  type: string;
  icon: string;
  change?: string;
  spread?: string;
}

interface ChooseAssetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAsset: (symbol: string) => void;
  selectedSymbol: string;
}

// 📊 TOP GAINERS DATA
const topGainers: Asset[] = [
  { symbol: "SNAP", name: "Snap Inc. (OTC)", type: "Stock", icon: "📸", change: "+370.98%" },
  { symbol: "ADAUSD", name: "CARDANO (OTC)", type: "Crypto", icon: "₳", change: "+235.95%" },
  { symbol: "SHIBUSD", name: "SHIB/USD (OTC)", type: "Crypto", icon: "🐕", change: "+163%" },
  { symbol: "NIKE", name: "Nike, Inc. (OTC)", type: "Stock", icon: "👟", change: "+325.38%" },
];

// 📉 TOP LOSERS DATA
const topLosers: Asset[] = [
  { symbol: "AAPL", name: "APPLE", type: "Stock", icon: "🍎", change: "-12.5%" },
  { symbol: "GOLD", name: "Gold", type: "Commodity", icon: "🥇", change: "-8.3%" },
  { symbol: "USOUSD", name: "USO/USD", type: "Commodity", icon: "🛢️", change: "-15.2%" },
  { symbol: "GOOGL", name: "GOOGLE", type: "Stock", icon: "🔍", change: "-9.7%" },
];

// 💎 LOWEST SPREAD DATA
const lowestSpread: Asset[] = [
  { symbol: "BTCUSD", name: "Bitcoin", type: "Crypto", icon: "₿", spread: "0.03%" },
  { symbol: "BTCUSD", name: "Bitcoin-PerpFuture", type: "Crypto", icon: "₿", spread: "0.027%" },
  { symbol: "ETHUSD", name: "Ethereum", type: "Crypto", icon: "Ξ", spread: "0.18%" },
  { symbol: "ZCASH", name: "ZCash", type: "Crypto", icon: "Ⓩ", spread: "0.464%" },
];

// 🌟 ALL POPULAR ASSETS
const popularAssets: Asset[] = [
  { symbol: "BTCUSD", name: "Bitcoin", type: "Crypto", icon: "₿" },
  { symbol: "ETHUSD", name: "Ethereum", type: "Crypto", icon: "Ξ" },
  { symbol: "BNBUSD", name: "Binance Coin", type: "Crypto", icon: "🪙" },
  { symbol: "SOLUSD", name: "Solana", type: "Crypto", icon: "◎" },
  { symbol: "XRPUSD", name: "Ripple", type: "Crypto", icon: "✕" },
  { symbol: "ADAUSD", name: "Cardano", type: "Crypto", icon: "₳" },
  { symbol: "DOGEUSD", name: "Dogecoin", type: "Crypto", icon: "Ð" },
  { symbol: "MATICUSD", name: "Polygon", type: "Crypto", icon: "⬡" },
  { symbol: "DOTUSD", name: "Polkadot", type: "Crypto", icon: "●" },
  { symbol: "UNIUSD", name: "Uniswap", type: "Crypto", icon: "🦄" },
  { symbol: "GOLD", name: "Gold", type: "Commodity", icon: "🥇" },
  { symbol: "SILVER", name: "Silver", type: "Commodity", icon: "🥈" },
  { symbol: "USOIL", name: "US Oil", type: "Commodity", icon: "🛢️" },
  { symbol: "UKOIL", name: "UK Oil", type: "Commodity", icon: "⛽" },
];

export function ChooseAssetModal({ isOpen, onClose, onSelectAsset, selectedSymbol }: ChooseAssetModalProps) {
  const [activeTab, setActiveTab] = useState<"popular" | "contracts" | "crypto">("popular");
  const [searchQuery, setSearchQuery] = useState("");

  if (!isOpen) return null;

  // Filter assets by search
  const filteredAssets = popularAssets.filter(
    (asset) =>
      asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.symbol.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-slate-950 z-50 flex flex-col">
      {/* 🎯 HEADER */}
      <div className="bg-slate-900 border-b border-slate-800 px-4 py-3 flex items-center justify-between">
        <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-lg transition-colors">
          <X className="h-5 w-5 text-white" />
        </button>
        <h2 className="text-lg font-bold text-white">Choose Asset</h2>
        <button onClick={() => {}} className="p-2 hover:bg-slate-800 rounded-lg transition-colors">
          <Search className="h-5 w-5 text-white" />
        </button>
      </div>

      {/* 🔖 TABS */}
      <div className="bg-slate-900 px-4 py-3 flex items-center justify-center gap-8">
        <button
          onClick={() => setActiveTab("popular")}
          className={`flex flex-col items-center gap-1 transition-all ${
            activeTab === "popular" ? "text-white" : "text-slate-500"
          }`}
        >
          <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
            activeTab === "popular" ? "bg-white" : "bg-slate-800"
          }`}>
            <span className="text-lg">🔥</span>
          </div>
          <span className="text-xs font-medium">Popular</span>
        </button>

        <button
          onClick={() => setActiveTab("contracts")}
          className={`flex flex-col items-center gap-1 transition-all ${
            activeTab === "contracts" ? "text-white" : "text-slate-500"
          }`}
        >
          <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
            activeTab === "contracts" ? "bg-white" : "bg-slate-800"
          }`}>
            <span className="text-lg">⚡</span>
          </div>
          <span className="text-xs font-medium">Contracts</span>
        </button>

        <button
          onClick={() => setActiveTab("crypto")}
          className={`flex flex-col items-center gap-1 transition-all ${
            activeTab === "crypto" ? "text-white" : "text-slate-500"
          }`}
        >
          <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
            activeTab === "crypto" ? "bg-white" : "bg-slate-800"
          }`}>
            <span className="text-lg">₿</span>
          </div>
          <span className="text-xs font-medium">Crypto</span>
        </button>
      </div>

      {/* 📜 CONTENT - SCROLLABLE */}
      <div className="flex-1 overflow-y-auto bg-slate-950 px-4 py-4 space-y-6">
        {/* 📊 TOP GAINERS */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-slate-400">Top gainers</h3>
            <button className="text-xs font-bold text-slate-400 hover:text-white transition-colors">
              MORE
            </button>
          </div>
          <div className="grid grid-cols-4 gap-3">
            {topGainers.map((asset) => (
              <button
                key={asset.symbol}
                onClick={() => {
                  onSelectAsset(asset.symbol);
                  onClose();
                }}
                className="flex flex-col items-center gap-2 p-3 bg-slate-900 hover:bg-slate-800 rounded-xl transition-all"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center text-xl">
                  {asset.icon}
                </div>
                <div className="text-center">
                  <div className="text-xs font-bold text-white">{asset.name.split(" ")[0]}</div>
                  <div className="text-[10px] text-slate-400">(OTC)</div>
                  <div className="text-xs font-bold text-green-400 mt-1">{asset.change}</div>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* 📉 TOP LOSERS */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-slate-400">Top losers</h3>
            <button className="text-xs font-bold text-slate-400 hover:text-white transition-colors">
              MORE
            </button>
          </div>
          <div className="grid grid-cols-4 gap-3">
            {topLosers.map((asset) => (
              <button
                key={asset.symbol}
                onClick={() => {
                  onSelectAsset(asset.symbol);
                  onClose();
                }}
                className="flex flex-col items-center gap-2 p-3 bg-slate-900 hover:bg-slate-800 rounded-xl transition-all"
              >
                <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center text-xl">
                  {asset.icon}
                </div>
                <div className="text-center">
                  <div className="text-xs font-bold text-white">{asset.name.split(" ")[0]}</div>
                  <div className="text-xs font-bold text-red-400 mt-1">{asset.change}</div>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* 💎 LOWEST SPREAD */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-slate-400">The lowest spread</h3>
            <button className="text-xs font-bold text-slate-400 hover:text-white transition-colors">
              MORE
            </button>
          </div>
          <div className="grid grid-cols-4 gap-3">
            {lowestSpread.map((asset, idx) => (
              <button
                key={`${asset.symbol}-${idx}`}
                onClick={() => {
                  onSelectAsset(asset.symbol);
                  onClose();
                }}
                className="flex flex-col items-center gap-2 p-3 bg-slate-900 hover:bg-slate-800 rounded-xl transition-all"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-xl text-white">
                  {asset.icon}
                </div>
                <div className="text-center">
                  <div className="text-xs font-bold text-white">{asset.name.split(" ")[0]}</div>
                  {asset.name.includes("-") && (
                    <div className="text-[10px] text-slate-400">{asset.name.split("-")[1]}</div>
                  )}
                  <div className="text-xs font-bold text-blue-400 mt-1">{asset.spread}</div>
                </div>
              </button>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
