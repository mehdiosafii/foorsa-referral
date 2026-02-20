import { Badge } from "@/components/ui/badge";
import { Users, Mail, Calendar, Inbox } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import type { Lead } from "@shared/schema";
import { format } from "date-fns";

interface LeadsTableProps {
  leads: Lead[];
  isLoading?: boolean;
}

const statusConfig: Record<string, { bg: string; text: string; dot: string }> = {
  new: { bg: "bg-blue-500/10", text: "text-blue-600 dark:text-blue-400", dot: "bg-blue-500" },
  contacted: { bg: "bg-accent/10", text: "text-accent dark:text-accent", dot: "bg-accent" },
  converted: { bg: "bg-emerald-500/10", text: "text-emerald-600 dark:text-emerald-400", dot: "bg-emerald-500" },
  lost: { bg: "bg-red-500/10", text: "text-red-600 dark:text-red-400", dot: "bg-red-500" },
};

export function LeadsTable({ leads, isLoading }: LeadsTableProps) {
  const { t } = useLanguage();
  
  const getStatusLabel = (status: string | null) => {
    const key = status || "new";
    return t.dashboard.status[key as keyof typeof t.dashboard.status] || key;
  };

  const getStatusConfig = (status: string | null) => {
    return statusConfig[status || "new"] || statusConfig.new;
  };
  
  if (isLoading) {
    return (
      <div className="rounded-2xl border border-border/50 bg-gradient-to-br from-card via-card to-card p-5 sm:p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-muted rounded-lg w-1/3" />
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-16 bg-muted rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border/50 bg-gradient-to-br from-card via-card to-card p-5 sm:p-6" data-testid="card-leads-table">
      <div className="flex items-center gap-3 mb-5">
        <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25">
          <Users className="h-5 w-5" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground">{t.dashboard.leadsTable.title}</h3>
          <p className="text-xs text-muted-foreground">Your recent referrals</p>
        </div>
      </div>
      
      {leads.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <Inbox className="h-12 w-12 mx-auto mb-3 text-muted-foreground/30" />
          <p className="text-sm">{t.dashboard.leadsTable.empty}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {leads.slice(0, 10).map((lead) => {
            const config = getStatusConfig(lead.status);
            return (
              <div 
                key={lead.id}
                className="p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors"
                data-testid={`row-lead-${lead.id}`}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm truncate">{lead.fullName}</p>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                      <Mail className="h-3 w-3" />
                      <span className="truncate" dir="ltr">{lead.email}</span>
                    </div>
                  </div>
                  <Badge 
                    className={`shrink-0 text-[10px] border-0 gap-1.5 ${config.bg} ${config.text}`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
                    {getStatusLabel(lead.status)}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border/50">
                  <span className="truncate">{lead.preferredProgram || t.dashboard.leadsTable.noProgram}</span>
                  <span className="shrink-0 flex items-center gap-1.5">
                    <Calendar className="h-3 w-3" />
                    {lead.createdAt ? format(new Date(lead.createdAt), "MMM d") : "-"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
