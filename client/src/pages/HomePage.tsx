import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Users, Shield, Eye } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import foorsaLogo from "@assets/logo_official.png";

export default function HomePage() {
  const { t, dir } = useLanguage();

  return (
    <div className="min-h-screen bg-background flex flex-col" dir={dir}>
      <div className="flex-1 flex items-center justify-center px-6">
        <div className="w-full max-w-md">
          <div className="text-center mb-16">
            <img 
              src={foorsaLogo} 
              alt="Foorsa" 
              className="h-12 mx-auto mb-8"
              data-testid="img-logo"
            />
            <h1 className="text-3xl font-semibold tracking-tight text-foreground mb-3" data-testid="text-title">
              {t.homePage.welcome}
            </h1>
            <p className="text-muted-foreground" data-testid="text-subtitle">
              {t.homePage.subtitle}
            </p>
          </div>

          <div className="space-y-4">
            <Link href="/landing">
              <Button 
                variant="outline" 
                className={`w-full h-14 justify-start gap-4 text-base font-normal ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}
                data-testid="button-view-landing"
              >
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                  <Eye className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className={dir === 'rtl' ? 'text-right flex-1' : 'text-left flex-1'}>
                  <div className="font-medium">{t.homePage.viewLanding}</div>
                  <div className="text-xs text-muted-foreground">{t.homePage.viewLandingDesc}</div>
                </div>
              </Button>
            </Link>

            <Link href="/login">
              <Button 
                variant="outline" 
                className={`w-full h-14 justify-start gap-4 text-base font-normal ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}
                data-testid="button-login-affiliate"
              >
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div className={dir === 'rtl' ? 'text-right flex-1' : 'text-left flex-1'}>
                  <div className="font-medium">{t.homePage.partnerLogin}</div>
                  <div className="text-xs text-muted-foreground">{t.homePage.partnerLoginDesc}</div>
                </div>
              </Button>
            </Link>

            <Link href="/admin" data-testid="button-login-admin">
              <Button 
                variant="outline" 
                className={`w-full h-14 justify-start gap-4 text-base font-normal ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}
              >
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                  <Shield className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className={dir === 'rtl' ? 'text-right flex-1' : 'text-left flex-1'}>
                  <div className="font-medium">{t.homePage.adminLogin}</div>
                  <div className="text-xs text-muted-foreground">{t.homePage.adminLoginDesc}</div>
                </div>
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <footer className="py-6 text-center">
        <p className="text-xs text-muted-foreground/60">
          {t.homePage.copyright}
        </p>
      </footer>
    </div>
  );
}
