import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  BarChart3,
  Trash2,
  Wrench,
  Undo2,
  AlertTriangle,
  Users,
  UserPlus,
  Target,
  TrendingUp,
  Calendar,
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { format, subDays } from "date-fns";
import type { User, Lead } from "@shared/schema";
import { MapView } from "@/components/MapView";

interface ChartDataPoint {
  date: string;
  clicks: number;
  leads: number;
}

type TimeRange = "7d" | "30d" | "90d";

export default function AdminSettings() {
  const { toast } = useToast();
  const [permanentDeleteUserId, setPermanentDeleteUserId] = useState<string | null>(null);
  const [permanentDeleteLeadId, setPermanentDeleteLeadId] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<TimeRange>("30d");

  const { data: chartData, isLoading: chartLoading } = useQuery<ChartDataPoint[]>({
    queryKey: ["/api/admin/chart"],
  });

  const { data: mapClicks, isLoading: mapLoading } = useQuery<any[]>({
    queryKey: ["/api/admin/map/clicks"],
  });

  const { data: trashedUsers, isLoading: trashedUsersLoading } = useQuery<User[]>({
    queryKey: ["/api/admin/trash/users"],
  });

  const { data: trashedLeads, isLoading: trashedLeadsLoading } = useQuery<(Lead & { userName: string })[]>({
    queryKey: ["/api/admin/trash/leads"],
  });

  const getFilteredChartData = () => {
    if (!chartData) return [];
    const days = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90;
    const cutoff = subDays(new Date(), days);
    return chartData.filter(d => new Date(d.date) >= cutoff);
  };

  const filteredData = getFilteredChartData();

  const restoreUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      return await apiRequest("POST", `/api/admin/trash/users/${userId}/restore`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/trash/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({ title: "Ambassador restored successfully" });
    },
    onError: () => {
      toast({ title: "Failed to restore ambassador", variant: "destructive" });
    },
  });

  const permanentDeleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      return await apiRequest("DELETE", `/api/admin/trash/users/${userId}/permanent`, undefined);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/trash/users"] });
      toast({ title: "Ambassador permanently deleted" });
      setPermanentDeleteUserId(null);
    },
    onError: () => {
      toast({ title: "Failed to permanently delete ambassador", variant: "destructive" });
    },
  });

  const restoreLeadMutation = useMutation({
    mutationFn: async (leadId: string) => {
      return await apiRequest("POST", `/api/admin/trash/leads/${leadId}/restore`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/leads"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/trash/leads"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({ title: "Lead restored successfully" });
    },
    onError: () => {
      toast({ title: "Failed to restore lead", variant: "destructive" });
    },
  });

  const permanentDeleteLeadMutation = useMutation({
    mutationFn: async (leadId: string) => {
      return await apiRequest("DELETE", `/api/admin/trash/leads/${leadId}/permanent`, undefined);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/trash/leads"] });
      toast({ title: "Lead permanently deleted" });
      setPermanentDeleteLeadId(null);
    },
    onError: () => {
      toast({ title: "Failed to permanently delete lead", variant: "destructive" });
    },
  });

  const cleanupTrashMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/admin/trash/cleanup", {});
      return res.json() as Promise<{ deletedUsers: number; deletedLeads: number }>;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/trash/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/trash/leads"] });
      toast({ title: `Cleaned up ${data.deletedUsers} users and ${data.deletedLeads} leads` });
    },
    onError: () => {
      toast({ title: "Failed to cleanup trash", variant: "destructive" });
    },
  });

  const seedAmbassadorsMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/admin/seed-ambassadors", {});
      return res.json() as Promise<{ message?: string }>;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/chart"] });
      toast({
        title: "Ambassadors seeded!",
        description: data.message || "Created ambassadors successfully",
      });
    },
    onError: () => {
      toast({ title: "Failed to seed ambassadors", variant: "destructive" });
    },
  });

  const timeRangeOptions: { value: TimeRange; label: string }[] = [
    { value: "7d", label: "7 days" },
    { value: "30d", label: "30 days" },
    { value: "90d", label: "90 days" },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold" data-testid="heading-settings">
          Settings
        </h1>
        <p className="text-muted-foreground">
          Analytics, trash management, and system tools.
        </p>
      </div>

      <Tabs defaultValue="analytics" className="space-y-6">
        <TabsList className="bg-muted/50">
          <TabsTrigger value="analytics" className="gap-2" data-testid="tab-analytics">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="trash" className="gap-2" data-testid="tab-trash">
            <Trash2 className="h-4 w-4" />
            Trash
          </TabsTrigger>
          <TabsTrigger value="system" className="gap-2" data-testid="tab-system">
            <Wrench className="h-4 w-4" />
            System Tools
          </TabsTrigger>
        </TabsList>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader className="pb-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <TrendingUp className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-semibold">Platform Activity</CardTitle>
                    <CardDescription className="text-sm">
                      Clicks and leads over time across all ambassadors
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-lg">
                  {timeRangeOptions.map((option) => (
                    <Button
                      key={option.value}
                      size="sm"
                      variant={timeRange === option.value ? "secondary" : "ghost"}
                      onClick={() => setTimeRange(option.value)}
                      className="text-xs px-3"
                      data-testid={`button-time-${option.value}`}
                    >
                      <Calendar className="h-3 w-3 mr-1.5" />
                      {option.label}
                    </Button>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              {chartLoading ? (
                <div className="h-[350px] flex items-center justify-center">
                  <Skeleton className="h-full w-full rounded-lg" />
                </div>
              ) : filteredData && filteredData.length > 0 ? (
                <div className="h-[350px] pt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={filteredData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorClicksAdmin" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorLeadsAdmin" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.3}/>
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
                        tickFormatter={(value) => format(new Date(value), "MMM dd")}
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={11}
                        tickLine={false}
                        axisLine={false}
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
                        labelFormatter={(value) => format(new Date(value), "PPP")}
                      />
                      <Legend 
                        wrapperStyle={{ fontSize: "12px", paddingTop: "20px" }}
                        iconSize={8}
                        iconType="circle"
                      />
                      <Area 
                        type="monotone" 
                        dataKey="clicks" 
                        stroke="hsl(var(--chart-1))" 
                        strokeWidth={2}
                        fill="url(#colorClicksAdmin)"
                        name="Clicks"
                      />
                      <Area 
                        type="monotone" 
                        dataKey="leads" 
                        stroke="hsl(var(--chart-2))" 
                        strokeWidth={2}
                        fill="url(#colorLeadsAdmin)"
                        name="Leads"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-[350px] flex flex-col items-center justify-center text-muted-foreground gap-3">
                  <div className="p-4 rounded-full bg-muted/50">
                    <BarChart3 className="h-10 w-10 opacity-40" />
                  </div>
                  <p className="text-sm">No activity data available yet</p>
                  <p className="text-xs text-muted-foreground/70">Data will appear as ambassadors generate clicks and leads</p>
                </div>
              )}
            </CardContent>
          </Card>

          <MapView 
            clicks={mapClicks || []} 
            title="Visitor Locations" 
            showAmbassadorName={true} 
            isLoading={mapLoading} 
          />
        </TabsContent>

        <TabsContent value="trash" className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold">Trash Management</h2>
              <p className="text-sm text-muted-foreground">
                Restore or permanently delete trashed items
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => cleanupTrashMutation.mutate()}
              disabled={cleanupTrashMutation.isPending}
              className="gap-2"
              data-testid="button-cleanup-trash"
            >
              <Trash2 className="h-4 w-4" />
              {cleanupTrashMutation.isPending ? "Cleaning..." : "Cleanup Old Trash"}
            </Button>
          </div>

          <Separator className="my-2" />

          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-muted">
                  <Users className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <CardTitle className="text-lg font-semibold">Trashed Ambassadors</CardTitle>
                  <CardDescription className="text-sm">
                    Ambassadors that have been soft deleted
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {trashedUsersLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-20 w-full rounded-lg" />
                  ))}
                </div>
              ) : trashedUsers && trashedUsers.length > 0 ? (
                <div className="space-y-3">
                  {trashedUsers.map((user, index) => (
                    <div key={user.id}>
                      <div
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4"
                        data-testid={`trashed-user-${user.id}`}
                      >
                        <div className="flex flex-col gap-1.5">
                          <span className="font-medium">
                            {user.firstName} {user.lastName}
                          </span>
                          <span className="text-sm text-muted-foreground">{user.email}</span>
                          {user.deletedAt && (
                            <span className="text-xs text-muted-foreground/70">
                              Deleted {format(new Date(user.deletedAt), "PPp")}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => restoreUserMutation.mutate(user.id)}
                            disabled={restoreUserMutation.isPending}
                            className="gap-1.5"
                            data-testid={`button-restore-user-${user.id}`}
                          >
                            <Undo2 className="h-3.5 w-3.5" />
                            Restore
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => setPermanentDeleteUserId(user.id)}
                            className="gap-1.5"
                            data-testid={`button-delete-user-${user.id}`}
                          >
                            <AlertTriangle className="h-3.5 w-3.5" />
                            Delete Forever
                          </Button>
                        </div>
                      </div>
                      {index < trashedUsers.length - 1 && <Separator />}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center text-muted-foreground">
                  <div className="p-4 rounded-full bg-muted/50 w-fit mx-auto mb-3">
                    <Users className="h-8 w-8 opacity-40" />
                  </div>
                  <p className="text-sm">No trashed ambassadors</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-muted">
                  <Target className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <CardTitle className="text-lg font-semibold">Trashed Leads</CardTitle>
                  <CardDescription className="text-sm">
                    Leads that have been soft deleted
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {trashedLeadsLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-20 w-full rounded-lg" />
                  ))}
                </div>
              ) : trashedLeads && trashedLeads.length > 0 ? (
                <div className="space-y-3">
                  {trashedLeads.map((lead, index) => (
                    <div key={lead.id}>
                      <div
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4"
                        data-testid={`trashed-lead-${lead.id}`}
                      >
                        <div className="flex flex-col gap-1.5">
                          <span className="font-medium">{lead.fullName}</span>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm text-muted-foreground">{lead.email}</span>
                            <Badge variant="secondary" className="text-xs">
                              via {lead.userName}
                            </Badge>
                          </div>
                          {lead.deletedAt && (
                            <span className="text-xs text-muted-foreground/70">
                              Deleted {format(new Date(lead.deletedAt), "PPp")}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => restoreLeadMutation.mutate(lead.id)}
                            disabled={restoreLeadMutation.isPending}
                            className="gap-1.5"
                            data-testid={`button-restore-lead-${lead.id}`}
                          >
                            <Undo2 className="h-3.5 w-3.5" />
                            Restore
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => setPermanentDeleteLeadId(lead.id)}
                            className="gap-1.5"
                            data-testid={`button-delete-lead-${lead.id}`}
                          >
                            <AlertTriangle className="h-3.5 w-3.5" />
                            Delete Forever
                          </Button>
                        </div>
                      </div>
                      {index < trashedLeads.length - 1 && <Separator />}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center text-muted-foreground">
                  <div className="p-4 rounded-full bg-muted/50 w-fit mx-auto mb-3">
                    <Target className="h-8 w-8 opacity-40" />
                  </div>
                  <p className="text-sm">No trashed leads</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold">System Tools</h2>
            <p className="text-sm text-muted-foreground">
              Administrative tools for managing the platform
            </p>
          </div>

          <Separator className="my-2" />

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <UserPlus className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-semibold">Seed Ambassadors</CardTitle>
                    <CardDescription className="text-sm">
                      Create sample ambassador accounts for testing
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  This will create sample ambassador accounts with pre-generated data for testing and demonstration purposes.
                </p>
                <Button
                  onClick={() => seedAmbassadorsMutation.mutate()}
                  disabled={seedAmbassadorsMutation.isPending}
                  className="gap-2"
                  size="lg"
                  data-testid="button-seed-ambassadors"
                >
                  <Users className="h-4 w-4" />
                  {seedAmbassadorsMutation.isPending ? "Seeding..." : "Seed Ambassadors"}
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <AlertDialog
        open={!!permanentDeleteUserId}
        onOpenChange={() => setPermanentDeleteUserId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Permanently Delete Ambassador?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the ambassador
              and all associated data from the database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete-user">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (permanentDeleteUserId) {
                  permanentDeleteUserMutation.mutate(permanentDeleteUserId);
                }
              }}
              className="bg-destructive text-destructive-foreground"
              data-testid="button-confirm-delete-user"
            >
              Delete Forever
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={!!permanentDeleteLeadId}
        onOpenChange={() => setPermanentDeleteLeadId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Permanently Delete Lead?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the lead
              from the database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete-lead">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (permanentDeleteLeadId) {
                  permanentDeleteLeadMutation.mutate(permanentDeleteLeadId);
                }
              }}
              className="bg-destructive text-destructive-foreground"
              data-testid="button-confirm-delete-lead"
            >
              Delete Forever
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
