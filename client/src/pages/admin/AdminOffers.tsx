import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Package,
  Plus,
  Pencil,
  Trash2,
  Users,
  Image as ImageIcon,
  Tag,
  AlertTriangle,
  UserCheck,
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface Offer {
  id: string;
  title: string;
  titleAr?: string;
  titleFr?: string;
  description?: string;
  descriptionAr?: string;
  descriptionFr?: string;
  imageUrl?: string;
  price?: string;
  category?: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface Assignment {
  id: string;
  offerId: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  createdAt: string;
}

const offerSchema = z.object({
  title: z.string().min(1, "Title is required"),
  titleAr: z.string().optional(),
  titleFr: z.string().optional(),
  description: z.string().optional(),
  descriptionAr: z.string().optional(),
  descriptionFr: z.string().optional(),
  imageUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  price: z.string().optional(),
  category: z.string().optional(),
  isActive: z.boolean().default(true),
  sortOrder: z.number().default(0),
});

type OfferForm = z.infer<typeof offerSchema>;

export default function AdminOffers() {
  const { toast } = useToast();
  const [showOfferDialog, setShowOfferDialog] = useState(false);
  const [editingOffer, setEditingOffer] = useState<Offer | null>(null);
  const [deleteOfferId, setDeleteOfferId] = useState<string | null>(null);
  const [assigningOffer, setAssigningOffer] = useState<Offer | null>(null);
  const [selectedAmbassadors, setSelectedAmbassadors] = useState<Set<string>>(new Set());

  const form = useForm<OfferForm>({
    resolver: zodResolver(offerSchema),
    defaultValues: {
      title: "",
      titleAr: "",
      titleFr: "",
      description: "",
      descriptionAr: "",
      descriptionFr: "",
      imageUrl: "",
      price: "",
      category: "",
      isActive: true,
      sortOrder: 0,
    },
  });

  const { data: offers, isLoading: offersLoading } = useQuery<Offer[]>({
    queryKey: ["/api/admin/offers"],
  });

  const { data: ambassadors, isLoading: ambassadorsLoading } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
  });

  const { data: assignments, isLoading: assignmentsLoading } = useQuery<Assignment[]>({
    queryKey: ["/api/admin/offers", assigningOffer?.id, "assignments"],
    enabled: !!assigningOffer,
  });

  const createOfferMutation = useMutation({
    mutationFn: async (data: OfferForm) => {
      return await apiRequest("POST", "/api/admin/offers", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/offers"] });
      toast({ title: "Offer created successfully!" });
      setShowOfferDialog(false);
      form.reset();
    },
    onError: () => {
      toast({ title: "Failed to create offer", variant: "destructive" });
    },
  });

  const updateOfferMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<OfferForm> }) => {
      return await apiRequest("PATCH", `/api/admin/offers/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/offers"] });
      toast({ title: "Offer updated successfully!" });
      setShowOfferDialog(false);
      setEditingOffer(null);
      form.reset();
    },
    onError: () => {
      toast({ title: "Failed to update offer", variant: "destructive" });
    },
  });

  const deleteOfferMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/admin/offers/${id}`, undefined);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/offers"] });
      toast({ title: "Offer deleted successfully" });
      setDeleteOfferId(null);
    },
    onError: () => {
      toast({ title: "Failed to delete offer", variant: "destructive" });
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      return await apiRequest("PATCH", `/api/admin/offers/${id}`, { isActive });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/offers"] });
      toast({ title: "Offer status updated" });
    },
    onError: () => {
      toast({ title: "Failed to update offer status", variant: "destructive" });
    },
  });

  const assignAmbassadorsMutation = useMutation({
    mutationFn: async ({ offerId, userIds }: { offerId: string; userIds: string[] }) => {
      return await apiRequest("POST", `/api/admin/offers/${offerId}/assignments`, { userIds });
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/offers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/offers", assigningOffer?.id, "assignments"] });
      toast({ title: `Assigned to ${data.assigned} ambassadors` });
    },
    onError: () => {
      toast({ title: "Failed to assign ambassadors", variant: "destructive" });
    },
  });

  const unassignAmbassadorMutation = useMutation({
    mutationFn: async ({ offerId, userId }: { offerId: string; userId: string }) => {
      return await apiRequest("DELETE", `/api/admin/offers/${offerId}/assignments`, { userId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/offers", assigningOffer?.id, "assignments"] });
      toast({ title: "Ambassador unassigned" });
    },
    onError: () => {
      toast({ title: "Failed to unassign ambassador", variant: "destructive" });
    },
  });

  const openOfferDialog = (offer?: Offer) => {
    if (offer) {
      setEditingOffer(offer);
      form.reset({
        title: offer.title,
        titleAr: offer.titleAr || "",
        titleFr: offer.titleFr || "",
        description: offer.description || "",
        descriptionAr: offer.descriptionAr || "",
        descriptionFr: offer.descriptionFr || "",
        imageUrl: offer.imageUrl || "",
        price: offer.price || "",
        category: offer.category || "",
        isActive: offer.isActive,
        sortOrder: offer.sortOrder,
      });
    } else {
      setEditingOffer(null);
      form.reset();
    }
    setShowOfferDialog(true);
  };

  const onSubmitOffer = (data: OfferForm) => {
    if (editingOffer) {
      updateOfferMutation.mutate({ id: editingOffer.id, data });
    } else {
      createOfferMutation.mutate(data);
    }
  };

  const openAssignmentDialog = (offer: Offer) => {
    setAssigningOffer(offer);
    // Pre-select assigned ambassadors
    queryClient.fetchQuery({
      queryKey: ["/api/admin/offers", offer.id, "assignments"],
    });
  };

  const handleAssignAll = () => {
    if (!ambassadors) return;
    const allIds = ambassadors.map(a => a.id);
    setSelectedAmbassadors(new Set(allIds));
  };

  const handleAssignSelected = () => {
    if (!assigningOffer) return;
    const userIds = Array.from(selectedAmbassadors);
    assignAmbassadorsMutation.mutate({ offerId: assigningOffer.id, userIds });
  };

  const toggleAmbassadorSelection = (userId: string) => {
    const newSet = new Set(selectedAmbassadors);
    if (newSet.has(userId)) {
      newSet.delete(userId);
    } else {
      newSet.add(userId);
    }
    setSelectedAmbassadors(newSet);
  };

  const isAssigned = (userId: string) => {
    return assignments?.some(a => a.userId === userId) || false;
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold" data-testid="heading-offers">
            Offers Management
          </h1>
          <p className="text-muted-foreground">
            Create and manage offers that ambassadors can promote
          </p>
        </div>
        <Button
          onClick={() => openOfferDialog()}
          className="gap-2"
          data-testid="button-add-offer"
        >
          <Plus className="h-4 w-4" />
          Add Offer
        </Button>
      </div>

      {offersLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-64 rounded-lg" />
          ))}
        </div>
      ) : offers && offers.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {offers.map((offer) => (
            <Card key={offer.id} className="overflow-hidden" data-testid={`card-offer-${offer.id}`}>
              {offer.imageUrl && (
                <div className="h-40 bg-muted relative">
                  <img
                    src={offer.imageUrl}
                    alt={offer.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg truncate">{offer.title}</CardTitle>
                    {offer.category && (
                      <Badge variant="secondary" className="mt-1 text-xs">
                        <Tag className="h-3 w-3 mr-1" />
                        {offer.category}
                      </Badge>
                    )}
                  </div>
                  <Switch
                    checked={offer.isActive}
                    onCheckedChange={(checked) =>
                      toggleActiveMutation.mutate({ id: offer.id, isActive: checked })
                    }
                    data-testid={`switch-offer-${offer.id}`}
                  />
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {offer.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {offer.description}
                  </p>
                )}
                {offer.price && (
                  <p className="text-lg font-semibold text-primary">{offer.price}</p>
                )}
                <Separator />
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openOfferDialog(offer)}
                    className="flex-1 gap-1.5"
                    data-testid={`button-edit-offer-${offer.id}`}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openAssignmentDialog(offer)}
                    className="flex-1 gap-1.5"
                    data-testid={`button-assign-${offer.id}`}
                  >
                    <Users className="h-3.5 w-3.5" />
                    Assign
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => setDeleteOfferId(offer.id)}
                    data-testid={`button-delete-offer-${offer.id}`}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-12">
          <div className="flex flex-col items-center justify-center text-center space-y-3">
            <div className="p-4 rounded-full bg-muted">
              <Package className="h-10 w-10 text-muted-foreground" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">No offers yet</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Create your first offer to get started
              </p>
            </div>
            <Button onClick={() => openOfferDialog()} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Offer
            </Button>
          </div>
        </Card>
      )}

      {/* Create/Edit Offer Dialog */}
      <Dialog open={showOfferDialog} onOpenChange={setShowOfferDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingOffer ? "Edit Offer" : "Create New Offer"}
            </DialogTitle>
            <DialogDescription>
              {editingOffer
                ? "Update the offer details below"
                : "Add a new offer for ambassadors to promote"}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmitOffer)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title (English) *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g., Study in China Scholarship" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="titleAr"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title (Arabic)</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="العنوان بالعربية" dir="rtl" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="titleFr"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title (French)</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Titre en français" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (English)</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="Detailed description..." rows={3} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="descriptionAr"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description (Arabic)</FormLabel>
                      <FormControl>
                        <Textarea {...field} placeholder="الوصف بالعربية" rows={2} dir="rtl" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="descriptionFr"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description (French)</FormLabel>
                      <FormControl>
                        <Textarea {...field} placeholder="Description en français" rows={2} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="imageUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Image URL</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="https://example.com/image.jpg" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g., Free, $99/mo" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g., Scholarship, Program" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="sortOrder"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sort Order</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex items-center gap-2 space-y-0 pt-8">
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <FormLabel className="!mt-0">Active</FormLabel>
                    </FormItem>
                  )}
                />
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowOfferDialog(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createOfferMutation.isPending || updateOfferMutation.isPending}
                >
                  {editingOffer ? "Update" : "Create"} Offer
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Assignment Dialog */}
      <Dialog open={!!assigningOffer} onOpenChange={() => setAssigningOffer(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Assign Ambassadors</DialogTitle>
            <DialogDescription>
              Select which ambassadors can see and promote "{assigningOffer?.title}"
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={handleAssignAll}
                disabled={!ambassadors || ambassadors.length === 0}
              >
                <UserCheck className="h-4 w-4 mr-1" />
                Select All
              </Button>
              <Button
                size="sm"
                onClick={handleAssignSelected}
                disabled={selectedAmbassadors.size === 0}
              >
                Assign Selected ({selectedAmbassadors.size})
              </Button>
            </div>

            <Separator />

            {ambassadorsLoading || assignmentsLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : ambassadors && ambassadors.length > 0 ? (
              <div className="space-y-2">
                {ambassadors.map((amb) => {
                  const assigned = isAssigned(amb.id);
                  const selected = selectedAmbassadors.has(amb.id);
                  
                  return (
                    <div
                      key={amb.id}
                      className={`flex items-center justify-between p-3 rounded-lg border ${
                        assigned ? "bg-primary/5 border-primary/20" : "bg-muted/50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Checkbox
                          checked={selected}
                          onCheckedChange={() => toggleAmbassadorSelection(amb.id)}
                        />
                        <div>
                          <p className="font-medium text-sm">
                            {amb.firstName} {amb.lastName}
                          </p>
                          <p className="text-xs text-muted-foreground">{amb.email}</p>
                        </div>
                      </div>
                      {assigned && (
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs">
                            <UserCheck className="h-3 w-3 mr-1" />
                            Assigned
                          </Badge>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() =>
                              assigningOffer &&
                              unassignAmbassadorMutation.mutate({
                                offerId: assigningOffer.id,
                                userId: amb.id,
                              })
                            }
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-4">
                No ambassadors available
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteOfferId} onOpenChange={() => setDeleteOfferId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Offer?</AlertDialogTitle>
            <AlertDialogDescription>
              This will soft-delete the offer. It will no longer be visible to ambassadors.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteOfferId) {
                  deleteOfferMutation.mutate(deleteOfferId);
                }
              }}
              className="bg-destructive text-destructive-foreground"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
