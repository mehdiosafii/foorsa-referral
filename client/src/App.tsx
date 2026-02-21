import { Switch, Route, useRoute } from "wouter";
import { lazy, Suspense } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageProvider } from "@/context/LanguageContext";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import foorsaLogo from "@assets/logo_official.png";
import { LogOut } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

// Eager-load critical pages
import LandingPage from "@/pages/LandingPage";
import NotFound from "@/pages/not-found";

// Lazy-load less critical pages
const HomePage = lazy(() => import("@/pages/HomePage"));
const ThankYouPage = lazy(() => import("@/pages/ThankYouPage"));
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const AmbassadorLogin = lazy(() => import("@/pages/AmbassadorLogin"));

// Lazy-load admin pages
const AdminLayout = lazy(() => import("@/components/admin/AdminLayout"));
const AdminOverview = lazy(() => import("@/pages/admin/AdminOverview"));
const AdminAmbassadors = lazy(() => import("@/pages/admin/AdminAmbassadors"));
const AdminLeads = lazy(() => import("@/pages/admin/AdminLeads"));
const AdminOffers = lazy(() => import("@/pages/admin/AdminOffers"));
const AdminTracking = lazy(() => import("@/pages/admin/AdminTracking"));
const AdminSettings = lazy(() => import("@/pages/admin/AdminSettings"));

function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  );
}

function ReferralLanding() {
  const [, params] = useRoute("/ref/:code");
  return <LandingPage referralCode={params?.code} />;
}

function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { t } = useLanguage();

  const handleLogout = () => {
    localStorage.removeItem("ambassador_user");
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-muted/30">
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto px-4 sm:px-6 max-w-7xl">
          <div className="flex items-center justify-between gap-4 h-16">
            <div className="flex items-center gap-3">
              <img src={foorsaLogo} alt="Foorsa" className="h-8" />
              <span className="font-semibold text-lg hidden sm:inline bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">{t.dashboard.title}</span>
            </div>
            <div className="flex items-center gap-1.5">
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

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      <Route path="/ref/:code" component={ReferralLanding} />
      <Route path="/landing">
        <LandingPage />
      </Route>
      <Route path="/thank-you">
        <Suspense fallback={<LoadingFallback />}>
          <ThankYouPage />
        </Suspense>
      </Route>
      <Route path="/shukran">
        <Suspense fallback={<LoadingFallback />}>
          <ThankYouPage />
        </Suspense>
      </Route>
      <Route path="/admin/ambassadors">
        <Suspense fallback={<LoadingFallback />}>
          <AdminLayout>
            <AdminAmbassadors />
          </AdminLayout>
        </Suspense>
      </Route>
      <Route path="/admin/leads">
        <Suspense fallback={<LoadingFallback />}>
          <AdminLayout>
            <AdminLeads />
          </AdminLayout>
        </Suspense>
      </Route>
      <Route path="/admin/offers">
        <Suspense fallback={<LoadingFallback />}>
          <AdminLayout>
            <AdminOffers />
          </AdminLayout>
        </Suspense>
      </Route>
      <Route path="/admin/tracking">
        <Suspense fallback={<LoadingFallback />}>
          <AdminLayout>
            <AdminTracking />
          </AdminLayout>
        </Suspense>
      </Route>
      <Route path="/admin/settings">
        <Suspense fallback={<LoadingFallback />}>
          <AdminLayout>
            <AdminSettings />
          </AdminLayout>
        </Suspense>
      </Route>
      <Route path="/admin">
        <Suspense fallback={<LoadingFallback />}>
          <AdminLayout>
            <AdminOverview />
          </AdminLayout>
        </Suspense>
      </Route>
      <Route path="/login">
        <Suspense fallback={<LoadingFallback />}>
          {isAuthenticated ? (
            <DashboardLayout>
              <Dashboard />
            </DashboardLayout>
          ) : (
            <AmbassadorLogin />
          )}
        </Suspense>
      </Route>
      <Route path="/partner">
        <Suspense fallback={<LoadingFallback />}>
          {isAuthenticated ? (
            <DashboardLayout>
              <Dashboard />
            </DashboardLayout>
          ) : isLoading ? (
            <LoadingFallback />
          ) : (
            <AmbassadorLogin />
          )}
        </Suspense>
      </Route>
      <Route path="/dashboard">
        <Suspense fallback={<LoadingFallback />}>
          {isAuthenticated ? (
            <DashboardLayout>
              <Dashboard />
            </DashboardLayout>
          ) : isLoading ? (
            <LoadingFallback />
          ) : (
            <AmbassadorLogin />
          )}
        </Suspense>
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
