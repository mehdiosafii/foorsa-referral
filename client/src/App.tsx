import { Switch, Route, useRoute } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageProvider } from "@/context/LanguageContext";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import HomePage from "@/pages/HomePage";
import LandingPage from "@/pages/LandingPage";
import ThankYouPage from "@/pages/ThankYouPage";
import Dashboard from "@/pages/Dashboard";
// OLD ADMIN PANEL DEPRECATED - Use /admin instead
// import AdminPanel from "@/pages/AdminPanel";
import AmbassadorLogin from "@/pages/AmbassadorLogin";
import NotFound from "@/pages/not-found";
import foorsaLogo from "@assets/logo_official.png";
import { LogOut, Settings } from "lucide-react";
import { Link } from "wouter";
import { LanguageSelector } from "@/components/LanguageSelector";
import { useLanguage } from "@/context/LanguageContext";
import AdminLayout from "@/components/admin/AdminLayout";
import AdminOverview from "@/pages/admin/AdminOverview";
import AdminAmbassadors from "@/pages/admin/AdminAmbassadors";
import AdminLeads from "@/pages/admin/AdminLeads";
import AdminTracking from "@/pages/admin/AdminTracking";
import AdminSettings from "@/pages/admin/AdminSettings";

function ReferralLanding() {
  const [, params] = useRoute("/ref/:code");
  return <LandingPage referralCode={params?.code} />;
}

function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, authType } = useAuth();
  const { t, dir } = useLanguage();

  const handleLogout = async () => {
    if (authType === "ambassador") {
      await fetch("/api/ambassador/logout", { method: "POST", credentials: "include" });
      queryClient.invalidateQueries({ queryKey: ["/api/ambassador/me"] });
      window.location.href = "/";
    } else {
      window.location.href = "/api/logout";
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-muted/30" dir={dir}>
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto px-4 sm:px-6 max-w-7xl">
          <div className="flex items-center justify-between gap-4 h-16">
            <div className="flex items-center gap-3">
              <img src={foorsaLogo} alt="Foorsa" className="h-8" />
              <span className="font-semibold text-lg hidden sm:inline bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">{t.dashboard.title}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <LanguageSelector />
              <ThemeToggle />
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleLogout}
                className="gap-2 rounded-xl"
                data-testid="button-logout"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">{t.dashboard.logout}</span>
              </Button>
            </div>
          </div>
        </div>
      </header>
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}

// OLD LAYOUT REMOVED - Using new AdminLayout for all admin routes

function Router() {
  const { isAuthenticated, isLoading, user } = useAuth();

  return (
    <Switch>
      <Route path="/ref/:code" component={ReferralLanding} />
      <Route path="/landing">
        <LandingPage />
      </Route>
      <Route path="/shukran">
        <ThankYouPage />
      </Route>
      <Route path="/thank-you">
        <ThankYouPage />
      </Route>
      {/* OLD ADMIN PANEL DEPRECATED - Redirects to new admin */}
      <Route path="/admin-old">
        <AdminLayout>
          <AdminOverview />
        </AdminLayout>
      </Route>
      <Route path="/admin/ambassadors">
        <AdminLayout>
          <AdminAmbassadors />
        </AdminLayout>
      </Route>
      <Route path="/admin/leads">
        <AdminLayout>
          <AdminLeads />
        </AdminLayout>
      </Route>
      <Route path="/admin/tracking">
        <AdminLayout>
          <AdminTracking />
        </AdminLayout>
      </Route>
      <Route path="/admin/settings">
        <AdminLayout>
          <AdminSettings />
        </AdminLayout>
      </Route>
      <Route path="/admin">
        <AdminLayout>
          <AdminOverview />
        </AdminLayout>
      </Route>
      <Route path="/login">
        {isAuthenticated ? (
          <DashboardLayout>
            <Dashboard />
          </DashboardLayout>
        ) : (
          <AmbassadorLogin />
        )}
      </Route>
      <Route path="/partner">
        {isAuthenticated ? (
          <DashboardLayout>
            <Dashboard />
          </DashboardLayout>
        ) : isLoading ? (
          <div className="min-h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <AmbassadorLogin />
        )}
      </Route>
      
      <Route path="/dashboard">
        {isAuthenticated ? (
          <DashboardLayout>
            <Dashboard />
          </DashboardLayout>
        ) : isLoading ? (
          <div className="min-h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <AmbassadorLogin />
        )}
      </Route>
      
      <Route path="/">
        <LandingPage />
      </Route>
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <LanguageProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </LanguageProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
