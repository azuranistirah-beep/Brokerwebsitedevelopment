import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { 
  ChevronDown, ArrowUp, ArrowDown, User, Search, 
  Settings, BarChart3, Award, Bot, HeadphonesIcon,
  UserCircle, Menu, Clock, Plus, Minus, X, TrendingUp, TrendingDown,
  Gift, Headphones, Activity, BarChart2, ChevronRight, Play, Pause,
  RotateCcw, DollarSign, CheckCircle, XCircle, Target, AlertCircle,
  MessageCircle, Globe, Info, LogOut, FileText
} from "lucide-react";
import { TradingChart } from "./TradingChart";
import { usePrices } from "../context/PriceContext";
import { projectId, publicAnonKey } from "../../../utils/supabase/info";

// ✅ UPDATED: Duration options from 5 seconds to 1 day
const DURATIONS = [
  { value: 5, label: "5s" },
  { value: 10, label: "10s" },
  { value: 15, label: "15s" },
  { value: 30, label: "30s" },
  { value: 45, label: "45s" },
  { value: 60, label: "1m" },
  { value: 120, label: "2m" },
  { value: 180, label: "3m" },
  { value: 300, label: "5m" },
  { value: 600, label: "10m" },
  { value: 900, label: "15m" },
  { value: 1800, label: "30m" },
  { value: 3600, label: "1h" },
  { value: 7200, label: "2h" },
  { value: 14400, label: "4h" },
  { value: 28800, label: "8h" },
  { value: 43200, label: "12h" },
  { value: 86400, label: "1d" },
];

interface Asset {
  symbol: string;
  name: string;
  flag: string;
  percentage: string;
  tradingViewSymbol: string;
  category?: string;
  price?: number;
  change?: number;
}

interface ActiveTrade {
  id: string;
  symbol: string;
  asset: string;
  direction: "UP" | "DOWN";
  amount: number;
  duration: number;
  entryPrice: number;
  targetPrice?: number;
  startTime: number;
  endTime: number;
  remainingSeconds: number;
  currentPrice: number;
  profit: number;
  status: "active" | "win" | "loss";
}

interface RobotStatus {
  isRunning: boolean;
  totalTrades: number;
  winRate: number;
  profit: number;
  currentSignal?: "BUY" | "SELL" | null;
}

