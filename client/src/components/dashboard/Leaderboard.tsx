import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Trophy, Medal, Crown, Flame, TrendingUp, Target, Zap, Star, Award, Lock } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import type { LeaderboardEntry } from "@shared/schema";

interface LeaderboardProps {
  entries: LeaderboardEntry[];
  currentUserId?: string;
  isLoading?: boolean;
}

export function Leaderboard({ entries, currentUserId, isLoading }: LeaderboardProps) {
  const { t } = useLanguage();
  
  const currentUserEntry = entries.find(e => e.userId === currentUserId);
  const currentRank = currentUserEntry?.rank || 0;
  const totalParticipants = entries.length;
  const nextRankEntry = entries.find(e => e.rank === currentRank - 1);
  const leadsToNextRank = Math.max(0, nextRankEntry ? nextRankEntry.totalLeads - (currentUserEntry?.totalLeads || 0) : 0);
  
  if (isLoading) {
    return (
      <div className="rounded-2xl border border-border/50 bg-gradient-to-br from-card via-card to-card p-5 sm:p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-muted rounded-lg w-1/3" />
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-14 bg-muted rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const getRankDisplay = (rank: number, isCurrentUser: boolean) => {
    if (rank === 1) return (
      <div className={`w-8 h-8 rounded-full bg-accent flex items-center justify-center shadow-lg shadow-accent/30 ${isCurrentUser ? 'ring-2 ring-primary' : ''}`}>
        <Crown className="h-4 w-4 text-accent-foreground" />
      </div>
    );
    if (rank === 2) return (
      <div className={`w-8 h-8 rounded-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center shadow-lg shadow-gray-400/30 ${isCurrentUser ? 'ring-2 ring-primary' : ''}`}>
        <Medal className="h-4 w-4 text-white" />
      </div>
    );
    if (rank === 3) return (
      <div className={`w-8 h-8 rounded-full bg-accent/70 flex items-center justify-center shadow-lg shadow-accent/20 ${isCurrentUser ? 'ring-2 ring-primary' : ''}`}>
        <Medal className="h-4 w-4 text-accent-foreground" />
      </div>
    );
    return (
      <div className={`w-8 h-8 rounded-full bg-muted flex items-center justify-center ${isCurrentUser ? 'ring-2 ring-primary' : ''}`}>
        <span className="text-sm font-bold text-muted-foreground">{rank}</span>
      </div>
    );
  };

  const getMotivationalMessage = (rank: number, total: number) => {
    const percentile = ((total - rank + 1) / total) * 100;
    if (rank === 1) return { message: "You're the champion! Stay on top", icon: Crown, color: "text-accent" };
    if (rank <= 3) return { message: "You're in the top ranks! Keep going", icon: Star, color: "text-accent" };
    if (percentile >= 75) return { message: "Excellent performance! Close to the top", icon: TrendingUp, color: "text-green-500" };
    if (percentile >= 50) return { message: "Halfway there! You can move up", icon: Target, color: "text-blue-500" };
    return { message: "Great opportunity to climb the ranks!", icon: Zap, color: "text-orange-500" };
  };

  const motivation = currentRank > 0 ? getMotivationalMessage(currentRank, totalParticipants) : null;

  return (
    <div className="rounded-2xl border border-border/50 bg-gradient-to-br from-card via-card to-card p-5 sm:p-6" data-testid="card-leaderboard">
      <div className="flex items-center gap-3 mb-5">
        <div className="p-2.5 rounded-xl bg-accent text-accent-foreground shadow-lg shadow-accent/25">
          <Trophy className="h-5 w-5" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground">{t.dashboard.leaderboard.title}</h3>
          <p className="text-xs text-muted-foreground">Compete with other ambassadors</p>
        </div>
      </div>

      {currentUserEntry && (
        <div className="mb-5 p-4 rounded-xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5 text-primary" />
              <span className="font-semibold text-foreground">Your Current Rank</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-3xl font-bold text-primary">#{currentRank}</span>
              <span className="text-sm text-muted-foreground">of {totalParticipants}</span>
            </div>
          </div>
          
          {motivation && (
            <div className="flex items-center gap-2 mb-3">
              <motivation.icon className={`h-4 w-4 ${motivation.color}`} />
              <span className="text-sm text-muted-foreground">{motivation.message}</span>
            </div>
          )}
          
          {currentRank > 1 && nextRankEntry && leadsToNextRank > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">To reach rank #{currentRank - 1}</span>
                <span className="font-medium text-primary">{leadsToNextRank} leads remaining</span>
              </div>
              <Progress 
                value={Math.max(0, 100 - (leadsToNextRank / Math.max(1, currentUserEntry.totalLeads + leadsToNextRank)) * 100)} 
                className="h-2"
              />
            </div>
          )}
          
          {currentRank === 1 && (
            <div className="flex items-center gap-2 text-accent">
              <Flame className="h-4 w-4" />
              <span className="text-sm font-medium">You're in the lead! Don't lose your spot</span>
            </div>
          )}
        </div>
      )}
      
      {entries.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <p className="text-sm">{t.dashboard.leaderboard.empty}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {entries.slice(0, 10).map((entry) => {
            const isCurrentUser = entry.userId === currentUserId;
            return (
              <div 
                key={entry.userId}
                className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-200 ${
                  isCurrentUser 
                    ? "bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 shadow-sm" 
                    : "bg-muted/30"
                }`}
                data-testid={`row-leaderboard-${entry.userId}`}
              >
                <div className="shrink-0">
                  {getRankDisplay(entry.rank, isCurrentUser)}
                </div>
                
                <Avatar className="h-9 w-9 shrink-0 ring-2 ring-background">
                  <AvatarImage src={entry.profileImageUrl || undefined} />
                  <AvatarFallback className="text-sm font-medium bg-gradient-to-br from-primary/20 to-primary/10">
                    {entry.firstName?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm truncate">
                      {entry.firstName}
                    </span>
                    {isCurrentUser && (
                      <Badge className="text-[10px] px-1.5 py-0 bg-primary/20 text-primary border-0">
                        {t.dashboard.leaderboard.you}
                      </Badge>
                    )}
                    {entry.rank === 1 && <Flame className="h-3.5 w-3.5 text-accent" />}
                  </div>
                </div>
                
                {isCurrentUser ? (
                  <div className="flex items-center gap-4 text-sm shrink-0">
                    <div className="text-center">
                      <div className="font-semibold text-foreground">{entry.totalLeads}</div>
                      <div className="text-[10px] text-muted-foreground uppercase tracking-wider">{t.dashboard.leaderboard.leads}</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-primary">{entry.totalConversions}</div>
                      <div className="text-[10px] text-muted-foreground uppercase tracking-wider">{t.dashboard.leaderboard.conversions}</div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Lock className="h-3.5 w-3.5" />
                    <span className="text-xs">Hidden</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
