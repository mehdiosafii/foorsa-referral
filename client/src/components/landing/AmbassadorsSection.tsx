import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { SiInstagram, SiYoutube, SiTiktok, SiWhatsapp } from "react-icons/si";
import { Users } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

interface PublicAmbassador {
  id: string;
  firstName: string | null;
  lastName: string | null;
  profileImageUrl: string | null;
  instagramUrl: string | null;
  youtubeUrl: string | null;
  tiktokUrl: string | null;
  instagramFollowers: number | null;
  youtubeFollowers: number | null;
  tiktokFollowers: number | null;
  referralCode: string | null;
}

const sectionText = {
  title: "Our Ambassadors",
  subtitle: "Meet the content creators helping students discover opportunities in China",
  followersLabel: "followers"
};

function formatFollowers(count: number | null): string {
  if (!count) return "";
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
  return count.toString();
}

function getTotalFollowers(ambassador: PublicAmbassador): number {
  return (ambassador.instagramFollowers || 0) + (ambassador.youtubeFollowers || 0) + (ambassador.tiktokFollowers || 0);
}

export function AmbassadorsSection() {
  const { t } = useLanguage();
  const text = sectionText;
  
  const { data: ambassadors = [], isLoading } = useQuery<PublicAmbassador[]>({
    queryKey: ["/api/ambassadors/public"],
  });

  if (isLoading || ambassadors.length === 0) {
    return null;
  }

  return (
    <section className="py-20 bg-muted/30" data-testid="section-ambassadors">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-accent/10 text-accent-foreground px-4 py-2 rounded-full mb-4">
            <Users className="h-4 w-4" />
            <span className="text-sm font-medium">{ambassadors.length}+ {text.title}</span>
          </div>
          
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            {text.title}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {text.subtitle}
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {ambassadors.map((ambassador) => (
            <Card 
              key={ambassador.id}
              className="p-6 text-center"
              data-testid={`card-ambassador-${ambassador.id}`}
            >
              <Avatar className="h-24 w-24 mx-auto mb-4 ring-4 ring-accent/20">
                <AvatarImage 
                  src={ambassador.profileImageUrl || undefined} 
                  alt={`${ambassador.firstName} ${ambassador.lastName}`} 
                />
                <AvatarFallback className="text-2xl bg-accent/10 text-foreground">
                  {ambassador.firstName?.charAt(0) || "A"}
                </AvatarFallback>
              </Avatar>
              
              <h3 className="text-xl font-bold text-foreground mb-1">
                {ambassador.firstName} {ambassador.lastName}
              </h3>
              
              <p className="text-sm text-muted-foreground mb-4">
                {formatFollowers(getTotalFollowers(ambassador))} {text.followersLabel}
              </p>
              
              <div className={`flex justify-center gap-2 `}>
                {ambassador.instagramUrl && (
                  <Button
                    variant="ghost"
                    size="icon"
                    asChild
                    className="text-pink-500 hover:text-pink-600 hover:bg-pink-500/10"
                  >
                    <a 
                      href={ambassador.instagramUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      data-testid={`link-instagram-${ambassador.id}`}
                    >
                      <SiInstagram className="h-5 w-5" />
                    </a>
                  </Button>
                )}
                
                {ambassador.youtubeUrl && (
                  <Button
                    variant="ghost"
                    size="icon"
                    asChild
                    className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
                  >
                    <a 
                      href={ambassador.youtubeUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      data-testid={`link-youtube-${ambassador.id}`}
                    >
                      <SiYoutube className="h-5 w-5" />
                    </a>
                  </Button>
                )}
                
                {ambassador.tiktokUrl && (
                  <Button
                    variant="ghost"
                    size="icon"
                    asChild
                    className="text-foreground hover:bg-foreground/10"
                  >
                    <a 
                      href={ambassador.tiktokUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      data-testid={`link-tiktok-${ambassador.id}`}
                    >
                      <SiTiktok className="h-5 w-5" />
                    </a>
                  </Button>
                )}
                
                <Button
                  variant="ghost"
                  size="icon"
                  asChild
                  className="text-green-500 hover:text-green-600 hover:bg-green-500/10"
                >
                  <a 
                    href={`https://wa.me/212704309787?text=${encodeURIComponent(`Hello, I'm interested in studying in China. I came from ${ambassador.firstName} ${ambassador.lastName}`)}`}
                    target="_blank" 
                    rel="noopener noreferrer"
                    data-testid={`link-whatsapp-${ambassador.id}`}
                  >
                    <SiWhatsapp className="h-5 w-5" />
                  </a>
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