const ASSETS: Asset[] = [
  // Crypto - Top Coins
  { symbol: "BTCUSD", tradingViewSymbol: "BINANCE:BTCUSDT", name: "Bitcoin", flag: "https://assets.coingecko.com/coins/images/1/small/bitcoin.png", percentage: "95%", category: "Crypto", price: 95420.50, change: 2.4 },
  { symbol: "ETHUSD", tradingViewSymbol: "BINANCE:ETHUSDT", name: "Ethereum", flag: "https://assets.coingecko.com/coins/images/279/small/ethereum.png", percentage: "93%", category: "Crypto", price: 3580.25, change: 1.8 },
  { symbol: "BNBUSD", tradingViewSymbol: "BINANCE:BNBUSDT", name: "Binance Coin", flag: "https://assets.coingecko.com/coins/images/825/small/bnb-icon2_2x.png", percentage: "91%", category: "Crypto", price: 645.30, change: -0.5 },
  { symbol: "XRPUSD", tradingViewSymbol: "BINANCE:XRPUSDT", name: "Ripple", flag: "https://assets.coingecko.com/coins/images/44/small/xrp-symbol-white-128.png", percentage: "89%", category: "Crypto", price: 2.45, change: 3.2 },
  { symbol: "SOLUSD", tradingViewSymbol: "BINANCE:SOLUSDT", name: "Solana", flag: "https://assets.coingecko.com/coins/images/4128/small/solana.png", percentage: "92%", category: "Crypto", price: 198.75, change: 4.1 },
  { symbol: "ADAUSD", tradingViewSymbol: "BINANCE:ADAUSDT", name: "Cardano", flag: "https://assets.coingecko.com/coins/images/975/small/cardano.png", percentage: "90%", category: "Crypto", price: 0.98, change: 2.1 },
  { symbol: "DOGEUSD", tradingViewSymbol: "BINANCE:DOGEUSDT", name: "Dogecoin", flag: "https://assets.coingecko.com/coins/images/5/small/dogecoin.png", percentage: "88%", category: "Crypto", price: 0.35, change: 5.3 },
  { symbol: "MATICUSD", tradingViewSymbol: "BINANCE:MATICUSDT", name: "Polygon", flag: "https://assets.coingecko.com/coins/images/4713/small/matic-token-icon.png", percentage: "89%", category: "Crypto", price: 0.85, change: 1.9 },
  { symbol: "DOTUSD", tradingViewSymbol: "BINANCE:DOTUSDT", name: "Polkadot", flag: "https://assets.coingecko.com/coins/images/12171/small/polkadot.png", percentage: "87%", category: "Crypto", price: 7.45, change: -1.2 },
  { symbol: "AVAXUSD", tradingViewSymbol: "BINANCE:AVAXUSDT", name: "Avalanche", flag: "https://assets.coingecko.com/coins/images/12559/small/Avalanche_Circle_RedWhite_Trans.png", percentage: "91%", category: "Crypto", price: 42.30, change: 3.7 },
  { symbol: "SHIBUSDT", tradingViewSymbol: "BINANCE:SHIBUSDT", name: "Shiba Inu", flag: "https://assets.coingecko.com/coins/images/11939/small/shiba.png", percentage: "86%", category: "Crypto", price: 0.00002845, change: 8.2 },
  { symbol: "LINKUSD", tradingViewSymbol: "BINANCE:LINKUSDT", name: "Chainlink", flag: "https://assets.coingecko.com/coins/images/877/small/chainlink-new-logo.png", percentage: "90%", category: "Crypto", price: 18.65, change: 2.8 },
  { symbol: "TRXUSD", tradingViewSymbol: "BINANCE:TRXUSDT", name: "Tron", flag: "https://assets.coingecko.com/coins/images/1094/small/tron-logo.png", percentage: "88%", category: "Crypto", price: 0.24, change: 1.5 },
  { symbol: "UNIUSD", tradingViewSymbol: "BINANCE:UNIUSDT", name: "Uniswap", flag: "https://assets.coingecko.com/coins/images/12504/large/uni.jpg", percentage: "89%", category: "Crypto", price: 12.45, change: -0.8 },
  { symbol: "LTCUSD", tradingViewSymbol: "BINANCE:LTCUSDT", name: "Litecoin", flag: "https://assets.coingecko.com/coins/images/2/small/litecoin.png", percentage: "91%", category: "Crypto", price: 105.30, change: 1.2 },
  { symbol: "ATOMUSD", tradingViewSymbol: "BINANCE:ATOMUSDT", name: "Cosmos", flag: "https://assets.coingecko.com/coins/images/1481/small/cosmos_hub.png", percentage: "88%", category: "Crypto", price: 11.85, change: 2.4 },
  { symbol: "ETCUSD", tradingViewSymbol: "BINANCE:ETCUSDT", name: "Ethereum Classic", flag: "https://assets.coingecko.com/coins/images/453/small/ethereum-classic-logo.png", percentage: "87%", category: "Crypto", price: 28.50, change: -1.5 },
  { symbol: "NEARUSD", tradingViewSymbol: "BINANCE:NEARUSDT", name: "NEAR Protocol", flag: "https://assets.coingecko.com/coins/images/10365/small/near.jpg", percentage: "89%", category: "Crypto", price: 5.75, change: 3.1 },
  { symbol: "APTUSD", tradingViewSymbol: "BINANCE:APTUSDT", name: "Aptos", flag: "https://assets.coingecko.com/coins/images/26455/small/aptos_round.png", percentage: "90%", category: "Crypto", price: 12.20, change: 4.5 },
  { symbol: "ARBUSD", tradingViewSymbol: "BINANCE:ARBUSDT", name: "Arbitrum", flag: "https://assets.coingecko.com/coins/images/16547/small/photo_2023-03-29_21.47.00.jpeg", percentage: "88%", category: "Crypto", price: 1.85, change: 2.2 },
  { symbol: "OPUSD", tradingViewSymbol: "BINANCE:OPUSDT", name: "Optimism", flag: "https://assets.coingecko.com/coins/images/25244/small/Optimism.png", percentage: "87%", category: "Crypto", price: 3.45, change: 1.9 },
  { symbol: "LDOUSD", tradingViewSymbol: "BINANCE:LDOUSDT", name: "Lido DAO", flag: "https://assets.coingecko.com/coins/images/13573/small/Lido_DAO.png", percentage: "86%", category: "Crypto", price: 2.65, change: -0.7 },
  { symbol: "XLMUSD", tradingViewSymbol: "BINANCE:XLMUSDT", name: "Stellar", flag: "https://assets.coingecko.com/coins/images/100/large/Stellar_symbol_black_RGB.png", percentage: "88%", category: "Crypto", price: 0.34, change: 3.4 },
  { symbol: "BCHUSD", tradingViewSymbol: "BINANCE:BCHUSDT", name: "Bitcoin Cash", flag: "https://assets.coingecko.com/coins/images/780/small/bitcoin-cash-circle.png", percentage: "89%", category: "Crypto", price: 549.14, change: 10.5 },
  { symbol: "ALGOUSD", tradingViewSymbol: "BINANCE:ALGOUSDT", name: "Algorand", flag: "https://assets.coingecko.com/coins/images/4380/large/download.png", percentage: "87%", category: "Crypto", price: 0.42, change: 2.8 },
  { symbol: "VETUSD", tradingViewSymbol: "BINANCE:VETUSDT", name: "VeChain", flag: "https://assets.coingecko.com/coins/images/1167/large/VeChain-Logo-768x725.png", percentage: "86%", category: "Crypto", price: 0.045, change: 4.2 },
  { symbol: "FILUSD", tradingViewSymbol: "BINANCE:FILUSDT", name: "Filecoin", flag: "https://assets.coingecko.com/coins/images/12817/small/filecoin.png", percentage: "88%", category: "Crypto", price: 8.95, change: 1.7 },
  { symbol: "ICPUSD", tradingViewSymbol: "BINANCE:ICPUSDT", name: "Internet Computer", flag: "https://assets.coingecko.com/coins/images/14495/small/Internet_Computer_logo.png", percentage: "87%", category: "Crypto", price: 13.45, change: 5.6 },
  { symbol: "SANDUSD", tradingViewSymbol: "BINANCE:SANDUSDT", name: "The Sandbox", flag: "https://assets.coingecko.com/coins/images/12129/small/sandbox_logo.jpg", percentage: "85%", category: "Crypto", price: 0.78, change: 6.3 },
  { symbol: "MANAUSD", tradingViewSymbol: "BINANCE:MANAUSDT", name: "Decentraland", flag: "https://assets.coingecko.com/coins/images/878/small/decentraland-mana.png", percentage: "86%", category: "Crypto", price: 0.92, change: 4.8 },
  { symbol: "AXSUSD", tradingViewSymbol: "BINANCE:AXSUSDT", name: "Axie Infinity", flag: "https://assets.coingecko.com/coins/images/13029/small/axie_infinity_logo.png", percentage: "84%", category: "Crypto", price: 11.20, change: 3.5 },
  { symbol: "GRTUSD", tradingViewSymbol: "BINANCE:GRTUSDT", name: "The Graph", flag: "https://assets.coingecko.com/coins/images/13397/small/Graph_Token.png", percentage: "87%", category: "Crypto", price: 0.38, change: 2.9 },
  { symbol: "FTMUSD", tradingViewSymbol: "BINANCE:FTMUSDT", name: "Fantom", flag: "https://assets.coingecko.com/coins/images/4001/small/Fantom_round.png", percentage: "88%", category: "Crypto", price: 0.65, change: 7.2 },
  { symbol: "ENJUSD", tradingViewSymbol: "BINANCE:ENJUSDT", name: "Enjin Coin", flag: "https://assets.coingecko.com/coins/images/1102/small/enjin-coin-logo.png", percentage: "85%", category: "Crypto", price: 0.56, change: 1.9 },
  { symbol: "APEUSD", tradingViewSymbol: "BINANCE:APEUSDT", name: "ApeCoin", flag: "https://assets.coingecko.com/coins/images/24383/small/apecoin.jpg", percentage: "87%", category: "Crypto", price: 3.85, change: 5.4 },
  { symbol: "GMXUSD", tradingViewSymbol: "BINANCE:GMXUSDT", name: "GMX", flag: "https://assets.coingecko.com/coins/images/18323/small/arbit.png", percentage: "86%", category: "Crypto", price: 67.50, change: 3.2 },
  { symbol: "RUNEUSD", tradingViewSymbol: "BINANCE:RUNEUSDT", name: "THORChain", flag: "https://assets.coingecko.com/coins/images/6595/small/thorchain.png", percentage: "88%", category: "Crypto", price: 7.85, change: 4.6 },
  { symbol: "QNTUSD", tradingViewSymbol: "BINANCE:QNTUSDT", name: "Quant", flag: "https://assets.coingecko.com/coins/images/3370/small/quant.png", percentage: "89%", category: "Crypto", price: 145.30, change: 2.8 },
  { symbol: "IMXUSD", tradingViewSymbol: "BINANCE:IMXUSDT", name: "Immutable X", flag: "https://assets.coingecko.com/coins/images/17233/small/immutableX-symbol-BLK-RGB.png", percentage: "87%", category: "Crypto", price: 2.95, change: 6.1 },
  { symbol: "CRVUSD", tradingViewSymbol: "BINANCE:CRVUSDT", name: "Curve DAO", flag: "https://assets.coingecko.com/coins/images/12124/small/Curve.png", percentage: "86%", category: "Crypto", price: 1.24, change: 3.3 },
  { symbol: "MKRUSD", tradingViewSymbol: "BINANCE:MKRUSDT", name: "Maker", flag: "https://assets.coingecko.com/coins/images/1364/small/Mark_Maker.png", percentage: "90%", category: "Crypto", price: 2845.60, change: 2.5 },
  { symbol: "AAVEUSD", tradingViewSymbol: "BINANCE:AAVEUSDT", name: "Aave", flag: "https://assets.coingecko.com/coins/images/12645/small/aave-token-round.png", percentage: "91%", category: "Crypto", price: 185.40, change: 4.7 },
  { symbol: "SNXUSD", tradingViewSymbol: "BINANCE:SNXUSDT", name: "Synthetix", flag: "https://assets.coingecko.com/coins/images/3406/small/SNX.png", percentage: "87%", category: "Crypto", price: 4.85, change: 2.1 },
  { symbol: "COMPUSD", tradingViewSymbol: "BINANCE:COMPUSDT", name: "Compound", flag: "https://assets.coingecko.com/coins/images/10775/small/COMP.png", percentage: "88%", category: "Crypto", price: 78.90, change: 3.8 },
  { symbol: "YFIUSD", tradingViewSymbol: "BINANCE:YFIUSDT", name: "Yearn Finance", flag: "https://assets.coingecko.com/coins/images/11849/large/yearn.jpg", percentage: "85%", category: "Crypto", price: 8945.30, change: 1.5 },
  { symbol: "SUSHIUSD", tradingViewSymbol: "BINANCE:SUSHIUSDT", name: "SushiSwap", flag: "https://assets.coingecko.com/coins/images/12271/small/512x512_Logo_no_chop.png", percentage: "86%", category: "Crypto", price: 2.45, change: 5.2 },
  { symbol: "ZRXUSD", tradingViewSymbol: "BINANCE:ZRXUSDT", name: "0x Protocol", flag: "https://assets.coingecko.com/coins/images/863/small/0x.png", percentage: "85%", category: "Crypto", price: 0.72, change: 2.9 },
  { symbol: "BATUSD", tradingViewSymbol: "BINANCE:BATUSDT", name: "Basic Attention", flag: "https://assets.coingecko.com/coins/images/677/small/basic-attention-token.png", percentage: "86%", category: "Crypto", price: 0.34, change: 1.7 },
  { symbol: "ZECUSD", tradingViewSymbol: "BINANCE:ZECUSDT", name: "Zcash", flag: "https://assets.coingecko.com/coins/images/486/small/circle-zcash-color.png", percentage: "87%", category: "Crypto", price: 48.90, change: 3.4 },
  { symbol: "DASHUSD", tradingViewSymbol: "BINANCE:DASHUSDT", name: "Dash", flag: "https://assets.coingecko.com/coins/images/19/small/dash-logo.png", percentage: "86%", category: "Crypto", price: 52.35, change: 2.6 },
  { symbol: "1INCHUSD", tradingViewSymbol: "BINANCE:1INCHUSDT", name: "1inch", flag: "https://assets.coingecko.com/coins/images/13469/small/1inch-token.png", percentage: "85%", category: "Crypto", price: 0.58, change: 3.1 },
  { symbol: "HBARUSD", tradingViewSymbol: "BINANCE:HBARUSDT", name: "Hedera", flag: "https://assets.coingecko.com/coins/images/3688/small/hbar.png", percentage: "88%", category: "Crypto", price: 0.18, change: 4.5 },
  { symbol: "FLOWUSD", tradingViewSymbol: "BINANCE:FLOWUSDT", name: "Flow", flag: "https://assets.coingecko.com/coins/images/13446/small/flow.png", percentage: "87%", category: "Crypto", price: 1.45, change: 2.8 },
  { symbol: "ONEUSD", tradingViewSymbol: "BINANCE:ONEUSDT", name: "Harmony", flag: "https://assets.coingecko.com/coins/images/4344/small/Y88JAze.png", percentage: "84%", category: "Crypto", price: 0.028, change: 5.2 },
  { symbol: "THETAUSD", tradingViewSymbol: "BINANCE:THETAUSDT", name: "Theta Network", flag: "https://assets.coingecko.com/coins/images/2538/small/theta-token-logo.png", percentage: "89%", category: "Crypto", price: 2.35, change: 3.7 },
  { symbol: "CHZUSD", tradingViewSymbol: "BINANCE:CHZUSDT", name: "Chiliz", flag: "https://assets.coingecko.com/coins/images/8834/small/Chiliz.png", percentage: "86%", category: "Crypto", price: 0.145, change: 6.8 },
  { symbol: "HOTUSD", tradingViewSymbol: "BINANCE:HOTUSDT", name: "Holo", flag: "https://assets.coingecko.com/coins/images/3348/large/Holologo_Profile.png", percentage: "83%", category: "Crypto", price: 0.0034, change: 4.1 },
  { symbol: "ZILUSD", tradingViewSymbol: "BINANCE:ZILUSDT", name: "Zilliqa", flag: "https://assets.coingecko.com/coins/images/2687/small/Zilliqa-logo.png", percentage: "85%", category: "Crypto", price: 0.038, change: 2.9 },
  { symbol: "WAVESUSD", tradingViewSymbol: "BINANCE:WAVESUSDT", name: "Waves", flag: "https://assets.coingecko.com/coins/images/425/small/waves.png", percentage: "87%", category: "Crypto", price: 3.85, change: 1.5 },
  { symbol: "KAVAUSD", tradingViewSymbol: "BINANCE:KAVAUSDT", name: "Kava", flag: "https://assets.coingecko.com/coins/images/9761/small/kava.png", percentage: "86%", category: "Crypto", price: 1.28, change: 3.3 },
  { symbol: "ONTUSD", tradingViewSymbol: "BINANCE:ONTUSDT", name: "Ontology", flag: "https://assets.coingecko.com/coins/images/3447/large/ONT.png", percentage: "84%", category: "Crypto", price: 0.42, change: 2.1 },
  { symbol: "XTZUSD", tradingViewSymbol: "BINANCE:XTZUSDT", name: "Tezos", flag: "https://assets.coingecko.com/coins/images/976/small/Tezos-logo.png", percentage: "88%", category: "Crypto", price: 1.85, change: 4.2 },
  { symbol: "QTUMUSD", tradingViewSymbol: "BINANCE:QTUMUSDT", name: "Qtum", flag: "https://assets.coingecko.com/coins/images/684/large/Qtum_Logo_blue_CG.png", percentage: "85%", category: "Crypto", price: 4.65, change: 1.8 },
  { symbol: "RVNUSD", tradingViewSymbol: "BINANCE:RVNUSDT", name: "Ravencoin", flag: "https://assets.coingecko.com/coins/images/3412/small/ravencoin.png", percentage: "83%", category: "Crypto", price: 0.035, change: 5.7 },
  { symbol: "NMRUSD", tradingViewSymbol: "BINANCE:NMRUSDT", name: "Numeraire", flag: "https://assets.coingecko.com/coins/images/752/small/numeraire.png", percentage: "86%", category: "Crypto", price: 25.80, change: 4.9 },
  { symbol: "STORJUSD", tradingViewSymbol: "BINANCE:STORJUSDT", name: "Storj", flag: "https://assets.coingecko.com/coins/images/949/small/storj.png", percentage: "85%", category: "Crypto", price: 0.68, change: 3.2 },
  { symbol: "ANKRUSD", tradingViewSymbol: "BINANCE:ANKRUSDT", name: "Ankr", flag: "https://assets.coingecko.com/coins/images/4324/small/U85xTl2.png", percentage: "84%", category: "Crypto", price: 0.048, change: 2.6 },
  { symbol: "CELRUSD", tradingViewSymbol: "BINANCE:CELRUSDT", name: "Celer Network", flag: "https://assets.coingecko.com/coins/images/4379/large/Celr.png", percentage: "83%", category: "Crypto", price: 0.024, change: 5.8 },
  { symbol: "CKBUSD", tradingViewSymbol: "BINANCE:CKBUSDT", name: "Nervos Network", flag: "https://assets.coingecko.com/coins/images/9566/small/Nervos_White.png", percentage: "85%", category: "Crypto", price: 0.0095, change: 3.9 },
  { symbol: "FETUSD", tradingViewSymbol: "BINANCE:FETUSDT", name: "Fetch.ai", flag: "https://assets.coingecko.com/coins/images/5681/small/Fetch.jpg", percentage: "87%", category: "Crypto", price: 0.75, change: 6.2 },
  { symbol: "IOTXUSD", tradingViewSymbol: "BINANCE:IOTXUSDT", name: "IoTeX", flag: "https://assets.coingecko.com/coins/images/3334/small/iotex-logo.png", percentage: "84%", category: "Crypto", price: 0.052, change: 3.7 },
  { symbol: "LRCUSD", tradingViewSymbol: "BINANCE:LRCUSDT", name: "Loopring", flag: "https://assets.coingecko.com/coins/images/913/large/LRC.png", percentage: "86%", category: "Crypto", price: 0.48, change: 4.5 },
  { symbol: "OCEANUSD", tradingViewSymbol: "BINANCE:OCEANUSDT", name: "Ocean Protocol", flag: "https://assets.coingecko.com/coins/images/3687/small/ocean-protocol-logo.jpg", percentage: "85%", category: "Crypto", price: 0.82, change: 5.1 },
  { symbol: "RSRUSD", tradingViewSymbol: "BINANCE:RSRUSDT", name: "Reserve Rights", flag: "https://assets.coingecko.com/coins/images/8365/large/rsr.png", percentage: "83%", category: "Crypto", price: 0.0098, change: 6.7 },
  { symbol: "SKLUSD", tradingViewSymbol: "BINANCE:SKLUSDT", name: "SKALE", flag: "https://assets.coingecko.com/coins/images/13245/small/SKALE_token_300x300.png", percentage: "85%", category: "Crypto", price: 0.085, change: 3.8 },
  { symbol: "UMAUSD", tradingViewSymbol: "BINANCE:UMAUSDT", name: "UMA", flag: "https://assets.coingecko.com/coins/images/10951/large/UMA.png", percentage: "86%", category: "Crypto", price: 3.65, change: 2.9 },
  { symbol: "WOOUSD", tradingViewSymbol: "BINANCE:WOOUSDT", name: "WOO Network", flag: "https://assets.coingecko.com/coins/images/12921/small/w2UiemF__400x400.jpg", percentage: "87%", category: "Crypto", price: 0.45, change: 4.2 },
  { symbol: "BANDUSD", tradingViewSymbol: "BINANCE:BANDUSDT", name: "Band Protocol", flag: "https://assets.coingecko.com/coins/images/9545/small/Band_token_blue_violet_token.png", percentage: "85%", category: "Crypto", price: 2.15, change: 3.5 },
  { symbol: "KSMUSD", tradingViewSymbol: "BINANCE:KSMUSDT", name: "Kusama", flag: "https://assets.coingecko.com/coins/images/9568/small/m4zRhP5e_400x400.jpg", percentage: "88%", category: "Crypto", price: 45.30, change: 2.8 },
  { symbol: "RENUSD", tradingViewSymbol: "BINANCE:RENUSDT", name: "Ren", flag: "https://assets.coingecko.com/coins/images/3139/small/REN.png", percentage: "84%", category: "Crypto", price: 0.12, change: 5.4 },
  { symbol: "BALUSD", tradingViewSymbol: "BINANCE:BALUSDT", name: "Balancer", flag: "https://assets.coingecko.com/coins/images/11683/large/Balancer.png", percentage: "86%", category: "Crypto", price: 5.85, change: 3.9 },
  { symbol: "COTIUSD", tradingViewSymbol: "BINANCE:COTIUSDT", name: "COTI", flag: "https://assets.coingecko.com/coins/images/2962/large/Coti.png", percentage: "85%", category: "Crypto", price: 0.145, change: 4.1 },
  { symbol: "OGNUSD", tradingViewSymbol: "BINANCE:OGNUSDT", name: "Origin Protocol", flag: "https://assets.coingecko.com/coins/images/3296/large/op.jpg", percentage: "84%", category: "Crypto", price: 0.22, change: 2.7 },
  { symbol: "RLCUSD", tradingViewSymbol: "BINANCE:RLCUSDT", name: "iExec RLC", flag: "https://assets.coingecko.com/coins/images/646/large/pL1VuXm.png", percentage: "85%", category: "Crypto", price: 2.95, change: 4.6 },
  { symbol: "SRMUSD", tradingViewSymbol: "BINANCE:SRMUSDT", name: "Serum", flag: "https://assets.coingecko.com/coins/images/11970/large/serum-logo.png", percentage: "86%", category: "Crypto", price: 0.85, change: 5.8 },
  { symbol: "LPTUSD", tradingViewSymbol: "BINANCE:LPTUSDT", name: "Livepeer", flag: "https://assets.coingecko.com/coins/images/7137/large/logo-circle-green.png", percentage: "87%", category: "Crypto", price: 18.45, change: 3.2 },
  { symbol: "ALPHAUSD", tradingViewSymbol: "BINANCE:ALPHAUSDT", name: "Alpha Finance", flag: "https://assets.coingecko.com/coins/images/12738/large/AlphaToken_256x256.png", percentage: "84%", category: "Crypto", price: 0.18, change: 6.1 },
  { symbol: "CTSIUSD", tradingViewSymbol: "BINANCE:CTSIUSDT", name: "Cartesi", flag: "https://assets.coingecko.com/coins/images/11038/large/Cartesi_Logo.png", percentage: "86%", category: "Crypto", price: 0.35, change: 5.5 },
  { symbol: "ROSEUSD", tradingViewSymbol: "BINANCE:ROSEUSDT", name: "Oasis Network", flag: "https://assets.coingecko.com/coins/images/13162/large/rose.png", percentage: "85%", category: "Crypto", price: 0.125, change: 4.2 },
  { symbol: "GLMUSD", tradingViewSymbol: "BINANCE:GLMUSDT", name: "Golem", flag: "https://assets.coingecko.com/coins/images/542/large/Golem_Submark_Positive_RGB.png", percentage: "84%", category: "Crypto", price: 0.58, change: 3.6 },
  { symbol: "JASMYUSD", tradingViewSymbol: "BINANCE:JASMYUSDT", name: "JasmyCoin", flag: "https://assets.coingecko.com/coins/images/13876/large/JASMY200x200.jpg", percentage: "86%", category: "Crypto", price: 0.0145, change: 8.9 },
  { symbol: "PEOPLEUSD", tradingViewSymbol: "BINANCE:PEOPLEUSDT", name: "ConstitutionDAO", flag: "https://assets.coingecko.com/coins/images/21810/large/constitutiondao.jpg", percentage: "83%", category: "Crypto", price: 0.065, change: 12.4 },
  { symbol: "GALAUSD", tradingViewSymbol: "BINANCE:GALAUSDT", name: "Gala", flag: "https://assets.coingecko.com/coins/images/12493/large/GALA-COINGECKO.png", percentage: "85%", category: "Crypto", price: 0.048, change: 7.3 },
  { symbol: "INJUSD", tradingViewSymbol: "BINANCE:INJUSDT", name: "Injective", flag: "https://assets.coingecko.com/coins/images/12882/large/Secondary_Symbol.png", percentage: "89%", category: "Crypto", price: 28.50, change: 5.6 },
  { symbol: "MINAUSD", tradingViewSymbol: "BINANCE:MINAUSDT", name: "Mina Protocol", flag: "https://assets.coingecko.com/coins/images/15628/large/JM4_vQ34_400x400.png", percentage: "87%", category: "Crypto", price: 1.35, change: 3.8 },
  { symbol: "ARUSD", tradingViewSymbol: "BINANCE:ARUSDT", name: "Arweave", flag: "https://assets.coingecko.com/coins/images/4343/large/Arweave.png", percentage: "88%", category: "Crypto", price: 12.80, change: 4.5 },
  { symbol: "CFXUSD", tradingViewSymbol: "BINANCE:CFXUSDT", name: "Conflux", flag: "https://assets.coingecko.com/coins/images/13079/large/3vuYMbjN.png", percentage: "84%", category: "Crypto", price: 0.28, change: 6.2 },
  { symbol: "KLAYUSD", tradingViewSymbol: "BINANCE:KLAYUSDT", name: "Klaytn", flag: "https://assets.coingecko.com/coins/images/9672/large/klaytn.png", percentage: "86%", category: "Crypto", price: 0.42, change: 2.9 },
  
  // Forex - Major Pairs
  { symbol: "EURUSD", tradingViewSymbol: "FX:EURUSD", name: "EUR/USD", flag: "https://flagcdn.com/w40/eu.png", percentage: "94%", category: "Forex", price: 1.0856, change: 0.3 },
  { symbol: "GBPUSD", tradingViewSymbol: "FX:GBPUSD", name: "GBP/USD", flag: "https://flagcdn.com/w40/gb.png", percentage: "93%", category: "Forex", price: 1.2645, change: -0.2 },
  { symbol: "USDJPY", tradingViewSymbol: "FX:USDJPY", name: "USD/JPY", flag: "https://flagcdn.com/w40/jp.png", percentage: "92%", category: "Forex", price: 149.85, change: 0.5 },
  { symbol: "AUDUSD", tradingViewSymbol: "FX:AUDUSD", name: "AUD/USD", flag: "https://flagcdn.com/w40/au.png", percentage: "91%", category: "Forex", price: 0.6523, change: 0.8 },
  { symbol: "USDCHF", tradingViewSymbol: "FX:USDCHF", name: "USD/CHF", flag: "https://flagcdn.com/w40/ch.png", percentage: "92%", category: "Forex", price: 0.8745, change: 0.4 },
  { symbol: "NZDUSD", tradingViewSymbol: "FX:NZDUSD", name: "NZD/USD", flag: "https://flagcdn.com/w40/nz.png", percentage: "90%", category: "Forex", price: 0.5707, change: 1.2 },
  { symbol: "USDCAD", tradingViewSymbol: "FX:USDCAD", name: "USD/CAD", flag: "https://flagcdn.com/w40/ca.png", percentage: "91%", category: "Forex", price: 1.3654, change: -0.3 },
  
  // Forex - Cross Pairs
  { symbol: "EURGBP", tradingViewSymbol: "FX:EURGBP", name: "EUR/GBP", flag: "https://flagcdn.com/w40/eu.png", percentage: "93%", category: "Forex", price: 0.8584, change: 0.5 },
  { symbol: "EURJPY", tradingViewSymbol: "FX:EURJPY", name: "EUR/JPY", flag: "https://flagcdn.com/w40/eu.png", percentage: "92%", category: "Forex", price: 162.65, change: 0.8 },
  { symbol: "GBPJPY", tradingViewSymbol: "FX:GBPJPY", name: "GBP/JPY", flag: "https://flagcdn.com/w40/gb.png", percentage: "91%", category: "Forex", price: 189.45, change: 0.3 },
  { symbol: "EURAUD", tradingViewSymbol: "FX:EURAUD", name: "EUR/AUD", flag: "https://flagcdn.com/w40/eu.png", percentage: "90%", category: "Forex", price: 1.6642, change: -0.5 },
  { symbol: "EURCHF", tradingViewSymbol: "FX:EURCHF", name: "EUR/CHF", flag: "https://flagcdn.com/w40/eu.png", percentage: "91%", category: "Forex", price: 0.9494, change: 0.7 },
  { symbol: "GBPAUD", tradingViewSymbol: "FX:GBPAUD", name: "GBP/AUD", flag: "https://flagcdn.com/w40/gb.png", percentage: "89%", category: "Forex", price: 1.9385, change: 0.2 },
  { symbol: "GBPCHF", tradingViewSymbol: "FX:GBPCHF", name: "GBP/CHF", flag: "https://flagcdn.com/w40/gb.png", percentage: "90%", category: "Forex", price: 1.1056, change: 0.1 },
  { symbol: "AUDJPY", tradingViewSymbol: "FX:AUDJPY", name: "AUD/JPY", flag: "https://flagcdn.com/w40/au.png", percentage: "89%", category: "Forex", price: 97.75, change: 1.3 },
  { symbol: "NZDJPY", tradingViewSymbol: "FX:NZDJPY", name: "NZD/JPY", flag: "https://flagcdn.com/w40/nz.png", percentage: "88%", category: "Forex", price: 85.53, change: 1.7 },
  { symbol: "CHFJPY", tradingViewSymbol: "FX:CHFJPY", name: "CHF/JPY", flag: "https://flagcdn.com/w40/ch.png", percentage: "89%", category: "Forex", price: 171.35, change: 0.1 },
  { symbol: "CADJPY", tradingViewSymbol: "FX:CADJPY", name: "CAD/JPY", flag: "https://flagcdn.com/w40/ca.png", percentage: "88%", category: "Forex", price: 109.75, change: 0.8 },
  { symbol: "AUDCAD", tradingViewSymbol: "FX:AUDCAD", name: "AUD/CAD", flag: "https://flagcdn.com/w40/au.png", percentage: "87%", category: "Forex", price: 0.8906, change: 1.1 },
  { symbol: "AUDCHF", tradingViewSymbol: "FX:AUDCHF", name: "AUD/CHF", flag: "https://flagcdn.com/w40/au.png", percentage: "88%", category: "Forex", price: 0.5704, change: 1.2 },
  { symbol: "AUDNZD", tradingViewSymbol: "FX:AUDNZD", name: "AUD/NZD", flag: "https://flagcdn.com/w40/au.png", percentage: "87%", category: "Forex", price: 1.1429, change: -0.4 },
  { symbol: "CADCHF", tradingViewSymbol: "FX:CADCHF", name: "CAD/CHF", flag: "https://flagcdn.com/w40/ca.png", percentage: "86%", category: "Forex", price: 0.6404, change: 0.7 },
  { symbol: "EURNZD", tradingViewSymbol: "FX:EURNZD", name: "EUR/NZD", flag: "https://flagcdn.com/w40/eu.png", percentage: "88%", category: "Forex", price: 1.9022, change: -0.8 },
  { symbol: "EURCAD", tradingViewSymbol: "FX:EURCAD", name: "EUR/CAD", flag: "https://flagcdn.com/w40/eu.png", percentage: "89%", category: "Forex", price: 1.4824, change: 0.0 },
  { symbol: "GBPCAD", tradingViewSymbol: "FX:GBPCAD", name: "GBP/CAD", flag: "https://flagcdn.com/w40/gb.png", percentage: "88%", category: "Forex", price: 1.7267, change: -0.5 },
  { symbol: "GBPNZD", tradingViewSymbol: "FX:GBPNZD", name: "GBP/NZD", flag: "https://flagcdn.com/w40/gb.png", percentage: "87%", category: "Forex", price: 2.2153, change: -1.4 },
  { symbol: "NZDCAD", tradingViewSymbol: "FX:NZDCAD", name: "NZD/CAD", flag: "https://flagcdn.com/w40/nz.png", percentage: "86%", category: "Forex", price: 0.7793, change: 0.9 },
  { symbol: "NZDCHF", tradingViewSymbol: "FX:NZDCHF", name: "NZD/CHF", flag: "https://flagcdn.com/w40/nz.png", percentage: "87%", category: "Forex", price: 0.4991, change: 1.6 },
  
  // Forex - Exotic Pairs
  { symbol: "USDSGD", tradingViewSymbol: "FX:USDSGD", name: "USD/SGD", flag: "https://flagcdn.com/w40/sg.png", percentage: "90%", category: "Forex", price: 1.3345, change: 0.2 },
  { symbol: "USDHKD", tradingViewSymbol: "FX:USDHKD", name: "USD/HKD", flag: "https://flagcdn.com/w40/hk.png", percentage: "89%", category: "Forex", price: 7.8045, change: 0.0 },
  { symbol: "USDMXN", tradingViewSymbol: "FX:USDMXN", name: "USD/MXN", flag: "https://flagcdn.com/w40/mx.png", percentage: "88%", category: "Forex", price: 18.35, change: -0.4 },
  { symbol: "USDZAR", tradingViewSymbol: "FX:USDZAR", name: "USD/ZAR", flag: "https://flagcdn.com/w40/za.png", percentage: "87%", category: "Forex", price: 18.15, change: 0.9 },
  { symbol: "USDTRY", tradingViewSymbol: "FX:USDTRY", name: "USD/TRY", flag: "https://flagcdn.com/w40/tr.png", percentage: "86%", category: "Forex", price: 34.25, change: 0.7 },
  { symbol: "USDSEK", tradingViewSymbol: "FX:USDSEK", name: "USD/SEK", flag: "https://flagcdn.com/w40/se.png", percentage: "89%", category: "Forex", price: 10.85, change: 0.3 },
  { symbol: "USDNOK", tradingViewSymbol: "FX:USDNOK", name: "USD/NOK", flag: "https://flagcdn.com/w40/no.png", percentage: "88%", category: "Forex", price: 11.04, change: 0.5 },
  { symbol: "USDDKK", tradingViewSymbol: "FX:USDDKK", name: "USD/DKK", flag: "https://flagcdn.com/w40/dk.png", percentage: "87%", category: "Forex", price: 7.08, change: 0.4 },
  { symbol: "USDPLN", tradingViewSymbol: "FX:USDPLN", name: "USD/PLN", flag: "https://flagcdn.com/w40/pl.png", percentage: "86%", category: "Forex", price: 4.02, change: 0.2 },
  { symbol: "USDHUF", tradingViewSymbol: "FX:USDHUF", name: "USD/HUF", flag: "https://flagcdn.com/w40/hu.png", percentage: "85%", category: "Forex", price: 365.50, change: 0.6 },
  { symbol: "USDCZK", tradingViewSymbol: "FX:USDCZK", name: "USD/CZK", flag: "https://flagcdn.com/w40/cz.png", percentage: "86%", category: "Forex", price: 22.85, change: 0.3 },
  { symbol: "USDTHB", tradingViewSymbol: "FX:USDTHB", name: "USD/THB", flag: "https://flagcdn.com/w40/th.png", percentage: "87%", category: "Forex", price: 33.75, change: 0.1 },
  { symbol: "USDIDR", tradingViewSymbol: "FX:USDIDR", name: "USD/IDR", flag: "https://flagcdn.com/w40/id.png", percentage: "85%", category: "Forex", price: 15650.00, change: 0.2 },
  { symbol: "USDKRW", tradingViewSymbol: "FX:USDKRW", name: "USD/KRW", flag: "https://flagcdn.com/w40/kr.png", percentage: "88%", category: "Forex", price: 1365.50, change: -0.1 },
  { symbol: "USDCNH", tradingViewSymbol: "FX:USDCNH", name: "USD/CNH", flag: "https://flagcdn.com/w40/cn.png", percentage: "89%", category: "Forex", price: 7.24, change: 0.2 },
  { symbol: "USDINR", tradingViewSymbol: "FX:USDINR", name: "USD/INR", flag: "https://flagcdn.com/w40/in.png", percentage: "87%", category: "Forex", price: 83.25, change: 0.1 },
  { symbol: "USDBRL", tradingViewSymbol: "FX:USDBRL", name: "USD/BRL", flag: "https://flagcdn.com/w40/br.png", percentage: "86%", category: "Forex", price: 5.85, change: -0.3 },
  { symbol: "USDARS", tradingViewSymbol: "FX:USDARS", name: "USD/ARS", flag: "https://flagcdn.com/w40/ar.png", percentage: "84%", category: "Forex", price: 985.50, change: 1.2 },
  { symbol: "USDCLP", tradingViewSymbol: "FX:USDCLP", name: "USD/CLP", flag: "https://flagcdn.com/w40/cl.png", percentage: "85%", category: "Forex", price: 975.00, change: 0.4 },
  { symbol: "EURSGD", tradingViewSymbol: "FX:EURSGD", name: "EUR/SGD", flag: "https://flagcdn.com/w40/eu.png", percentage: "88%", category: "Forex", price: 1.4484, change: 0.5 },
  { symbol: "GBPSGD", tradingViewSymbol: "FX:GBPSGD", name: "GBP/SGD", flag: "https://flagcdn.com/w40/gb.png", percentage: "87%", category: "Forex", price: 1.6874, change: 0.0 },
  { symbol: "EURHUF", tradingViewSymbol: "FX:EURHUF", name: "EUR/HUF", flag: "https://flagcdn.com/w40/eu.png", percentage: "85%", category: "Forex", price: 396.85, change: 0.9 },
  { symbol: "EURPLN", tradingViewSymbol: "FX:EURPLN", name: "EUR/PLN", flag: "https://flagcdn.com/w40/eu.png", percentage: "86%", category: "Forex", price: 4.36, change: 0.5 },
  { symbol: "EURTRY", tradingViewSymbol: "FX:EURTRY", name: "EUR/TRY", flag: "https://flagcdn.com/w40/eu.png", percentage: "84%", category: "Forex", price: 37.18, change: 1.0 },
  { symbol: "EURSEK", tradingViewSymbol: "FX:EURSEK", name: "EUR/SEK", flag: "https://flagcdn.com/w40/eu.png", percentage: "87%", category: "Forex", price: 11.78, change: 0.6 },
  { symbol: "EURNOK", tradingViewSymbol: "FX:EURNOK", name: "EUR/NOK", flag: "https://flagcdn.com/w40/eu.png", percentage: "86%", category: "Forex", price: 11.98, change: 0.8 },
  { symbol: "EURDKK", tradingViewSymbol: "FX:EURDKK", name: "EUR/DKK", flag: "https://flagcdn.com/w40/eu.png", percentage: "88%", category: "Forex", price: 7.46, change: 0.0 },
  { symbol: "EURZAR", tradingViewSymbol: "FX:EURZAR", name: "EUR/ZAR", flag: "https://flagcdn.com/w40/eu.png", percentage: "85%", category: "Forex", price: 19.70, change: 1.2 },
  
  // Commodities
  { symbol: "GOLD", tradingViewSymbol: "TVC:GOLD", name: "Gold", flag: "https://img.icons8.com/color/96/000000/gold-bars.png", percentage: "96%", category: "Commodity", price: 2850.00, change: 1.5 },
  { symbol: "SILVER", tradingViewSymbol: "TVC:SILVER", name: "Silver", flag: "https://img.icons8.com/color/96/000000/bar-chart.png", percentage: "94%", category: "Commodity", price: 32.45, change: 2.1 },
  { symbol: "USOIL", tradingViewSymbol: "TVC:USOIL", name: "Crude Oil", flag: "https://img.icons8.com/color/96/000000/oil-industry.png", percentage: "90%", category: "Commodity", price: 78.65, change: -1.2 },
  { symbol: "UKOIL", tradingViewSymbol: "TVC:UKOIL", name: "Brent Oil", flag: "https://img.icons8.com/color/96/000000/gas-station.png", percentage: "89%", category: "Commodity", price: 82.30, change: -0.8 },
  
  // Stocks - US Tech (Magnificent 7 + More)
  { symbol: "AAPL", tradingViewSymbol: "NASDAQ:AAPL", name: "Apple Inc", flag: "https://logo.clearbit.com/apple.com", percentage: "95%", category: "Stocks", price: 185.50, change: 1.8 },
  { symbol: "MSFT", tradingViewSymbol: "NASDAQ:MSFT", name: "Microsoft", flag: "https://logo.clearbit.com/microsoft.com", percentage: "96%", category: "Stocks", price: 412.80, change: 1.2 },
  { symbol: "GOOGL", tradingViewSymbol: "NASDAQ:GOOGL", name: "Alphabet", flag: "https://logo.clearbit.com/google.com", percentage: "94%", category: "Stocks", price: 142.30, change: 2.3 },
  { symbol: "AMZN", tradingViewSymbol: "NASDAQ:AMZN", name: "Amazon", flag: "https://logo.clearbit.com/amazon.com", percentage: "93%", category: "Stocks", price: 178.20, change: 0.9 },
  { symbol: "META", tradingViewSymbol: "NASDAQ:META", name: "Meta", flag: "https://logo.clearbit.com/meta.com", percentage: "94%", category: "Stocks", price: 485.20, change: 2.7 },
  { symbol: "NVDA", tradingViewSymbol: "NASDAQ:NVDA", name: "NVIDIA", flag: "https://logo.clearbit.com/nvidia.com", percentage: "96%", category: "Stocks", price: 875.40, change: 5.2 },
  { symbol: "TSLA", tradingViewSymbol: "NASDAQ:TSLA", name: "Tesla", flag: "https://logo.clearbit.com/tesla.com", percentage: "92%", category: "Stocks", price: 248.75, change: 3.5 },
  { symbol: "AMD", tradingViewSymbol: "NASDAQ:AMD", name: "AMD", flag: "https://logo.clearbit.com/amd.com", percentage: "93%", category: "Stocks", price: 165.30, change: 3.1 },
  { symbol: "NFLX", tradingViewSymbol: "NASDAQ:NFLX", name: "Netflix", flag: "https://logo.clearbit.com/netflix.com", percentage: "91%", category: "Stocks", price: 612.80, change: 1.5 },
  { symbol: "INTC", tradingViewSymbol: "NASDAQ:INTC", name: "Intel", flag: "https://logo.clearbit.com/intel.com", percentage: "89%", category: "Stocks", price: 42.50, change: -0.8 },
  { symbol: "ADBE", tradingViewSymbol: "NASDAQ:ADBE", name: "Adobe", flag: "https://logo.clearbit.com/adobe.com", percentage: "92%", category: "Stocks", price: 565.40, change: 1.9 },
  { symbol: "CRM", tradingViewSymbol: "NYSE:CRM", name: "Salesforce", flag: "https://logo.clearbit.com/salesforce.com", percentage: "91%", category: "Stocks", price: 285.70, change: 2.2 },
  { symbol: "ORCL", tradingViewSymbol: "NYSE:ORCL", name: "Oracle", flag: "https://logo.clearbit.com/oracle.com", percentage: "90%", category: "Stocks", price: 125.80, change: 1.4 },
  { symbol: "CSCO", tradingViewSymbol: "NASDAQ:CSCO", name: "Cisco", flag: "https://logo.clearbit.com/cisco.com", percentage: "89%", category: "Stocks", price: 56.30, change: 0.6 },
  { symbol: "IBM", tradingViewSymbol: "NYSE:IBM", name: "IBM", flag: "https://logo.clearbit.com/ibm.com", percentage: "88%", category: "Stocks", price: 185.40, change: 0.9 },
  { symbol: "QCOM", tradingViewSymbol: "NASDAQ:QCOM", name: "Qualcomm", flag: "https://logo.clearbit.com/qualcomm.com", percentage: "91%", category: "Stocks", price: 168.90, change: 2.4 },
  { symbol: "AVGO", tradingViewSymbol: "NASDAQ:AVGO", name: "Broadcom", flag: "https://logo.clearbit.com/broadcom.com", percentage: "92%", category: "Stocks", price: 1285.50, change: 3.2 },
  
  // Finance & Banking
  { symbol: "JPM", tradingViewSymbol: "NYSE:JPM", name: "JPMorgan", flag: "https://logo.clearbit.com/jpmorganchase.com", percentage: "94%", category: "Stocks", price: 178.50, change: 1.3 },
  { symbol: "BAC", tradingViewSymbol: "NYSE:BAC", name: "Bank of America", flag: "https://logo.clearbit.com/bankofamerica.com", percentage: "92%", category: "Stocks", price: 36.80, change: 0.9 },
  { symbol: "WFC", tradingViewSymbol: "NYSE:WFC", name: "Wells Fargo", flag: "https://logo.clearbit.com/wellsfargo.com", percentage: "91%", category: "Stocks", price: 58.40, change: 1.1 },
  { symbol: "GS", tradingViewSymbol: "NYSE:GS", name: "Goldman Sachs", flag: "https://logo.clearbit.com/goldmansachs.com", percentage: "93%", category: "Stocks", price: 425.30, change: 1.8 },
  { symbol: "MS", tradingViewSymbol: "NYSE:MS", name: "Morgan Stanley", flag: "https://logo.clearbit.com/morganstanley.com", percentage: "92%", category: "Stocks", price: 98.70, change: 1.5 },
  { symbol: "C", tradingViewSymbol: "NYSE:C", name: "Citigroup", flag: "https://logo.clearbit.com/citigroup.com", percentage: "90%", category: "Stocks", price: 62.50, change: 0.7 },
  { symbol: "AXP", tradingViewSymbol: "NYSE:AXP", name: "American Express", flag: "https://logo.clearbit.com/americanexpress.com", percentage: "91%", category: "Stocks", price: 215.80, change: 1.9 },
  { symbol: "V", tradingViewSymbol: "NYSE:V", name: "Visa", flag: "https://logo.clearbit.com/visa.com", percentage: "95%", category: "Stocks", price: 275.40, change: 2.1 },
  { symbol: "MA", tradingViewSymbol: "NYSE:MA", name: "Mastercard", flag: "https://logo.clearbit.com/mastercard.com", percentage: "94%", category: "Stocks", price: 445.60, change: 1.7 },
  { symbol: "PYPL", tradingViewSymbol: "NASDAQ:PYPL", name: "PayPal", flag: "https://logo.clearbit.com/paypal.com", percentage: "89%", category: "Stocks", price: 68.30, change: -0.5 },
  
  // Consumer & Retail
  { symbol: "WMT", tradingViewSymbol: "NYSE:WMT", name: "Walmart", flag: "https://logo.clearbit.com/walmart.com", percentage: "93%", category: "Stocks", price: 168.50, change: 0.8 },
  { symbol: "TGT", tradingViewSymbol: "NYSE:TGT", name: "Target", flag: "https://logo.clearbit.com/target.com", percentage: "90%", category: "Stocks", price: 145.70, change: 1.2 },
  { symbol: "HD", tradingViewSymbol: "NYSE:HD", name: "Home Depot", flag: "https://logo.clearbit.com/homedepot.com", percentage: "92%", category: "Stocks", price: 385.20, change: 1.5 },
  { symbol: "KO", tradingViewSymbol: "NYSE:KO", name: "Coca-Cola", flag: "https://logo.clearbit.com/coca-cola.com", percentage: "92%", category: "Stocks", price: 62.40, change: 0.6 },
  { symbol: "PEP", tradingViewSymbol: "NASDAQ:PEP", name: "PepsiCo", flag: "https://logo.clearbit.com/pepsico.com", percentage: "91%", category: "Stocks", price: 175.30, change: 0.9 },
  { symbol: "MCD", tradingViewSymbol: "NYSE:MCD", name: "McDonald's", flag: "https://logo.clearbit.com/mcdonalds.com", percentage: "93%", category: "Stocks", price: 295.60, change: 1.3 },
  { symbol: "SBUX", tradingViewSymbol: "NASDAQ:SBUX", name: "Starbucks", flag: "https://logo.clearbit.com/starbucks.com", percentage: "90%", category: "Stocks", price: 98.50, change: -0.4 },
  { symbol: "NKE", tradingViewSymbol: "NYSE:NKE", name: "Nike", flag: "https://logo.clearbit.com/nike.com", percentage: "91%", category: "Stocks", price: 108.70, change: 1.8 },
  { symbol: "DIS", tradingViewSymbol: "NYSE:DIS", name: "Disney", flag: "https://logo.clearbit.com/disney.com", percentage: "92%", category: "Stocks", price: 112.40, change: 2.5 },
  { symbol: "COST", tradingViewSymbol: "NASDAQ:COST", name: "Costco", flag: "https://logo.clearbit.com/costco.com", percentage: "94%", category: "Stocks", price: 725.80, change: 1.7 },
  
  // Healthcare & Pharma
  { symbol: "JNJ", tradingViewSymbol: "NYSE:JNJ", name: "Johnson & Johnson", flag: "https://logo.clearbit.com/jnj.com", percentage: "94%", category: "Stocks", price: 158.30, change: 0.7 },
  { symbol: "PFE", tradingViewSymbol: "NYSE:PFE", name: "Pfizer", flag: "https://logo.clearbit.com/pfizer.com", percentage: "91%", category: "Stocks", price: 28.50, change: 1.2 },
  { symbol: "UNH", tradingViewSymbol: "NYSE:UNH", name: "UnitedHealth", flag: "https://logo.clearbit.com/unitedhealthgroup.com", percentage: "95%", category: "Stocks", price: 512.80, change: 1.9 },
  { symbol: "CVS", tradingViewSymbol: "NYSE:CVS", name: "CVS Health", flag: "https://logo.clearbit.com/cvs.com", percentage: "90%", category: "Stocks", price: 72.60, change: 0.5 },
  { symbol: "ABBV", tradingViewSymbol: "NYSE:ABBV", name: "AbbVie", flag: "https://logo.clearbit.com/abbvie.com", percentage: "92%", category: "Stocks", price: 168.90, change: 1.4 },
  { symbol: "MRK", tradingViewSymbol: "NYSE:MRK", name: "Merck", flag: "https://logo.clearbit.com/merck.com", percentage: "91%", category: "Stocks", price: 115.40, change: 0.9 },
  { symbol: "TMO", tradingViewSymbol: "NYSE:TMO", name: "Thermo Fisher", flag: "https://logo.clearbit.com/thermofisher.com", percentage: "93%", category: "Stocks", price: 545.70, change: 1.6 },
  { symbol: "LLY", tradingViewSymbol: "NYSE:LLY", name: "Eli Lilly", flag: "https://logo.clearbit.com/lilly.com", percentage: "94%", category: "Stocks", price: 685.30, change: 3.2 },
  
  // Energy & Industrial
  { symbol: "XOM", tradingViewSymbol: "NYSE:XOM", name: "Exxon Mobil", flag: "https://logo.clearbit.com/exxonmobil.com", percentage: "92%", category: "Stocks", price: 112.50, change: 1.8 },
  { symbol: "CVX", tradingViewSymbol: "NYSE:CVX", name: "Chevron", flag: "https://logo.clearbit.com/chevron.com", percentage: "91%", category: "Stocks", price: 158.70, change: 1.5 },
  { symbol: "COP", tradingViewSymbol: "NYSE:COP", name: "ConocoPhillips", flag: "https://logo.clearbit.com/conocophillips.com", percentage: "90%", category: "Stocks", price: 118.40, change: 2.1 },
  { symbol: "SLB", tradingViewSymbol: "NYSE:SLB", name: "Schlumberger", flag: "https://logo.clearbit.com/slb.com", percentage: "89%", category: "Stocks", price: 48.30, change: 1.9 },
  { symbol: "BA", tradingViewSymbol: "NYSE:BA", name: "Boeing", flag: "https://logo.clearbit.com/boeing.com", percentage: "90%", category: "Stocks", price: 178.50, change: 2.7 },
  { symbol: "CAT", tradingViewSymbol: "NYSE:CAT", name: "Caterpillar", flag: "https://logo.clearbit.com/caterpillar.com", percentage: "91%", category: "Stocks", price: 325.80, change: 1.3 },
  { symbol: "GE", tradingViewSymbol: "NYSE:GE", name: "General Electric", flag: "https://logo.clearbit.com/ge.com", percentage: "89%", category: "Stocks", price: 142.60, change: 2.2 },
  
  // Automotive
  { symbol: "F", tradingViewSymbol: "NYSE:F", name: "Ford", flag: "https://logo.clearbit.com/ford.com", percentage: "88%", category: "Stocks", price: 12.40, change: 1.6 },
  { symbol: "GM", tradingViewSymbol: "NYSE:GM", name: "General Motors", flag: "https://logo.clearbit.com/gm.com", percentage: "89%", category: "Stocks", price: 38.70, change: 1.9 },
  { symbol: "RIVN", tradingViewSymbol: "NASDAQ:RIVN", name: "Rivian", flag: "https://logo.clearbit.com/rivian.com", percentage: "86%", category: "Stocks", price: 14.50, change: 4.2 },
  
  // Chinese Stocks
  { symbol: "BABA", tradingViewSymbol: "NYSE:BABA", name: "Alibaba", flag: "https://logo.clearbit.com/alibaba.com", percentage: "91%", category: "Stocks", price: 88.50, change: 2.8 },
  { symbol: "BIDU", tradingViewSymbol: "NASDAQ:BIDU", name: "Baidu", flag: "https://logo.clearbit.com/baidu.com", percentage: "88%", category: "Stocks", price: 102.30, change: 1.9 },
  { symbol: "JD", tradingViewSymbol: "NASDAQ:JD", name: "JD.com", flag: "https://logo.clearbit.com/jd.com", percentage: "89%", category: "Stocks", price: 32.40, change: 2.5 },
  { symbol: "PDD", tradingViewSymbol: "NASDAQ:PDD", name: "PDD Holdings", flag: "https://logo.clearbit.com/pinduoduo.com", percentage: "90%", category: "Stocks", price: 138.70, change: 3.1 },
  { symbol: "NIO", tradingViewSymbol: "NYSE:NIO", name: "NIO", flag: "https://logo.clearbit.com/nio.com", percentage: "87%", category: "Stocks", price: 6.80, change: 4.5 },
  
  // Asia Tech
  { symbol: "TSM", tradingViewSymbol: "NYSE:TSM", name: "Taiwan Semi", flag: "https://logo.clearbit.com/tsmc.com", percentage: "95%", category: "Stocks", price: 142.80, change: 2.9 },
  { symbol: "ASML", tradingViewSymbol: "NASDAQ:ASML", name: "ASML", flag: "https://logo.clearbit.com/asml.com", percentage: "94%", category: "Stocks", price: 785.40, change: 2.6 },
  { symbol: "SONY", tradingViewSymbol: "NYSE:SONY", name: "Sony", flag: "https://logo.clearbit.com/sony.com", percentage: "91%", category: "Stocks", price: 92.50, change: 1.8 },
  { symbol: "TM", tradingViewSymbol: "NYSE:TM", name: "Toyota", flag: "https://logo.clearbit.com/toyota.com", percentage: "92%", category: "Stocks", price: 185.30, change: 1.5 },
  
  // Crypto & AI Stocks
  { symbol: "COIN", tradingViewSymbol: "NASDAQ:COIN", name: "Coinbase", flag: "https://logo.clearbit.com/coinbase.com", percentage: "89%", category: "Stocks", price: 215.40, change: 5.8 },
  { symbol: "MSTR", tradingViewSymbol: "NASDAQ:MSTR", name: "MicroStrategy", flag: "https://logo.clearbit.com/microstrategy.com", percentage: "88%", category: "Stocks", price: 1485.30, change: 6.2 },
  { symbol: "PLTR", tradingViewSymbol: "NYSE:PLTR", name: "Palantir", flag: "https://logo.clearbit.com/palantir.com", percentage: "91%", category: "Stocks", price: 28.50, change: 4.8 },
  { symbol: "SNOW", tradingViewSymbol: "NYSE:SNOW", name: "Snowflake", flag: "https://logo.clearbit.com/snowflake.com", percentage: "89%", category: "Stocks", price: 165.80, change: 3.2 },
  { symbol: "CRWD", tradingViewSymbol: "NASDAQ:CRWD", name: "CrowdStrike", flag: "https://logo.clearbit.com/crowdstrike.com", percentage: "92%", category: "Stocks", price: 285.70, change: 3.8 },
  
  // Semiconductor
  { symbol: "MU", tradingViewSymbol: "NASDAQ:MU", name: "Micron", flag: "https://logo.clearbit.com/micron.com", percentage: "91%", category: "Stocks", price: 92.50, change: 2.9 },
  { symbol: "AMAT", tradingViewSymbol: "NASDAQ:AMAT", name: "Applied Materials", flag: "https://logo.clearbit.com/appliedmaterials.com", percentage: "90%", category: "Stocks", price: 185.30, change: 2.4 },
  { symbol: "LRCX", tradingViewSymbol: "NASDAQ:LRCX", name: "Lam Research", flag: "https://logo.clearbit.com/lamresearch.com", percentage: "89%", category: "Stocks", price: 785.60, change: 2.1 },
  
  // E-commerce & Delivery
  { symbol: "UBER", tradingViewSymbol: "NYSE:UBER", name: "Uber", flag: "https://logo.clearbit.com/uber.com", percentage: "91%", category: "Stocks", price: 68.50, change: 2.6 },
  { symbol: "DASH", tradingViewSymbol: "NASDAQ:DASH", name: "DoorDash", flag: "https://logo.clearbit.com/doordash.com", percentage: "89%", category: "Stocks", price: 125.70, change: 3.4 },
  { symbol: "ABNB", tradingViewSymbol: "NASDAQ:ABNB", name: "Airbnb", flag: "https://logo.clearbit.com/airbnb.com", percentage: "90%", category: "Stocks", price: 142.80, change: 2.1 },
];

