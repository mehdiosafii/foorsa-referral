import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, BarChart, Bar, Cell } from "recharts";
import { 
  Users, MousePointerClick, Target, TrendingUp, 
  Search, Download, Shield, ShieldOff, Trash2,
  Activity, UserCheck, BarChart3, Clock, Eye, UserPlus, Trophy, Medal, Award, Lock,
  KeyRound, ExternalLink, Undo2, AlertTriangle, Copy, LogIn, Link, Plus, Pencil, Smartphone
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { MapView } from "@/components/MapView";
import { format, formatDistanceToNow } from "date-fns";
import { FuturisticStatsBlock, FuturisticGrid } from "@/components/admin/FuturisticStatsBlock";
import type { User, Lead, TrackingLinkStats, PerformanceEntity, PerformanceTimeseries } from "@shared/schema";

// Admin password is validated server-side via /api/auth/admin

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

interface AmbassadorRankings {
  userId: string;
  clicks: { value: number; rank: number; total: number; percentile: number };
  leads: { value: number; rank: number; total: number; percentile: number };
  conversions: { value: number; rank: number; total: number; percentile: number };
  topPerformers: { name: string; clicks: number; leads: number; conversions: number }[];
}

const createAmbassadorSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().optional(),
  password: z.string().min(4, "Password must be at least 4 characters"),
  instagramUrl: z.string().optional(),
  youtubeUrl: z.string().optional(),
  tiktokUrl: z.string().optional(),
  instagramFollowers: z.number().optional(),
  youtubeFollowers: z.number().optional(),
  tiktokFollowers: z.number().optional(),
});

type CreateAmbassadorForm = z.infer<typeof createAmbassadorSchema>;

const trackingLinkSchema = z.object({
  name: z.string().min(1, "Name is required"),
  platform: z.string().min(1, "Platform is required"),
  code: z.string().min(1, "Code is required").regex(/^[a-zA-Z0-9_-]+$/, "Code can only contain letters, numbers, hyphens, and underscores"),
});

type TrackingLinkForm = z.infer<typeof trackingLinkSchema>;

const PLATFORMS = ["Facebook", "Instagram", "TikTok", "Google", "YouTube", "Twitter", "LinkedIn", "Email", "Other"];

