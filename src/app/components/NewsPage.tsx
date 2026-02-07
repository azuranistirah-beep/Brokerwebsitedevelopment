import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { Clock, ArrowLeft, ExternalLink, Search, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { TickerTape } from "./TickerTape";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { projectId, publicAnonKey } from "../../../utils/supabase/info";

interface NewsArticle {
  title: string;
  description: string;
  url: string;
  image: string;
  source: string;
  publishedAt: string;
  author: string;
  content: string;
}

export function NewsPage() {
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(false);
  const [category, setCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const pageSize = 20;

  useEffect(() => {
    fetchNews();
  }, [category, currentPage]);

  const fetchNews = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        category,
        page: currentPage.toString(),
        pageSize: pageSize.toString(),
        ...(searchQuery && { search: searchQuery })
      });

      const url = `https://${projectId}.supabase.co/functions/v1/make-server-20da1dab/news?${params}`;
      console.log('Fetching news from:', url);

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('Response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('Received data:', data);
        setArticles(data.articles || []);
        setTotalResults(data.totalResults || 0);
      } else {
        console.error('Response not OK:', response.status, response.statusText);
        const errorText = await response.text();
        console.error('Error response:', errorText);
      }
    } catch (error) {
      console.error("Error fetching news:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchNews();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const totalPages = Math.ceil(totalResults / pageSize);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffHours < 48) return 'Yesterday';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (selectedArticle) {
    return (
      <div className="min-h-screen bg-white pb-20">
        <div className="bg-white border-b border-slate-200">
          <TickerTape colorTheme="light" />
        </div>
        
        <div className="pt-8">
          <div className="container mx-auto px-4 max-w-4xl">
            <Button 
              variant="ghost" 
              className="mb-6 text-slate-600 hover:text-slate-900"
              onClick={() => setSelectedArticle(null)}
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to News
            </Button>

            <article>
              <div className="mb-6">
                <Badge className="bg-blue-600 hover:bg-blue-700 mb-4">{category.toUpperCase()}</Badge>
                <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4 leading-tight">
                  {selectedArticle.title}
                </h1>
                <div className="flex items-center gap-4 text-slate-500 text-sm mb-6">
                  <span className="font-medium text-slate-700">{selectedArticle.author}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock size={14} /> {formatDate(selectedArticle.publishedAt)}
                  </span>
                  <span>•</span>
                  <span className="font-bold text-slate-700">{selectedArticle.source}</span>
                </div>
              </div>

              <div className="relative h-96 w-full overflow-hidden rounded-2xl mb-8">
                <ImageWithFallback 
                  src={selectedArticle.image}
                  alt={selectedArticle.title}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="prose prose-lg max-w-none">
                <p className="text-slate-700 mb-6 leading-relaxed text-lg">
                  {selectedArticle.description}
                </p>
                {selectedArticle.content && (
                  <p className="text-slate-700 mb-6 leading-relaxed text-lg">
                    {selectedArticle.content}
                  </p>
                )}
              </div>

              {selectedArticle.url && (
                <div className="mt-8 pt-8 border-t border-slate-200">
                  <a 
                    href={selectedArticle.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Read original article <ExternalLink size={16} />
                  </a>
                </div>
              )}
            </article>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-20">
      <div className="bg-white border-b border-slate-200">
        <TickerTape colorTheme="light" />
      </div>
      
      <div className="pt-8">
        <div className="container mx-auto px-4">
          {/* Header with Search */}
          <div className="mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              <div>
                <h1 className="text-3xl font-bold text-slate-900">Market News</h1>
                <p className="text-slate-500">Latest financial updates from trusted sources</p>
              </div>
              
              <div className="flex gap-2 w-full md:w-96">
                <Input
                  placeholder="Search news..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1"
                />
                <Button 
                  onClick={handleSearch}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Category Tabs */}
            <Tabs value={category} onValueChange={(value) => { setCategory(value); setCurrentPage(1); }}>
              <TabsList className="bg-slate-100">
                <TabsTrigger value="all">All News</TabsTrigger>
                <TabsTrigger value="stocks">Stocks</TabsTrigger>
                <TabsTrigger value="forex">Forex</TabsTrigger>
                <TabsTrigger value="crypto">Crypto</TabsTrigger>
                <TabsTrigger value="commodities">Commodities</TabsTrigger>
                <TabsTrigger value="economy">Economy</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          ) : articles.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="text-slate-400 mb-4">
                <Search className="h-16 w-16" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">No articles found</h3>
              <p className="text-slate-500">Try adjusting your filters or search query</p>
            </div>
          ) : (
            <>
              {/* News Grid */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {articles.map((article, index) => (
                  <Card 
                    key={index}
                    className="flex flex-col overflow-hidden border-slate-200 shadow-sm bg-white hover:shadow-lg transition-all cursor-pointer group h-full"
                    onClick={() => setSelectedArticle(article)}
                  >
                    <div className="w-full h-48 relative overflow-hidden">
                      <ImageWithFallback 
                        src={article.image}
                        alt={article.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    </div>
                    <div className="flex-1 p-6 flex flex-col">
                      <div className="flex justify-between items-start mb-3">
                        <Badge variant="outline" className="text-slate-600 border-slate-200 text-xs">
                          {article.source}
                        </Badge>
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                          <Clock size={12} /> {formatDate(article.publishedAt)}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                        {article.title}
                      </h3>
                      <p className="text-slate-600 text-sm line-clamp-3 mb-4 flex-1">
                        {article.description}
                      </p>
                      <div className="text-xs text-slate-400 mt-auto">
                        By {article.author}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="border-slate-300"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  
                  <div className="flex items-center gap-2">
                    {[...Array(Math.min(5, totalPages))].map((_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }

                      return (
                        <Button
                          key={pageNum}
                          variant={currentPage === pageNum ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(pageNum)}
                          className={currentPage === pageNum 
                            ? "bg-blue-600 hover:bg-blue-700" 
                            : "border-slate-300"
                          }
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="border-slate-300"
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}

              {/* Results Count */}
              <div className="text-center mt-6 text-sm text-slate-500">
                Showing {((currentPage - 1) * pageSize) + 1}-{Math.min(currentPage * pageSize, totalResults)} of {totalResults} articles
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}