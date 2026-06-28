import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Shield, AlertTriangle, HelpCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PredictionResult {
  verdict: "real" | "fake";
  confidence: number;
  credibilityScore: number;
  realConfidence: number;
  fakeConfidence: number;
  signals: string[];
}

export const SearchBar = () => {
  const [query, setQuery] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<PredictionResult | null>(null);

  const { toast } = useToast();

  const handleSearch = async () => {
    const trimmedQuery = query.trim();

    if (!trimmedQuery) {
      toast({
        title: "Input Required",
        description: "Paste a news headline, article, or news URL.",
        variant: "destructive",
      });
      return;
    }

    setAnalyzing(true);
    setResult(null);

    try {
      const response = await fetch("http://127.0.0.1:5000/predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: trimmedQuery,
        }),
      });

      if (!response.ok) {
        throw new Error("Prediction failed");
      }

      const data = await response.json();

      console.log("Backend Response:", data);

    const confidence =
      Math.max(...Object.values(data.confidence).map(Number)) * 100;

      setResult({
        verdict:
          data.prediction === "Real News"
            ? "real"
            : "fake",

        confidence,

        credibilityScore: confidence,

        realConfidence: Number(data.confidence["Real News"]) * 100,

        fakeConfidence: Number(data.confidence["Fake News"]) * 100,

        signals: [
          "Fine-tuned DistilBERT model",
          "Softmax probability prediction",
          "Binary fake-news classification",
        ],
      });

      toast({
        title: "Analysis Complete",
        description: data.prediction,
      });
    } catch (error) {
      console.error(error);

      toast({
        title: "Analysis Failed",
        description: "Could not connect to Flask backend.",
        variant: "destructive",
      });
    } finally {
      setAnalyzing(false);
    }
  };


 const getVerdictIcon = () => {
  if (!result) return null;

  switch (result.verdict) {
    case "real":
      return <Shield className="w-5 h-5" />;

    case "fake":
      return <AlertTriangle className="w-5 h-5" />;

    default:
      return <HelpCircle className="w-5 h-5" />;
  }
};

const getVerdictColor = () => {
  if (!result) return "";

  switch (result.verdict) {
    case "real":
      return "bg-success/20 text-success border-success/30";

    case "fake":
      return "bg-destructive/20 text-destructive border-destructive/30";

    default:
      return "bg-warning/20 text-warning border-warning/30";
  }
};

  return (
    <div className="space-y-6">
      <Card className="p-8 gradient-card shadow-elevated border-border/50">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Enter news headline or URL to analyze..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="pl-12 h-12 bg-background/50 border-border/50 focus:border-primary transition-all"
            />
          </div>
          <Button 
            onClick={handleSearch} 
            disabled={analyzing}
            className="h-12 px-8 gradient-primary hover:shadow-glow transition-all duration-300"
          >
            {analyzing ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                <span>Analyzing...</span>
              </div>
            ) : (
              <>
                <Search className="w-4 h-4 mr-2" />
                Analyze
              </>
            )}
          </Button>
        </div>
      </Card>

      {result && (
  <Card className="p-8 space-y-6 gradient-card shadow-elevated border-primary/30 animate-fade-in">

    <div className="flex items-center justify-between">

      <h2 className="text-2xl font-bold">
        Analysis Result
      </h2>

      <Badge
        variant="outline"
        className={`${getVerdictColor()} flex items-center gap-2 px-4 py-2`}
      >
        {getVerdictIcon()}
        {result.verdict.toUpperCase()}
      </Badge>

    </div>

    <div className="grid grid-cols-2 gap-6">

      <div className="glass-effect rounded-xl p-6">

        <p className="text-sm text-muted-foreground">
          Confidence
        </p>

        <p className="text-4xl font-bold text-primary">
          {result.confidence.toFixed(1)}%
        </p>

      </div>

      <div className="glass-effect rounded-xl p-6">

        <p className="text-sm text-muted-foreground">
          Credibility Score
        </p>

        <p className="text-4xl font-bold text-primary">
          {result.credibilityScore.toFixed(1)}/100
        </p>

      </div>

    </div>

    <div>

      <h3 className="font-semibold mb-4">
        Model Confidence
      </h3>

      <div className="space-y-4">

        <div>

          <div className="flex justify-between mb-1">
            <span>Real News</span>
            <span>{result.realConfidence.toFixed(1)}%</span>
          </div>

          <div className="w-full h-3 bg-gray-200 rounded-full">

            <div
              className="h-3 bg-green-500 rounded-full transition-all duration-500"
              style={{
                width: `${result.realConfidence}%`,
              }}
            />

          </div>

        </div>

        <div>

          <div className="flex justify-between mb-1">
            <span>Fake News</span>
            <span>{result.fakeConfidence.toFixed(1)}%</span>
          </div>

          <div className="w-full h-3 bg-gray-200 rounded-full">

            <div
              className="h-3 bg-red-500 rounded-full transition-all duration-500"
              style={{
                width: `${result.fakeConfidence}%`,
              }}
            />

          </div>

        </div>

      </div>

    </div>

    <div>

      <h3 className="font-semibold mb-3">
        Detection Signals
      </h3>

      <ul className="space-y-2">

        {result.signals.map((signal, index) => (

          <li
            key={index}
            className="text-sm text-muted-foreground"
          >
            • {signal}
          </li>

        ))}

      </ul>

    </div>

  </Card>
)}
    </div>
  );
};