export default function AdminPanel() {
  const { toast } = useToast();
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem("adminAuthenticated") === "true";
  });
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [leadStatusFilter, setLeadStatusFilter] = useState<string>("all");
  const [deleteLeadId, setDeleteLeadId] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [showAddAmbassador, setShowAddAmbassador] = useState(false);
  const [analyticsUser, setAnalyticsUser] = useState<AdminUser | null>(null);
  const [passwordChangeUser, setPasswordChangeUser] = useState<AdminUser | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [showTrackingLinkDialog, setShowTrackingLinkDialog] = useState(false);
  const [editingTrackingLink, setEditingTrackingLink] = useState<TrackingLinkStats | null>(null);
  const [deleteTrackingLinkId, setDeleteTrackingLinkId] = useState<string | null>(null);

  // Analytics tab state
  const [analyticsPlatform, setAnalyticsPlatform] = useState<string>("All");
  const [analyticsAmbassadorId, setAnalyticsAmbassadorId] = useState<string>("all");
  const [analyticsDateRange, setAnalyticsDateRange] = useState<number>(30);
  const [analyticsSortColumn, setAnalyticsSortColumn] = useState<keyof PerformanceEntity>("clicks");
  const [analyticsSortOrder, setAnalyticsSortOrder] = useState<"asc" | "desc">("desc");

  const form = useForm<CreateAmbassadorForm>({
    resolver: zodResolver(createAmbassadorSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      password: "",
      instagramUrl: "",
      youtubeUrl: "",
      tiktokUrl: "",
      instagramFollowers: 0,
      youtubeFollowers: 0,
      tiktokFollowers: 0,
    },
  });

  const trackingLinkForm = useForm<TrackingLinkForm>({
    resolver: zodResolver(trackingLinkSchema),
    defaultValues: {
      name: "",
      platform: "",
      code: "",
    },
  });

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/auth/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        setIsAuthenticated(true);
        sessionStorage.setItem("adminAuthenticated", "true");
        sessionStorage.setItem("adminPassword", password);
        setPasswordError("");
      } else {
        setPasswordError("Incorrect password");
        setPassword("");
      }
    } catch {
      setPasswordError("Login failed");
      setPassword("");
    }
  };

  const { data: adminStats, isLoading: statsLoading } = useQuery<AdminStats>({
    queryKey: ["/api/admin/stats"],
    enabled: isAuthenticated,
  });

  const { data: users, isLoading: usersLoading } = useQuery<AdminUser[]>({
    queryKey: ["/api/admin/users"],
    enabled: isAuthenticated,
  });

  const { data: allLeads, isLoading: leadsLoading } = useQuery<(Lead & { userName: string })[]>({
    queryKey: ["/api/admin/leads"],
    enabled: isAuthenticated,
  });

  const { data: chartData } = useQuery<{ date: string; clicks: number; leads: number }[]>({
    queryKey: ["/api/admin/chart"],
    enabled: isAuthenticated,
  });

  const { data: ambassadorRankings } = useQuery<AmbassadorRankings>({
    queryKey: ["/api/admin/users", analyticsUser?.id, "rankings"],
    enabled: !!analyticsUser,
  });

  const { data: ambassadorTrend } = useQuery<{ date: string; clicks: number; leads: number; conversions: number }[]>({
    queryKey: ["/api/admin/users", analyticsUser?.id, "trend"],
    enabled: !!analyticsUser,
  });

  // Trash queries
  const { data: trashedUsers } = useQuery<User[]>({
    queryKey: ["/api/admin/trash/users"],
    enabled: isAuthenticated,
  });

  const { data: trashedLeads } = useQuery<(Lead & { userName: string })[]>({
    queryKey: ["/api/admin/trash/leads"],
    enabled: isAuthenticated,
  });

  const { data: mapClicks, isLoading: mapLoading } = useQuery<any[]>({
    queryKey: ["/api/admin/map/clicks"],
    enabled: isAuthenticated,
  });

  const { data: trackingLinks, isLoading: trackingLinksLoading } = useQuery<TrackingLinkStats[]>({
    queryKey: ["/api/admin/tracking-links"],
    enabled: isAuthenticated,
  });

  // Analytics queries
  const analyticsStartDate = new Date();
  analyticsStartDate.setDate(analyticsStartDate.getDate() - analyticsDateRange);

  const { data: analyticsSummary, isLoading: analyticsSummaryLoading } = useQuery<PerformanceEntity[]>({
    queryKey: ["/api/admin/analytics/summary", analyticsPlatform, analyticsAmbassadorId, analyticsDateRange],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (analyticsPlatform !== "All") params.set("platform", analyticsPlatform);
      if (analyticsAmbassadorId !== "all") params.set("ambassadorId", analyticsAmbassadorId);
      params.set("startDate", analyticsStartDate.toISOString());
      params.set("endDate", new Date().toISOString());
      const res = await fetch(`/api/admin/analytics/summary?${params}`, {
        headers: { "X-Admin-Password": sessionStorage.getItem("adminPassword") || "" },
      });
      if (!res.ok) throw new Error("Failed to fetch analytics summary");
      return res.json();
    },
    enabled: isAuthenticated,
  });

  const { data: analyticsTimeseries, isLoading: analyticsTimeseriesLoading } = useQuery<PerformanceTimeseries[]>({
    queryKey: ["/api/admin/analytics/timeseries", analyticsPlatform, analyticsAmbassadorId, analyticsDateRange],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (analyticsPlatform !== "All") params.set("platform", analyticsPlatform);
      if (analyticsAmbassadorId !== "all") params.set("ambassadorId", analyticsAmbassadorId);
      params.set("startDate", analyticsStartDate.toISOString());
      params.set("endDate", new Date().toISOString());
      const res = await fetch(`/api/admin/analytics/timeseries?${params}`, {
        headers: { "X-Admin-Password": sessionStorage.getItem("adminPassword") || "" },
      });
      if (!res.ok) throw new Error("Failed to fetch analytics timeseries");
      return res.json();
    },
    enabled: isAuthenticated,
  });

  const createAmbassadorMutation = useMutation({
    mutationFn: async (data: CreateAmbassadorForm) => {
      return await apiRequest("POST", "/api/admin/users", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/chart"] });
      toast({ title: "Ambassador created successfully!" });
      setShowAddAmbassador(false);
      form.reset();
    },
    onError: () => {
      toast({ title: "Failed to create ambassador", variant: "destructive" });
    },
  });

  const seedAmbassadorsMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", "/api/admin/seed-ambassadors", {});
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/chart"] });
      toast({ 
        title: "Ambassadors seeded!", 
        description: data.message || `Created ambassadors successfully` 
      });
    },
    onError: () => {
      toast({ title: "Failed to seed ambassadors", variant: "destructive" });
    },
  });

  const updateLeadMutation = useMutation({
    mutationFn: async ({ leadId, status }: { leadId: string; status: string }) => {
      return await apiRequest("PATCH", `/api/admin/leads/${leadId}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/leads"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({ title: "Lead status updated" });
    },
    onError: () => {
      toast({ title: "Failed to update lead", variant: "destructive" });
    },
  });

  const deleteLeadMutation = useMutation({
    mutationFn: async (leadId: string) => {
      return await apiRequest("DELETE", `/api/admin/leads/${leadId}`, undefined);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/leads"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/trash/leads"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({ title: "Lead moved to trash" });
      setDeleteLeadId(null);
    },
    onError: () => {
      toast({ title: "Failed to delete lead", variant: "destructive" });
    },
  });

  const convertLeadMutation = useMutation({
    mutationFn: async (leadId: string) => {
      return await apiRequest("POST", `/api/admin/leads/${leadId}/convert`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({ title: "Lead marked as converted!" });
    },
    onError: () => {
      toast({ title: "Failed to convert lead", variant: "destructive" });
    },
  });

  const toggleAdminMutation = useMutation({
    mutationFn: async (userId: string) => {
      return await apiRequest("PATCH", `/api/admin/users/${userId}/toggle-admin`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({ title: "User admin status updated" });
    },
    onError: () => {
      toast({ title: "Failed to update user", variant: "destructive" });
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: async ({ userId, password }: { userId: string; password: string }) => {
      return await apiRequest("PATCH", `/api/admin/users/${userId}/password`, { password });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({ title: "Password updated successfully" });
      setPasswordChangeUser(null);
      setNewPassword("");
    },
    onError: (error: any) => {
      toast({ title: error.message || "Failed to update password", variant: "destructive" });
    },
  });

  const handlePasswordChange = () => {
    if (!passwordChangeUser || !newPassword || newPassword.length < 4) {
      toast({ title: "Password must be at least 4 characters", variant: "destructive" });
      return;
    }
    changePasswordMutation.mutate({ userId: passwordChangeUser.id, password: newPassword });
  };

  const impersonateMutation = useMutation({
    mutationFn: async (userId: string) => {
      return await apiRequest("POST", `/api/admin/users/${userId}/impersonate`, {});
    },
    onSuccess: (data: any) => {
      toast({ title: "Logging in as ambassador...", description: `Redirecting to ${data.user?.firstName}'s dashboard` });
      // Redirect to the ambassador dashboard
      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 500);
    },
    onError: (error: any) => {
      toast({ title: error.message || "Failed to impersonate ambassador", variant: "destructive" });
    },
  });

  const openAmbassadorPortal = (user: AdminUser) => {
    window.open(`/ref/${user.referralCode}`, "_blank");
  };

  // State for user deletion
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);
  const [permanentDeleteUserId, setPermanentDeleteUserId] = useState<string | null>(null);
  const [permanentDeleteLeadId, setPermanentDeleteLeadId] = useState<string | null>(null);

  // Soft delete user mutation
  const softDeleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      return await apiRequest("DELETE", `/api/admin/users/${userId}`, undefined);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/trash/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({ title: "Ambassador moved to trash" });
      setDeleteUserId(null);
    },
    onError: () => {
      toast({ title: "Failed to delete ambassador", variant: "destructive" });
    },
  });

  // Restore user mutation
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

  // Permanent delete user mutation
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

  // Restore lead mutation
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

  // Permanent delete lead mutation
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

  // Cleanup old trash
  const cleanupTrashMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", "/api/admin/trash/cleanup", {});
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/trash/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/trash/leads"] });
      toast({ title: `Cleaned up ${data.deletedUsers} users and ${data.deletedLeads} leads` });
    },
    onError: () => {
      toast({ title: "Failed to cleanup trash", variant: "destructive" });
    },
  });

  // Tracking Links mutations
  const createTrackingLinkMutation = useMutation({
    mutationFn: async (data: TrackingLinkForm) => {
      return await apiRequest("POST", "/api/admin/tracking-links", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/tracking-links"] });
      toast({ title: "Tracking link created successfully!" });
      setShowTrackingLinkDialog(false);
      trackingLinkForm.reset();
    },
    onError: (error: any) => {
      toast({ title: error.message || "Failed to create tracking link", variant: "destructive" });
    },
  });

  const updateTrackingLinkMutation = useMutation({
    mutationFn: async ({ id, ...data }: { id: string; name?: string; platform?: string; isActive?: boolean }) => {
      return await apiRequest("PATCH", `/api/admin/tracking-links/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/tracking-links"] });
      toast({ title: "Tracking link updated" });
      setShowTrackingLinkDialog(false);
      setEditingTrackingLink(null);
      trackingLinkForm.reset();
    },
    onError: (error: any) => {
      toast({ title: error.message || "Failed to update tracking link", variant: "destructive" });
    },
  });

  const deleteTrackingLinkMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/admin/tracking-links/${id}`, undefined);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/tracking-links"] });
      toast({ title: "Tracking link deleted" });
      setDeleteTrackingLinkId(null);
    },
    onError: () => {
      toast({ title: "Failed to delete tracking link", variant: "destructive" });
    },
  });

  const toggleTrackingLinkStatus = (link: TrackingLinkStats) => {
    updateTrackingLinkMutation.mutate({ id: link.id, isActive: !link.isActive });
  };

  const copyTrackingUrl = (code: string) => {
    const url = `${window.location.origin}?track=${code}`;
    navigator.clipboard.writeText(url);
    toast({ title: "Tracking URL copied to clipboard" });
  };

  const openTrackingLinkDialog = (link?: TrackingLinkStats) => {
    if (link) {
      setEditingTrackingLink(link);
      trackingLinkForm.reset({
        name: link.name,
        platform: link.platform,
        code: link.code,
      });
    } else {
      setEditingTrackingLink(null);
      trackingLinkForm.reset({
        name: "",
        platform: "",
        code: "",
      });
    }
    setShowTrackingLinkDialog(true);
  };

  const onSubmitTrackingLink = (data: TrackingLinkForm) => {
    if (editingTrackingLink) {
      updateTrackingLinkMutation.mutate({ id: editingTrackingLink.id, name: data.name, platform: data.platform });
    } else {
      createTrackingLinkMutation.mutate(data);
    }
  };

  const exportToCSV = (data: any[], filename: string) => {
    if (!data || data.length === 0) {
      toast({ title: "No data to export", variant: "destructive" });
      return;
    }
    
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(","),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header];
          if (typeof value === "object") return JSON.stringify(value);
          if (typeof value === "string" && value.includes(",")) return `"${value}"`;
          return value ?? "";
        }).join(",")
      )
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}_${format(new Date(), "yyyy-MM-dd")}.csv`;
    link.click();
    toast({ title: `Exported ${data.length} records` });
  };

  const onSubmitAmbassador = (data: CreateAmbassadorForm) => {
    createAmbassadorMutation.mutate(data);
  };

  if (!isAuthenticated) {
    return (
      <div 
        className="flex items-center justify-center min-h-screen p-6 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)' }}
      >
        <div 
          className="fixed inset-0 pointer-events-none"
          aria-hidden="true"
          data-testid="decorative-floating-elements"
        >
          <div className="absolute font-serif text-8xl font-light tracking-wide" style={{ top: '5%', left: '3%', color: 'rgba(139, 92, 246, 0.15)', animation: 'adminFloatSlow 12s ease-in-out infinite', textShadow: '0 0 40px rgba(139, 92, 246, 0.1)' }}>中</div>
          <div className="absolute font-serif text-7xl font-light" style={{ top: '8%', right: '25%', color: 'rgba(236, 72, 153, 0.12)', animation: 'adminFloatSlow 14s ease-in-out infinite 2s' }}>国</div>
          <div className="absolute font-serif text-6xl font-light" style={{ top: '20%', left: '8%', color: 'rgba(59, 130, 246, 0.13)', animation: 'adminFloatSlow 11s ease-in-out infinite 1s' }}>学</div>
          <div className="absolute font-serif text-9xl font-extralight" style={{ bottom: '8%', left: '5%', color: 'rgba(139, 92, 246, 0.12)', animation: 'adminFloatSlow 15s ease-in-out infinite 3s', textShadow: '0 0 60px rgba(139, 92, 246, 0.08)' }}>北</div>
          <div className="absolute font-serif text-7xl font-light" style={{ bottom: '15%', left: '20%', color: 'rgba(236, 72, 153, 0.1)', animation: 'adminFloatSlow 13s ease-in-out infinite 4s' }}>京</div>
          <div className="absolute font-serif text-5xl font-light" style={{ top: '40%', left: '2%', color: 'rgba(59, 130, 246, 0.12)', animation: 'adminFloatSlow 10s ease-in-out infinite 2.5s' }}>留</div>
          <div className="absolute font-serif text-6xl font-light" style={{ top: '60%', left: '5%', color: 'rgba(139, 92, 246, 0.1)', animation: 'adminFloatSlow 14s ease-in-out infinite 5s' }}>华</div>
          <div className="absolute font-serif text-8xl font-extralight" style={{ top: '12%', right: '5%', color: 'rgba(59, 130, 246, 0.14)', animation: 'adminFloatSlow 12s ease-in-out infinite 1.5s', textShadow: '0 0 50px rgba(59, 130, 246, 0.1)' }}>大</div>
          <div className="absolute font-serif text-5xl font-light" style={{ top: '35%', right: '3%', color: 'rgba(236, 72, 153, 0.11)', animation: 'adminFloatSlow 11s ease-in-out infinite 3.5s' }}>生</div>
          <div className="absolute font-serif text-6xl font-light" style={{ bottom: '25%', right: '8%', color: 'rgba(139, 92, 246, 0.12)', animation: 'adminFloatSlow 13s ease-in-out infinite 4.5s' }}>飞</div>
          <div className="absolute font-serif text-7xl font-light" style={{ bottom: '5%', right: '15%', color: 'rgba(59, 130, 246, 0.13)', animation: 'adminFloatSlow 15s ease-in-out infinite 2s' }}>梦</div>
          <div className="absolute font-serif text-5xl font-light" style={{ top: '70%', right: '3%', color: 'rgba(236, 72, 153, 0.1)', animation: 'adminFloatSlow 12s ease-in-out infinite 5.5s' }}>志</div>
          <div className="absolute font-serif text-4xl font-light" style={{ top: '85%', left: '35%', color: 'rgba(139, 92, 246, 0.08)', animation: 'adminFloatSlow 14s ease-in-out infinite 6s' }}>未</div>
          <div className="absolute font-serif text-4xl font-light" style={{ top: '3%', left: '40%', color: 'rgba(59, 130, 246, 0.1)', animation: 'adminFloatSlow 11s ease-in-out infinite 7s' }}>来</div>

          <div 
            className="absolute"
            style={{
              top: '15%',
              right: '8%',
              animation: 'adminFloatSlow 8s ease-in-out infinite',
            }}
            data-testid="decorative-iphone"
          >
            <div className="relative w-32 h-48 sm:w-44 sm:h-64">
              <div className="absolute -inset-4 rounded-[2.5rem] bg-gradient-to-br from-violet-500/20 via-pink-500/15 to-blue-500/20 blur-2xl" />
              <div className="absolute -inset-2 rounded-[2rem] bg-gradient-to-br from-violet-400/10 to-pink-400/10 blur-xl" />
              <div 
                className="absolute inset-0 rounded-[1.5rem] border-2 border-white/20"
                style={{ 
                  background: 'linear-gradient(180deg, rgba(30, 27, 75, 0.95) 0%, rgba(15, 23, 42, 0.98) 100%)',
                  boxShadow: '0 25px 50px -12px rgba(139, 92, 246, 0.25), inset 0 1px 0 rgba(255,255,255,0.1)'
                }}
              >
                <div className="absolute top-3 left-1/2 -translate-x-1/2 flex items-center gap-2">
                  <div className="w-12 h-1.5 rounded-full bg-slate-700/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-600/60" />
                </div>
                <div className="absolute inset-4 top-8 rounded-xl bg-gradient-to-br from-violet-500/10 via-transparent to-pink-500/10 flex items-center justify-center">
                  <Smartphone className="w-12 h-12 sm:w-16 sm:h-16 text-violet-400/80" />
                </div>
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-sm font-medium text-violet-300/70">
                  iPhone 17
                </div>
              </div>
            </div>
          </div>

          <div 
            className="absolute hidden sm:block"
            style={{
              bottom: '10%',
              left: '8%',
              animation: 'adminFloatSlow 18s ease-in-out infinite 3s',
            }}
            data-testid="decorative-china-map"
          >
            <svg viewBox="0 0 200 150" className="w-48 h-36 opacity-30" aria-hidden="true">
              <defs>
                <linearGradient id="adminMapGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="rgb(139, 92, 246)" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="rgb(59, 130, 246)" stopOpacity="0.4" />
                </linearGradient>
              </defs>
              <path 
                d="M20,75 Q50,30 100,40 Q150,50 180,75 Q150,100 100,110 Q50,120 20,75 Z" 
                fill="none" 
                stroke="url(#adminMapGradient)"
                strokeWidth="2"
              />
              <circle cx="60" cy="70" r="4" fill="rgba(236, 72, 153, 0.5)" />
              <circle cx="100" cy="60" r="5" fill="rgba(139, 92, 246, 0.5)" />
              <circle cx="140" cy="75" r="4" fill="rgba(59, 130, 246, 0.5)" />
            </svg>
          </div>
        </div>

        <style>{`
          @keyframes adminFloatSlow {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            33% { transform: translateY(-12px) rotate(1deg); }
            66% { transform: translateY(-6px) rotate(-0.5deg); }
          }
        `}</style>

        <div className="relative w-full max-w-sm z-10">
          <div className="relative rounded-2xl border border-white/10 bg-slate-900/70 backdrop-blur-xl p-8 text-center shadow-2xl shadow-violet-500/10">
            <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-violet-600 to-violet-700 flex items-center justify-center shadow-lg shadow-violet-500/25">
              <Lock className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Admin Access</h2>
            <p className="text-slate-400 mb-6">Enter the admin password to continue</p>
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <Input
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="text-center h-12 rounded-xl border-slate-700/50 bg-slate-800/50 text-white placeholder:text-slate-500 focus:border-violet-500/50"
                data-testid="input-admin-password"
              />
              {passwordError && (
                <p className="text-sm text-red-400">{passwordError}</p>
              )}
              <Button type="submit" className="w-full h-12 rounded-xl text-base bg-gradient-to-r from-violet-600 to-violet-700 hover:from-violet-500 hover:to-violet-600 border-0 shadow-lg shadow-violet-500/25" data-testid="button-admin-login">
                Access Admin Panel
              </Button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  const filteredUsers = users?.filter(u => 
    !searchQuery || 
    u.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.referralCode?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const filteredLeads = allLeads?.filter(l => 
    leadStatusFilter === "all" || l.status === leadStatusFilter
  ) || [];

  const conversionRate = adminStats && adminStats.totalLeads > 0 
    ? ((adminStats.totalConversions / adminStats.totalLeads) * 100).toFixed(1)
    : "0";

  const recentLeads = allLeads?.slice(0, 5) || [];
  const topPerformers = [...(users || [])].sort((a, b) => b.stats.leads - a.stats.leads).slice(0, 5);

  const statusColors: Record<string, string> = {
    new: "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300",
    contacted: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300",
    converted: "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300",
    lost: "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300",
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="h-5 w-5 text-yellow-500" />;
    if (rank === 2) return <Medal className="h-5 w-5 text-gray-400" />;
    if (rank === 3) return <Award className="h-5 w-5 text-amber-600" />;
    return <span className="text-sm font-bold text-muted-foreground">#{rank}</span>;
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground" data-testid="text-admin-title">
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground">
            Complete overview and management of your referral platform
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <Button 
            onClick={() => seedAmbassadorsMutation.mutate()} 
            variant="outline"
            className="rounded-xl gap-2"
            disabled={seedAmbassadorsMutation.isPending}
            data-testid="button-seed-ambassadors"
          >
            <Users className="h-4 w-4" />
            {seedAmbassadorsMutation.isPending ? "Seeding..." : "Seed Ambassadors"}
          </Button>
          <Button 
            onClick={() => setShowAddAmbassador(true)} 
            className="rounded-xl gap-2 shadow-lg shadow-primary/25"
            data-testid="button-add-ambassador"
          >
            <UserPlus className="h-4 w-4" />
            Add Ambassador
          </Button>
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
            <Shield className="h-3.5 w-3.5 text-primary" />
            <span className="text-sm font-medium text-primary">Administrator</span>
          </div>
        </div>
      </div>

      {/* Futuristic Stats Overview */}
      <FuturisticGrid>
        {statsLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-2xl bg-slate-800/50" />
          ))
        ) : (
          <>
            <FuturisticStatsBlock
              title="Ambassadors"
              value={adminStats?.totalUsers || 0}
              icon={Users}
              description="Active partners"
              color="violet"
              trend={12}
              testId="stats-ambassadors"
              details={[
                { label: "Active this week", value: Math.floor((adminStats?.totalUsers || 0) * 0.7), change: 8 },
                { label: "New this month", value: Math.floor((adminStats?.totalUsers || 0) * 0.2), change: 15 },
                { label: "Avg leads/ambassador", value: adminStats?.totalUsers ? Math.round(adminStats.totalLeads / adminStats.totalUsers) : 0 },
              ]}
            />
            <FuturisticStatsBlock
              title="Total Clicks"
              value={adminStats?.totalClicks || 0}
              icon={MousePointerClick}
              description="Link visits"
              color="blue"
              trend={8}
              testId="stats-clicks"
              details={[
                { label: "Today", value: Math.floor((adminStats?.totalClicks || 0) * 0.05), change: 12 },
                { label: "This week", value: Math.floor((adminStats?.totalClicks || 0) * 0.25), change: 5 },
                { label: "Click-to-lead rate", value: adminStats?.totalClicks ? `${((adminStats.totalLeads / adminStats.totalClicks) * 100).toFixed(1)}%` : "0%" },
              ]}
            />
            <FuturisticStatsBlock
              title="Total Leads"
              value={adminStats?.totalLeads || 0}
              icon={Target}
              description="Submissions"
              color="emerald"
              trend={15}
              testId="stats-leads"
              details={[
                { label: "New leads", value: allLeads?.filter(l => l.status === "new").length || 0 },
                { label: "Contacted", value: allLeads?.filter(l => l.status === "contacted").length || 0 },
                { label: "Converted", value: allLeads?.filter(l => l.status === "converted").length || 0 },
                { label: "Lost", value: allLeads?.filter(l => l.status === "lost").length || 0 },
              ]}
            />
            <FuturisticStatsBlock
              title="Applied"
              value={adminStats?.totalConversions || 0}
              icon={UserCheck}
              description="Successful apps"
              color="amber"
              trend={22}
              testId="stats-conversions"
              details={[
                { label: "This month", value: Math.floor((adminStats?.totalConversions || 0) * 0.3), change: 18 },
                { label: "Pending verification", value: Math.floor((adminStats?.totalConversions || 0) * 0.1) },
                { label: "Avg time to convert", value: "3.2 days" },
              ]}
            />
            <FuturisticStatsBlock
              title="Conv. Rate"
              value={`${conversionRate}%`}
              icon={TrendingUp}
              description="Conversion rate"
              color="rose"
              trend={parseFloat(conversionRate) > 10 ? 5 : -2}
              testId="stats-rate"
              details={[
                { label: "vs last month", value: "+2.3%", change: 8 },
                { label: "Industry avg", value: "8.5%" },
                { label: "Target", value: "15%" },
              ]}
            />
          </>
        )}
      </FuturisticGrid>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Performance Chart */}
        <div className="rounded-2xl border border-border/50 bg-gradient-to-br from-card via-card to-card p-5 sm:p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-lg shadow-primary/25">
              <Activity className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold">Platform Activity</h3>
              <p className="text-xs text-muted-foreground">Last 30 days performance</p>
            </div>
          </div>
          <div className="h-64">
            {chartData && chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" fontSize={10} tickLine={false} axisLine={false} interval="preserveStartEnd" />
                  <YAxis fontSize={10} tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: "12px" }} />
                  <Line type="monotone" dataKey="clicks" stroke="hsl(var(--chart-1))" strokeWidth={2} dot={false} name="Clicks" />
                  <Line type="monotone" dataKey="leads" stroke="hsl(var(--chart-2))" strokeWidth={2} dot={false} name="Leads" />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                No activity data yet
              </div>
            )}
          </div>
        </div>

        {/* Top Performers */}
        <div className="rounded-2xl border border-border/50 bg-gradient-to-br from-card via-card to-card p-5 sm:p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-lg shadow-amber-500/25">
              <BarChart3 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold">Top Performers</h3>
              <p className="text-xs text-muted-foreground">Best performing ambassadors</p>
            </div>
          </div>
          <div className="h-64">
            {topPerformers.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topPerformers.map(u => ({ 
                  name: u.firstName || "User", 
                  leads: u.stats.leads,
                  conversions: u.stats.conversions
                }))} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis fontSize={10} tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey="leads" fill="hsl(var(--chart-1))" name="Leads" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="conversions" fill="hsl(var(--chart-2))" name="Conversions" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                No performer data yet
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Visitor Map */}
      <MapView 
        clicks={mapClicks || []} 
        title="Visitor Locations" 
        showAmbassadorName={true} 
        isLoading={mapLoading} 
      />

      {/* Recent Activity */}
      <div className="rounded-2xl border border-border/50 bg-gradient-to-br from-card via-card to-card p-5 sm:p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold">Recent Submissions</h3>
            <p className="text-xs text-muted-foreground">Latest form submissions</p>
          </div>
        </div>
        <div className="space-y-3">
          {recentLeads.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No recent submissions</p>
          ) : (
            recentLeads.map((lead) => (
              <div key={lead.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs">{lead.fullName?.charAt(0) || "L"}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate">{lead.fullName}</p>
                    <p className="text-xs text-muted-foreground">{lead.userName || "Direct"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className={`text-xs ${statusColors[lead.status || "new"]}`}>
                    {lead.status || "new"}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {lead.createdAt ? formatDistanceToNow(new Date(lead.createdAt), { addSuffix: true }) : ""}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="users" className="space-y-6">
        <TabsList className="w-full sm:w-auto h-12 p-1 rounded-xl bg-muted/50">
          <TabsTrigger value="users" className="flex-1 sm:flex-none gap-2 rounded-lg" data-testid="tab-users">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Ambassadors</span>
            <span className="sm:hidden">Team</span>
          </TabsTrigger>
          <TabsTrigger value="leads" className="flex-1 sm:flex-none gap-2 rounded-lg" data-testid="tab-leads">
            <Target className="h-4 w-4" />
            <span className="hidden sm:inline">All Leads</span>
            <span className="sm:hidden">Leads</span>
          </TabsTrigger>
          <TabsTrigger value="tracking" className="flex-1 sm:flex-none gap-2 rounded-lg" data-testid="tab-tracking-links">
            <Link className="h-4 w-4" />
            <span className="hidden sm:inline">Tracking Links</span>
            <span className="sm:hidden">Links</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex-1 sm:flex-none gap-2 rounded-lg" data-testid="tab-analytics">
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">Analytics</span>
            <span className="sm:hidden">Stats</span>
          </TabsTrigger>
          <TabsTrigger value="trash" className="flex-1 sm:flex-none gap-2 rounded-lg" data-testid="tab-trash">
            <Trash2 className="h-4 w-4" />
            <span className="hidden sm:inline">Trash</span>
            <span className="sm:hidden">Trash</span>
          </TabsTrigger>
        </TabsList>

        {/* Ambassadors Tab */}
        <TabsContent value="users">
          <div className="rounded-2xl border border-border/50 bg-gradient-to-br from-card via-card to-card p-5 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <h3 className="font-semibold text-foreground">Manage Ambassadors</h3>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name, email, or code..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 w-full sm:w-72"
                    data-testid="input-search-users"
                  />
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => exportToCSV(users?.map(u => ({
                    name: `${u.firstName} ${u.lastName}`,
                    email: u.email,
                    phone: u.phone || "",
                    referralCode: u.referralCode,
                    clicks: u.stats.clicks,
                    leads: u.stats.leads,
                    conversions: u.stats.conversions,
                    isAdmin: u.isAdmin,
                    joined: u.createdAt,
                  })) || [], "ambassadors")}
                  data-testid="button-export"
                >
                  <Download className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Export CSV</span>
                </Button>
              </div>
            </div>

            {usersLoading ? (
              <Skeleton className="h-60" />
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {searchQuery ? "No ambassadors match your search" : "No ambassadors yet"}
              </div>
            ) : (
              <div className="overflow-x-auto -mx-4 sm:mx-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ambassador</TableHead>
                      <TableHead className="hidden sm:table-cell">Referral Code</TableHead>
                      <TableHead className="text-right">Clicks</TableHead>
                      <TableHead className="text-right">Leads</TableHead>
                      <TableHead className="text-right hidden sm:table-cell">Applied</TableHead>
                      <TableHead className="hidden md:table-cell">Joined</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((u) => (
                      <TableRow key={u.id} data-testid={`row-user-${u.id}`}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={u.profileImageUrl || undefined} />
                              <AvatarFallback className="text-xs">{u.firstName?.charAt(0) || "U"}</AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <p className="font-medium text-sm truncate">{u.firstName} {u.lastName}</p>
                                {u.isAdmin && (
                                  <Badge variant="secondary" className="text-[10px] px-1">Admin</Badge>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <code className="text-xs bg-muted px-2 py-1 rounded font-mono">
                            {u.referralCode}
                          </code>
                        </TableCell>
                        <TableCell className="text-right tabular-nums">{u.stats?.clicks || 0}</TableCell>
                        <TableCell className="text-right tabular-nums">{u.stats?.leads || 0}</TableCell>
                        <TableCell className="text-right tabular-nums font-semibold hidden sm:table-cell">{u.stats?.conversions || 0}</TableCell>
                        <TableCell className="text-muted-foreground text-xs hidden md:table-cell">
                          {u.createdAt ? format(new Date(u.createdAt), "MMM d, yyyy") : "-"}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                const domain = "https://foorsa.live";
                                const dashboardUrl = `${domain}/partner`;
                                const referralUrl = `${domain}/r/${u.referralCode}`;
                                const message = `Hi ${u.firstName || ""},

