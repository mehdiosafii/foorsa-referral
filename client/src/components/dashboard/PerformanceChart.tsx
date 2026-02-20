import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { TrendingUp, Activity } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface ChartData {
  date: string;
  clicks: number;
  leads: number;
}

interface PerformanceChartProps {
  data: ChartData[];
}

export function PerformanceChart({ data }: PerformanceChartProps) {
  const { t } = useLanguage();
  const hasData = data.some(d => d.clicks > 0 || d.leads > 0);
  
  return (
    <Card data-testid="card-performance-chart">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Activity className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              {t.dashboard.chart.title}
              <TrendingUp className="h-4 w-4 text-emerald-500" />
            </CardTitle>
            <CardDescription className="text-sm">{t.dashboard.chart.subtitle}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {!hasData ? (
          <div className="h-56 sm:h-64 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <div className="p-4 rounded-full bg-muted/50 w-fit mx-auto mb-3">
                <Activity className="h-8 w-8 opacity-40" />
              </div>
              <p className="text-sm">{t.dashboard.chart.empty}</p>
            </div>
          </div>
        ) : (
          <div className="h-56 sm:h-64 lg:h-72 pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorClicksDash" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorLeadsDash" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  stroke="hsl(var(--border))" 
                  vertical={false}
                  strokeOpacity={0.5}
                />
                <XAxis 
                  dataKey="date" 
                  stroke="hsl(var(--muted-foreground))" 
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  interval="preserveStartEnd"
                  dy={10}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))" 
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                  dx={-10}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "12px",
                    color: "hsl(var(--foreground))",
                    fontSize: "12px",
                    padding: "12px 16px",
                    boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
                  }}
                />
                <Legend 
                  wrapperStyle={{ fontSize: "12px", paddingTop: "16px" }}
                  iconSize={8}
                  iconType="circle"
                />
                <Area 
                  type="monotone" 
                  dataKey="clicks" 
                  stroke="hsl(var(--chart-1))" 
                  strokeWidth={2}
                  fill="url(#colorClicksDash)"
                  name={t.dashboard.chart.clicks}
                />
                <Area 
                  type="monotone" 
                  dataKey="leads" 
                  stroke="hsl(var(--chart-2))" 
                  strokeWidth={2}
                  fill="url(#colorLeadsDash)"
                  name={t.dashboard.chart.leads}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
