import { Card } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  trendUp?: boolean;
}

export const StatsCard = ({ title, value, icon: Icon, trend, trendUp }: StatsCardProps) => {
  return (
    <Card className="group relative overflow-hidden p-6 gradient-card hover:shadow-elevated transition-all duration-500 hover:-translate-y-1 border-border/50 hover:border-primary/50">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <div className="relative flex items-start justify-between">
        <div className="space-y-3 flex-1">
          <p className="text-sm text-muted-foreground/70 font-medium">{title}</p>
          <p className="text-4xl font-bold bg-gradient-to-br from-foreground to-foreground/60 bg-clip-text text-transparent">
            {value}
          </p>
          {trend && (
            <p className={`text-xs font-medium flex items-center gap-1 ${trendUp ? 'text-success' : 'text-destructive'}`}>
              <span className={`inline-block w-2 h-2 rounded-full ${trendUp ? 'bg-success' : 'bg-destructive'} animate-pulse`} />
              {trend}
            </p>
          )}
        </div>
        <div className="p-4 bg-primary/10 rounded-xl group-hover:bg-primary/20 transition-all duration-500 group-hover:shadow-glow">
          <Icon className="w-7 h-7 text-primary group-hover:scale-110 transition-transform duration-500" />
        </div>
      </div>
    </Card>
  );
};
