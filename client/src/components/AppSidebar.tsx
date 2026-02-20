import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard, 
  Trophy, 
  Users, 
  LogOut,
  ExternalLink,
  Sparkles
} from "lucide-react";
import foorsaIcon from "@assets/foorsa_icon.png";

export function AppSidebar() {
  const [location] = useLocation();
  const { user } = useAuth();

  const mainNavItems = [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "Leaderboard",
      url: "/leaderboard",
      icon: Trophy,
    },
  ];

  const adminNavItems = [
    {
      title: "Admin Panel",
      url: "/admin",
      icon: Users,
    },
  ];

  return (
    <Sidebar>
      <SidebarHeader className="p-4 pb-2">
        <Link 
          href="/dashboard" 
          className="flex items-center gap-3 group transition-all duration-200 ease-out"
        >
          <div className="relative">
            <img 
              src={foorsaIcon} 
              alt="Foorsa" 
              className="h-10 w-10 rounded-lg shadow-sm transition-transform duration-200 ease-out group-hover:scale-105"
            />
            <div className="absolute -top-1 -right-1 h-3 w-3 bg-gradient-to-br from-sidebar-primary to-sidebar-primary/70 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
              <Sparkles className="h-2 w-2 text-sidebar-primary-foreground" />
            </div>
          </div>
          <div className="flex flex-col">
            <h2 className="font-semibold text-base text-sidebar-foreground tracking-tight">
              Foorsa
            </h2>
            <p className="text-[11px] font-medium text-sidebar-foreground/50 tracking-wide uppercase">
              Referral Platform
            </p>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarSeparator className="opacity-30 my-2" />
      
      <SidebarContent className="gap-6 px-2">
        <SidebarGroup className="p-0">
          <SidebarGroupLabel className="px-3 text-[10px] font-semibold uppercase tracking-widest text-sidebar-foreground/40 mb-1">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {mainNavItems.map((item) => {
                const isActive = location === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton 
                      asChild 
                      isActive={isActive}
                      className={`
                        py-2.5 px-3 rounded-lg transition-all duration-200 ease-out
                        ${isActive 
                          ? 'bg-sidebar-accent shadow-sm' 
                          : 'hover-elevate'
                        }
                      `}
                    >
                      <Link href={item.url} data-testid={`nav-${item.title.toLowerCase()}`}>
                        <item.icon className="h-5 w-5 shrink-0" />
                        <span className="font-medium">{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {user?.isAdmin && (
          <SidebarGroup className="p-0">
            <SidebarGroupLabel className="px-3 text-[10px] font-semibold uppercase tracking-widest text-sidebar-foreground/40 mb-1">
              Administration
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="gap-1">
                {adminNavItems.map((item) => {
                  const isActive = location === item.url;
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton 
                        asChild 
                        isActive={isActive}
                        className={`
                          py-2.5 px-3 rounded-lg transition-all duration-200 ease-out
                          ${isActive 
                            ? 'bg-sidebar-accent shadow-sm' 
                            : 'hover-elevate'
                          }
                        `}
                      >
                        <Link href={item.url} data-testid={`nav-${item.title.toLowerCase().replace(/\s/g, '-')}`}>
                          <item.icon className="h-5 w-5 shrink-0" />
                          <span className="font-medium">{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        <SidebarGroup className="p-0">
          <SidebarGroupLabel className="px-3 text-[10px] font-semibold uppercase tracking-widest text-sidebar-foreground/40 mb-1">
            Quick Links
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              <SidebarMenuItem>
                <SidebarMenuButton 
                  asChild
                  className="py-2.5 px-3 rounded-lg transition-all duration-200 ease-out hover-elevate"
                >
                  <a 
                    href={`/ref/${user?.referralCode}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    data-testid="nav-view-landing"
                  >
                    <ExternalLink className="h-5 w-5 shrink-0" />
                    <span className="font-medium">View My Landing Page</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarSeparator className="opacity-30 mt-auto" />

      <SidebarFooter className="p-4">
        <div className="flex items-center gap-3 mb-3 px-1">
          <Avatar className="h-9 w-9 ring-2 ring-sidebar-accent/50 ring-offset-1 ring-offset-sidebar">
            <AvatarImage src={user?.profileImageUrl || undefined} />
            <AvatarFallback className="bg-sidebar-accent text-sidebar-accent-foreground text-sm font-medium">
              {user?.firstName?.charAt(0) || "U"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm text-sidebar-foreground truncate leading-tight">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-[11px] text-sidebar-foreground/50 truncate">
              {user?.email}
            </p>
          </div>
        </div>
        <a href="/api/logout" className="block">
          <Button 
            variant="ghost" 
            className="w-full justify-start gap-2.5 text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50 transition-all duration-200 ease-out h-9"
            data-testid="button-logout"
          >
            <LogOut className="h-4 w-4" />
            <span className="text-sm font-medium">Log Out</span>
          </Button>
        </a>
      </SidebarFooter>
    </Sidebar>
  );
}
