import { useLanguage } from "@/context/LanguageContext";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, Tooltip } from "recharts";
import { TrendingUp, Crown, Target, Zap, Award, Users } from "lucide-react";
import type { LeaderboardEntry } from "@shared/schema";

interface RankChartProps {
  entries: LeaderboardEntry[];
  currentUserId?: string;
  isLoading?: boolean;
}

export function RankChart({ entries, currentUserId, isLoading }: RankChartProps) {
  const { t } = useLanguage();
  
  const currentUserEntry = entries.find(e => e.userId === currentUserId);
  const currentRank = currentUserEntry?.rank || 0;
  const totalParticipants = entries.length;
  
  if (isLoading) {
    return (
      <Card className="p-5 sm:p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-muted rounded-lg w-1/3" />
          <div className="h-48 bg-muted rounded-xl" />
        </div>
      </Card>
    );
  }

  if (!currentUserEntry || entries.length === 0) {
    return null;
  }

  const chartData = entries.slice(0, 10).map(entry => {
    const isCurrentUser = entry.userId === currentUserId;
    return {
      name: isCurrentUser ? entry.firstName : `#${entry.rank}`,
      leads: entry.totalLeads,
      conversions: entry.totalConversions,
      isCurrentUser,
      rank: entry.rank,
    };
  });

  const percentile = Math.round(((totalParticipants - currentRank + 1) / totalParticipants) * 100);
  
  const achievements = [];
  if (currentRank === 1) achievements.push({ icon: Crown, label: "Leader", color: "bg-accent text-accent-foreground" });
  if (currentRank <= 3) achievements.push({ icon: Award, label: "Top 3", color: "bg-primary text-primary-foreground" });
  if (currentUserEntry.totalLeads >= 10) achievements.push({ icon: Target, label: "10+ Leads", color: "bg-green-500 text-white" });
  if (currentUserEntry.totalLeads >= 25) achievements.push({ icon: Zap, label: "25+ Leads", color: "bg-orange-500 text-white" });
  if (currentUserEntry.totalConversions >= 5) achievements.push({ icon: Users, label: "5+ Conversions", color: "bg-blue-500 text-white" });

  return (
    <Card className="p-5 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/25">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Performance Analysis</h3>
            <p className="text-xs text-muted-foreground">Compared to top 10 ambassadors</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="text-center px-4 py-2 rounded-xl bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20">
            <div className="text-2xl font-bold text-primary">Top {percentile}%</div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Percentile</div>
          </div>
        </div>
      </div>

      {achievements.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {achievements.map((achievement, i) => (
            <Badge key={i} className={`${achievement.color} gap-1`}>
              <achievement.icon className="h-3 w-3" />
              {achievement.label}
            </Badge>
          ))}
        </div>
      )}

      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical" margin={{ left: 0, right: 20 }}>
            <XAxis type="number" hide />
            <YAxis 
              type="category" 
              dataKey="name" 
              width={70}
              tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
                      <p className="font-semibold text-foreground mb-1">
                        {data.isCurrentUser ? `${data.name} (You)` : `Ambassador #${data.rank}`}
                      </p>
                      <p className="text-sm text-muted-foreground">Rank: #{data.rank}</p>
                      {data.isCurrentUser && (
                        <>
                          <p className="text-sm text-muted-foreground">Leads: {data.leads}</p>
                          <p className="text-sm text-muted-foreground">Conversions: {data.conversions}</p>
                        </>
                      )}
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="leads" radius={[0, 4, 4, 0]}>
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`}
                  fill={entry.isCurrentUser ? 'hsl(var(--primary))' : 'hsl(var(--muted))'}
                  opacity={entry.isCurrentUser ? 1 : 0.6}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 pt-4 border-t border-border/50">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-foreground">{currentUserEntry.totalLeads}</div>
            <div className="text-xs text-muted-foreground">Leads</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-primary">{currentUserEntry.totalConversions}</div>
            <div className="text-xs text-muted-foreground">Conversions</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-accent">#{currentRank}</div>
            <div className="text-xs text-muted-foreground">Rank</div>
          </div>
        </div>
      </div>
    </Card>
  );
}
