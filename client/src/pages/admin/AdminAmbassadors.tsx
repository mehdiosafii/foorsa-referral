import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import {
  Search,
  Download,
  Shield,
  ShieldOff,
  Trash2,
  UserPlus,
  KeyRound,
  ExternalLink,
  LogIn,
  MoreHorizontal,
  Copy,
  Pencil,
  Users,
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { format } from "date-fns";
import type { User } from "@shared/schema";

interface AdminUser extends User {
  stats: {
    clicks: number;
    leads: number;
    conversions: number;
  };
}

const createAmbassadorSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().optional(),
  password: z.string().min(4, "Password must be at least 4 characters"),
});

const editAmbassadorSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  phone: z.string().optional(),
  instagramUrl: z.string().optional(),
  youtubeUrl: z.string().optional(),
  tiktokUrl: z.string().optional(),
});

type CreateAmbassadorForm = z.infer<typeof createAmbassadorSchema>;
type EditAmbassadorForm = z.infer<typeof editAmbassadorSchema>;

export default function AdminAmbassadors() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddAmbassador, setShowAddAmbassador] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [passwordChangeUser, setPasswordChangeUser] = useState<AdminUser | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);

  const form = useForm<CreateAmbassadorForm>({
    resolver: zodResolver(createAmbassadorSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      password: "",
    },
  });

  const editForm = useForm<EditAmbassadorForm>({
    resolver: zodResolver(editAmbassadorSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      phone: "",
      instagramUrl: "",
      youtubeUrl: "",
      tiktokUrl: "",
    },
  });

  const { data: users, isLoading: usersLoading } = useQuery<AdminUser[]>({
    queryKey: ["/api/admin/users"],
  });

  const createAmbassadorMutation = useMutation({
    mutationFn: async (data: CreateAmbassadorForm) => {
      return await apiRequest("POST", "/api/admin/users", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({ title: "Ambassador created successfully!" });
      setShowAddAmbassador(false);
      form.reset();
    },
    onError: () => {
      toast({ title: "Failed to create ambassador", variant: "destructive" });
    },
  });

  const toggleAdminMutation = useMutation({
    mutationFn: async (userId: string) => {
      return await apiRequest("PATCH", `/api/admin/users/${userId}/toggle-admin`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({ title: "Admin status updated" });
    },
    onError: () => {
      toast({ title: "Failed to update admin status", variant: "destructive" });
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

  const handleViewDashboard = (user: AdminUser) => {
    // Store ambassador data in localStorage so Dashboard reads it via useAuth
    const ambassadorData = {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      referralCode: user.referralCode,
      role: user.role,
    };
    localStorage.setItem("ambassador_user", JSON.stringify(ambassadorData));
    toast({ title: "Viewing ambassador dashboard...", description: `${user.firstName} ${user.lastName}` });
    // Open in new tab so admin panel stays open
    window.open("/dashboard", "_blank");
  };

  const updateAmbassadorMutation = useMutation({
    mutationFn: async ({ userId, data }: { userId: string; data: EditAmbassadorForm }) => {
      return await apiRequest("PATCH", `/api/admin/users/${userId}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({ title: "Ambassador updated successfully" });
      setEditingUser(null);
      editForm.reset();
    },
    onError: () => {
      toast({ title: "Failed to update ambassador", variant: "destructive" });
    },
  });

  const handlePasswordChange = () => {
    if (!passwordChangeUser || !newPassword || newPassword.length < 4) {
      toast({ title: "Password must be at least 4 characters", variant: "destructive" });
      return;
    }
    changePasswordMutation.mutate({ userId: passwordChangeUser.id, password: newPassword });
  };

  const openAmbassadorPortal = (user: AdminUser) => {
    window.open(`/ref/${user.referralCode}`, "_blank");
  };

  const copyReferralLink = (user: AdminUser) => {
    const url = `${window.location.origin}/r/${user.referralCode}`;
    navigator.clipboard.writeText(url);
    toast({ title: "Referral link copied to clipboard" });
  };

  const openEditDialog = (user: AdminUser) => {
    setEditingUser(user);
    editForm.reset({
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      phone: user.phone || "",
      instagramUrl: user.instagramUrl || "",
      youtubeUrl: user.youtubeUrl || "",
      tiktokUrl: user.tiktokUrl || "",
    });
  };

  const onSubmitEdit = (data: EditAmbassadorForm) => {
    if (editingUser) {
      updateAmbassadorMutation.mutate({ userId: editingUser.id, data });
    }
  };

  const exportToCSV = () => {
    if (!users || users.length === 0) {
      toast({ title: "No data to export", variant: "destructive" });
      return;
    }

    const exportData = users.map((u) => ({
      firstName: u.firstName,
      lastName: u.lastName,
      email: u.email,
      phone: u.phone,
      referralCode: u.referralCode,
      clicks: u.stats.clicks,
      leads: u.stats.leads,
      conversions: u.stats.conversions,
      isAdmin: u.isAdmin,
      createdAt: u.createdAt,
    }));

    const headers = Object.keys(exportData[0]);
    const csvContent = [
      headers.join(","),
      ...exportData.map((row) =>
        headers
          .map((header) => {
            const value = row[header as keyof typeof row];
            if (typeof value === "string" && value.includes(",")) return `"${value}"`;
            return value ?? "";
          })
          .join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `ambassadors_${format(new Date(), "yyyy-MM-dd")}.csv`;
    link.click();
    toast({ title: `Exported ${users.length} ambassadors` });
  };

  const onSubmitAmbassador = (data: CreateAmbassadorForm) => {
    createAmbassadorMutation.mutate(data);
  };

  const filteredUsers =
    users?.filter(
      (u) =>
        !searchQuery ||
        u.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.referralCode?.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

  return (
    <div className="p-6 space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold" data-testid="heading-ambassadors">
          Ambassadors
        </h1>
        <p className="text-muted-foreground text-sm">
          Manage ambassador accounts and their performance.
        </p>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg font-semibold">
                  Ambassador Directory
                </CardTitle>
                <CardDescription className="text-sm">
                  View and manage all ambassador accounts
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <Button
                variant="outline"
                onClick={exportToCSV}
                className="gap-2"
                data-testid="button-export-csv"
              >
                <Download className="h-4 w-4" />
                Export CSV
              </Button>
              <Button
                onClick={() => setShowAddAmbassador(true)}
                className="gap-2"
                data-testid="button-add-ambassador"
              >
                <UserPlus className="h-4 w-4" />
                Add Ambassador
              </Button>
            </div>
          </div>
          <div className="relative max-w-sm mt-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, or referral code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
              data-testid="input-search-ambassadors"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {usersLoading ? (
            <div className="p-6">
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-20 w-full rounded-lg" />
                ))}
              </div>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 space-y-3">
              <div className="p-4 rounded-full bg-muted/50 w-fit mx-auto mb-1">
                <Users className="h-8 w-8 text-muted-foreground opacity-40" />
              </div>
              <div className="text-center space-y-1">
                <p className="font-semibold text-foreground">No ambassadors found</p>
                <p className="text-sm text-muted-foreground">
                  {searchQuery ? "Try adjusting your search query" : "Add your first ambassador to get started"}
                </p>
              </div>
              {!searchQuery && (
                <Button onClick={() => setShowAddAmbassador(true)} className="gap-2 mt-2">
                  <UserPlus className="h-4 w-4" />
                  Add Ambassador
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-b border-border/50">
                    <TableHead className="text-xs uppercase tracking-wide text-muted-foreground font-medium h-11">Ambassador</TableHead>
                    <TableHead className="text-xs uppercase tracking-wide text-muted-foreground font-medium h-11">Referral Code</TableHead>
                    <TableHead className="text-center text-xs uppercase tracking-wide text-muted-foreground font-medium h-11">Clicks</TableHead>
                    <TableHead className="text-center text-xs uppercase tracking-wide text-muted-foreground font-medium h-11">Leads</TableHead>
                    <TableHead className="text-center text-xs uppercase tracking-wide text-muted-foreground font-medium h-11">Conversions</TableHead>
                    <TableHead className="text-xs uppercase tracking-wide text-muted-foreground font-medium h-11">Joined</TableHead>
                    <TableHead className="w-[60px] text-xs uppercase tracking-wide text-muted-foreground font-medium h-11"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow 
                      key={user.id} 
                      data-testid={`row-ambassador-${user.id}`}
                      className="border-b border-border/30 hover:bg-muted/50 transition-colors"
                    >
                      <TableCell className="py-4">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={user.profileImageUrl || undefined} />
                            <AvatarFallback>
                              {user.firstName?.[0]}
                              {user.lastName?.[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <div className="font-medium flex items-center gap-2 flex-wrap">
                              <span className="truncate max-w-[150px]">{user.firstName} {user.lastName}</span>
                              {user.isAdmin && (
                                <Badge variant="secondary" className="text-xs font-medium">
                                  Admin
                                </Badge>
                              )}
                            </div>
                            <div className="text-sm text-muted-foreground truncate max-w-[200px]">{user.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <code className="text-sm bg-muted px-2 py-1 rounded font-mono">
                          {user.referralCode}
                        </code>
                      </TableCell>
                      <TableCell className="text-center py-4">
                        <span className="font-medium tabular-nums">{user.stats.clicks}</span>
                      </TableCell>
                      <TableCell className="text-center py-4">
                        <span className="font-medium tabular-nums">{user.stats.leads}</span>
                      </TableCell>
                      <TableCell className="text-center py-4">
                        <span className="font-medium tabular-nums">{user.stats.conversions}</span>
                      </TableCell>
                      <TableCell className="py-4">
                        <span className="text-sm text-muted-foreground">
                          {user.createdAt ? format(new Date(user.createdAt), "MMM d, yyyy") : "-"}
                        </span>
                      </TableCell>
                      <TableCell className="py-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              data-testid={`button-actions-${user.id}`}
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => openEditDialog(user)}
                              data-testid={`action-edit-${user.id}`}
                            >
                              <Pencil className="h-4 w-4 mr-2" />
                              Edit Profile
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => copyReferralLink(user)}
                              data-testid={`action-copy-link-${user.id}`}
                            >
                              <Copy className="h-4 w-4 mr-2" />
                              Copy Referral Link
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => openAmbassadorPortal(user)}
                              data-testid={`action-view-portal-${user.id}`}
                            >
                              <ExternalLink className="h-4 w-4 mr-2" />
                              View Portal
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleViewDashboard(user)}
                              data-testid={`action-login-as-${user.id}`}
                            >
                              <LogIn className="h-4 w-4 mr-2" />
                              View Dashboard
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => setPasswordChangeUser(user)}
                              data-testid={`action-change-password-${user.id}`}
                            >
                              <KeyRound className="h-4 w-4 mr-2" />
                              Change Password
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => toggleAdminMutation.mutate(user.id)}
                              data-testid={`action-toggle-admin-${user.id}`}
                            >
                              {user.isAdmin ? (
                                <>
                                  <ShieldOff className="h-4 w-4 mr-2" />
                                  Remove Admin
                                </>
                              ) : (
                                <>
                                  <Shield className="h-4 w-4 mr-2" />
                                  Make Admin
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => setDeleteUserId(user.id)}
                              className="text-destructive focus:text-destructive"
                              data-testid={`action-delete-${user.id}`}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showAddAmbassador} onOpenChange={setShowAddAmbassador}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Ambassador</DialogTitle>
            <DialogDescription>
              Create a new ambassador account with login credentials.
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
                        <Input
                          placeholder="John"
                          {...field}
                          data-testid="input-first-name"
                        />
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
                        <Input
                          placeholder="Doe"
                          {...field}
                          data-testid="input-last-name"
                        />
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
                      <Input
                        type="email"
                        placeholder="john@example.com"
                        {...field}
                        data-testid="input-email"
                      />
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
                    <FormLabel>Phone (optional)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="+1 234 567 890"
                        {...field}
                        data-testid="input-phone"
                      />
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
                      <Input
                        type="password"
                        placeholder="Enter password"
                        {...field}
                        data-testid="input-password"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAddAmbassador(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createAmbassadorMutation.isPending}
                  data-testid="button-submit-ambassador"
                >
                  {createAmbassadorMutation.isPending ? "Creating..." : "Create Ambassador"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!passwordChangeUser} onOpenChange={() => setPasswordChangeUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>
              Set a new password for {passwordChangeUser?.firstName} {passwordChangeUser?.lastName}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              type="password"
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              data-testid="input-new-password"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setPasswordChangeUser(null);
                setNewPassword("");
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handlePasswordChange}
              disabled={changePasswordMutation.isPending}
              data-testid="button-save-password"
            >
              {changePasswordMutation.isPending ? "Saving..." : "Save Password"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteUserId} onOpenChange={() => setDeleteUserId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Ambassador</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this ambassador? They will be moved to trash and can
              be restored later.
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
              data-testid="button-confirm-delete"
            >
              {softDeleteUserMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editingUser} onOpenChange={() => setEditingUser(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Ambassador</DialogTitle>
            <DialogDescription>
              Update profile information for {editingUser?.firstName} {editingUser?.lastName}
            </DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onSubmitEdit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="input-edit-first-name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="input-edit-last-name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={editForm.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input {...field} data-testid="input-edit-phone" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="border-t pt-4 mt-4">
                <h4 className="text-sm font-medium mb-3">Social Media</h4>
                <div className="space-y-3">
                  <FormField
                    control={editForm.control}
                    name="instagramUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Instagram URL</FormLabel>
                        <FormControl>
                          <Input placeholder="https://instagram.com/username" {...field} data-testid="input-edit-instagram" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={editForm.control}
                    name="youtubeUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>YouTube URL</FormLabel>
                        <FormControl>
                          <Input placeholder="https://youtube.com/@channel" {...field} data-testid="input-edit-youtube" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={editForm.control}
                    name="tiktokUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>TikTok URL</FormLabel>
                        <FormControl>
                          <Input placeholder="https://tiktok.com/@username" {...field} data-testid="input-edit-tiktok" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditingUser(null)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={updateAmbassadorMutation.isPending}
                  data-testid="button-save-edit"
                >
                  {updateAmbassadorMutation.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
