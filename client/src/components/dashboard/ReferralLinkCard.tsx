import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Copy, Check, Share2, Sparkles } from "lucide-react";
import { SiWhatsapp, SiFacebook, SiInstagram, SiTiktok } from "react-icons/si";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/context/LanguageContext";

interface ReferralLinkCardProps {
  referralCode: string;
}

export function ReferralLinkCard({ referralCode }: ReferralLinkCardProps) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  const { t } = useLanguage();
  
  // Use the configured domain for referral URLs
  // In production, this should be set to the live domain (e.g., https://foorsa.live)
  const getBaseUrl = () => {
    // Always prioritize the configured domain if set
    if (import.meta.env.VITE_REFERRAL_DOMAIN) {
      return import.meta.env.VITE_REFERRAL_DOMAIN;
    }
    // Fallback to window location for development
    if (typeof window !== 'undefined') {
      return window.location.origin;
    }
    return "";
  };
  const referralUrl = `${getBaseUrl()}/r/${referralCode}`;
  const shareText = `${t.dashboard.shareMessage} ${referralUrl}`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(referralUrl);
      setCopied(true);
      toast({
        title: t.dashboard.referralLink.copied,
        description: referralUrl,
      });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({
        title: t.dashboard.copyError,
        description: t.dashboard.copyManually,
        variant: "destructive",
      });
    }
  };

  const copyWithMessage = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      toast({
        title: t.dashboard.referralLink.copied,
        description: t.dashboard.referralLink.readyToPaste,
      });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({
        title: t.dashboard.copyError,
        description: t.dashboard.copyManually,
        variant: "destructive",
      });
    }
  };

  const shareToWhatsApp = () => {
    const text = encodeURIComponent(shareText);
    window.open(`https://wa.me/?text=${text}`, "_blank");
  };

  const shareToFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralUrl)}&quote=${encodeURIComponent(t.dashboard.shareMessage)}`, "_blank");
  };

  const shareToInstagram = async () => {
    await copyWithMessage();
    toast({
      title: t.dashboard.referralLink.copied,
      description: t.dashboard.referralLink.instagramHint,
    });
  };

  const shareToTikTok = async () => {
    await copyWithMessage();
    toast({
      title: t.dashboard.referralLink.copied,
      description: t.dashboard.referralLink.tiktokHint,
    });
  };

  return (
    <div 
      className="relative overflow-hidden rounded-2xl border border-accent/30 dark:border-accent/20 bg-gradient-to-br from-accent/10 via-accent/5 to-accent/10 dark:from-accent/10 dark:via-accent/5 dark:to-accent/10 p-5 sm:p-6"
      data-testid="card-referral-link"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-accent/30 to-transparent dark:from-accent/10 rounded-full blur-2xl" />
      
      <div className="relative">
        <div className="flex items-center gap-3 mb-5">
          <div className="p-2.5 rounded-xl bg-accent text-accent-foreground shadow-lg shadow-accent/25">
            <Share2 className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              {t.dashboard.referralLink.title}
              <Sparkles className="h-4 w-4 text-accent" />
            </h3>
            <p className="text-sm text-muted-foreground">{t.dashboard.referralLink.subtitle}</p>
          </div>
        </div>
        
        <div className="flex gap-2 mb-5">
          <div className="flex-1 relative">
            <input
              type="text"
              value={referralUrl}
              readOnly
              dir="ltr"
              className="w-full px-4 py-3 rounded-xl bg-white/80 dark:bg-black/20 border border-accent/30 dark:border-accent/20 font-mono text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
              data-testid="input-referral-link"
            />
          </div>
          <Button 
            variant="outline"
            size="icon"
            onClick={copyToClipboard}
            className="h-12 w-12 rounded-xl border-accent/30 dark:border-accent/20 bg-white/80 dark:bg-black/20"
            data-testid="button-copy-link"
          >
            {copied ? (
              <Check className="h-5 w-5 text-emerald-500" />
            ) : (
              <Copy className="h-5 w-5" />
            )}
          </Button>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Button 
            onClick={shareToWhatsApp}
            className="gap-2 bg-green-500 hover:bg-green-600 text-white border-0 rounded-xl"
            data-testid="button-share-whatsapp"
          >
            <SiWhatsapp className="h-4 w-4" />
            <span className="hidden sm:inline">WhatsApp</span>
          </Button>
          <Button 
            onClick={shareToFacebook}
            className="gap-2 bg-blue-600 hover:bg-blue-700 text-white border-0 rounded-xl"
            data-testid="button-share-facebook"
          >
            <SiFacebook className="h-4 w-4" />
            <span className="hidden sm:inline">Facebook</span>
          </Button>
          <Button 
            onClick={shareToInstagram}
            className="gap-2 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 hover:from-purple-600 hover:via-pink-600 hover:to-orange-600 text-white border-0 rounded-xl"
            data-testid="button-share-instagram"
          >
            <SiInstagram className="h-4 w-4" />
            <span className="hidden sm:inline">Instagram</span>
          </Button>
          <Button 
            onClick={shareToTikTok}
            className="gap-2 bg-black hover:bg-gray-800 text-white border-0 rounded-xl dark:bg-white dark:hover:bg-gray-200 dark:text-black"
            data-testid="button-share-tiktok"
          >
            <SiTiktok className="h-4 w-4" />
            <span className="hidden sm:inline">TikTok</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
