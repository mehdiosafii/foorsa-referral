import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, MousePointerClick, Target, TrendingUp, Trophy, Medal, Award } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { User, Lead } from "@shared/schema";

interface AdminStats {
  totalUsers: number;
  totalClicks: number;
  totalLeads: number;
  totalConversions: number;
}

interface AdminUser extends User {
  stats: {
    clicks: number;
    leads: number;
    conversions: number;
  };
}

interface LeadWithUser extends Lead {
  userName: string;
}

const periodOptions = [
  { value: "all", label: "All Time" },
  { value: "month", label: "This Month" },
  { value: "lastMonth", label: "Last Month" },
  { value: "week", label: "This Week" },
  { value: "7d", label: "Last 7 Days" },
  { value: "30d", label: "Last 30 Days" },
];

export default function AdminOverview() {
  const [period, setPeriod] = useState("all");

  const { data: adminStats, isLoading: statsLoading } = useQuery<AdminStats>({
    queryKey: ["/api/admin/stats", period],
    queryFn: async () => {
      const pw = sessionStorage.getItem("adminPassword") || "";
      const res = await fetch(`/api/admin/stats?period=${period}`, {
        headers: { "x-admin-password": pw },
      });
      if (!res.ok) throw new Error("Failed to fetch stats");
      return res.json();
    },
  });

  const { data: leads, isLoading: leadsLoading } = useQuery<LeadWithUser[]>({
    queryKey: ["/api/admin/leads", period],
    queryFn: async () => {
      const pw = sessionStorage.getItem("adminPassword") || "";
      const res = await fetch(`/api/admin/leads?period=${period}`, {
        headers: { "x-admin-password": pw },
      });
      if (!res.ok) throw new Error("Failed to fetch leads");
      return res.json();
    },
  });

  const { data: users, isLoading: usersLoading } = useQuery<AdminUser[]>({
    queryKey: ["/api/admin/users", period],
    queryFn: async () => {
      const pw = sessionStorage.getItem("adminPassword") || "";
      const res = await fetch(`/api/admin/users?period=${period}`, {
        headers: { "x-admin-password": pw },
      });
      if (!res.ok) throw new Error("Failed to fetch users");
      return res.json();
    },
  });

  const recentLeads = leads?.slice(0, 5) || [];
  const topPerformers = users
    ?.filter(u => !u.isAdmin)
    ?.sort((a, b) => (b.stats?.leads || 0) - (a.stats?.leads || 0))
    ?.slice(0, 3) || [];

  const conversionRate = adminStats?.totalLeads && adminStats.totalLeads > 0
    ? ((adminStats.totalConversions / adminStats.totalLeads) * 100).toFixed(1)
    : "0";

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      new: "default",
      contacted: "secondary",
      converted: "default",
      lost: "destructive",
    };
    return (
      <Badge variant={variants[status] || "outline"} className="text-xs">
        {status}
      </Badge>
    );
  };

  const getRankIcon = (index: number) => {
    const icons = [
      <Trophy key="trophy" className="h-5 w-5 text-yellow-500" />,
      <Medal key="medal" className="h-5 w-5 text-gray-400" />,
      <Award key="award" className="h-5 w-5 text-amber-600" />,
    ];
    return icons[index];
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold" data-testid="heading-overview">Overview</h1>
          <p className="text-muted-foreground text-sm">
            Key metrics and recent activity
          </p>
        </div>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-[160px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {periodOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsLoading ? (
          <>
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-28 rounded-2xl" />
            ))}
          </>
        ) : (
          <>
            <StatsCard
              title="Total Ambassadors"
              value={adminStats?.totalUsers || 0}
              icon={Users}
              variant="primary"
            />
            <StatsCard
              title="Total Clicks"
              value={adminStats?.totalClicks || 0}
              icon={MousePointerClick}
              variant="default"
            />
            <StatsCard
              title="Total Leads"
              value={adminStats?.totalLeads || 0}
              icon={Target}
              variant="gold"
            />
            <StatsCard
              title="Conversion Rate"
              value={`${conversionRate}%`}
              icon={TrendingUp}
              variant="success"
            />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Target className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg font-semibold">Recent Submissions</CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {leadsLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full rounded-lg" />
                ))}
              </div>
            ) : recentLeads.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground">
                <div className="p-4 rounded-full bg-muted/50 w-fit mx-auto mb-3">
                  <Target className="h-8 w-8 opacity-40" />
                </div>
                <p className="text-sm font-medium">No leads yet</p>
                <p className="text-xs text-muted-foreground/70 mt-1">Leads will appear here when submitted</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentLeads.map((lead) => (
                  <div
                    key={lead.id}
                    className="flex items-center justify-between gap-4 py-3 border-b border-border/50 last:border-0"
                    data-testid={`lead-item-${lead.id}`}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm truncate">{lead.fullName}</p>
                      <p className="text-xs text-muted-foreground">
                        via {lead.userName}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      {getStatusBadge(lead.status || 'new')}
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {lead.createdAt ? formatDistanceToNow(new Date(lead.createdAt), { addSuffix: true }) : ''}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-muted">
                <Trophy className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <CardTitle className="text-lg font-semibold">Top Performers</CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {usersLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-20 w-full rounded-lg" />
                ))}
              </div>
            ) : topPerformers.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground">
                <div className="p-4 rounded-full bg-muted/50 w-fit mx-auto mb-3">
                  <Users className="h-8 w-8 opacity-40" />
                </div>
                <p className="text-sm font-medium">No ambassadors yet</p>
                <p className="text-xs text-muted-foreground/70 mt-1">Ambassador performance will appear here</p>
              </div>
            ) : (
              <div className="space-y-3">
                {topPerformers.map((user, index) => (
                  <div
                    key={user.id}
                    className="flex items-center gap-4 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                    data-testid={`performer-item-${user.id}`}
                  >
                    <div className="shrink-0">
                      {getRankIcon(index)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {user.stats?.leads || 0} leads · {user.stats?.clicks || 0} clicks
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-lg font-semibold">{user.stats?.leads || 0}</p>
                      <p className="text-xs text-muted-foreground">leads</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
