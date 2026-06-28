import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Shield, AlertTriangle, HelpCircle, ExternalLink } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface NewsCardProps {
  title: string;
  description: string;
  url: string;
  source: string;
  publishedAt: string;
  urlToImage?: string;
}

export const NewsCard = ({ title, description, url, source, publishedAt, urlToImage }: NewsCardProps) => {
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const { toast } = useToast();

  const analyzeNews = async () => {
    setAnalyzing(true);
    try {
      const response = await fetch("http://127.0.0.1:5000/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: `${title} ${description}` }),
      });

      if (!response.ok) {
        throw new Error("Backend request failed");
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      const confidence = data.confidence
        ? Math.round(
           Math.max(...Object.values(data.confidence).map(Number)) * 100
          )
        : 0;

      setAnalysis({
      verdict: data.prediction === "Real News" ? "real" : "fake",
      confidence,
      credibilityScore: confidence,
      realConfidence: Number(data.confidence["Real News"]) * 100,
      fakeConfidence: Number(data.confidence["Fake News"]) * 100,

      signals: [
        "Fine-tuned DistilBERT model",
        "Semantic text classification",
        data.prediction === "Real News"
        ? "No strong indicators of misinformation detected."
        : "Potential misinformation patterns detected.",
      ],
    });

    } catch (error) {
      console.error('Analysis error:', error);
      toast({
        title: "Analysis Failed",
        description: "Could not analyze this article",
        variant: "destructive",
      });
    } finally {
      setAnalyzing(false);
    }
  };

  const getVerdictIcon = () => {
    if (!analysis) return null;
    switch (analysis.verdict) {
      case 'real':
        return <Shield className="w-4 h-4" />;
      case 'fake':
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <HelpCircle className="w-4 h-4" />;
    }
  };

  const getVerdictColor = () => {
    if (!analysis) return '';
    switch (analysis.verdict) {
      case 'real':
        return 'bg-success/20 text-success border-success/30';
      case 'fake':
        return 'bg-destructive/20 text-destructive border-destructive/30';
      default:
        return 'bg-warning/20 text-warning border-warning/30';
    }
  };

  return (
    <Card className="group p-0 overflow-hidden hover:shadow-elevated transition-all duration-500 hover:-translate-y-2 gradient-card border-border/50 hover:border-primary/50">
      <div className="space-y-4">
        {urlToImage && (
          <div className="relative overflow-hidden h-48">
            <img 
              src={urlToImage} 
              alt={title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
          </div>
        )}
        
        <div className="px-5 pb-5 space-y-3">{urlToImage ? '' : <div className="pt-5" />}
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-foreground line-clamp-2 flex-1 group-hover:text-primary transition-colors">
              {title}
            </h3>
            {analysis && (
              <Badge variant="outline" className={`${getVerdictColor()} flex items-center gap-1 shadow-glow animate-scale-in`}>
                {getVerdictIcon()}
                {analysis.verdict.toUpperCase()}
              </Badge>
            )}
          </div>

          <p className="text-sm text-muted-foreground/80 line-clamp-3 leading-relaxed">{description}</p>

          {analysis && (
            <div className="space-y-3 p-4 glass-effect rounded-lg border border-primary/20 animate-fade-in">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground">Confidence</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                      {Number(analysis.confidence).toFixed(1)}
                    </span>
                    <span className="text-xs text-muted-foreground">%</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground">Credibility</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                      {analysis.credibilityScore}
                    </span>
                    <span className="text-xs text-muted-foreground">/100</span>
                  </div>
                </div>
              </div>
              {analysis.signals && analysis.signals.length > 0 && (
                <div className="text-xs text-muted-foreground/70 pt-3 border-t border-border/50 space-y-1">
                  {analysis.signals.slice(0, 2).map((signal: string, idx: number) => (
                    <div key={idx} className="flex items-center gap-2">
                      <div className="w-1 h-1 rounded-full bg-primary" />
                      {signal}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="flex items-center justify-between pt-4 border-t border-border/50">
            <div className="text-xs text-muted-foreground/70 space-y-0.5">
              <div className="font-medium text-foreground/80">{source}</div>
              <div>{new Date(publishedAt).toLocaleDateString()}</div>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={analyzeNews}
                disabled={analyzing}
                className="hover:bg-primary/20 hover:border-primary transition-all"
              >
                {analyzing ? (
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    <span>Analyzing...</span>
                  </div>
                ) : (
                  analysis ? 'Re-analyze' : 'Analyze'
                )}
              </Button>
              <Button 
                size="sm" 
                variant="secondary" 
                asChild
                className="hover:bg-accent/20 hover:border-accent transition-all"
              >
                <a href={url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-4 h-4" />
                </a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