Welcome to the Foorsa Partnership Program!

Foorsa is a leading platform helping students study in China. As a partner, you can earn commissions on every student who signs up through your link.

🔐 Login Credentials:
Email: ${u.email}
Password: ${u.password || "1234"}

🔗 Your Links:
Dashboard: ${dashboardUrl}
Your Referral Link: ${referralUrl}

Share your referral link with your followers and earn on every registration!

Team Foorsa`;
                                navigator.clipboard.writeText(message);
                                toast({ title: "Copied!", description: "Message with credentials copied" });
                              }}
                              title="Copy Login Credentials"
                              data-testid={`button-copy-${u.id}`}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setAnalyticsUser(u)}
                              title="View Analytics"
                              data-testid={`button-analytics-${u.id}`}
                            >
                              <BarChart3 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setSelectedUser(u)}
                              title="View Details"
                              data-testid={`button-view-${u.id}`}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setPasswordChangeUser(u)}
                              title="Change Password"
                              data-testid={`button-password-${u.id}`}
                            >
                              <KeyRound className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openAmbassadorPortal(u)}
                              title="View Landing Page"
                              data-testid={`button-portal-${u.id}`}
                            >
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => impersonateMutation.mutate(u.id)}
                              title="Login as Ambassador"
                              data-testid={`button-impersonate-${u.id}`}
                              disabled={impersonateMutation.isPending}
                              className="text-primary"
                            >
                              <LogIn className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setDeleteUserId(u.id)}
                              title="Delete Ambassador"
                              data-testid={`button-delete-user-${u.id}`}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Leads Tab */}
        <TabsContent value="leads">
          <div className="rounded-2xl border border-border/50 bg-gradient-to-br from-card via-card to-card p-5 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <h3 className="font-semibold text-foreground">Manage Leads</h3>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4">
                <Select value={leadStatusFilter} onValueChange={setLeadStatusFilter}>
                  <SelectTrigger className="w-full sm:w-40" data-testid="select-status-filter">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="contacted">Contacted</SelectItem>
                    <SelectItem value="converted">Converted</SelectItem>
                    <SelectItem value="lost">Lost</SelectItem>
                  </SelectContent>
                </Select>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => exportToCSV(allLeads?.map(l => ({
                    name: l.fullName,
                    email: l.email,
                    phone: l.phone,
                    program: l.preferredProgram,
                    city: l.preferredCity,
                    referredBy: l.userName,
                    status: l.status,
                    date: l.createdAt,
                  })) || [], "leads")}
                  data-testid="button-export-leads"
                >
                  <Download className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Export CSV</span>
                </Button>
              </div>
            </div>

            {leadsLoading ? (
              <Skeleton className="h-60" />
            ) : filteredLeads.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {leadStatusFilter !== "all" ? `No ${leadStatusFilter} leads` : "No leads yet"}
              </div>
            ) : (
              <div className="overflow-x-auto -mx-4 sm:mx-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Lead</TableHead>
                      <TableHead className="hidden sm:table-cell">Contact</TableHead>
                      <TableHead className="hidden md:table-cell">Program</TableHead>
                      <TableHead>Referred By</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="hidden sm:table-cell">Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLeads.map((lead) => (
                      <TableRow key={lead.id} data-testid={`row-admin-lead-${lead.id}`}>
                        <TableCell>
                          <div className="min-w-0">
                            <p className="font-medium text-sm truncate">{lead.fullName}</p>
                            <p className="text-xs text-muted-foreground truncate sm:hidden">{lead.email}</p>
                          </div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <div className="text-xs">
                            <p className="truncate">{lead.email}</p>
                            <p className="text-muted-foreground">{lead.phone}</p>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-sm">{lead.preferredProgram || "-"}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {lead.userName || "Direct"}
                        </TableCell>
                        <TableCell>
                          <Select
                            value={lead.status || "new"}
                            onValueChange={(value) => updateLeadMutation.mutate({ leadId: lead.id, status: value })}
                          >
                            <SelectTrigger className="w-28 h-8 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="new">New</SelectItem>
                              <SelectItem value="contacted">Contacted</SelectItem>
                              <SelectItem value="converted">Converted</SelectItem>
                              <SelectItem value="lost">Lost</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-xs hidden sm:table-cell">
                          {lead.createdAt ? format(new Date(lead.createdAt), "MMM d") : "-"}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            {lead.status !== "converted" && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-xs h-8"
                                onClick={() => convertLeadMutation.mutate(lead.id)}
                                disabled={convertLeadMutation.isPending}
                                data-testid={`button-convert-${lead.id}`}
                              >
                                <UserCheck className="h-3 w-3 sm:mr-1" />
                                <span className="hidden sm:inline">Convert</span>
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive"
                              onClick={() => setDeleteLeadId(lead.id)}
                              data-testid={`button-delete-${lead.id}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Tracking Links Tab */}
        <TabsContent value="tracking">
          <div className="rounded-2xl border border-border/50 bg-gradient-to-br from-card via-card to-card p-5 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <h3 className="font-semibold text-foreground" data-testid="text-tracking-links-title">Manage Tracking Links</h3>
              <Button 
                onClick={() => openTrackingLinkDialog()} 
                className="rounded-xl gap-2"
                data-testid="button-create-tracking-link"
              >
                <Plus className="h-4 w-4" />
                Create New Link
              </Button>
            </div>

            {trackingLinksLoading ? (
              <Skeleton className="h-60" />
            ) : !trackingLinks || trackingLinks.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground" data-testid="text-no-tracking-links">
                No tracking links yet. Create one to start tracking campaigns.
              </div>
            ) : (
              <div className="overflow-x-auto -mx-4 sm:mx-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Platform</TableHead>
                      <TableHead>Code</TableHead>
                      <TableHead className="text-right">Clicks</TableHead>
                      <TableHead className="text-right">Leads</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {trackingLinks.map((link) => (
                      <TableRow key={link.id} data-testid={`row-tracking-link-${link.id}`}>
                        <TableCell>
                          <span className="font-medium text-sm" data-testid={`text-tracking-link-name-${link.id}`}>{link.name}</span>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" data-testid={`badge-platform-${link.id}`}>
                            {link.platform}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <code className="text-xs font-mono bg-muted px-2 py-1 rounded" data-testid={`text-tracking-code-${link.id}`}>
                              {link.code}
                            </code>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => copyTrackingUrl(link.code)}
                              title="Copy tracking URL"
                              data-testid={`button-copy-url-${link.id}`}
                            >
                              <Copy className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-medium" data-testid={`text-clicks-${link.id}`}>
                          {link.totalClicks}
                        </TableCell>
                        <TableCell className="text-right font-medium" data-testid={`text-leads-${link.id}`}>
                          {link.totalLeads}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={link.isActive ?? true}
                              onCheckedChange={() => toggleTrackingLinkStatus(link)}
                              data-testid={`switch-status-${link.id}`}
                            />
                            <span className="text-xs text-muted-foreground">
                              {link.isActive ? "Active" : "Inactive"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => openTrackingLinkDialog(link)}
                              title="Edit"
                              data-testid={`button-edit-tracking-link-${link.id}`}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive"
                              onClick={() => setDeleteTrackingLinkId(link.id)}
                              title="Delete"
                              data-testid={`button-delete-tracking-link-${link.id}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics">
          <div className="space-y-6">
            {/* Filters Section */}
            <div className="rounded-2xl border border-border/50 bg-gradient-to-br from-card via-card to-card p-5 sm:p-6">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <h3 className="font-semibold text-foreground" data-testid="text-analytics-title">Performance Analytics</h3>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-wrap">
                  <Select value={analyticsPlatform} onValueChange={setAnalyticsPlatform}>
                    <SelectTrigger className="w-full sm:w-40" data-testid="select-analytics-platform">
                      <SelectValue placeholder="Platform" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">All</SelectItem>
                      <SelectItem value="Ambassador">Ambassador</SelectItem>
                      <SelectItem value="Facebook">Facebook</SelectItem>
                      <SelectItem value="Instagram">Instagram</SelectItem>
                      <SelectItem value="TikTok">TikTok</SelectItem>
                      <SelectItem value="Google">Google</SelectItem>
                      <SelectItem value="YouTube">YouTube</SelectItem>
                      <SelectItem value="Twitter">Twitter</SelectItem>
                      <SelectItem value="LinkedIn">LinkedIn</SelectItem>
                      <SelectItem value="Email">Email</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>

                  {(analyticsPlatform === "All" || analyticsPlatform === "Ambassador") && (
                    <Select value={analyticsAmbassadorId} onValueChange={setAnalyticsAmbassadorId}>
                      <SelectTrigger className="w-full sm:w-48" data-testid="select-analytics-ambassador">
                        <SelectValue placeholder="All Ambassadors" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Ambassadors</SelectItem>
                        {users?.map((user) => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.firstName} {user.lastName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}

                  <div className="flex items-center gap-2">
                    <Button
                      variant={analyticsDateRange === 7 ? "default" : "outline"}
                      size="sm"
                      onClick={() => setAnalyticsDateRange(7)}
                      data-testid="button-range-7d"
                    >
                      7 Days
                    </Button>
                    <Button
                      variant={analyticsDateRange === 30 ? "default" : "outline"}
                      size="sm"
                      onClick={() => setAnalyticsDateRange(30)}
                      data-testid="button-range-30d"
                    >
                      30 Days
                    </Button>
                    <Button
                      variant={analyticsDateRange === 90 ? "default" : "outline"}
                      size="sm"
                      onClick={() => setAnalyticsDateRange(90)}
                      data-testid="button-range-90d"
                    >
                      90 Days
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {analyticsSummaryLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-24 sm:h-28" />
                ))
              ) : (
                <>
                  <StatsCard
                    title="Total Clicks"
                    value={analyticsSummary?.reduce((sum, e) => sum + e.clicks, 0) || 0}
                    icon={MousePointerClick}
                    description="Combined clicks"
                    data-testid="stat-analytics-clicks"
                  />
                  <StatsCard
                    title="Total Leads"
                    value={analyticsSummary?.reduce((sum, e) => sum + e.leads, 0) || 0}
                    icon={Target}
                    description="Combined leads"
                    data-testid="stat-analytics-leads"
                  />
                  <StatsCard
                    title="Total Conversions"
                    value={analyticsSummary?.reduce((sum, e) => sum + e.conversions, 0) || 0}
                    icon={UserCheck}
                    description="Combined conversions"
                    data-testid="stat-analytics-conversions"
                  />
                  <StatsCard
                    title="Avg Conv. Rate"
                    value={`${(() => {
                      const totalLeads = analyticsSummary?.reduce((sum, e) => sum + e.leads, 0) || 0;
                      const totalConversions = analyticsSummary?.reduce((sum, e) => sum + e.conversions, 0) || 0;
                      return totalLeads > 0 ? ((totalConversions / totalLeads) * 100).toFixed(1) : "0";
                    })()}%`}
                    icon={TrendingUp}
                    description="Average rate"
                    data-testid="stat-analytics-rate"
                  />
                </>
              )}
            </div>

            {/* Performance Chart */}
            <div className="rounded-2xl border border-border/50 bg-gradient-to-br from-card via-card to-card p-5 sm:p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-lg shadow-primary/25">
                  <Activity className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold">Performance Over Time</h3>
                  <p className="text-xs text-muted-foreground">Clicks and leads aggregated by day</p>
                </div>
              </div>
              <div className="h-64">
                {analyticsTimeseriesLoading ? (
                  <Skeleton className="h-full" />
                ) : analyticsTimeseries && analyticsTimeseries.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart 
                      data={(() => {
                        const aggregated: Record<string, { date: string; clicks: number; leads: number }> = {};
                        analyticsTimeseries.forEach((item) => {
                          if (!aggregated[item.date]) {
                            aggregated[item.date] = { date: item.date, clicks: 0, leads: 0 };
                          }
                          aggregated[item.date].clicks += item.clicks;
                          aggregated[item.date].leads += item.leads;
                        });
                        return Object.values(aggregated).sort((a, b) => a.date.localeCompare(b.date));
                      })()}
                      margin={{ top: 5, right: 10, left: -20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="date" fontSize={10} tickLine={false} axisLine={false} interval="preserveStartEnd" />
                      <YAxis fontSize={10} tickLine={false} axisLine={false} allowDecimals={false} />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                      />
                      <Legend wrapperStyle={{ fontSize: "12px" }} />
                      <Line type="monotone" dataKey="clicks" stroke="hsl(var(--chart-1))" strokeWidth={2} dot={false} name="Clicks" />
                      <Line type="monotone" dataKey="leads" stroke="hsl(var(--chart-2))" strokeWidth={2} dot={false} name="Leads" />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground">
                    No data available for the selected filters
                  </div>
                )}
              </div>
            </div>

            {/* Comparison Table */}
            <div className="rounded-2xl border border-border/50 bg-gradient-to-br from-card via-card to-card p-5 sm:p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-lg shadow-amber-500/25">
                  <BarChart3 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold">Performance Comparison</h3>
                  <p className="text-xs text-muted-foreground">Click column headers to sort</p>
                </div>
              </div>

              {analyticsSummaryLoading ? (
                <Skeleton className="h-60" />
              ) : !analyticsSummary || analyticsSummary.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground" data-testid="text-no-analytics">
                  No data available for the selected filters
                </div>
              ) : (
                <div className="overflow-x-auto -mx-4 sm:mx-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead
                          className="cursor-pointer"
                          onClick={() => {
                            if (analyticsSortColumn === "name") {
                              setAnalyticsSortOrder(analyticsSortOrder === "asc" ? "desc" : "asc");
                            } else {
                              setAnalyticsSortColumn("name");
                              setAnalyticsSortOrder("asc");
                            }
                          }}
                          data-testid="th-analytics-name"
                        >
                          Name {analyticsSortColumn === "name" && (analyticsSortOrder === "asc" ? "↑" : "↓")}
                        </TableHead>
                        <TableHead data-testid="th-analytics-type">Type</TableHead>
                        <TableHead
                          className="text-right cursor-pointer"
                          onClick={() => {
                            if (analyticsSortColumn === "clicks") {
                              setAnalyticsSortOrder(analyticsSortOrder === "asc" ? "desc" : "asc");
                            } else {
                              setAnalyticsSortColumn("clicks");
                              setAnalyticsSortOrder("desc");
                            }
                          }}
                          data-testid="th-analytics-clicks"
                        >
                          Clicks {analyticsSortColumn === "clicks" && (analyticsSortOrder === "asc" ? "↑" : "↓")}
                        </TableHead>
                        <TableHead
                          className="text-right cursor-pointer"
                          onClick={() => {
                            if (analyticsSortColumn === "leads") {
                              setAnalyticsSortOrder(analyticsSortOrder === "asc" ? "desc" : "asc");
                            } else {
                              setAnalyticsSortColumn("leads");
                              setAnalyticsSortOrder("desc");
                            }
                          }}
                          data-testid="th-analytics-leads"
                        >
                          Leads {analyticsSortColumn === "leads" && (analyticsSortOrder === "asc" ? "↑" : "↓")}
                        </TableHead>
                        <TableHead
                          className="text-right cursor-pointer"
                          onClick={() => {
                            if (analyticsSortColumn === "conversions") {
                              setAnalyticsSortOrder(analyticsSortOrder === "asc" ? "desc" : "asc");
                            } else {
                              setAnalyticsSortColumn("conversions");
                              setAnalyticsSortOrder("desc");
                            }
                          }}
                          data-testid="th-analytics-conversions"
                        >
                          Conversions {analyticsSortColumn === "conversions" && (analyticsSortOrder === "asc" ? "↑" : "↓")}
                        </TableHead>
                        <TableHead
                          className="text-right cursor-pointer"
                          onClick={() => {
                            if (analyticsSortColumn === "conversionRate") {
                              setAnalyticsSortOrder(analyticsSortOrder === "asc" ? "desc" : "asc");
                            } else {
                              setAnalyticsSortColumn("conversionRate");
                              setAnalyticsSortOrder("desc");
                            }
                          }}
                          data-testid="th-analytics-rate"
                        >
                          Conv. Rate {analyticsSortColumn === "conversionRate" && (analyticsSortOrder === "asc" ? "↑" : "↓")}
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {[...analyticsSummary]
                        .sort((a, b) => {
                          const aVal = a[analyticsSortColumn];
                          const bVal = b[analyticsSortColumn];
                          if (typeof aVal === "string" && typeof bVal === "string") {
                            return analyticsSortOrder === "asc" 
                              ? aVal.localeCompare(bVal) 
                              : bVal.localeCompare(aVal);
                          }
                          return analyticsSortOrder === "asc" 
                            ? (aVal as number) - (bVal as number) 
                            : (bVal as number) - (aVal as number);
                        })
                        .map((entity) => (
                          <TableRow key={entity.entityId} data-testid={`row-analytics-${entity.entityId}`}>
                            <TableCell>
                              <span className="font-medium text-sm" data-testid={`text-analytics-name-${entity.entityId}`}>
                                {entity.name}
                              </span>
                            </TableCell>
                            <TableCell>
                              <Badge 
                                variant={entity.entityType === "ambassador" ? "default" : "secondary"}
                                data-testid={`badge-analytics-type-${entity.entityId}`}
                              >
                                {entity.entityType === "ambassador" ? "Ambassador" : entity.platform}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right tabular-nums" data-testid={`text-analytics-clicks-${entity.entityId}`}>
                              {entity.clicks}
                            </TableCell>
                            <TableCell className="text-right tabular-nums" data-testid={`text-analytics-leads-${entity.entityId}`}>
                              {entity.leads}
                            </TableCell>
                            <TableCell className="text-right tabular-nums" data-testid={`text-analytics-conversions-${entity.entityId}`}>
                              {entity.conversions}
                            </TableCell>
                            <TableCell className="text-right tabular-nums" data-testid={`text-analytics-rate-${entity.entityId}`}>
                              {entity.conversionRate.toFixed(1)}%
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Trash Tab */}
        <TabsContent value="trash">
          <div className="rounded-2xl border border-border/50 bg-gradient-to-br from-card via-card to-card p-5 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <Trash2 className="h-5 w-5" />
                  Trash
                </h3>
                <p className="text-sm text-muted-foreground">
                  Items in trash will be permanently deleted after 10 days
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => cleanupTrashMutation.mutate()}
                disabled={cleanupTrashMutation.isPending}
                data-testid="button-cleanup-trash"
              >
                <AlertTriangle className="h-4 w-4 mr-2" />
                {cleanupTrashMutation.isPending ? "Cleaning..." : "Cleanup Old Items"}
              </Button>
            </div>

            {/* Trashed Ambassadors */}
            <div className="mb-8">
              <h4 className="text-sm font-medium mb-4 flex items-center gap-2">
                <Users className="h-4 w-4" />
                Deleted Ambassadors ({trashedUsers?.length || 0})
              </h4>
              {!trashedUsers || trashedUsers.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground border rounded-md">
                  No deleted ambassadors
                </div>
              ) : (
                <div className="overflow-x-auto -mx-4 sm:mx-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Ambassador</TableHead>
                        <TableHead className="hidden sm:table-cell">Email</TableHead>
                        <TableHead>Code</TableHead>
                        <TableHead className="hidden sm:table-cell">Deleted</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {trashedUsers.map((user) => (
                        <TableRow key={user.id} data-testid={`row-trashed-user-${user.id}`}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={user.profileImageUrl || undefined} />
                                <AvatarFallback>{user.firstName?.charAt(0) || "U"}</AvatarFallback>
                              </Avatar>
                              <span className="font-medium text-sm">{user.firstName} {user.lastName}</span>
                            </div>
                          </TableCell>
                          <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                            {user.email}
                          </TableCell>
                          <TableCell>
                            <code className="text-xs font-mono bg-muted px-1 py-0.5 rounded">{user.referralCode}</code>
                          </TableCell>
                          <TableCell className="hidden sm:table-cell text-xs text-muted-foreground">
                            {user.deletedAt ? formatDistanceToNow(new Date(user.deletedAt), { addSuffix: true }) : "-"}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => restoreUserMutation.mutate(user.id)}
                                disabled={restoreUserMutation.isPending}
                                title="Restore"
                                data-testid={`button-restore-user-${user.id}`}
                              >
                                <Undo2 className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setPermanentDeleteUserId(user.id)}
                                title="Delete Permanently"
                                className="text-destructive hover:text-destructive"
                                data-testid={`button-permanent-delete-user-${user.id}`}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>

            {/* Trashed Leads */}
            <div>
              <h4 className="text-sm font-medium mb-4 flex items-center gap-2">
                <Target className="h-4 w-4" />
                Deleted Leads ({trashedLeads?.length || 0})
              </h4>
              {!trashedLeads || trashedLeads.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground border rounded-md">
                  No deleted leads
                </div>
              ) : (
                <div className="overflow-x-auto -mx-4 sm:mx-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Lead</TableHead>
                        <TableHead className="hidden sm:table-cell">Contact</TableHead>
                        <TableHead>Referred By</TableHead>
                        <TableHead className="hidden sm:table-cell">Deleted</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {trashedLeads.map((lead) => (
                        <TableRow key={lead.id} data-testid={`row-trashed-lead-${lead.id}`}>
                          <TableCell>
                            <p className="font-medium text-sm">{lead.fullName}</p>
                          </TableCell>
                          <TableCell className="hidden sm:table-cell">
                            <div className="text-xs">
                              <p>{lead.email}</p>
                              <p className="text-muted-foreground">{lead.phone}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm">{lead.userName}</span>
                          </TableCell>
                          <TableCell className="hidden sm:table-cell text-xs text-muted-foreground">
                            {lead.deletedAt ? formatDistanceToNow(new Date(lead.deletedAt), { addSuffix: true }) : "-"}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => restoreLeadMutation.mutate(lead.id)}
                                disabled={restoreLeadMutation.isPending}
                                title="Restore"
                                data-testid={`button-restore-lead-${lead.id}`}
                              >
                                <Undo2 className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setPermanentDeleteLeadId(lead.id)}
                                title="Delete Permanently"
                                className="text-destructive hover:text-destructive"
                                data-testid={`button-permanent-delete-lead-${lead.id}`}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Add Ambassador Dialog */}
      <Dialog open={showAddAmbassador} onOpenChange={setShowAddAmbassador}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Ambassador</DialogTitle>
            <DialogDescription>
              Create a new ambassador account. They will automatically appear in all charts and analytics.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmitAmbassador)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John" {...field} data-testid="input-firstName" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Doe" {...field} data-testid="input-lastName" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="john@example.com" {...field} data-testid="input-email" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="+212 6XX XXX XXX" {...field} data-testid="input-phone" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="text" placeholder="Enter password for ambassador" {...field} data-testid="input-ambassador-password" />
                    </FormControl>
                    <p className="text-xs text-muted-foreground">This password will be used by the ambassador to login</p>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="border-t pt-4">
                <p className="text-sm font-medium mb-3">Social Media (Optional)</p>
                <div className="space-y-3">
                  <FormField
                    control={form.control}
                    name="instagramUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Instagram URL</FormLabel>
                        <FormControl>
                          <Input placeholder="https://instagram.com/username" {...field} data-testid="input-instagram-url" />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="youtubeUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>YouTube URL</FormLabel>
                        <FormControl>
                          <Input placeholder="https://youtube.com/@channel" {...field} data-testid="input-youtube-url" />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="tiktokUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>TikTok URL</FormLabel>
                        <FormControl>
                          <Input placeholder="https://tiktok.com/@username" {...field} data-testid="input-tiktok-url" />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-3 gap-2">
                    <FormField
                      control={form.control}
                      name="instagramFollowers"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">IG Followers</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="0" 
                              {...field} 
                              onChange={e => field.onChange(parseInt(e.target.value) || 0)}
                              data-testid="input-instagram-followers" 
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="youtubeFollowers"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">YT Subs</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="0" 
                              {...field} 
                              onChange={e => field.onChange(parseInt(e.target.value) || 0)}
                              data-testid="input-youtube-followers" 
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="tiktokFollowers"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">TT Followers</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="0" 
                              {...field} 
                              onChange={e => field.onChange(parseInt(e.target.value) || 0)}
                              data-testid="input-tiktok-followers" 
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setShowAddAmbassador(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createAmbassadorMutation.isPending} data-testid="button-create-ambassador">
                  {createAmbassadorMutation.isPending ? "Creating..." : "Create Ambassador"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Lead Confirmation Dialog */}
      <Dialog open={!!deleteLeadId} onOpenChange={() => setDeleteLeadId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Move Lead to Trash</DialogTitle>
            <DialogDescription>
              This lead will be moved to trash. You can restore it within 10 days before it's permanently deleted.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteLeadId(null)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => deleteLeadId && deleteLeadMutation.mutate(deleteLeadId)}
              disabled={deleteLeadMutation.isPending}
            >
              Move to Trash
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete User Confirmation Dialog */}
      <Dialog open={!!deleteUserId} onOpenChange={() => setDeleteUserId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Move Ambassador to Trash</DialogTitle>
            <DialogDescription>
              This ambassador will be moved to trash. You can restore them within 10 days before they're permanently deleted.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteUserId(null)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => deleteUserId && softDeleteUserMutation.mutate(deleteUserId)}
              disabled={softDeleteUserMutation.isPending}
            >
              Move to Trash
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Permanent Delete User Confirmation Dialog */}
      <Dialog open={!!permanentDeleteUserId} onOpenChange={() => setPermanentDeleteUserId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Permanently Delete Ambassador</DialogTitle>
            <DialogDescription>
              This action cannot be undone. All data associated with this ambassador (clicks, leads, conversions) will be permanently deleted.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPermanentDeleteUserId(null)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => permanentDeleteUserId && permanentDeleteUserMutation.mutate(permanentDeleteUserId)}
              disabled={permanentDeleteUserMutation.isPending}
            >
              Delete Forever
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Permanent Delete Lead Confirmation Dialog */}
      <Dialog open={!!permanentDeleteLeadId} onOpenChange={() => setPermanentDeleteLeadId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Permanently Delete Lead</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This lead and any related conversion records will be permanently deleted.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPermanentDeleteLeadId(null)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => permanentDeleteLeadId && permanentDeleteLeadMutation.mutate(permanentDeleteLeadId)}
              disabled={permanentDeleteLeadMutation.isPending}
            >
              Delete Forever
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Tracking Link Create/Edit Dialog */}
      <Dialog open={showTrackingLinkDialog} onOpenChange={(open) => {
        if (!open) {
          setShowTrackingLinkDialog(false);
          setEditingTrackingLink(null);
          trackingLinkForm.reset();
        }
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle data-testid="text-tracking-link-dialog-title">
              {editingTrackingLink ? "Edit Tracking Link" : "Create Tracking Link"}
            </DialogTitle>
            <DialogDescription>
              {editingTrackingLink 
                ? "Update the tracking link details." 
                : "Create a new tracking link to track campaigns from different platforms."}
            </DialogDescription>
          </DialogHeader>
          <Form {...trackingLinkForm}>
            <form onSubmit={trackingLinkForm.handleSubmit(onSubmitTrackingLink)} className="space-y-4">
              <FormField
                control={trackingLinkForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Summer Campaign 2024" {...field} data-testid="input-tracking-link-name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={trackingLinkForm.control}
                name="platform"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Platform</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-tracking-link-platform">
                          <SelectValue placeholder="Select a platform" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {PLATFORMS.map((platform) => (
                          <SelectItem key={platform} value={platform} data-testid={`option-platform-${platform.toLowerCase()}`}>
                            {platform}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={trackingLinkForm.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tracking Code</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g., summer-fb-2024" 
                        {...field} 
                        disabled={!!editingTrackingLink}
                        data-testid="input-tracking-link-code" 
                      />
                    </FormControl>
                    <p className="text-xs text-muted-foreground">
                      {editingTrackingLink 
                        ? "Tracking code cannot be changed after creation." 
                        : "Use letters, numbers, hyphens, and underscores only."}
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setShowTrackingLinkDialog(false);
                    setEditingTrackingLink(null);
                    trackingLinkForm.reset();
                  }}
                  data-testid="button-cancel-tracking-link"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={createTrackingLinkMutation.isPending || updateTrackingLinkMutation.isPending}
                  data-testid="button-save-tracking-link"
                >
                  {(createTrackingLinkMutation.isPending || updateTrackingLinkMutation.isPending) 
                    ? "Saving..." 
                    : editingTrackingLink ? "Update Link" : "Create Link"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Tracking Link Confirmation Dialog */}
      <Dialog open={!!deleteTrackingLinkId} onOpenChange={() => setDeleteTrackingLinkId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle data-testid="text-delete-tracking-link-title">Delete Tracking Link</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this tracking link? This will also remove all associated click and lead tracking data.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setDeleteTrackingLinkId(null)}
              data-testid="button-cancel-delete-tracking-link"
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => deleteTrackingLinkId && deleteTrackingLinkMutation.mutate(deleteTrackingLinkId)}
              disabled={deleteTrackingLinkMutation.isPending}
              data-testid="button-confirm-delete-tracking-link"
            >
              {deleteTrackingLinkMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Password Change Dialog */}
      <Dialog open={!!passwordChangeUser} onOpenChange={() => { setPasswordChangeUser(null); setNewPassword(""); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>
              Set a new password for {passwordChangeUser?.firstName} {passwordChangeUser?.lastName}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input
                id="new-password"
                type="password"
                placeholder="Enter new password (min 4 characters)"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                data-testid="input-new-password"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setPasswordChangeUser(null); setNewPassword(""); }}>
              Cancel
            </Button>
            <Button 
              onClick={handlePasswordChange}
              disabled={changePasswordMutation.isPending || newPassword.length < 4}
              data-testid="button-save-password"
            >
              {changePasswordMutation.isPending ? "Saving..." : "Save Password"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* User Details Dialog */}
      <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Ambassador Details</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={selectedUser.profileImageUrl || undefined} />
                  <AvatarFallback>{selectedUser.firstName?.charAt(0) || "U"}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-lg">{selectedUser.firstName} {selectedUser.lastName}</h3>
                  <p className="text-muted-foreground text-sm">{selectedUser.email}</p>
                  {selectedUser.isAdmin && <Badge variant="secondary" className="mt-1">Admin</Badge>}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground">Referral Code</p>
                  <code className="font-mono font-semibold">{selectedUser.referralCode}</code>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground">Joined</p>
                  <p className="font-semibold text-sm">
                    {selectedUser.createdAt ? format(new Date(selectedUser.createdAt), "MMM d, yyyy") : "-"}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 rounded-lg bg-muted/50 text-center">
                  <p className="text-2xl font-bold">{selectedUser.stats.clicks}</p>
                  <p className="text-xs text-muted-foreground">Clicks</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50 text-center">
                  <p className="text-2xl font-bold">{selectedUser.stats.leads}</p>
                  <p className="text-xs text-muted-foreground">Leads</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50 text-center">
                  <p className="text-2xl font-bold text-primary">{selectedUser.stats.conversions}</p>
                  <p className="text-xs text-muted-foreground">Applied</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Ambassador Analytics Sheet */}
      <Sheet open={!!analyticsUser} onOpenChange={() => setAnalyticsUser(null)}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-3">
              {analyticsUser && (
                <>
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={analyticsUser.profileImageUrl || undefined} />
                    <AvatarFallback>{analyticsUser.firstName?.charAt(0) || "U"}</AvatarFallback>
                  </Avatar>
                  <div>
                    <span>{analyticsUser.firstName} {analyticsUser.lastName}</span>
                    <p className="text-sm font-normal text-muted-foreground">{analyticsUser.email}</p>
                  </div>
                </>
              )}
            </SheetTitle>
            <SheetDescription>Performance analytics and rankings</SheetDescription>
          </SheetHeader>

          {analyticsUser && (
            <div className="mt-6 space-y-6">
              {/* Rankings */}
              {ambassadorRankings && (
                <div className="space-y-4">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Trophy className="h-4 w-4" />
                    Rankings
                  </h4>
                  
                  {/* Clicks Ranking */}
                  <div className="p-4 rounded-lg bg-muted/50 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Clicks</span>
                      <div className="flex items-center gap-2">
                        {getRankIcon(ambassadorRankings.clicks.rank)}
                        <span className="text-sm text-muted-foreground">
                          of {ambassadorRankings.clicks.total}
                        </span>
                      </div>
                    </div>
                    <Progress value={ambassadorRankings.clicks.percentile} className="h-2" />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{ambassadorRankings.clicks.value} clicks</span>
                      <span>Top {100 - ambassadorRankings.clicks.percentile}%</span>
                    </div>
                  </div>

                  {/* Leads Ranking */}
                  <div className="p-4 rounded-lg bg-muted/50 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Leads</span>
                      <div className="flex items-center gap-2">
                        {getRankIcon(ambassadorRankings.leads.rank)}
                        <span className="text-sm text-muted-foreground">
                          of {ambassadorRankings.leads.total}
                        </span>
                      </div>
                    </div>
                    <Progress value={ambassadorRankings.leads.percentile} className="h-2" />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{ambassadorRankings.leads.value} leads</span>
                      <span>Top {100 - ambassadorRankings.leads.percentile}%</span>
                    </div>
                  </div>

                  {/* Conversions Ranking */}
                  <div className="p-4 rounded-lg bg-muted/50 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Applied to Foorsa</span>
                      <div className="flex items-center gap-2">
                        {getRankIcon(ambassadorRankings.conversions.rank)}
                        <span className="text-sm text-muted-foreground">
                          of {ambassadorRankings.conversions.total}
                        </span>
                      </div>
                    </div>
                    <Progress value={ambassadorRankings.conversions.percentile} className="h-2" />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{ambassadorRankings.conversions.value} conversions</span>
                      <span>Top {100 - ambassadorRankings.conversions.percentile}%</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Comparison Chart */}
              {ambassadorRankings && ambassadorRankings.topPerformers.length > 0 && (
                <div className="space-y-4">
                  <h4 className="font-semibold">Compared to Top 5</h4>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart 
                        data={ambassadorRankings.topPerformers.map(p => ({
                          name: p.name.split(" ")[0],
                          leads: p.leads,
                          isUser: p.name === `${analyticsUser.firstName} ${analyticsUser.lastName}`.trim(),
                        }))}
                        margin={{ top: 5, right: 10, left: -20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="name" fontSize={10} tickLine={false} axisLine={false} />
                        <YAxis fontSize={10} tickLine={false} axisLine={false} allowDecimals={false} />
                        <Tooltip 
                          contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "8px",
                          }}
                        />
                        <Bar dataKey="leads" radius={[4, 4, 0, 0]}>
                          {ambassadorRankings.topPerformers.map((entry, index) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={entry.name === `${analyticsUser.firstName} ${analyticsUser.lastName}`.trim() 
                                ? "hsl(var(--primary))" 
                                : "hsl(var(--muted-foreground) / 0.3)"
                              }
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {/* Trend Chart */}
              {ambassadorTrend && ambassadorTrend.length > 0 && (
                <div className="space-y-4">
                  <h4 className="font-semibold">30-Day Performance Trend</h4>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={ambassadorTrend} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="date" fontSize={9} tickLine={false} axisLine={false} interval="preserveStartEnd" />
                        <YAxis fontSize={10} tickLine={false} axisLine={false} allowDecimals={false} />
                        <Tooltip 
                          contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "8px",
                          }}
                        />
                        <Legend wrapperStyle={{ fontSize: "10px" }} />
                        <Line type="monotone" dataKey="clicks" stroke="hsl(var(--chart-1))" strokeWidth={2} dot={false} name="Clicks" />
                        <Line type="monotone" dataKey="leads" stroke="hsl(var(--chart-2))" strokeWidth={2} dot={false} name="Leads" />
                        <Line type="monotone" dataKey="conversions" stroke="hsl(var(--chart-3))" strokeWidth={2} dot={false} name="Applied" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
