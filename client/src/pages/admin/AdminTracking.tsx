import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Plus, Pencil, Copy, Trash2, Link, MousePointerClick, Users } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { TrackingLinkStats } from "@shared/schema";

const PLATFORMS = [
  "Facebook",
  "Instagram",
  "TikTok",
  "Google",
  "YouTube",
  "Twitter",
  "LinkedIn",
  "Email",
  "Other",
];

const trackingLinkSchema = z.object({
  name: z.string().min(1, "Name is required"),
  platform: z.string().min(1, "Platform is required"),
  code: z
    .string()
    .min(1, "Code is required")
    .regex(
      /^[a-zA-Z0-9_-]+$/,
      "Code can only contain letters, numbers, hyphens, and underscores"
    ),
});

type TrackingLinkForm = z.infer<typeof trackingLinkSchema>;

export default function AdminTracking() {
  const { toast } = useToast();
  const [showDialog, setShowDialog] = useState(false);
  const [editingLink, setEditingLink] = useState<TrackingLinkStats | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const form = useForm<TrackingLinkForm>({
    resolver: zodResolver(trackingLinkSchema),
    defaultValues: {
      name: "",
      platform: "",
      code: "",
    },
  });

  const { data: trackingLinks, isLoading } = useQuery<TrackingLinkStats[]>({
    queryKey: ["/api/admin/tracking-links"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: TrackingLinkForm) => {
      return await apiRequest("POST", "/api/admin/tracking-links", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/tracking-links"] });
      toast({ title: "Tracking link created successfully!" });
      closeDialog();
    },
    onError: (error: any) => {
      toast({
        title: error.message || "Failed to create tracking link",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      ...data
    }: {
      id: string;
      name?: string;
      platform?: string;
      isActive?: boolean;
    }) => {
      return await apiRequest("PATCH", `/api/admin/tracking-links/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/tracking-links"] });
      toast({ title: "Tracking link updated" });
      closeDialog();
    },
    onError: (error: any) => {
      toast({
        title: error.message || "Failed to update tracking link",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/admin/tracking-links/${id}`, undefined);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/tracking-links"] });
      toast({ title: "Tracking link deleted" });
      setDeleteId(null);
    },
    onError: () => {
      toast({ title: "Failed to delete tracking link", variant: "destructive" });
    },
  });

  const openDialog = (link?: TrackingLinkStats) => {
    if (link) {
      setEditingLink(link);
      form.reset({
        name: link.name,
        platform: link.platform,
        code: link.code,
      });
    } else {
      setEditingLink(null);
      form.reset({
        name: "",
        platform: "",
        code: "",
      });
    }
    setShowDialog(true);
  };

  const closeDialog = () => {
    setShowDialog(false);
    setEditingLink(null);
    form.reset();
  };

  const onSubmit = (data: TrackingLinkForm) => {
    if (editingLink) {
      updateMutation.mutate({
        id: editingLink.id,
        name: data.name,
        platform: data.platform,
      });
    } else {
      createMutation.mutate(data);
    }
  };

  const toggleStatus = (link: TrackingLinkStats) => {
    updateMutation.mutate({ id: link.id, isActive: !link.isActive });
  };

  const copyUrl = (code: string) => {
    const url = `${window.location.origin}/t/${code}`;
    navigator.clipboard.writeText(url);
    toast({ title: "Tracking URL copied to clipboard" });
  };

  const getPlatformColor = (platform: string) => {
    const colors: Record<string, string> = {
      Facebook: "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300",
      Instagram: "bg-pink-100 text-pink-800 dark:bg-pink-900/50 dark:text-pink-300",
      TikTok: "bg-slate-100 text-slate-800 dark:bg-slate-900/50 dark:text-slate-300",
      Google: "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300",
      YouTube: "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300",
      Twitter: "bg-sky-100 text-sky-800 dark:bg-sky-900/50 dark:text-sky-300",
      LinkedIn: "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300",
      Email: "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300",
      Other: "bg-gray-100 text-gray-800 dark:bg-gray-900/50 dark:text-gray-300",
    };
    return colors[platform] || colors.Other;
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold" data-testid="heading-tracking">
            Tracking Links
          </h1>
          <p className="text-muted-foreground mt-1">
            Create and manage tracking links for campaigns.
          </p>
        </div>
        <Button
          onClick={() => openDialog()}
          className="gap-2"
          data-testid="button-create-link"
        >
          <Plus className="h-4 w-4" />
          Create Link
        </Button>
      </div>

      {isLoading ? (
        <Card className="p-6">
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-10 w-40" />
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-6 w-16" />
              </div>
            ))}
          </div>
        </Card>
      ) : !trackingLinks || trackingLinks.length === 0 ? (
        <Card className="p-12 text-center">
          <Link className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No tracking links yet</h3>
          <p className="text-muted-foreground mb-4">
            Create your first tracking link to start tracking campaign performance.
          </p>
          <Button onClick={() => openDialog()} data-testid="button-create-first-link">
            <Plus className="h-4 w-4 mr-2" />
            Create Link
          </Button>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Platform</TableHead>
                <TableHead>Code</TableHead>
                <TableHead className="text-center">Clicks</TableHead>
                <TableHead className="text-center">Leads</TableHead>
                <TableHead className="text-center">Active</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {trackingLinks.map((link) => (
                <TableRow key={link.id} data-testid={`row-tracking-link-${link.id}`}>
                  <TableCell className="font-medium" data-testid={`text-link-name-${link.id}`}>
                    {link.name}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={getPlatformColor(link.platform)}
                      data-testid={`badge-platform-${link.id}`}
                    >
                      {link.platform}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <code
                      className="text-sm bg-muted px-2 py-1 rounded"
                      data-testid={`text-code-${link.id}`}
                    >
                      {link.code}
                    </code>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <MousePointerClick className="h-4 w-4 text-muted-foreground" />
                      <span data-testid={`text-clicks-${link.id}`}>{link.totalClicks}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span data-testid={`text-leads-${link.id}`}>{link.totalLeads}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <Switch
                      checked={link.isActive ?? false}
                      onCheckedChange={() => toggleStatus(link)}
                      data-testid={`switch-active-${link.id}`}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => openDialog(link)}
                        data-testid={`button-edit-${link.id}`}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => copyUrl(link.code)}
                        data-testid={`button-copy-${link.id}`}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => setDeleteId(link.id)}
                        data-testid={`button-delete-${link.id}`}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingLink ? "Edit Tracking Link" : "Create Tracking Link"}
            </DialogTitle>
            <DialogDescription>
              {editingLink
                ? "Update the tracking link details."
                : "Create a new tracking link to track campaign performance."}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Summer Campaign"
                        {...field}
                        data-testid="input-link-name"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="platform"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Platform</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-platform">
                          <SelectValue placeholder="Select a platform" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {PLATFORMS.map((platform) => (
                          <SelectItem
                            key={platform}
                            value={platform}
                            data-testid={`option-platform-${platform.toLowerCase()}`}
                          >
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
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Code</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., summer-2024"
                        {...field}
                        disabled={!!editingLink}
                        data-testid="input-link-code"
                      />
                    </FormControl>
                    <FormMessage />
                    {!editingLink && (
                      <p className="text-xs text-muted-foreground">
                        Only letters, numbers, hyphens, and underscores allowed.
                      </p>
                    )}
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={closeDialog}
                  data-testid="button-cancel"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  data-testid="button-submit"
                >
                  {createMutation.isPending || updateMutation.isPending
                    ? "Saving..."
                    : editingLink
                    ? "Update"
                    : "Create"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Tracking Link</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this tracking link? This action cannot be
              undone and will remove all associated click and lead data.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteId(null)}
              data-testid="button-cancel-delete"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteId && deleteMutation.mutate(deleteId)}
              disabled={deleteMutation.isPending}
              data-testid="button-confirm-delete"
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
