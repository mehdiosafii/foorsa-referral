import { Globe, Lightbulb } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

interface ChinaFactProps {
  userId?: string;
}

export function MotivationalQuote({ userId = "" }: ChinaFactProps) {
  const { t } = useLanguage();
  const facts = t.chinaFacts;
  
  const today = new Date();
  const dayOfYear = Math.floor(
    (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24)
  );
  
  const userHash = userId ? userId.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) : 0;
  const factIndex = (dayOfYear + userHash) % facts.length;
  const fact = facts[factIndex];

  return (
    <div 
      className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 p-5 sm:p-6"
      data-testid="card-china-fact"
    >
      <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-primary/10 to-transparent rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-primary/5 to-transparent rounded-full blur-2xl" />
      
      <div className="relative flex items-start gap-4">
        <div className="shrink-0 p-3 rounded-xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-lg shadow-primary/25">
          <Globe className="h-5 w-5 sm:h-6 sm:w-6" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-semibold text-primary uppercase tracking-wider">{t.factOfDay}</span>
            <Lightbulb className="h-3.5 w-3.5 text-accent" />
          </div>
          <p className="text-base sm:text-lg font-medium text-foreground leading-relaxed" data-testid="text-fact">
            {fact.text}
          </p>
          <p className="text-sm text-muted-foreground mt-3 flex items-center gap-2" data-testid="text-fact-source">
            <span className="inline-block w-8 h-px bg-muted-foreground/30" />
            {fact.source}
          </p>
        </div>
      </div>
    </div>
  );
}