export function MobileTradingDashboard() {
  const navigate = useNavigate();
  const { prices, getPrice } = usePrices(); // ✅ FIXED: Only destructure what exists
  
  // Get user info from localStorage
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);
  
  useEffect(() => {
    const token = localStorage.getItem('investoft_token');
    const userId = localStorage.getItem('investoft_user_id');
    const userEmail = localStorage.getItem('investoft_user_email');
    
    if (token && userId) {
      setIsAuthenticated(true);
      setUser({
        id: userId,
        email: userEmail,
        demo_balance: 10000 // Default demo balance
      });
    }
  }, []);
  
  // Handle image logo errors with fallback
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const target = e.target as HTMLImageElement;
    // Fallback to a generic stock/crypto icon
    target.src = "https://img.icons8.com/fluency/96/stocks.png";
  };
  
  const [accountType, setAccountType] = useState<"Demo" | "Real">("Demo");
  const [balance, setBalance] = useState(user?.demo_balance ?? 10000);
  const [selectedAsset, setSelectedAsset] = useState<Asset>(ASSETS[0]); // Bitcoin (BTC/USD) as default
  const [amount, setAmount] = useState(10);
  const [duration, setDuration] = useState(60); // Default 1 minute
  const [activeTrades, setActiveTrades] = useState<ActiveTrade[]>([]);
  const [closedTrades, setClosedTrades] = useState<ActiveTrade[]>([]);
  const [isTrading, setIsTrading] = useState(false);
  const [activeNav, setActiveNav] = useState("platform");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);
  
  // Crypto from CoinGecko API (3500+ cryptocurrencies)
  const [allCryptos, setAllCryptos] = useState<Asset[]>([]);
  const [isLoadingCryptos, setIsLoadingCryptos] = useState(false);
  
  // UI states
  const [showAccountDropdown, setShowAccountDropdown] = useState(false);
  const [showAssetSelector, setShowAssetSelector] = useState(false);
  const [showDurationSelector, setShowDurationSelector] = useState(false);
  const [showAmountSelector, setShowAmountSelector] = useState(false);
  
  // Robot states
  const [robotStatus, setRobotStatus] = useState<RobotStatus>({
    isRunning: false,
    totalTrades: 0,
    winRate: 0,
    profit: 0,
    currentSignal: null
  });
  const [robotSettings, setRobotSettings] = useState({
    initialAmount: 10,
    duration: 60,
    profitLimit: 20,
    stopLoss: 50,
    maxTrades: 10,
    autoSwitch: true
  });
  
  // Get current price from context or fallback
  const priceData = prices[selectedAsset.symbol];
  const [chartPrice, setChartPrice] = useState<number | null>(null); // Real-time price from TradingView chart
  const currentPrice = chartPrice || priceData?.price || selectedAsset.price || 0;
  const [priceChange, setPriceChange] = useState(0);
  const [priceChangePercent, setPriceChangePercent] = useState(0);
  const [lastPrice, setLastPrice] = useState(currentPrice);

  // Sync balance from user context when user data loads
  useEffect(() => {
    if (user) {
      if (accountType === "Demo") {
        setBalance(user.demo_balance ?? 10000);
      } else {
        setBalance(user.balance ?? 0);
      }
    }
  }, [user, accountType]);

  // Reset chart price when asset changes
  useEffect(() => {
    console.log(`🔄 Asset changed to ${selectedAsset.symbol}, resetting chart price...`);
    setChartPrice(null);
  }, [selectedAsset.symbol]);

  // Handle price update from TradingView chart
  const handleChartPriceUpdate = (price: number) => {
    console.log(`📈 Chart price update for ${selectedAsset.symbol}: $${price.toFixed(2)}`);
    setChartPrice(price);
  };

  // Calculate price change
  useEffect(() => {
    if (currentPrice > 0 && lastPrice > 0) {
      const change = currentPrice - lastPrice;
      const changePercent = (change / lastPrice) * 100;
      setPriceChange(change);
      setPriceChangePercent(changePercent);
    }
    setLastPrice(currentPrice);
  }, [currentPrice]);

  // ❌ DISABLED: CoinGecko fetch causing CORS errors
  // Using static ASSETS list instead
  useEffect(() => {
    console.log("ℹ️ Using static crypto list (CoinGecko fetch disabled)");
    setIsLoadingCryptos(false);
  }, []);

  // Update active trades countdown and results
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      
      setActiveTrades((prev) => {
        const updated = prev.map((trade) => {
          const remaining = Math.max(0, Math.ceil((trade.endTime - now) / 1000));
          const updatedTrade = {
            ...trade,
            remainingSeconds: remaining,
            currentPrice: currentPrice,
          };

          // Calculate profit
          if (trade.direction === "UP") {
            updatedTrade.profit = currentPrice > trade.entryPrice 
              ? ((currentPrice - trade.entryPrice) / trade.entryPrice) * trade.amount
              : -((trade.entryPrice - currentPrice) / trade.entryPrice) * trade.amount;
          } else {
            updatedTrade.profit = currentPrice < trade.entryPrice
              ? ((trade.entryPrice - currentPrice) / trade.entryPrice) * trade.amount
              : -((currentPrice - trade.entryPrice) / trade.entryPrice) * trade.amount;
          }

          // Close trade if time is up
          if (remaining === 0 && trade.status === "active") {
            const isWin = 
              (trade.direction === "UP" && currentPrice > trade.entryPrice) ||
              (trade.direction === "DOWN" && currentPrice < trade.entryPrice);

            updatedTrade.status = isWin ? "win" : "loss";
            
            // Update balance
            if (isWin) {
              const payout = trade.amount * 1.85; // 85% profit
              setBalance((b) => b + payout);
              updatedTrade.profit = payout - trade.amount;
            } else {
              updatedTrade.profit = -trade.amount;
            }

            // Move to closed trades after 3 seconds
            setTimeout(() => {
              setActiveTrades((current) => current.filter((t) => t.id !== trade.id));
              setClosedTrades((closed) => [updatedTrade, ...closed]);
            }, 3000);
          }

          return updatedTrade;
        });

        return updated;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [currentPrice]);

  // Format balance
  const formatBalance = (value: number) => {
    return `$${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Format price
  const formatPrice = (price: number) => {
    if (price === 0) return "Loading...";
    
    if (selectedAsset.symbol.includes("JPY")) {
      return price.toFixed(3);
    } else if (selectedAsset.category === "Forex") {
      return price.toFixed(5);
    } else if (selectedAsset.category === "Crypto") {
      return price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    } else {
      return price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
  };

  // Format price change
  const formatPriceChange = (change: number) => {
    const sign = change >= 0 ? "+" : "";
    return `${sign}${change.toFixed(2)}`;
  };

  // Handle trade
  const handleTrade = async (direction: "UP" | "DOWN") => {
    if (amount > balance) {
      alert("Saldo tidak mencukupi!");
      return;
    }
    
    if (currentPrice === 0) {
      alert("Menunggu harga real-time...");
      return;
    }
    
    if (isTrading) {
      return;
    }
    
    setIsTrading(true);
    
    try {
      const tradeId = `trade_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const now = Date.now();
      const endTime = now + (duration * 1000);
      
      const newTrade: ActiveTrade = {
        id: tradeId,
        symbol: selectedAsset.symbol,
        asset: selectedAsset.name,
        direction,
        amount,
        duration,
        entryPrice: currentPrice,
        startTime: now,
        endTime,
        remainingSeconds: duration,
        currentPrice,
        profit: 0,
        status: "active"
      };
      
      setBalance(prev => prev - amount);
      setActiveTrades(prev => [...prev, newTrade]);
      
      console.log(`✅ Trade opened:`, newTrade);
      
    } catch (error) {
      console.error("❌ Trade error:", error);
      alert("Gagal membuka trade!");
    } finally {
      setIsTrading(false);
    }
  };

  // Get duration label
  const getDurationLabel = () => {
    const found = DURATIONS.find(d => d.value === duration);
    return found ? found.label : "1m";
  };

  // Preset amounts
  const AMOUNT_PRESETS = [1, 5, 10, 25, 50, 100, 250, 500, 1000, 2500, 5000, 10000];

  // Adjust amount
  const adjustAmount = (delta: number) => {
    const currentIndex = AMOUNT_PRESETS.findIndex(preset => preset >= amount);
    
    if (delta > 0) {
      if (currentIndex < AMOUNT_PRESETS.length - 1) {
        setAmount(AMOUNT_PRESETS[currentIndex === -1 ? 0 : Math.min(currentIndex + 1, AMOUNT_PRESETS.length - 1)]);
      }
    } else {
      if (currentIndex > 0) {
        setAmount(AMOUNT_PRESETS[Math.max(0, currentIndex - 1)]);
      } else if (amount > 1) {
        setAmount(Math.max(1, amount - 1));
      }
    }
  };

  // Adjust duration
  const adjustDuration = (delta: number) => {
    const currentIndex = DURATIONS.findIndex(d => d.value === duration);
    const newIndex = Math.max(0, Math.min(DURATIONS.length - 1, currentIndex + delta));
    setDuration(DURATIONS[newIndex].value);
  };

  const handleLogout = () => {
    if (confirm("Apakah Anda yakin ingin keluar?")) {
      navigate("/member-login");
    }
  };

  // RENDER CONTENT BASED ON ACTIVE NAV
  const renderContent = () => {
    // PENAWARAN - Assets List
    if (activeNav === "penawaran") {
      const categories = ["All", "Crypto", "Forex", "Commodity", "Stocks"];
      
      // Combine ASSETS with fetched cryptos
      let combinedAssets = [...ASSETS];
      
      // Add ALL fetched cryptos from CoinGecko
      if (allCryptos.length > 0) {
        // Remove original crypto assets to avoid duplicates
        combinedAssets = combinedAssets.filter(asset => asset.category !== "Crypto");
        // Add all fetched cryptos
        combinedAssets = [...combinedAssets, ...allCryptos];
      }
      
      const filteredAssets = selectedCategory === "All" 
        ? combinedAssets 
        : combinedAssets.filter(asset => asset.category === selectedCategory);

      return (
        <div className="flex-1 overflow-y-auto bg-[#0a0a0a] p-4" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Trebuchet MS", Roboto, Ubuntu, sans-serif' }}>
          <h1 className="text-white text-2xl mb-4">Penawaran Aset</h1>
          
          {/* Category Filter */}
          <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-lg text-sm whitespace-nowrap transition-colors ${
                  selectedCategory === cat
                    ? "bg-gray-800/80 text-white border border-gray-700"
                    : "bg-gray-900/50 text-gray-300 hover:bg-gray-800/60"
                }`}
              >
                {cat}
                {cat === "Crypto" && allCryptos.length > 0 && (
                  <span className="ml-2 text-xs text-green-400">({allCryptos.length})</span>
                )}
              </button>
            ))}
          </div>

          {/* Loading Indicator */}
          {isLoadingCryptos && selectedCategory === "Crypto" && (
            <div className="flex items-center justify-center py-8 text-gray-400">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
              <span className="ml-3">Loading {allCryptos.length}+ cryptocurrencies...</span>
            </div>
          )}

          {/* Assets List */}
          <div className="space-y-2">
            {filteredAssets.map((asset) => {
              // Get real-time price from PriceContext
              const realtimePrice = prices[asset.symbol]?.price || asset.price || 0;
              const realtimeChange = prices[asset.symbol]?.change24h || asset.change || 0;
              
              return (
              <button
                key={asset.symbol}
                onClick={() => {
                  setSelectedAsset(asset);
                  setActiveNav("platform");
                }}
                className="w-full bg-black hover:bg-gray-950 rounded-xl p-4 transition-colors border border-gray-900"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img 
                      src={asset.flag} 
                      alt={asset.name} 
                      className="w-6 h-6 rounded-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                      }}
                    />
                    <div className="text-left">
                      <div className="flex items-center gap-2">
                        <span className="text-white text-sm">{asset.name}</span>
                        <span className="text-gray-300 text-xs">{asset.percentage}</span>
                      </div>
                      <span className="text-gray-400 text-xs">{asset.category}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-white text-base">
                      ${realtimePrice.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 8 })}
                    </div>
                    <div className={`text-sm ${realtimeChange >= 0 ? "text-green-500" : "text-red-500"}`}>
                      {realtimeChange >= 0 ? "+" : ""}{realtimeChange.toFixed(2)}%
                    </div>
                  </div>
                </div>
              </button>
              );
            })}
          </div>
        </div>
      );
    }

    // ROBOT - Trading Robot
    if (activeNav === "robot") {
      const winRate = robotStatus.totalTrades > 0 
        ? ((robotStatus.totalTrades - Math.floor(robotStatus.totalTrades * 0.4)) / robotStatus.totalTrades * 100)
        : 0;

      return (
        <div className="flex-1 overflow-y-auto bg-[#0a0a0a] p-4" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Trebuchet MS", Roboto, Ubuntu, sans-serif' }}>
          <h1 className="text-white text-2xl mb-4">Robot Trading</h1>
          
          {/* Robot Status */}
          <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-xl p-4 mb-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-white text-lg">Status Robot</h2>
                <p className="text-gray-300 text-sm">
                  {robotStatus.isRunning ? "🟢 Aktif - Trading otomatis berjalan" : "⚪ Tidak aktif"}
                </p>
              </div>
              {robotStatus.currentSignal && (
                <div className={`px-4 py-2 rounded-lg text-white ${
                  robotStatus.currentSignal === "BUY" ? "bg-green-500" : "bg-red-500"
                }`}>
                  {robotStatus.currentSignal}
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white/10 rounded-lg p-3">
                <div className="text-gray-300 text-xs mb-1">Total Trades</div>
                <div className="text-white text-xl">{robotStatus.totalTrades}</div>
              </div>
              <div className="bg-white/10 rounded-lg p-3">
                <div className="text-gray-300 text-xs mb-1">Win Rate</div>
                <div className="text-white text-xl">{winRate.toFixed(1)}%</div>
              </div>
              <div className="bg-white/10 rounded-lg p-3">
                <div className="text-gray-300 text-xs mb-1">Profit/Loss</div>
                <div className={`text-xl ${robotStatus.profit >= 0 ? "text-green-300" : "text-red-300"}`}>
                  ${robotStatus.profit.toFixed(2)}
                </div>
              </div>
            </div>
          </div>

          {/* Settings */}
          <div className="mb-4">
            <h2 className="text-white text-base mb-3">Pengaturan Robot</h2>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-gray-400 text-xs mb-1 block">Jumlah awal</label>
                <input
                  type="number"
                  value={robotSettings.initialAmount}
                  onChange={(e) => setRobotSettings(prev => ({ ...prev, initialAmount: Number(e.target.value) }))}
                  className="w-full bg-gray-800 text-white px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={robotStatus.isRunning}
                />
              </div>
              <div>
                <label className="text-gray-400 text-xs mb-1 block">Durasi</label>
                <select
                  value={robotSettings.duration}
                  onChange={(e) => setRobotSettings(prev => ({ ...prev, duration: Number(e.target.value) }))}
                  className="w-full bg-gray-800 text-white px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={robotStatus.isRunning}
                >
                  <option value="5">5 detik</option>
                  <option value="10">10 detik</option>
                  <option value="30">30 detik</option>
                  <option value="60">1 menit</option>
                  <option value="120">2 menit</option>
                  <option value="300">5 menit</option>
                </select>
              </div>
              <div>
                <label className="text-gray-400 text-xs mb-1 block">Profit Target</label>
                <input
                  type="number"
                  value={robotSettings.profitLimit}
                  onChange={(e) => setRobotSettings(prev => ({ ...prev, profitLimit: Number(e.target.value) }))}
                  className="w-full bg-gray-800 text-white px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={robotStatus.isRunning}
                />
              </div>
              <div>
                <label className="text-gray-400 text-xs mb-1 block">Stop Loss</label>
                <input
                  type="number"
                  value={robotSettings.stopLoss}
                  onChange={(e) => setRobotSettings(prev => ({ ...prev, stopLoss: Number(e.target.value) }))}
                  className="w-full bg-gray-800 text-white px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={robotStatus.isRunning}
                />
              </div>
            </div>
          </div>

          {/* Control Buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => setRobotStatus(prev => ({ ...prev, isRunning: !prev.isRunning }))}
              className={`flex-1 py-4 rounded-xl text-base transition-colors flex items-center justify-center gap-2 ${
                robotStatus.isRunning
                  ? "bg-red-500 hover:bg-red-600 text-white"
                  : "bg-green-500 hover:bg-green-600 text-white"
              }`}
            >
              {robotStatus.isRunning ? (
                <>
                  <Pause className="w-6 h-6" />
                  Stop Robot
                </>
              ) : (
                <>
                  <Play className="w-6 h-6" />
                  Mulai Robot
                </>
              )}
            </button>
            <button
              onClick={() => setRobotStatus({
                isRunning: false,
                totalTrades: 0,
                winRate: 0,
                profit: 0,
                currentSignal: null
              })}
              className="px-6 py-4 bg-gray-600 hover:bg-gray-700 text-white rounded-xl transition-colors"
              disabled={robotStatus.isRunning}
            >
              <RotateCcw className="w-6 h-6" />
            </button>
          </div>
        </div>
      );
    }

    // DUKUNGAN - Support
    if (activeNav === "dukungan") {
      return (
        <div className="flex-1 overflow-y-auto bg-[#0a0a0a] p-4" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Trebuchet MS", Roboto, Ubuntu, sans-serif' }}>
          <h1 className="text-white text-2xl mb-4">Dukungan</h1>
          
          {/* Live Support */}
          <div className="mb-6">
            <h2 className="text-white text-base mb-3">Butuh Bantuan Admin?</h2>
            <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-xl p-4 mb-3 border border-gray-700">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <MessageCircle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-white text-base">Live Chat Support</h3>
                  <p className="text-gray-300 text-sm">Admin online 24/7</p>
                </div>
              </div>
              <button className="w-full bg-gray-800 hover:bg-gray-700 text-white py-3 rounded-lg transition-colors border border-gray-700">
                Mulai Chat dengan Admin
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button className="bg-gray-900 hover:bg-gray-800 rounded-xl p-4 transition-colors">
                <Headphones className="w-8 h-8 text-gray-400 mb-2" />
                <div className="text-white text-sm">Email Support</div>
                <div className="text-gray-400 text-xs">support@investoft.com</div>
              </button>
              <button className="bg-gray-900 hover:bg-gray-800 rounded-xl p-4 transition-colors">
                <MessageCircle className="w-8 h-8 text-green-400 mb-2" />
                <div className="text-white text-sm">WhatsApp</div>
                <div className="text-gray-400 text-xs">+62 812 3456 7890</div>
              </button>
            </div>
          </div>

          {/* Common Issues */}
          <div className="mb-6">
            <h2 className="text-white text-base mb-3">Masalah Umum</h2>
            <div className="space-y-2">
              <button className="w-full bg-gray-900 hover:bg-gray-800 rounded-xl p-4 text-left transition-colors">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-400 mt-0.5" />
                  <div>
                    <div className="text-white text-sm">Deposit tidak masuk</div>
                    <p className="text-gray-400 text-xs mt-1">Hubungi admin dengan bukti transfer</p>
                  </div>
                </div>
              </button>

              <button className="w-full bg-gray-900 hover:bg-gray-800 rounded-xl p-4 text-left transition-colors">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-yellow-400 mt-0.5" />
                  <div>
                    <div className="text-white text-sm">Withdraw tertunda</div>
                    <p className="text-gray-400 text-xs mt-1">Proses withdraw 1-24 jam</p>
                  </div>
                </div>
              </button>

              <button className="w-full bg-gray-900 hover:bg-gray-800 rounded-xl p-4 text-left transition-colors">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-green-400 mt-0.5" />
                  <div>
                    <div className="text-white text-sm">Robot tidak berjalan</div>
                    <p className="text-gray-400 text-xs mt-1">Pastikan saldo mencukupi</p>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      );
    }

    // AKUN - Profile
    if (activeNav === "akun") {
      return (
        <div className="flex-1 overflow-y-auto bg-[#0a0a0a] p-4" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Trebuchet MS", Roboto, Ubuntu, sans-serif' }}>
          <h1 className="text-white text-2xl mb-4">Akun</h1>
          
          {/* User Profile */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-gray-700 to-gray-800 rounded-full flex items-center justify-center relative border border-gray-700">
              <User className="w-8 h-8 text-white" />
              <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-[#0a0a0a]"></div>
            </div>
            <div>
              <h2 className="text-white text-xl">User_134201167</h2>
              <p className="text-gray-300 text-sm">ID <span>134201167</span></p>
              <p className="text-gray-400 text-xs">azuranistirah@gmail.com</p>
            </div>
          </div>

          {/* Balance */}
          <div className="bg-gray-900 rounded-xl p-4 mb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Saldo {accountType === "Demo" ? "Demo" : "Real"}</p>
                <p className="text-white text-2xl">{formatBalance(balance)}</p>
              </div>
              <DollarSign className="w-10 h-10 text-gray-400" />
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <button
              onClick={() => navigate("/member-deposit")}
              className="bg-green-500 hover:bg-green-600 rounded-xl p-4 transition-colors"
            >
              <ArrowDown className="w-6 h-6 text-white mb-2" />
              <div className="text-white text-sm">Deposit</div>
              <div className="text-green-100 text-xs">Top up saldo</div>
            </button>
            <button className="bg-gray-800 hover:bg-gray-700 rounded-xl p-4 transition-colors border border-gray-700">
              <ArrowUp className="w-6 h-6 text-white mb-2" />
              <div className="text-white text-sm">Withdraw</div>
              <div className="text-gray-300 text-xs">Tarik dana</div>
            </button>
          </div>

          {/* Menu Items */}
          <div className="space-y-2 mb-6">
            <button className="w-full bg-gray-900 rounded-xl p-4 flex items-center justify-between hover:bg-gray-800 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-gray-400" />
                </div>
                <div className="text-left">
                  <div className="text-white text-sm">Riwayat Transaksi</div>
                  <p className="text-gray-400 text-xs">Lihat semua aktivitas</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>

            <button className="w-full bg-gray-900 rounded-xl p-4 flex items-center justify-between hover:bg-gray-800 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center">
                  <User className="w-5 h-5 text-gray-400" />
                </div>
                <div className="text-left">
                  <div className="text-white text-sm">Edit Profil</div>
                  <p className="text-gray-400 text-xs">Ubah data pribadi</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>

            <button className="w-full bg-gray-900 rounded-xl p-4 flex items-center justify-between hover:bg-gray-800 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center">
                  <Globe className="w-5 h-5 text-gray-400" />
                </div>
                <div className="text-left">
                  <div className="text-white text-sm">Bahasa</div>
                  <p className="text-gray-400 text-xs">Bahasa Indonesia</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>

            <button className="w-full bg-gray-900 rounded-xl p-4 flex items-center justify-between hover:bg-gray-800 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center">
                  <Info className="w-5 h-5 text-gray-400" />
                </div>
                <div className="text-left">
                  <div className="text-white text-sm">Tentang Investoft</div>
                  <p className="text-gray-400 text-xs">Versi 2.1.0</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>

            <button
              onClick={handleLogout}
              className="w-full bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-center justify-between hover:bg-red-500/20 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
                  <LogOut className="w-5 h-5 text-red-400" />
                </div>
                <div className="text-left">
                  <div className="text-red-400 text-sm">Keluar</div>
                  <p className="text-red-400/60 text-xs">Logout dari akun</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-red-400" />
            </button>
          </div>
        </div>
      );
    }

    // DEFAULT: PLATFORM - Trading View
    return (
      <>
        {/* Asset Selector Bar */}
        <div className="flex items-center justify-between px-4 py-2 bg-[#0f0f0f] border-b border-gray-800">
          <button
            onClick={() => setShowAssetSelector(true)}
            className="flex items-center gap-2"
          >
            <img 
              src={selectedAsset.flag} 
              alt={selectedAsset.name} 
              className="w-6 h-6 rounded-full"
              onError={handleImageError}
            />
            <div className="flex flex-col">
              <span className="text-white text-sm">{selectedAsset.name}</span>
            </div>
            <span className="text-gray-300 text-sm ml-1">{selectedAsset.percentage}</span>
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </button>

          <div className="flex items-center gap-3">
            <Search className="w-5 h-5 text-gray-400" />
            <Settings className="w-5 h-5 text-gray-400" />
            <div className="px-2 py-1 bg-gray-800 rounded text-white text-xs">
              {getDurationLabel()}
            </div>
          </div>
        </div>

        {/* Price Info Bar - SEPARATED FROM CHART */}
        <div className="bg-[#0a0a0a] border-b border-gray-800 px-4 py-2" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Trebuchet MS", Roboto, Ubuntu, sans-serif' }}>
          <div className="flex items-center justify-center gap-3">
            <span className="text-white text-sm">{formatPrice(currentPrice)}</span>
            <span className={`text-xs ${priceChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {formatPriceChange(priceChange)} ({priceChangePercent.toFixed(2)}%)
            </span>
          </div>
        </div>

        {/* Chart Area */}
        <div className="flex-1 bg-black relative">
          {/* Active Trades */}
          {activeTrades.length > 0 && (
            <div className="absolute top-4 right-4 z-10 space-y-2 max-w-[200px]">
              {activeTrades.map((trade) => (
                <div
                  key={trade.id}
                  className={`bg-black/70 backdrop-blur-sm border-2 rounded-lg p-2 ${
                    trade.status === "win" 
                      ? "border-green-500 animate-pulse" 
                      : trade.status === "loss" 
                      ? "border-red-500 animate-pulse"
                      : trade.direction === "UP" 
                      ? "border-green-500/50" 
                      : "border-red-500/50"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1">
                      {trade.direction === "UP" ? (
                        <TrendingUp className="w-4 h-4 text-green-500" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-red-500" />
                      )}
                      <span className="text-white text-xs">{trade.asset}</span>
                    </div>
                    {trade.status === "active" && (
                      <span className="text-gray-400 text-xs font-mono">
                        {Math.floor(trade.remainingSeconds / 60)}:{String(trade.remainingSeconds % 60).padStart(2, '0')}
                      </span>
                    )}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-400">Entry:</span>
                      <span className="text-white font-mono">${trade.entryPrice.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-400">P/L:</span>
                      <span className={`font-mono ${
                        trade.profit > 0 ? "text-green-500" : "text-red-500"
                      }`}>
                        {trade.profit > 0 ? "+" : ""}${trade.profit.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {trade.status !== "active" && (
                    <div className={`mt-2 text-center py-1 rounded text-xs ${
                      trade.status === "win" 
                        ? "bg-green-500 text-white" 
                        : "bg-red-500 text-white"
                    }`}>
                      {trade.status === "win" ? "🎉 WIN!" : "😔 LOSS"}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Chart */}
          <TradingChart
            symbol={selectedAsset.tradingViewSymbol}
            interval="1"
            theme="dark"
            onPriceUpdate={handleChartPriceUpdate}
          />
        </div>

        {/* Trading Controls */}
        <div className="bg-[#0a0a0a] border-t border-gray-800 px-4 py-3">
          {/* Duration & Amount */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex-1 mr-2">
              <div className="text-gray-400 text-xs mb-1.5">Waktunya</div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => adjustDuration(-1)}
                  className="w-10 h-10 bg-gray-800 hover:bg-gray-700 text-white rounded-lg flex items-center justify-center text-xl"
                >
                  −
                </button>
                <button
                  onClick={() => setShowDurationSelector(true)}
                  className="flex-1 h-10 bg-gray-800 hover:bg-gray-700 text-white rounded-lg flex items-center justify-center text-sm"
                >
                  {getDurationLabel()}
                </button>
                <button
                  onClick={() => adjustDuration(1)}
                  className="w-10 h-10 bg-gray-800 hover:bg-gray-700 text-white rounded-lg flex items-center justify-center text-xl"
                >
                  +
                </button>
              </div>
            </div>

            <div className="flex-1 ml-2">
              <div className="text-gray-400 text-xs mb-1.5">Jumlah</div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => adjustAmount(-1)}
                  className="w-10 h-10 bg-gray-800 hover:bg-gray-700 text-white rounded-lg flex items-center justify-center text-xl"
                >
                  −
                </button>
                <button
                  onClick={() => setShowAmountSelector(true)}
                  className="flex-1 h-10 bg-gray-800 hover:bg-gray-700 text-white rounded-lg flex items-center justify-center text-sm"
                >
                  ${amount}
                </button>
                <button
                  onClick={() => adjustAmount(1)}
                  className="w-10 h-10 bg-gray-800 hover:bg-gray-700 text-white rounded-lg flex items-center justify-center text-xl"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Buy/Sell Buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => handleTrade("DOWN")}
              disabled={isTrading || currentPrice === 0}
              className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white py-4 rounded-xl flex flex-col items-center justify-center transition-colors"
            >
              <ArrowDown className="w-8 h-8 mb-1" />
              <span className="text-sm">SELL</span>
            </button>

            <button
              onClick={() => handleTrade("UP")}
              disabled={isTrading || currentPrice === 0}
              className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white py-4 rounded-xl flex flex-col items-center justify-center transition-colors"
            >
              <ArrowUp className="w-8 h-8 mb-1" />
              <span className="text-sm">BUY</span>
            </button>
          </div>
        </div>
      </>
    );
  };

  return (
    <div className="h-screen w-full bg-black flex flex-col overflow-hidden" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Trebuchet MS", Roboto, Ubuntu, sans-serif' }}>
      {/* Top Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#0a0a0a] border-b border-gray-800">
        <div className="relative">
          <button
            onClick={() => setShowAccountDropdown(!showAccountDropdown)}
            className="flex items-center gap-2"
          >
            <User className="w-6 h-6 text-white bg-gray-700 rounded-full p-1" />
            <div className="flex flex-col items-start">
              <span className="text-white text-sm">Akun {accountType === "Demo" ? "demo" : "real"}</span>
              <span className="text-white text-base">{formatBalance(balance)}</span>
            </div>
            <ChevronDown className="w-4 h-4 text-white ml-1" />
          </button>

          {showAccountDropdown && (
            <>
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setShowAccountDropdown(false)}
              />
              <div className="absolute top-full left-0 mt-2 w-64 bg-[#1a1a1a] rounded-lg shadow-xl border border-gray-800 z-50" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Trebuchet MS", Roboto, Ubuntu, sans-serif' }}>
                <button
                  onClick={() => {
                    setAccountType("Demo");
                    setBalance(10641.20);
                    setShowAccountDropdown(false);
                  }}
                  className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-800 border-b border-gray-800"
                >
                  <span className="text-white text-sm">Akun demo</span>
                  <span className="text-white text-sm">$10,641.20</span>
                </button>
                <button
                  onClick={() => {
                    setAccountType("Real");
                    setBalance(0);
                    setShowAccountDropdown(false);
                  }}
                  className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-800"
                >
                  <span className="text-white text-sm">Akun real</span>
                  <span className="text-white text-sm">$0.00</span>
                </button>
              </div>
            </>
          )}
        </div>

        <button
          onClick={() => navigate("/member-deposit")}
          className="px-6 py-2 bg-gray-800 hover:bg-gray-700 text-white text-sm rounded-lg transition-colors border border-gray-700"
        >
          Deposit
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {renderContent()}
      </div>

      {/* Bottom Navigation */}
      <div className="flex items-center justify-around bg-[#0a0a0a] border-t border-gray-800 py-2 safe-bottom">
        <button
          onClick={() => {
            console.log("🔵 Switching to: platform");
            setActiveNav("platform");
          }}
          className={`flex flex-col items-center gap-1 py-2 px-3 transition-colors ${
            activeNav === "platform" ? "text-blue-500" : "text-gray-400"
          }`}
        >
          <BarChart3 className="w-5 h-5" />
          <span className="text-[10px] font-medium">Platform</span>
        </button>

        <button
          onClick={() => {
            console.log("🔵 Switching to: penawaran");
            setActiveNav("penawaran");
          }}
          className={`flex flex-col items-center gap-1 py-2 px-3 transition-colors ${
            activeNav === "penawaran" ? "text-blue-500" : "text-gray-400"
          }`}
        >
          <Gift className="w-5 h-5" />
          <span className="text-[10px] font-medium">Penawaran</span>
        </button>

        <button
          onClick={() => {
            console.log("🔵 Switching to: robot");
            setActiveNav("robot");
          }}
          className={`flex flex-col items-center gap-1 py-2 px-3 transition-colors ${
            activeNav === "robot" ? "text-blue-500" : "text-gray-400"
          }`}
        >
          <Bot className="w-5 h-5" />
          <span className="text-[10px] font-medium">Robot</span>
        </button>

        <button
          onClick={() => {
            console.log("🔵 Switching to: dukungan");
            setActiveNav("dukungan");
          }}
          className={`flex flex-col items-center gap-1 py-2 px-3 transition-colors ${
            activeNav === "dukungan" ? "text-blue-500" : "text-gray-400"
          }`}
        >
          <Headphones className="w-5 h-5" />
          <span className="text-[10px] font-medium">Dukungan</span>
        </button>

        <button
          onClick={() => {
            console.log("🔵 Switching to: akun");
            setActiveNav("akun");
          }}
          className={`flex flex-col items-center gap-1 py-2 px-3 transition-colors ${
            activeNav === "akun" ? "text-blue-500" : "text-gray-400"
          }`}
        >
          <UserCircle className="w-5 h-5" />
          <span className="text-[10px] font-medium">Akun</span>
        </button>
      </div>

      {/* Modals */}
      {showDurationSelector && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-end">
          <div className="w-full bg-black rounded-t-2xl p-4" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Trebuchet MS", Roboto, Ubuntu, sans-serif' }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white text-base">Pilih Durasi</h3>
              <button
                onClick={() => setShowDurationSelector(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="grid grid-cols-4 gap-2 mb-4">
              {DURATIONS.map((dur) => (
                <button
                  key={dur.value}
                  onClick={() => {
                    setDuration(dur.value);
                    setShowDurationSelector(false);
                  }}
                  className={`py-3 px-4 rounded-lg text-sm transition-colors ${
                    duration === dur.value
                      ? "bg-gray-800/80 text-white border border-gray-700"
                      : "bg-gray-900/50 text-gray-300 hover:bg-gray-800/60"
                  }`}
                >
                  {dur.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {showAssetSelector && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-end">
          <div className="w-full bg-black rounded-t-2xl p-4 max-h-[80vh] overflow-y-auto" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Trebuchet MS", Roboto, Ubuntu, sans-serif' }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white text-base">Pilih Asset</h3>
              <button
                onClick={() => setShowAssetSelector(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-2 mb-4">
              {ASSETS.map((asset) => (
                <button
                  key={asset.symbol}
                  onClick={() => {
                    setSelectedAsset(asset);
                    setShowAssetSelector(false);
                  }}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${
                    selectedAsset.symbol === asset.symbol
                      ? "bg-gray-800/80 border border-gray-700"
                      : "bg-gray-900/50 hover:bg-gray-800/60"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <img 
                      src={asset.flag} 
                      alt={asset.name} 
                      className="w-6 h-6 rounded-full"
                      onError={handleImageError}
                    />
                    <div className="flex flex-col items-start">
                      <span className="text-white text-sm">{asset.name}</span>
                      <span className="text-gray-400 text-xs">{asset.symbol}</span>
                    </div>
                  </div>
                  <span className="text-gray-300 text-sm">{asset.percentage}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {showAmountSelector && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-end">
          <div className="w-full bg-black rounded-t-2xl p-4" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Trebuchet MS", Roboto, Ubuntu, sans-serif' }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white text-base">Pilih Jumlah</h3>
              <button
                onClick={() => setShowAmountSelector(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2 mb-4">
              {AMOUNT_PRESETS.map((preset) => (
                <button
                  key={preset}
                  onClick={() => {
                    setAmount(preset);
                    setShowAmountSelector(false);
                  }}
                  className={`py-3 px-4 rounded-lg text-sm transition-colors ${
                    amount === preset
                      ? "bg-gray-800/80 text-white border border-gray-700"
                      : "bg-gray-900/50 text-gray-300 hover:bg-gray-800/60"
                  }`}
                >
                  ${preset}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}