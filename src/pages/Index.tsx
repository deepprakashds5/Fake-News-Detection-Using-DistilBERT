import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { NewsCard } from "@/components/NewsCard";
import { StatsCard } from "@/components/StatsCard";
import { SearchBar } from "@/components/SearchBar";
import { Newspaper, Shield, AlertTriangle, TrendingUp } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Article {
  title: string;
  description: string;
  url: string;
  urlToImage?: string;
  source: { name: string };
  publishedAt: string;
}

const Index = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      const response = await fetch("http://127.0.0.1:5000/live-feed");

      if (!response.ok) {
        throw new Error("Live feed request failed");
      }

      const data = await response.json();

      if (data?.error) throw new Error(data.error);

      if (data?.articles) {
        setArticles(data.articles.filter((a: Article) => a.title && a.description));
      }
    } catch (error) {
      console.error('Error fetching news:', error);
      toast({
        title: "Error Loading News",
        description: "Could not fetch live news feed",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="container mx-auto px-4 py-8 max-w-7xl relative z-10">
        {/* Header */}
        <div className="mb-12 text-center animate-fade-in">
          <div className="inline-flex items-center gap-3 mb-4 px-6 py-3 rounded-full glass-effect shadow-glow">
            <Shield className="w-10 h-10 text-primary animate-glow" />
            <h1 className="text-5xl font-bold bg-gradient-to-r from-primary via-primary-glow to-accent bg-clip-text text-transparent">
              FakeNews Detector
            </h1>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="animate-scale-in" style={{ animationDelay: '0.1s' }}>
            <StatsCard
              title="Total Articles"
              value={articles.length}
              icon={Newspaper}
            />
          </div>
          <div className="animate-scale-in" style={{ animationDelay: '0.2s' }}>
            <StatsCard
              title="Verified Real"
              value="68%"
              icon={Shield}
              trend="+5% from last hour"
              trendUp={true}
            />
          </div>
          <div className="animate-scale-in" style={{ animationDelay: '0.3s' }}>
            <StatsCard
              title="Flagged Fake"
              value="18%"
              icon={AlertTriangle}
              trend="-2% from last hour"
              trendUp={true}
            />
          </div>
          <div className="animate-scale-in" style={{ animationDelay: '0.4s' }}>
            <StatsCard
              title="Detection Rate"
              value="94.2%"
              icon={TrendingUp}
              trend="+1.2% accuracy"
              trendUp={true}
            />
          </div>
        </div>

        <Tabs defaultValue="search" className="space-y-6 animate-fade-in" style={{ animationDelay: '0.5s' }}>
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 glass-effect p-1">
            <TabsTrigger value="search" className="data-[state=active]:bg-primary/20">
              Custom Analysis
            </TabsTrigger>
            <TabsTrigger value="feed" className="data-[state=active]:bg-primary/20">
              Live Feed
            </TabsTrigger>
          </TabsList>

          <TabsContent value="search" className="space-y-4">
            <SearchBar />
          </TabsContent>

          <TabsContent value="feed" className="space-y-4">
            {loading ? (
              <div className="text-center py-20">
                <div className="relative inline-flex">
                  <div className="animate-spin w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full" />
                  <Shield className="w-8 h-8 text-primary absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                </div>
                <p className="text-muted-foreground mt-6 text-lg">Analyzing live news feed...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {articles.map((article, index) => (
                  <div 
                    key={index}
                    className="animate-fade-in"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <NewsCard
                      title={article.title}
                      description={article.description}
                      url={article.url}
                      source={article.source.name}
                      publishedAt={article.publishedAt}
                      urlToImage={article.urlToImage}
                    />
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
