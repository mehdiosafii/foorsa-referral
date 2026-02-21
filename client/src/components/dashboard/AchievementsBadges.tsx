import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Trophy, Crown, Target, Zap, Star, Flame, 
  Users, TrendingUp, Award, Rocket, Medal, 
  Sparkles, Gift
} from "lucide-react";
import type { UserStats, LeaderboardEntry } from "@shared/schema";

interface AchievementsBadgesProps {
  stats: UserStats;
  leaderboardEntry?: LeaderboardEntry;
  totalParticipants: number;
}

interface Achievement {
  id: string;
  icon: typeof Trophy;
  label: string;
  description: string;
  unlocked: boolean;
  progress?: number;
  maxProgress?: number;
  color: string;
}

export function AchievementsBadges({ stats, leaderboardEntry }: AchievementsBadgesProps) {
  const currentRank = leaderboardEntry?.rank || 999;
  
  const achievements: Achievement[] = [
    {
      id: "first_lead",
      icon: Star,
      label: "First Step",
      description: "Get your first lead",
      unlocked: stats.totalLeads >= 1,
      progress: Math.min(stats.totalLeads, 1),
      maxProgress: 1,
      color: "bg-blue-500",
    },
    {
      id: "five_leads",
      icon: Target,
      label: "Strong Start",
      description: "Get 5 leads",
      unlocked: stats.totalLeads >= 5,
      progress: Math.min(stats.totalLeads, 5),
      maxProgress: 5,
      color: "bg-green-500",
    },
    {
      id: "ten_leads",
      icon: Zap,
      label: "Advanced",
      description: "Get 10 leads",
      unlocked: stats.totalLeads >= 10,
      progress: Math.min(stats.totalLeads, 10),
      maxProgress: 10,
      color: "bg-orange-500",
    },
    {
      id: "twenty_five_leads",
      icon: Rocket,
      label: "Rising Star",
      description: "Get 25 leads",
      unlocked: stats.totalLeads >= 25,
      progress: Math.min(stats.totalLeads, 25),
      maxProgress: 25,
      color: "bg-purple-500",
    },
    {
      id: "fifty_leads",
      icon: Trophy,
      label: "Legend",
      description: "Get 50 leads",
      unlocked: stats.totalLeads >= 50,
      progress: Math.min(stats.totalLeads, 50),
      maxProgress: 50,
      color: "bg-accent",
    },
    {
      id: "first_conversion",
      icon: Gift,
      label: "First Win",
      description: "Get your first conversion",
      unlocked: stats.totalConversions >= 1,
      progress: Math.min(stats.totalConversions, 1),
      maxProgress: 1,
      color: "bg-pink-500",
    },
    {
      id: "five_conversions",
      icon: Users,
      label: "Influencer",
      description: "Get 5 conversions",
      unlocked: stats.totalConversions >= 5,
      progress: Math.min(stats.totalConversions, 5),
      maxProgress: 5,
      color: "bg-teal-500",
    },
    {
      id: "top_ten",
      icon: Medal,
      label: "Top 10",
      description: "Reach the top 10",
      unlocked: currentRank <= 10,
      color: "bg-indigo-500",
    },
    {
      id: "top_three",
      icon: Award,
      label: "Podium",
      description: "Reach the top 3",
      unlocked: currentRank <= 3,
      color: "bg-amber-500",
    },
    {
      id: "champion",
      icon: Crown,
      label: "Champion",
      description: "Reach #1",
      unlocked: currentRank === 1,
      color: "bg-accent",
    },
    {
      id: "high_conversion",
      icon: TrendingUp,
      label: "High Rate",
      description: "Achieve 20%+ conversion rate",
      unlocked: stats.conversionRate >= 20,
      color: "bg-emerald-500",
    },
    {
      id: "on_fire",
      icon: Flame,
      label: "On Fire",
      description: "100+ clicks",
      unlocked: stats.totalClicks >= 100,
      progress: Math.min(stats.totalClicks, 100),
      maxProgress: 100,
      color: "bg-red-500",
    },
  ];

  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const totalAchievements = achievements.length;

  return (
    <Card className="p-5 sm:p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-accent text-accent-foreground shadow-lg shadow-accent/25">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Achievements</h3>
            <p className="text-xs text-muted-foreground">Collect badges and stand out</p>
          </div>
        </div>
        <Badge className="bg-primary/20 text-primary border-0">
          {unlockedCount}/{totalAchievements}
        </Badge>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
        {achievements.map((achievement) => (
          <div 
            key={achievement.id}
            className={`relative group flex flex-col items-center p-3 rounded-xl border transition-all ${
              achievement.unlocked 
                ? 'bg-gradient-to-b from-primary/10 to-primary/5 border-primary/20' 
                : 'bg-muted/30 border-border/50 opacity-50'
            }`}
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
              achievement.unlocked ? achievement.color : 'bg-muted'
            }`}>
              <achievement.icon className={`h-5 w-5 ${achievement.unlocked ? 'text-white' : 'text-muted-foreground'}`} />
            </div>
            <span className="text-[10px] font-medium text-center text-foreground leading-tight">
              {achievement.label}
            </span>
            
            {achievement.progress !== undefined && achievement.maxProgress && !achievement.unlocked && (
              <div className="w-full mt-2">
                <Progress 
                  value={(achievement.progress / achievement.maxProgress) * 100} 
                  className="h-1"
                />
                <span className="text-[8px] text-muted-foreground">
                  {achievement.progress}/{achievement.maxProgress}
                </span>
              </div>
            )}

            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-foreground text-background text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
              {achievement.description}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
