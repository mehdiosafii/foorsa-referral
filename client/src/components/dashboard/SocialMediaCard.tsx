import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SiInstagram, SiYoutube, SiTiktok } from "react-icons/si";
import { ExternalLink } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

interface SocialMediaCardProps {
  instagramUrl?: string | null;
  youtubeUrl?: string | null;
  tiktokUrl?: string | null;
  instagramFollowers?: number | null;
  youtubeFollowers?: number | null;
  tiktokFollowers?: number | null;
}

function formatFollowers(count: number | null | undefined): string {
  if (!count) return "0";
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
  return count.toString();
}

export function SocialMediaCard({
  instagramUrl,
  youtubeUrl,
  tiktokUrl,
  instagramFollowers,
  youtubeFollowers,
  tiktokFollowers,
}: SocialMediaCardProps) {
  const { t } = useLanguage();
  
  const hasSocialMedia = instagramUrl || youtubeUrl || tiktokUrl;
  
  if (!hasSocialMedia) return null;

  const socialLinks = [
    {
      name: "Instagram",
      url: instagramUrl,
      followers: instagramFollowers,
      icon: SiInstagram,
      color: "text-pink-500",
      bgColor: "bg-pink-500/10",
    },
    {
      name: "YouTube",
      url: youtubeUrl,
      followers: youtubeFollowers,
      icon: SiYoutube,
      color: "text-red-500",
      bgColor: "bg-red-500/10",
    },
    {
      name: "TikTok",
      url: tiktokUrl,
      followers: tiktokFollowers,
      icon: SiTiktok,
      color: "text-foreground",
      bgColor: "bg-foreground/10",
    },
  ].filter(link => link.url);

  return (
    <Card className="border-0 shadow-sm" data-testid="card-social-media">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold" data-testid="text-social-media-title">
          {t.dashboard.socialMedia?.title || "Social Media"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {socialLinks.map((social) => (
            <div
              key={social.name}
              className={`flex items-center gap-3 p-4 rounded-xl ${social.bgColor}`}
              data-testid={`social-card-${social.name.toLowerCase()}`}
            >
              <div className={`${social.color}`}>
                <social.icon className="h-8 w-8" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-muted-foreground">{social.name}</p>
                <p className="text-xl font-bold" data-testid={`followers-${social.name.toLowerCase()}`}>
                  {formatFollowers(social.followers)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {t.dashboard.socialMedia?.followers || "followers"}
                </p>
              </div>
              {social.url && (
                <Button
                  variant="ghost"
                  size="icon"
                  asChild
                  className="shrink-0"
                  data-testid={`link-${social.name.toLowerCase()}`}
                >
                  <a href={social.url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
