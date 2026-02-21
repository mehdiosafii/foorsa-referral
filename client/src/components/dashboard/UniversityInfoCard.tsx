import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { GraduationCap, MapPin, Sparkles, Copy, Check, Flame, Clock, Share2, BookOpen } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useToast } from "@/hooks/use-toast";

interface Story {
  title: string;
  content: string;
  emoji: string;
}

interface Offer {
  id: string;
  title: string;
  description: string;
  price: string;
  category: string;
  location: string;
  deadline: string;
  stories: Story[] | null;
  imageUrl: string | null;
  isActive: boolean;
  sortOrder: number;
}

function StoryCard({ story, offer, onCopy }: { story: Story; offer: Offer; onCopy: (text: string) => void }) {
  const [copied, setCopied] = useState(false);

  const getShareText = () => {
    return `${story.content}\n\n#StudyInChina #${offer.title} #Foorsa\n\nDeadline: ${offer.deadline}`;
  };

  const handleCopy = () => {
    onCopy(getShareText());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="bg-muted/50 rounded-lg p-4 space-y-3 hover-elevate cursor-pointer"
      onClick={handleCopy}
    >
      <div className="flex items-start justify-between gap-2">
        <h4 className="font-semibold text-sm">{story.title}</h4>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 flex-shrink-0"
          onClick={(e) => { e.stopPropagation(); handleCopy(); }}
        >
          {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
        </Button>
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed">{story.content}</p>
      <div className="flex items-center gap-2 pt-1">
        <Badge variant="secondary" className="text-[10px]">
          <Share2 className="h-2.5 w-2.5 mr-1" />
          Tap to copy
        </Badge>
      </div>
    </div>
  );
}

function OfferPromoDialog({ offer }: { offer: Offer }) {
  const { toast } = useToast();

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied!", description: "Story copied - ready to share!" });
  };

  const stories = offer.stories || [];

  return (
    <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col overflow-hidden">
      <DialogHeader className="flex-shrink-0">
        <DialogTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-primary" />
          Know more about {offer.title}
        </DialogTitle>
      </DialogHeader>

      <div className="flex-1 overflow-y-auto pr-2 min-h-0">
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg p-4 border border-primary/20">
            <p className="font-medium">{offer.description}</p>
            <p className="text-sm text-muted-foreground mt-1">
              Tap any story below to copy it. Share with your audience!
            </p>
          </div>

          <div className="space-y-3">
            {stories.map((story, index) => (
              <StoryCard key={index} story={story} offer={offer} onCopy={copyToClipboard} />
            ))}
          </div>

          {offer.deadline && (
            <div className="bg-destructive/5 rounded-lg p-4 border border-destructive/20">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="h-4 w-4 text-destructive" />
                <span className="font-semibold text-sm text-destructive">Deadline: {offer.deadline}</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Share these stories now - spots are filling fast!
              </p>
            </div>
          )}
        </div>
      </div>
    </DialogContent>
  );
}

function OfferCard({ offer }: { offer: Offer }) {
  return (
    <Card className="overflow-visible border shadow-sm" data-testid={`card-university-${offer.title.toLowerCase()}`}>
      <CardContent className="p-4">
        <div className="flex flex-col gap-1 mb-3">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-bold text-lg">{offer.title}</h3>
            <Badge variant="secondary" className="text-[10px] flex-shrink-0">
              {offer.category}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">{offer.description}</p>
        </div>

        {offer.location && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-3">
            <MapPin className="h-3 w-3" />
            <span>{offer.location}</span>
          </div>
        )}

        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="bg-muted/50 rounded-lg p-2.5">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Tuition</p>
            <p className="text-sm font-semibold">{offer.price}</p>
          </div>
          {offer.deadline && (
            <div className="bg-destructive/5 rounded-lg p-2.5 border border-destructive/20">
              <p className="text-[10px] text-destructive uppercase tracking-wide flex items-center gap-1">
                <Clock className="h-2.5 w-2.5" />
                Deadline
              </p>
              <p className="text-sm font-semibold text-destructive">{offer.deadline}</p>
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-1.5 mb-4">
          <Badge variant="secondary" className="text-[10px]">
            <Flame className="h-2.5 w-2.5 mr-1" />
            Filling Fast
          </Badge>
          <Badge variant="secondary" className="text-[10px]">
            <Sparkles className="h-2.5 w-2.5 mr-1" />
            Exclusive Foorsa
          </Badge>
        </div>

        <Dialog>
          <DialogTrigger asChild>
            <Button className="w-full" size="sm">
              <BookOpen className="h-4 w-4 mr-2" />
              Know more
            </Button>
          </DialogTrigger>
          <OfferPromoDialog offer={offer} />
        </Dialog>
      </CardContent>
    </Card>
  );
}

export function UniversityInfoCard() {
  const { t } = useLanguage();

  // Get current user ID from stored auth
  const storedUser = typeof window !== "undefined" ? localStorage.getItem("user") : null;
  const userId = storedUser ? JSON.parse(storedUser)?.id : undefined;

  const { data: offers, isLoading } = useQuery<Offer[]>({
    queryKey: ["/api/offers", userId],
    queryFn: async () => {
      const url = userId ? `/api/offers?userId=${userId}` : "/api/offers";
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch offers");
      return res.json();
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-64 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!offers || offers.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <GraduationCap className="h-12 w-12 mx-auto mb-3 opacity-40" />
        <p className="font-medium">No offers available yet</p>
        <p className="text-sm mt-1">Check back soon for exclusive university offers!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4" data-testid="section-universities">
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-lg shadow-primary/25">
          <GraduationCap className="h-5 w-5" />
        </div>
        <div>
          <h2 className="font-semibold text-lg">Exclusive Foorsa Offers: March Intake</h2>
          <p className="text-xs text-muted-foreground">Click any university to get stories you can share</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {offers.map((offer) => (
          <OfferCard key={offer.id} offer={offer} />
        ))}
      </div>
    </div>
  );
}
