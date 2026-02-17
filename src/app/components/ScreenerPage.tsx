import { Card } from "./ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Badge } from "./ui/badge";
import { TickerTape } from "./TickerTape";

export function ScreenerPage() {
  const screenerData = [
    // Stocks - US Tech Giants
    { symbol: "AAPL", name: "Apple Inc.", price: 178.34, change: 1.23, rating: "Strong Buy", sector: "Technology", type: "Stock" },
    { symbol: "MSFT", name: "Microsoft Corp.", price: 330.45, change: 0.67, rating: "Buy", sector: "Technology", type: "Stock" },
    { symbol: "AMZN", name: "Amazon.com Inc.", price: 135.67, change: 0.89, rating: "Buy", sector: "Consumer Cyclical", type: "Stock" },
    { symbol: "NVDA", name: "NVIDIA Corp.", price: 460.12, change: 3.45, rating: "Strong Buy", sector: "Technology", type: "Stock" },
    { symbol: "TSLA", name: "Tesla Inc.", price: 245.67, change: -2.34, rating: "Hold", sector: "Consumer Cyclical", type: "Stock" },
    { symbol: "GOOGL", name: "Alphabet Inc.", price: 136.23, change: 1.12, rating: "Buy", sector: "Communication Services", type: "Stock" },
    { symbol: "META", name: "Meta Platforms", price: 298.67, change: -0.45, rating: "Buy", sector: "Communication Services", type: "Stock" },
    { symbol: "BRK.B", name: "Berkshire Hathaway", price: 360.12, change: 0.23, rating: "Hold", sector: "Financial Services", type: "Stock" },
    { symbol: "LLY", name: "Eli Lilly", price: 550.45, change: 2.12, rating: "Strong Buy", sector: "Healthcare", type: "Stock" },
    { symbol: "V", name: "Visa Inc.", price: 245.67, change: 0.56, rating: "Buy", sector: "Financial Services", type: "Stock" },
    { symbol: "JPM", name: "JPMorgan Chase", price: 145.23, change: 0.34, rating: "Buy", sector: "Financial Services", type: "Stock" },
    { symbol: "JNJ", name: "Johnson & Johnson", price: 158.90, change: 0.12, rating: "Hold", sector: "Healthcare", type: "Stock" },
    { symbol: "WMT", name: "Walmart Inc.", price: 52.45, change: 0.78, rating: "Buy", sector: "Consumer Defensive", type: "Stock" },
    { symbol: "PG", name: "Procter & Gamble", price: 150.34, change: -0.23, rating: "Hold", sector: "Consumer Defensive", type: "Stock" },
    { symbol: "DIS", name: "Walt Disney Co.", price: 98.12, change: 1.45, rating: "Buy", sector: "Communication Services", type: "Stock" },
    
    // Forex Pairs
    { symbol: "EURUSD", name: "Euro / US Dollar", price: 1.0845, change: -0.15, rating: "Sell", sector: "Forex Major", type: "Forex" },
    { symbol: "GBPUSD", name: "British Pound / US Dollar", price: 1.2634, change: 0.23, rating: "Buy", sector: "Forex Major", type: "Forex" },
    { symbol: "USDJPY", name: "US Dollar / Japanese Yen", price: 149.45, change: 0.45, rating: "Hold", sector: "Forex Major", type: "Forex" },
    { symbol: "AUDUSD", name: "Australian Dollar / US Dollar", price: 0.6512, change: -0.34, rating: "Sell", sector: "Forex Major", type: "Forex" },
    { symbol: "USDCAD", name: "US Dollar / Canadian Dollar", price: 1.3645, change: 0.12, rating: "Hold", sector: "Forex Major", type: "Forex" },
    { symbol: "USDCHF", name: "US Dollar / Swiss Franc", price: 0.8823, change: 0.09, rating: "Hold", sector: "Forex Major", type: "Forex" },
    
    // Indices
    { symbol: "SPX500", name: "S&P 500", price: 4850.45, change: 0.78, rating: "Strong Buy", sector: "US Indices", type: "Index" },
    { symbol: "NSX100", name: "Nasdaq 100", price: 16420.30, change: 1.23, rating: "Strong Buy", sector: "US Indices", type: "Index" },
    { symbol: "DJI30", name: "Dow Jones Industrial", price: 37850.20, change: 0.45, rating: "Buy", sector: "US Indices", type: "Index" },
    { symbol: "UK100", name: "FTSE 100", price: 7650.80, change: -0.12, rating: "Hold", sector: "European Indices", type: "Index" },
    { symbol: "GER40", name: "DAX 40", price: 17240.50, change: 0.34, rating: "Buy", sector: "European Indices", type: "Index" },
    { symbol: "JPN225", name: "Nikkei 225", price: 38450.70, change: 0.89, rating: "Strong Buy", sector: "Asian Indices", type: "Index" },
    
    // Commodities
    { symbol: "XAUUSD", name: "Gold", price: 2345.60, change: 0.56, rating: "Buy", sector: "Precious Metals", type: "Commodity" },
    { symbol: "XAGUSD", name: "Silver", price: 24.85, change: 1.12, rating: "Strong Buy", sector: "Precious Metals", type: "Commodity" },
    { symbol: "WTIUSD", name: "Crude Oil WTI", price: 78.45, change: -0.45, rating: "Hold", sector: "Energy", type: "Commodity" },
    { symbol: "BRUSD", name: "Brent Crude Oil", price: 82.30, change: -0.23, rating: "Hold", sector: "Energy", type: "Commodity" },
  ];

  return (
    <div className="min-h-screen bg-slate-950 pb-20">
      {/* Ticker Tape */}
      <div className="bg-slate-900 border-b border-slate-800">
        <TickerTape colorTheme="dark" />
      </div>
      
      <div className="pt-8">
        <div className="container mx-auto px-4">
          {/* Market Screener Section */}
          <div>
            <div className="flex justify-between items-center mb-6">
               <div>
                <h1 className="text-3xl font-bold text-white mb-2">Market Screener</h1>
                <p className="text-slate-400">Filter and analyze stocks, forex, indices, and commodities</p>
               </div>
            </div>

            <Card className="border-slate-800 shadow-sm bg-slate-900 overflow-hidden">
              <Table>
                <TableHeader className="bg-slate-800/50">
                  <TableRow className="border-b border-slate-700">
                    <TableHead className="text-slate-200 font-bold">Symbol</TableHead>
                    <TableHead className="text-slate-200 font-bold">Name</TableHead>
                    <TableHead className="text-slate-200 font-bold">Type</TableHead>
                    <TableHead className="text-slate-200 font-bold text-right">Price</TableHead>
                    <TableHead className="text-slate-200 font-bold text-right">Change %</TableHead>
                    <TableHead className="text-slate-200 font-bold">Sector</TableHead>
                    <TableHead className="text-slate-200 font-bold">Analyst Rating</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {screenerData.map((stock) => (
                    <TableRow key={stock.symbol} className="hover:bg-slate-800/50 border-b border-slate-800 last:border-0">
                      <TableCell className="font-medium text-white">{stock.symbol}</TableCell>
                      <TableCell className="text-slate-300">{stock.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs border-slate-700 text-slate-300">
                          {stock.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-mono text-white">${stock.price.toLocaleString()}</TableCell>
                      <TableCell className={`text-right font-medium ${stock.change >= 0 ? "text-green-400" : "text-red-400"}`}>
                        {stock.change > 0 ? "+" : ""}{stock.change}%
                      </TableCell>
                      <TableCell className="text-slate-300">{stock.sector}</TableCell>
                      <TableCell>
                        <Badge variant={stock.rating.includes("Buy") ? "default" : "secondary"} className={
                          stock.rating === "Strong Buy" ? "bg-green-600 hover:bg-green-700 text-white" :
                          stock.rating === "Buy" ? "bg-blue-600 hover:bg-blue-700 text-white" :
                          stock.rating === "Sell" ? "bg-red-600 hover:bg-red-700 text-white" :
                          "bg-yellow-500 hover:bg-yellow-600 text-white"
                        }>
                          {stock.rating}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}