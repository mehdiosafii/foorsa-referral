import { useState } from "react";
import { useLocation, Link } from "wouter";
import { 
  Home, Users, Target, Link as LinkIcon, Settings, Lock, Activity, Search, Bell 
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import foorsaLogo from "@assets/logo_official.png";

const ADMIN_PASSWORD = "1234";

const navItems = [
  { title: "Overview", href: "/admin", icon: Home },
  { title: "Ambassadors", href: "/admin/ambassadors", icon: Users },
  { title: "Leads", href: "/admin/leads", icon: Target },
  { title: "Tracking Links", href: "/admin/tracking", icon: LinkIcon },
  { title: "Settings", href: "/admin/settings", icon: Settings },
];

function AdminSidebar() {
  const [location] = useLocation();
  const { setOpenMobile } = useSidebar();

  const handleNavClick = () => {
    // Always close mobile drawer - this is a no-op on desktop
    setOpenMobile(false);
  };

  return (
    <Sidebar>
      <SidebarContent>
        <div className="p-4 border-b border-border/50 bg-gradient-to-r from-primary/5 via-primary/10 to-transparent">
          <div className="flex items-center gap-2">
            <img src={foorsaLogo} alt="Foorsa" className="h-6" />
            <span className="font-semibold text-sm bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">Admin</span>
          </div>
        </div>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const isActive = location === item.href || 
                  (item.href !== "/admin" && location.startsWith(item.href));
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={isActive}>
                      <Link 
                        href={item.href} 
                        onClick={handleNavClick}
                        data-testid={`nav-${item.title.toLowerCase().replace(/\s+/g, "-")}`}
                      >
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

function PasswordGate({ onSuccess }: { onSuccess: () => void }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      sessionStorage.setItem("adminAuthenticated", "true");
      onSuccess();
    } else {
      setError("Incorrect password");
      setPassword("");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 pointer-events-none" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-primary/3 rounded-full blur-3xl pointer-events-none" />
      <Card className="w-full max-w-sm p-6 rounded-xl border-border/50 backdrop-blur-sm relative z-10">
        <div className="flex flex-col items-center gap-4 mb-6">
          <div className="p-3 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 ring-1 ring-primary/20">
            <Lock className="h-6 w-6 text-primary" />
          </div>
          <div className="text-center">
            <h1 className="text-xl font-semibold">Admin Access</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Enter the admin password to continue
            </p>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError("");
              }}
              data-testid="input-admin-password"
            />
            {error && (
              <p className="text-sm text-destructive mt-2" data-testid="text-password-error">
                {error}
              </p>
            )}
          </div>
          <Button type="submit" className="w-full" data-testid="button-admin-login">
            Access Admin Panel
          </Button>
        </form>
      </Card>
    </div>
  );
}

function getCurrentSectionName(path: string): string {
  const item = navItems.find(
    (nav) => path === nav.href || (nav.href !== "/admin" && path.startsWith(nav.href))
  );
  return item?.title || "Overview";
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem("adminAuthenticated") === "true";
  });
  const [location] = useLocation();

  if (!isAuthenticated) {
    return <PasswordGate onSuccess={() => setIsAuthenticated(true)} />;
  }

  const sectionName = getCurrentSectionName(location);

  const sidebarStyle = {
    "--sidebar-width": "14rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <SidebarProvider defaultOpen={true} style={sidebarStyle as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AdminSidebar />
        <div className="flex flex-col flex-1 min-w-0">
          <header className="sticky top-0 z-50 h-14 border-b border-border/50 bg-background/80 backdrop-blur-md transition-all duration-200">
            <div className="flex items-center justify-between gap-4 h-full px-4">
              <div className="flex items-center gap-3">
                <SidebarTrigger data-testid="button-sidebar-toggle" />
                <div className="hidden sm:flex items-center gap-2">
                  <span className="font-medium text-foreground">Admin</span>
                  <span className="text-muted-foreground/60">/</span>
                  <span className="text-muted-foreground">{sectionName}</span>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="relative hidden md:flex items-center">
                  <Search className="absolute left-3 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <Input
                    type="search"
                    placeholder="Search..."
                    className="w-48 lg:w-64 pl-9 h-9 bg-muted/50 border-none rounded-lg text-sm placeholder:text-muted-foreground/70 focus-visible:ring-1 focus-visible:ring-ring/50 transition-all duration-200"
                    data-testid="input-admin-search"
                  />
                </div>
                
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="relative"
                  data-testid="button-notifications"
                >
                  <Bell className="h-4 w-4" />
                  <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary" />
                </Button>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="rounded-full"
                      data-testid="button-profile-menu"
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
                          AD
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col gap-1">
                        <p className="text-sm font-medium">Admin</p>
                        <p className="text-xs text-muted-foreground">admin@foorsa.com</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/" className="cursor-pointer" data-testid="link-home">
                        <Home className="mr-2 h-4 w-4" />
                        Home
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/admin/settings" className="cursor-pointer" data-testid="link-settings">
                        <Settings className="mr-2 h-4 w-4" />
                        Settings
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                
                <ThemeToggle />
              </div>
            </div>
          </header>
          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
