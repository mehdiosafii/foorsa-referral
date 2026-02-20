import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/context/LanguageContext";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { ReferralLinkCard } from "@/components/dashboard/ReferralLinkCard";
import { PerformanceChart } from "@/components/dashboard/PerformanceChart";
import { LeadsTable } from "@/components/dashboard/LeadsTable";
import { Leaderboard } from "@/components/dashboard/Leaderboard";
import { RankChart } from "@/components/dashboard/RankChart";
import { AchievementsBadges } from "@/components/dashboard/AchievementsBadges";
import { MotivationalQuote } from "@/components/dashboard/MotivationalQuote";
import { SocialMediaCard } from "@/components/dashboard/SocialMediaCard";
import { UniversityInfoCard } from "@/components/dashboard/UniversityInfoCard";
import { MapView } from "@/components/MapView";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MousePointerClick, Users, TrendingUp, Target, Sparkles } from "lucide-react";
import type { UserStats, LeaderboardEntry, Lead } from "@shared/schema";

export default function Dashboard() {
  const { toast } = useToast();
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const { t, dir } = useLanguage();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: t.dashboard.unauthorized,
        description: t.dashboard.loggingIn,
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
    }
  }, [isAuthenticated, authLoading, toast, t]);

  const { data: stats, isLoading: statsLoading } = useQuery<UserStats>({
    queryKey: ["/api/stats"],
    enabled: isAuthenticated,
  });

  const { data: leads, isLoading: leadsLoading } = useQuery<Lead[]>({
    queryKey: ["/api/leads"],
    enabled: isAuthenticated,
  });

  const { data: leaderboard, isLoading: leaderboardLoading } = useQuery<LeaderboardEntry[]>({
    queryKey: ["/api/leaderboard"],
    enabled: isAuthenticated,
  });

  const { data: chartData } = useQuery<{ date: string; clicks: number; leads: number }[]>({
    queryKey: ["/api/stats/chart"],
    enabled: isAuthenticated,
  });

  const { data: mapClicks, isLoading: mapLoading } = useQuery<any[]>({
    queryKey: ["/api/ambassador/map/clicks"],
    enabled: isAuthenticated,
  });

  if (authLoading) {
    return (
      <div className="container mx-auto px-4 sm:px-6 py-8 max-w-7xl" dir={dir}>
        <div className="space-y-8">
          <div className="space-y-2">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-5 w-96" />
          </div>
          <Skeleton className="h-24 rounded-2xl" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-28 rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen" dir={dir}>
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-7xl space-y-6 sm:space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 ring-4 ring-accent/20" data-testid="avatar-ambassador">
              <AvatarImage 
                src={user?.profileImageUrl || undefined} 
                alt={`${user?.firstName} ${user?.lastName}`} 
              />
              <AvatarFallback className="text-xl bg-accent/10 text-foreground">
                {user?.firstName?.charAt(0) || "A"}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground" data-testid="text-dashboard-title">
                  {t.dashboard.welcome}, {user?.firstName || t.dashboard.ambassador}
                </h1>
                <Sparkles className="h-6 w-6 text-accent" />
              </div>
              <p className="text-muted-foreground">
                {t.dashboard.subtitle}
              </p>
            </div>
          </div>
        </div>

        <MotivationalQuote userId={user?.id} />

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statsLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-28 rounded-2xl" />
            ))
          ) : (
            <>
              <StatsCard
                title={t.dashboard.stats.clicks}
                value={stats?.totalClicks || 0}
                icon={MousePointerClick}
                description={t.dashboard.stats.totalVisits}
                variant="default"
              />
              <StatsCard
                title={t.dashboard.stats.leads}
                value={stats?.totalLeads || 0}
                icon={Users}
                description={t.dashboard.stats.submissions}
                variant="primary"
              />
              <StatsCard
                title={t.dashboard.stats.conversions}
                value={stats?.totalConversions || 0}
                icon={Target}
                description={t.dashboard.stats.enrollments}
                variant="success"
              />
              <StatsCard
                title={t.dashboard.stats.rate}
                value={`${stats?.conversionRate?.toFixed(1) || 0}%`}
                icon={TrendingUp}
                description={t.dashboard.stats.successRate}
                variant="gold"
              />
            </>
          )}
        </div>

        <ReferralLinkCard referralCode={user?.referralCode || ""} />

        <SocialMediaCard
          instagramUrl={user?.instagramUrl}
          youtubeUrl={user?.youtubeUrl}
          tiktokUrl={user?.tiktokUrl}
          instagramFollowers={user?.instagramFollowers}
          youtubeFollowers={user?.youtubeFollowers}
          tiktokFollowers={user?.tiktokFollowers}
        />

        <UniversityInfoCard />

        {chartData && chartData.length > 0 && (
          <PerformanceChart data={chartData} />
        )}

        <RankChart 
          entries={leaderboard || []} 
          currentUserId={user?.id}
          isLoading={leaderboardLoading}
        />

        {stats && (
          <AchievementsBadges 
            stats={stats}
            leaderboardEntry={leaderboard?.find(e => e.userId === user?.id)}
            totalParticipants={leaderboard?.length || 0}
          />
        )}

        <MapView 
          clicks={mapClicks || []} 
          title="Your Visitor Locations" 
          isLoading={mapLoading} 
        />

        <div className="grid gap-6 lg:grid-cols-2">
          <LeadsTable leads={leads || []} isLoading={leadsLoading} />
          <Leaderboard 
            entries={leaderboard || []} 
            currentUserId={user?.id}
            isLoading={leaderboardLoading}
          />
        </div>
      </div>
    </div>
  );
}
