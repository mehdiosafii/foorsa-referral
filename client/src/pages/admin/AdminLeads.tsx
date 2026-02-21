import { useState, useEffect, useMemo, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { Download, MoreHorizontal, UserCheck, Trash2, RefreshCw, Send, Inbox, CheckCircle2, ChevronRight, Users, AlertCircle, Zap, FileText } from "lucide-react";
import { DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { motion, AnimatePresence } from "framer-motion";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { format } from "date-fns";
import type { Lead } from "@shared/schema";

type LeadWithSource = Lead & { 
  userName: string;
  whatsappStatus: string | null;
  whatsappSentAt: string | null;
  whatsappError: string | null;
  whatsappTriggeredBy: string | null;
  whatsappNextRetryAt: string | null;
  whatsappAttempts: number | null;
};

const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
  "New Lead": { bg: "bg-blue-50 dark:bg-blue-950/40", text: "text-blue-700 dark:text-blue-300", label: "New Lead" },
  "Qualified": { bg: "bg-amber-50 dark:bg-amber-950/40", text: "text-amber-700 dark:text-amber-300", label: "Qualified" },
  "Very qualified": { bg: "bg-orange-50 dark:bg-orange-950/40", text: "text-orange-700 dark:text-orange-300", label: "Very qualified" },
  "Procedure Explained": { bg: "bg-purple-50 dark:bg-purple-950/40", text: "text-purple-700 dark:text-purple-300", label: "Procedure Explained" },
  "New Old applicant": { bg: "bg-cyan-50 dark:bg-cyan-950/40", text: "text-cyan-700 dark:text-cyan-300", label: "New Old applicant" },
  "Hot Lead": { bg: "bg-amber-100 dark:bg-amber-900/40", text: "text-amber-800 dark:text-amber-200", label: "Hot Lead" },
  "Ready to Pay": { bg: "bg-violet-50 dark:bg-violet-950/40", text: "text-violet-700 dark:text-violet-300", label: "Ready to Pay" },
  "Next year Applicant": { bg: "bg-teal-50 dark:bg-teal-950/40", text: "text-teal-700 dark:text-teal-300", label: "Next year Applicant" },
  "Our Student (March)": { bg: "bg-emerald-50 dark:bg-emerald-950/40", text: "text-emerald-700 dark:text-emerald-300", label: "Our Student (March)" },
  "Visa business": { bg: "bg-sky-50 dark:bg-sky-950/40", text: "text-sky-700 dark:text-sky-300", label: "Visa business" },
  "Our Student": { bg: "bg-green-50 dark:bg-green-950/40", text: "text-green-700 dark:text-green-300", label: "Our Student" },
};

type BulkSendFilterType = "all_new" | "all_failed" | "pending_retry" | "all_unsent";

// Predefined WhatsApp message templates
// Note: Currently only 'openinggiveaway' template is registered in respond.io
// When new templates are added to respond.io, update both here and in server/routes.ts
const whatsappTemplates = [
  {
    id: "openinggiveaway",
    name: "Welcome Message",
    description: "Automatic welcome message for new students",
    preview: "Hello [Name]! Thank you for registering with Foorsa...",
    icon: "welcome",
  },
];

type QuickSendLead = LeadWithSource | null;

type SendProgress = {
  total: number;
  sent: number;
  failed: number;
  current: string;
};

export default function AdminLeads() {
  const { toast } = useToast();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [whatsappFilter, setWhatsappFilter] = useState<string>("all");
  const [deleteLeadId, setDeleteLeadId] = useState<string | null>(null);
  const [showBulkSendDialog, setShowBulkSendDialog] = useState(false);
  const [bulkSendFilter, setBulkSendFilter] = useState<BulkSendFilterType>("all_unsent");
  const [isSending, setIsSending] = useState(false);
  const [sendProgress, setSendProgress] = useState<SendProgress | null>(null);
  const [keepPolling, setKeepPolling] = useState(false);
  const [targetLeadIds, setTargetLeadIds] = useState<string[]>([]);
  const [wizardStep, setWizardStep] = useState<1 | 2 | 3 | 4>(1);
  const [selectedLeadIds, setSelectedLeadIds] = useState<Set<string>>(new Set());
  const [quickSendLead, setQuickSendLead] = useState<QuickSendLead>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string>("openinggiveaway");

  const isNotSent = useCallback((status: string | null) => !status || status === "not_sent", []);

  const { data: leads, isLoading, isError, error, refetch } = useQuery<LeadWithSource[]>({
    queryKey: ["/api/admin/leads"],
    retry: 2,
    staleTime: 3000,
  });

  const hasQueuedTargets = useMemo(() => {
    return targetLeadIds.length > 0 && leads?.some(
      l => targetLeadIds.includes(l.id) && ['queued', 'pending', 'pending_retry'].includes(l.whatsappStatus || '')
    );
  }, [targetLeadIds, leads]);

  const isPolling = isSending || keepPolling || hasQueuedTargets;

  useEffect(() => {
    if (!isPolling) return;
    const interval = setInterval(() => refetch(), 3000);
    return () => clearInterval(interval);
  }, [isPolling, refetch]);

  const realProgress = useMemo(() => {
    if (!targetLeadIds.length || !leads) return null;
    const targetLeads = leads.filter(l => targetLeadIds.includes(l.id));
    const completed = targetLeads.filter(l => 
      l.whatsappStatus === 'sent' || l.whatsappStatus === 'delivered' || 
      l.whatsappStatus === 'failed' || l.whatsappStatus === 'queued'
    ).length;
    const failed = targetLeads.filter(l => l.whatsappStatus === 'failed').length;
    return { total: targetLeadIds.length, sent: completed, failed };
  }, [targetLeadIds, leads]);

  useEffect(() => {
    if (!isSending && targetLeadIds.length > 0 && realProgress && realProgress.sent === realProgress.total && !hasQueuedTargets) {
      setWizardStep(4);
      const timer = setTimeout(() => setKeepPolling(false), 1500);
      return () => clearTimeout(timer);
    }
  }, [isSending, targetLeadIds, realProgress, hasQueuedTargets]);

  useEffect(() => {
    if (!isSending && sendProgress !== null && !targetLeadIds.length) {
      setKeepPolling(true);
      const timer = setTimeout(() => setKeepPolling(false), 10000);
      return () => clearTimeout(timer);
    }
  }, [isSending, sendProgress, targetLeadIds.length]);

  const updateLeadMutation = useMutation({
    mutationFn: async ({ leadId, status }: { leadId: string; status: string }) => {
      return await apiRequest("PATCH", `/api/admin/leads/${leadId}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/leads"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({ title: "Status updated" });
    },
    onError: () => {
      toast({ title: "Failed to update", variant: "destructive" });
    },
  });

  const convertLeadMutation = useMutation({
    mutationFn: async (leadId: string) => {
      return await apiRequest("POST", `/api/admin/leads/${leadId}/convert`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/leads"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({ title: "Lead converted!" });
    },
    onError: () => {
      toast({ title: "Failed to convert", variant: "destructive" });
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
      toast({ title: "Moved to trash" });
      setDeleteLeadId(null);
    },
    onError: () => {
      toast({ title: "Failed to delete", variant: "destructive" });
    },
  });

  const retryWhatsappMutation = useMutation({
    mutationFn: async (leadId: string) => {
      return await apiRequest("POST", `/api/admin/leads/${leadId}/retry-whatsapp`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/leads"] });
      toast({ title: "Message queued" });
    },
    onError: () => {
      toast({ title: "Failed to retry", variant: "destructive" });
    },
  });

  const bulkSendMutation = useMutation({
    mutationFn: async ({ filter, leadIds }: { filter: BulkSendFilterType; leadIds: string[] }) => {
      setTargetLeadIds(leadIds);
      setIsSending(true);
      setWizardStep(3);
      setSendProgress({ total: leadIds.length, sent: 0, failed: 0, current: "" });
      return await apiRequest("POST", "/api/admin/leads/bulk-send", { filter, leadIds });
    },
    onSuccess: (data: any) => {
      setIsSending(false);
      setKeepPolling(true);
      queryClient.invalidateQueries({ queryKey: ["/api/admin/leads"] });
      const successCount = data.queued || 0;
      const failedCount = data.failed || 0;
      toast({ 
        title: "Messages queued",
        description: failedCount > 0 
          ? `${successCount} queued, ${failedCount} failed`
          : `${successCount} messages queued`
      });
    },
    onError: () => {
      setIsSending(false);
      setSendProgress(null);
      setTargetLeadIds([]);
      setWizardStep(1);
      toast({ title: "Failed to send", variant: "destructive" });
    },
  });

  // Quick Send mutation for individual leads with template selection
  const quickSendMutation = useMutation({
    mutationFn: async ({ leadId, templateId }: { leadId: string; templateId: string }) => {
      return await apiRequest("POST", "/api/admin/leads/quick-send", { leadId, templateId });
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/leads"] });
      setQuickSendLead(null);
      toast({ 
        title: "Message sent",
        description: `Message queued successfully`
      });
    },
    onError: (error: any) => {
      toast({ 
        title: "Failed to send", 
        description: error.message || "Please try again",
        variant: "destructive" 
      });
    },
  });

  const exportToCSV = useCallback(() => {
    if (!leads || leads.length === 0) {
      toast({ title: "No data to export", variant: "destructive" });
      return;
    }

    const exportData = leads.map(l => ({
      name: l.fullName,
      phone: l.phone || l.whatsappNumber,
      source: l.userName || "Direct",
      program: l.preferredProgram || "",
      city: l.preferredCity || "",
      status: l.status || "New Lead",
      date: l.createdAt ? format(new Date(l.createdAt), "yyyy-MM-dd HH:mm") : "",
    }));

    const headers = Object.keys(exportData[0]);
    const csvContent = [
      headers.join(","),
      ...exportData.map(row =>
        headers.map(header => {
          const value = row[header as keyof typeof row];
          if (typeof value === "string" && value.includes(",")) return `"${value}"`;
          return value ?? "";
        }).join(",")
      )
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `leads_${format(new Date(), "yyyy-MM-dd")}.csv`;
    link.click();
    toast({ title: `Exported ${exportData.length} leads` });
  }, [leads, toast]);

  const filteredLeads = useMemo(() => {
    if (!leads) return [];
    return leads.filter(l => {
      const statusMatch = statusFilter === "all" || l.status === statusFilter;
      const whatsappMatch = whatsappFilter === "all" || 
        (whatsappFilter === "not_sent" && isNotSent(l.whatsappStatus)) ||
        (whatsappFilter === "failed" && l.whatsappStatus === "failed") ||
        (whatsappFilter === "sent" && (l.whatsappStatus === "sent" || l.whatsappStatus === "delivered")) ||
        (whatsappFilter === "queued" && l.whatsappStatus === "queued") ||
        (whatsappFilter === "pending" && (l.whatsappStatus === "pending" || l.whatsappStatus === "pending_retry")) ||
        (whatsappFilter === "contact_exists" && l.whatsappStatus === "contact_exists") ||
        (whatsappFilter === "contact_failed" && l.whatsappStatus === "contact_failed") ||
        (whatsappFilter === "invalid_phone" && l.whatsappStatus === "invalid_phone");
      return statusMatch && whatsappMatch;
    });
  }, [leads, statusFilter, whatsappFilter, isNotSent]);

  const { unsentCount, bulkSendLeads, filterCounts, previewNames } = useMemo(() => {
    if (!leads) return { unsentCount: 0, bulkSendLeads: [], filterCounts: { all_new: 0, all_failed: 0, pending_retry: 0, all_unsent: 0 }, previewNames: [] };
    
    // Now contact_failed is retryable since we use phone identifiers directly (no contact creation needed)
    const canSend = (l: LeadWithSource) => 
      (isNotSent(l.whatsappStatus) || l.whatsappStatus === "failed" || l.whatsappStatus === "contact_failed") && 
      l.whatsappStatus !== "invalid_phone";
    
    const unsent = leads.filter(canSend);
    
    const bulkLeads = leads.filter(l => {
      if (l.whatsappStatus === "invalid_phone") return false;
      switch (bulkSendFilter) {
        case "all_new": return l.status === "New Lead" && isNotSent(l.whatsappStatus);
        case "all_failed": return l.whatsappStatus === "failed" || l.whatsappStatus === "contact_failed";
        case "pending_retry": return l.whatsappStatus === "pending_retry";
        case "all_unsent":
        default: return isNotSent(l.whatsappStatus) || l.whatsappStatus === "failed" || l.whatsappStatus === "contact_failed";
      }
    });

    const counts = {
      all_new: leads.filter(l => l.status === "New Lead" && isNotSent(l.whatsappStatus) && l.whatsappStatus !== "invalid_phone").length,
      all_failed: leads.filter(l => l.whatsappStatus === "failed" || l.whatsappStatus === "contact_failed").length,
      pending_retry: leads.filter(l => l.whatsappStatus === "pending_retry").length,
      all_unsent: leads.filter(l => canSend(l)).length,
    };

    return {
      unsentCount: unsent.length,
      bulkSendLeads: bulkLeads,
      filterCounts: counts,
      previewNames: bulkLeads.slice(0, 3).map(l => l.fullName.split(' ')[0]),
    };
  }, [leads, bulkSendFilter, isNotSent]);

  const bulkSendCount = bulkSendLeads.length;

  const toggleSelectLead = useCallback((leadId: string) => {
    setSelectedLeadIds(prev => {
      const next = new Set(prev);
      if (next.has(leadId)) next.delete(leadId);
      else next.add(leadId);
      return next;
    });
  }, []);

  const toggleSelectAll = useCallback(() => {
    setSelectedLeadIds(prev => {
      if (prev.size === filteredLeads.length && filteredLeads.length > 0) return new Set();
      return new Set(filteredLeads.map(l => l.id));
    });
  }, [filteredLeads]);

  const isAllSelected = filteredLeads.length > 0 && selectedLeadIds.size === filteredLeads.length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      <div className="max-w-[1400px] mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-semibold" data-testid="heading-leads">Leads</h1>
                {isPolling && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 text-xs font-medium" data-testid="badge-live-polling">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-600"></span>
                    </span>
                    Live
                  </span>
                )}
              </div>
              <p className="text-muted-foreground text-sm">
                Track and manage lead submissions
              </p>
            </div>
            
            <div className="flex items-center gap-3 flex-wrap">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-36 h-9 text-sm bg-background/80 backdrop-blur-sm border-border/60" data-testid="select-status-filter">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="New Lead">New Lead</SelectItem>
                  <SelectItem value="Qualified">Qualified</SelectItem>
                  <SelectItem value="Very qualified">Very qualified</SelectItem>
                  <SelectItem value="Procedure Explained">Procedure Explained</SelectItem>
                  <SelectItem value="New Old applicant">New Old applicant</SelectItem>
                  <SelectItem value="Hot Lead">Hot Lead</SelectItem>
                  <SelectItem value="Ready to Pay">Ready to Pay</SelectItem>
                  <SelectItem value="Next year Applicant">Next year Applicant</SelectItem>
                  <SelectItem value="Our Student (March)">Our Student (March)</SelectItem>
                  <SelectItem value="Visa business">Visa business</SelectItem>
                  <SelectItem value="Our Student">Our Student</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={whatsappFilter} onValueChange={setWhatsappFilter}>
                <SelectTrigger className="w-36 h-9 text-sm bg-background/80 backdrop-blur-sm border-border/60" data-testid="select-whatsapp-filter">
                  <SelectValue placeholder="WhatsApp" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Messages</SelectItem>
                  <SelectItem value="not_sent">Not Sent</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="queued">Queued</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="contact_failed">Contact Failed</SelectItem>
                  <SelectItem value="invalid_phone">Invalid Phone</SelectItem>
                </SelectContent>
              </Select>

              <div className="h-6 w-px bg-border/60 hidden sm:block" />

              {(unsentCount > 0 || selectedLeadIds.size > 0) && (
                <Button
                  onClick={() => setShowBulkSendDialog(true)}
                  disabled={bulkSendMutation.isPending}
                  size="sm"
                  className="h-9 gap-2 bg-primary hover:bg-primary/90 shadow-sm"
                  data-testid="button-bulk-send"
                >
                  <Send className="h-3.5 w-3.5" />
                  Send ({selectedLeadIds.size > 0 ? selectedLeadIds.size : unsentCount})
                </Button>
              )}
              
              <Button
                variant="outline"
                size="sm"
                onClick={exportToCSV}
                className="h-9 gap-2 bg-background/80 backdrop-blur-sm border-border/60"
                data-testid="button-export-csv"
              >
                <Download className="h-3.5 w-3.5" />
                Export
              </Button>
            </div>
          </div>

          <Card className="border-border/40 shadow-sm bg-card/80 backdrop-blur-sm overflow-hidden">
            <CardContent className="p-0">
              {isLoading ? (
                <div className="p-8 space-y-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full rounded-lg" />
                  ))}
                </div>
              ) : isError ? (
                <div className="flex flex-col items-center justify-center py-20 px-6" data-testid="text-error">
                  <div className="h-14 w-14 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
                    <AlertCircle className="h-7 w-7 text-destructive" />
                  </div>
                  <p className="text-foreground font-medium mb-1">Failed to load leads</p>
                  <p className="text-sm text-muted-foreground mb-4">{error?.message}</p>
                  <Button variant="outline" size="sm" onClick={() => refetch()}>
                    Try again
                  </Button>
                </div>
              ) : filteredLeads.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 px-6" data-testid="text-no-leads">
                  <div className="h-14 w-14 rounded-full bg-muted flex items-center justify-center mb-4">
                    <Inbox className="h-7 w-7 text-muted-foreground" />
                  </div>
                  <p className="text-foreground font-medium mb-1">No leads found</p>
                  <p className="text-sm text-muted-foreground">
                    {statusFilter !== "all" ? "Try adjusting your filters" : "Leads will appear here when submitted"}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border/50 bg-muted/30">
                        <th className="w-12 py-4 px-4">
                          <Checkbox 
                            checked={isAllSelected}
                            onCheckedChange={toggleSelectAll}
                            aria-label="Select all"
                            data-testid="checkbox-select-all"
                            className="rounded-[4px]"
                          />
                        </th>
                        <th className="text-left py-4 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Lead</th>
                        <th className="text-left py-4 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Source</th>
                        <th className="text-left py-4 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden md:table-cell">Program</th>
                        <th className="text-left py-4 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                        <th className="text-left py-4 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden sm:table-cell">Date</th>
                        <th className="w-12 py-4 px-4"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/30">
                      {filteredLeads.map((lead, index) => {
                        const status = statusConfig[lead.status || "New Lead"] || statusConfig["New Lead"];
                        const isSelected = selectedLeadIds.has(lead.id);
                        
                        return (
                          <tr
                            key={lead.id}
                            data-testid={`row-lead-${lead.id}`}
                            className={`group transition-colors duration-150 ${isSelected ? "bg-primary/[0.04]" : "hover:bg-muted/40"}`}
                          >
                            <td className="py-4 px-4">
                              <Checkbox
                                checked={isSelected}
                                onCheckedChange={() => toggleSelectLead(lead.id)}
                                aria-label={`Select ${lead.fullName}`}
                                data-testid={`checkbox-lead-${lead.id}`}
                                className="rounded-[4px]"
                              />
                            </td>
                            <td className="py-4 px-4">
                              <div className="min-w-0">
                                <p className="font-medium text-sm text-foreground truncate max-w-[180px]" data-testid={`text-lead-name-${lead.id}`}>
                                  {lead.fullName}
                                </p>
                                <p className="text-xs text-muted-foreground truncate max-w-[180px] mt-0.5">
                                  {lead.phone || lead.whatsappNumber || "No phone"}
                                </p>
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <span className="text-sm text-muted-foreground" data-testid={`text-lead-source-${lead.id}`}>
                                {lead.userName || "Direct"}
                              </span>
                            </td>
                            <td className="py-4 px-4 hidden md:table-cell">
                              <span className="text-sm text-muted-foreground truncate block max-w-[120px]">
                                {lead.preferredProgram || "-"}
                              </span>
                            </td>
                            <td className="py-4 px-4">
                              <span 
                                className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${status.bg} ${status.text}`}
                                data-testid={`badge-status-${lead.id}`}
                              >
                                {status.label}
                              </span>
                            </td>
                            <td className="py-4 px-4 hidden sm:table-cell">
                              <span className="text-xs text-muted-foreground" data-testid={`text-lead-date-${lead.id}`}>
                                {lead.createdAt ? format(new Date(lead.createdAt), "MMM d") : "-"}
                              </span>
                            </td>
                            <td className="py-4 px-4">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity duration-150"
                                    data-testid={`button-actions-${lead.id}`}
                                  >
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48">
                                  <DropdownMenuItem
                                    onClick={() => updateLeadMutation.mutate({ leadId: lead.id, status: "Qualified" })}
                                    disabled={lead.status === "Qualified"}
                                  >
                                    Mark Qualified
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => updateLeadMutation.mutate({ leadId: lead.id, status: "Hot Lead" })}
                                    disabled={lead.status === "Hot Lead"}
                                  >
                                    Mark Hot Lead
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => updateLeadMutation.mutate({ leadId: lead.id, status: "Ready to Pay" })}
                                    disabled={lead.status === "Ready to Pay"}
                                  >
                                    Mark Ready to Pay
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  {lead.status !== "Our Student" && (
                                    <DropdownMenuItem
                                      onClick={() => convertLeadMutation.mutate(lead.id)}
                                      className="text-emerald-600"
                                    >
                                      <UserCheck className="h-4 w-4 mr-2" />
                                      Convert
                                    </DropdownMenuItem>
                                  )}
                                  {(isNotSent(lead.whatsappStatus) || lead.whatsappStatus === "failed" || lead.whatsappStatus === "contact_exists") && 
                                   lead.whatsappStatus !== "invalid_phone" && lead.whatsappStatus !== "contact_failed" && (
                                    <DropdownMenuItem onClick={() => retryWhatsappMutation.mutate(lead.id)}>
                                      <RefreshCw className="h-4 w-4 mr-2" />
                                      {isNotSent(lead.whatsappStatus) ? "Send Message" : "Retry"}
                                    </DropdownMenuItem>
                                  )}
                                  {lead.whatsappStatus !== "invalid_phone" && lead.whatsappStatus !== "contact_failed" && (
                                    <DropdownMenuItem 
                                      onClick={() => {
                                        setQuickSendLead(lead);
                                        setSelectedTemplate("openinggiveaway");
                                      }}
                                      className="text-primary"
                                      data-testid={`button-quick-send-${lead.id}`}
                                    >
                                      <Zap className="h-4 w-4 mr-2" />
                                      Quick Send
                                    </DropdownMenuItem>
                                  )}
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={() => setDeleteLeadId(lead.id)}
                                    className="text-destructive"
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <AlertDialog open={!!deleteLeadId} onOpenChange={() => setDeleteLeadId(null)}>
        <AlertDialogContent className="max-w-sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete lead?</AlertDialogTitle>
            <AlertDialogDescription>
              This will move the lead to trash. You can restore it later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteLeadId && deleteLeadMutation.mutate(deleteLeadId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={showBulkSendDialog} onOpenChange={(open) => {
        if (!isSending) {
          setShowBulkSendDialog(open);
          if (!open) {
            setTargetLeadIds([]);
            setSendProgress(null);
            setWizardStep(1);
          } else if (open && selectedLeadIds.size > 0) {
            // When leads are selected via checkboxes, skip to confirmation step
            setTargetLeadIds(Array.from(selectedLeadIds));
            setWizardStep(2);
          }
        }
      }}>
        <DialogContent className="max-w-sm p-0 overflow-hidden gap-0" data-testid="dialog-bulk-send">
          <div className="p-6 pb-4">
            <div className="flex justify-center gap-1.5">
              {[1, 2, 3, 4].map((step) => (
                <div
                  key={step}
                  className={`h-1 rounded-full transition-all duration-200 ${
                    step === wizardStep ? "w-6 bg-primary" : step < wizardStep ? "w-1.5 bg-primary/50" : "w-1.5 bg-muted"
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="px-6 pb-6 min-h-[260px]">
            <AnimatePresence mode="wait">
              {wizardStep === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  transition={{ duration: 0.15 }}
                  className="space-y-4"
                >
                  <div className="text-center mb-6">
                    <h3 className="text-lg font-semibold">Select Recipients</h3>
                    <p className="text-sm text-muted-foreground mt-1">Choose which leads to message</p>
                  </div>
                  
                  <div className="space-y-2">
                    {([
                      { value: "all_unsent" as const, label: "All Unsent", count: filterCounts.all_unsent },
                      { value: "all_new" as const, label: "New Only", count: filterCounts.all_new },
                      { value: "all_failed" as const, label: "Failed Only", count: filterCounts.all_failed },
                      { value: "pending_retry" as const, label: "Pending Retry", count: filterCounts.pending_retry },
                    ]).map((option) => (
                      <button
                        key={option.value}
                        onClick={() => {
                          setBulkSendFilter(option.value);
                          if (option.count > 0) setWizardStep(2);
                        }}
                        className={`w-full p-3.5 rounded-lg border text-left transition-all duration-150 flex items-center justify-between ${
                          option.count === 0 
                            ? "opacity-40 cursor-not-allowed border-border/30" 
                            : "hover:bg-muted/50 border-border/60 cursor-pointer active:scale-[0.99]"
                        } ${bulkSendFilter === option.value && option.count > 0 ? "border-primary bg-primary/5" : ""}`}
                        disabled={option.count === 0}
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-muted/80 flex items-center justify-center">
                            <Users className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <span className="font-medium text-sm">{option.label}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground tabular-nums">{option.count}</span>
                          {option.count > 0 && <ChevronRight className="h-4 w-4 text-muted-foreground/60" />}
                        </div>
                      </button>
                    ))}
                  </div>
                  
                  <div className="pt-4 flex justify-end">
                    <Button variant="ghost" size="sm" onClick={() => setShowBulkSendDialog(false)}>
                      Cancel
                    </Button>
                  </div>
                </motion.div>
              )}

              {wizardStep === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  transition={{ duration: 0.15 }}
                  className="flex flex-col h-full"
                >
                  {(() => {
                    // Use targetLeadIds if set (from checkbox selection), otherwise use bulkSendLeads
                    const count = targetLeadIds.length > 0 ? targetLeadIds.length : bulkSendCount;
                    const selectedLeadsList = targetLeadIds.length > 0 
                      ? leads?.filter(l => targetLeadIds.includes(l.id)) || []
                      : bulkSendLeads;
                    const names = selectedLeadsList.slice(0, 3).map(l => l.fullName.split(' ')[0]);
                    
                    return (
                      <div className="text-center flex-1 flex flex-col items-center justify-center py-8">
                        <p className="text-5xl font-bold tabular-nums">{count}</p>
                        <p className="text-muted-foreground mt-2">messages to send</p>
                        {names.length > 0 && (
                          <p className="text-xs text-muted-foreground mt-4">
                            {names.join(", ")}{count > 3 && ` +${count - 3} more`}
                          </p>
                        )}
                      </div>
                    );
                  })()}
                  
                  <div className="flex justify-between gap-3 pt-4">
                    <Button variant="ghost" size="sm" onClick={() => {
                      if (targetLeadIds.length > 0 && selectedLeadIds.size > 0) {
                        // If we came from checkbox selection, close dialog
                        setShowBulkSendDialog(false);
                        setTargetLeadIds([]);
                      } else {
                        setWizardStep(1);
                      }
                    }}>
                      {targetLeadIds.length > 0 && selectedLeadIds.size > 0 ? "Cancel" : "Back"}
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => {
                        // Use targetLeadIds if set (from checkbox selection), otherwise use bulkSendLeads
                        const idsToSend = targetLeadIds.length > 0 ? targetLeadIds : bulkSendLeads.map(l => l.id);
                        bulkSendMutation.mutate({ filter: bulkSendFilter, leadIds: idsToSend });
                      }}
                      disabled={targetLeadIds.length > 0 ? targetLeadIds.length === 0 : bulkSendCount === 0}
                      className="gap-2"
                    >
                      <Send className="h-3.5 w-3.5" />
                      Send
                    </Button>
                  </div>
                </motion.div>
              )}

              {wizardStep === 3 && realProgress && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-col items-center justify-center py-12"
                >
                  <div className="h-12 w-12 rounded-full border-2 border-muted border-t-primary animate-spin mb-6" />
                  <p className="font-medium">Sending...</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {realProgress.sent} of {realProgress.total}
                  </p>
                  <div className="w-full max-w-[200px] mt-6">
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all duration-300"
                        style={{ width: `${(realProgress.sent / realProgress.total) * 100}%` }}
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {wizardStep === 4 && realProgress && (
                <motion.div
                  key="step4"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-col items-center justify-center py-12"
                >
                  <div className="h-14 w-14 rounded-full bg-emerald-100 dark:bg-emerald-950/50 flex items-center justify-center mb-4">
                    <CheckCircle2 className="h-7 w-7 text-emerald-600" />
                  </div>
                  <p className="font-medium">Done!</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {realProgress.total - realProgress.failed} sent
                    {realProgress.failed > 0 && <span className="text-destructive"> / {realProgress.failed} failed</span>}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-6"
                    onClick={() => {
                      setShowBulkSendDialog(false);
                      setTargetLeadIds([]);
                      setSendProgress(null);
                      setWizardStep(1);
                      setSelectedLeadIds(new Set()); // Clear checkbox selection after send
                    }}
                  >
                    Close
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </DialogContent>
      </Dialog>

      {/* Quick Send Dialog */}
      <Dialog open={!!quickSendLead} onOpenChange={(open) => {
        if (!open) setQuickSendLead(null);
      }}>
        <DialogContent className="max-w-md" data-testid="dialog-quick-send">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              Quick Send
            </DialogTitle>
            <DialogDescription>
              {quickSendLead && (
                <>Send a WhatsApp message to <span className="font-medium">{quickSendLead.fullName}</span></>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <RadioGroup
              value={selectedTemplate}
              onValueChange={setSelectedTemplate}
              className="gap-3"
            >
              {whatsappTemplates.map((template) => (
                <div
                  key={template.id}
                  className={`flex items-start gap-3 p-3 rounded-md border cursor-pointer transition-colors ${
                    selectedTemplate === template.id 
                      ? "border-primary bg-primary/5" 
                      : "border-border hover:border-primary/50"
                  }`}
                  onClick={() => setSelectedTemplate(template.id)}
                >
                  <RadioGroupItem value={template.id} id={template.id} className="mt-0.5" />
                  <Label htmlFor={template.id} className="cursor-pointer flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{template.name}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{template.description}</p>
                    <p className="text-xs text-muted-foreground/70 italic">{template.preview}</p>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setQuickSendLead(null)}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (quickSendLead) {
                  quickSendMutation.mutate({ 
                    leadId: quickSendLead.id, 
                    templateId: selectedTemplate 
                  });
                }
              }}
              disabled={quickSendMutation.isPending}
              data-testid="button-confirm-quick-send"
            >
              {quickSendMutation.isPending ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send Message
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
