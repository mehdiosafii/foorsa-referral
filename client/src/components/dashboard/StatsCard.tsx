import { Card } from "@/components/ui/card";
import { ArrowUp, ArrowDown } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: number;
  description?: string;
  variant?: "default" | "primary" | "gold" | "success";
}

export function StatsCard({ title, value, icon: Icon, trend, description, variant = "default" }: StatsCardProps) {
  const isPositive = trend !== undefined && trend >= 0;
  const hasTrend = trend !== undefined;

  return (
    <Card 
      className="relative bg-card/95 border border-border/50 rounded-lg p-5 shadow-sm transition-all duration-200"
      data-testid={`stats-card-${title.toLowerCase().replace(/\s/g, '-')}`}
    >
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground font-medium">{title}</span>
        </div>
        
        <div className="flex items-end gap-3">
          <p className="text-2xl sm:text-3xl font-semibold text-foreground tracking-tight">
            {value}
          </p>
          
          {hasTrend && (
            <div 
              className={`inline-flex items-center gap-0.5 text-xs font-medium px-1.5 py-0.5 rounded ${
                isPositive 
                  ? 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20' 
                  : 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20'
              }`}
            >
              {isPositive ? (
                <ArrowUp className="h-3 w-3" />
              ) : (
                <ArrowDown className="h-3 w-3" />
              )}
              <span>{isPositive ? '+' : ''}{trend}%</span>
            </div>
          )}
        </div>
        
        {description && (
          <span className="text-xs text-muted-foreground">{description}</span>
        )}
      </div>
    </Card>
  );
}
