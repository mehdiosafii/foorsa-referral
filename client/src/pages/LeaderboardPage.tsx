import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Leaderboard } from "@/components/dashboard/Leaderboard";
import { Skeleton } from "@/components/ui/skeleton";
import type { LeaderboardEntry } from "@shared/schema";

export default function LeaderboardPage() {
  const { toast } = useToast();
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
    }
  }, [isAuthenticated, authLoading, toast]);

  const { data: leaderboard, isLoading } = useQuery<LeaderboardEntry[]>({
    queryKey: ["/api/leaderboard"],
    enabled: isAuthenticated,
  });

  if (authLoading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground" data-testid="text-leaderboard-title">
          Leaderboard
        </h1>
        <p className="text-muted-foreground">
          See how you rank against other referral partners.
        </p>
      </div>

      <Leaderboard 
        entries={leaderboard || []} 
        currentUserId={user?.id}
        isLoading={isLoading}
      />
    </div>
  );
}
