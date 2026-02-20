import { useState } from "react";
import { LucideIcon, ChevronDown, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface DetailItem {
  label: string;
  value: string | number;
  change?: number;
}

interface FuturisticStatsBlockProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  trend?: number;
  details?: DetailItem[];
  color?: "violet" | "blue" | "emerald" | "amber" | "rose";
  testId?: string;
}

const colorStyles = {
  violet: {
    gradient: "from-violet-500/20 via-violet-500/10 to-transparent",
    border: "border-violet-500/30 hover:border-violet-400/50",
    glow: "shadow-violet-500/20 hover:shadow-violet-500/40",
    icon: "from-violet-500 to-violet-600",
    accent: "text-violet-400",
    bar: "bg-violet-500",
  },
  blue: {
    gradient: "from-blue-500/20 via-blue-500/10 to-transparent",
    border: "border-blue-500/30 hover:border-blue-400/50",
    glow: "shadow-blue-500/20 hover:shadow-blue-500/40",
    icon: "from-blue-500 to-blue-600",
    accent: "text-blue-400",
    bar: "bg-blue-500",
  },
  emerald: {
    gradient: "from-emerald-500/20 via-emerald-500/10 to-transparent",
    border: "border-emerald-500/30 hover:border-emerald-400/50",
    glow: "shadow-emerald-500/20 hover:shadow-emerald-500/40",
    icon: "from-emerald-500 to-emerald-600",
    accent: "text-emerald-400",
    bar: "bg-emerald-500",
  },
  amber: {
    gradient: "from-amber-500/20 via-amber-500/10 to-transparent",
    border: "border-amber-500/30 hover:border-amber-400/50",
    glow: "shadow-amber-500/20 hover:shadow-amber-500/40",
    icon: "from-amber-500 to-amber-600",
    accent: "text-amber-400",
    bar: "bg-amber-500",
  },
  rose: {
    gradient: "from-rose-500/20 via-rose-500/10 to-transparent",
    border: "border-rose-500/30 hover:border-rose-400/50",
    glow: "shadow-rose-500/20 hover:shadow-rose-500/40",
    icon: "from-rose-500 to-rose-600",
    accent: "text-rose-400",
    bar: "bg-rose-500",
  },
};

export function FuturisticStatsBlock({
  title,
  value,
  icon: Icon,
  description,
  trend,
  details,
  color = "violet",
  testId,
}: FuturisticStatsBlockProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasDetails = details && details.length > 0;
  const styles = colorStyles[color];

  const getTrendIcon = () => {
    if (!trend) return <Minus className="h-3 w-3" />;
    if (trend > 0) return <TrendingUp className="h-3 w-3" />;
    return <TrendingDown className="h-3 w-3" />;
  };

  const getTrendColor = () => {
    if (!trend) return "text-slate-400";
    if (trend > 0) return "text-emerald-400";
    return "text-rose-400";
  };

  return (
    <motion.div
      layout
      className={cn(
        "relative rounded-2xl border bg-slate-900/80 backdrop-blur-xl overflow-hidden cursor-pointer transition-all duration-300",
        styles.border,
        "shadow-lg",
        styles.glow,
        isExpanded && "col-span-2 row-span-2"
      )}
      onClick={() => hasDetails && setIsExpanded(!isExpanded)}
      data-testid={testId}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className={cn("absolute inset-0 bg-gradient-to-br opacity-50", styles.gradient)} />
      
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      
      <div className="relative p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">{title}</span>
              {hasDetails && (
                <motion.div
                  animate={{ rotate: isExpanded ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown className="h-3 w-3 text-slate-500" />
                </motion.div>
              )}
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-bold text-white tracking-tight">{value}</span>
              {trend !== undefined && (
                <span className={cn("flex items-center gap-0.5 text-xs font-medium", getTrendColor())}>
                  {getTrendIcon()}
                  {Math.abs(trend)}%
                </span>
              )}
            </div>
            {description && (
              <p className="text-xs text-slate-500 mt-1">{description}</p>
            )}
          </div>
          
          <div className={cn("p-2.5 rounded-xl bg-gradient-to-br shadow-lg", styles.icon)}>
            <Icon className="h-5 w-5 text-white" />
          </div>
        </div>

        <AnimatePresence>
          {isExpanded && details && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-4 pt-4 border-t border-slate-700/50"
            >
              <div className="grid gap-3">
                {details.map((detail, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between"
                  >
                    <span className="text-sm text-slate-400">{detail.label}</span>
                    <div className="flex items-center gap-2">
                      <span className={cn("text-sm font-semibold", styles.accent)}>{detail.value}</span>
                      {detail.change !== undefined && (
                        <span className={cn("text-xs", detail.change >= 0 ? "text-emerald-400" : "text-rose-400")}>
                          {detail.change >= 0 ? "+" : ""}{detail.change}%
                        </span>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
              
              <div className="mt-4 h-1.5 rounded-full bg-slate-800 overflow-hidden">
                <motion.div
                  className={cn("h-full rounded-full", styles.bar)}
                  initial={{ width: 0 }}
                  animate={{ width: "65%" }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="absolute -bottom-20 -right-20 w-40 h-40 rounded-full bg-gradient-to-br from-white/5 to-transparent blur-2xl pointer-events-none" />
    </motion.div>
  );
}

interface FuturisticGridProps {
  children: React.ReactNode;
  className?: string;
}

export function FuturisticGrid({ children, className }: FuturisticGridProps) {
  return (
    <div className={cn("grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4", className)}>
      {children}
    </div>
  );
}
