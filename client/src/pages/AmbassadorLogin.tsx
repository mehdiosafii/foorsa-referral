import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/context/LanguageContext";
import { ArrowLeft, ArrowRight, LogIn, Mail, Lock, Smartphone } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import foorsaLogo from "@assets/logo_official.png";

export default function AmbassadorLogin() {
  const [, setLocation] = useLocation();
  const { t, dir } = useLanguage();
  const { toast } = useToast();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    document.documentElement.classList.add('dark');
    return () => {
      document.documentElement.classList.remove('dark');
    };
  }, []);

  const loginMutation = useMutation({
    mutationFn: async (credentials: { email: string; password: string }) => {
      const res = await apiRequest("POST", "/api/ambassador/login", credentials);
      return res.json();
    },
    onSuccess: (data) => {
      localStorage.setItem("ambassador_user", JSON.stringify(data));
      window.dispatchEvent(new Event("ambassador_login"));
      setLocation("/dashboard");
    },
    onError: () => {
      toast({
        title: t.login.error,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    loginMutation.mutate({ email, password });
  };

  const BackArrow = dir === 'rtl' ? ArrowRight : ArrowLeft;

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      dir={dir}
      style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)' }}
    >
      <div 
        className="fixed inset-0 pointer-events-none"
        aria-hidden="true"
        data-testid="decorative-floating-elements"
      >
        <div className="absolute font-serif text-8xl font-light tracking-wide" style={{ top: '5%', left: '3%', color: 'rgba(139, 92, 246, 0.15)', animation: 'floatSlow 12s ease-in-out infinite', textShadow: '0 0 40px rgba(139, 92, 246, 0.1)' }}>中</div>
        <div className="absolute font-serif text-7xl font-light" style={{ top: '8%', right: '25%', color: 'rgba(236, 72, 153, 0.12)', animation: 'floatSlow 14s ease-in-out infinite 2s' }}>国</div>
        <div className="absolute font-serif text-6xl font-light" style={{ top: '20%', left: '8%', color: 'rgba(59, 130, 246, 0.13)', animation: 'floatSlow 11s ease-in-out infinite 1s' }}>学</div>
        <div className="absolute font-serif text-9xl font-extralight" style={{ bottom: '8%', left: '5%', color: 'rgba(139, 92, 246, 0.12)', animation: 'floatSlow 15s ease-in-out infinite 3s', textShadow: '0 0 60px rgba(139, 92, 246, 0.08)' }}>北</div>
        <div className="absolute font-serif text-7xl font-light" style={{ bottom: '15%', left: '20%', color: 'rgba(236, 72, 153, 0.1)', animation: 'floatSlow 13s ease-in-out infinite 4s' }}>京</div>
        <div className="absolute font-serif text-5xl font-light" style={{ top: '40%', left: '2%', color: 'rgba(59, 130, 246, 0.12)', animation: 'floatSlow 10s ease-in-out infinite 2.5s' }}>留</div>
        <div className="absolute font-serif text-6xl font-light" style={{ top: '60%', left: '5%', color: 'rgba(139, 92, 246, 0.1)', animation: 'floatSlow 14s ease-in-out infinite 5s' }}>华</div>
        <div className="absolute font-serif text-8xl font-extralight" style={{ top: '12%', right: '5%', color: 'rgba(59, 130, 246, 0.14)', animation: 'floatSlow 12s ease-in-out infinite 1.5s', textShadow: '0 0 50px rgba(59, 130, 246, 0.1)' }}>大</div>
        <div className="absolute font-serif text-5xl font-light" style={{ top: '35%', right: '3%', color: 'rgba(236, 72, 153, 0.11)', animation: 'floatSlow 11s ease-in-out infinite 3.5s' }}>生</div>
        <div className="absolute font-serif text-6xl font-light" style={{ bottom: '25%', right: '8%', color: 'rgba(139, 92, 246, 0.12)', animation: 'floatSlow 13s ease-in-out infinite 4.5s' }}>飞</div>
        <div className="absolute font-serif text-7xl font-light" style={{ bottom: '5%', right: '15%', color: 'rgba(59, 130, 246, 0.13)', animation: 'floatSlow 15s ease-in-out infinite 2s' }}>梦</div>
        <div className="absolute font-serif text-5xl font-light" style={{ top: '70%', right: '3%', color: 'rgba(236, 72, 153, 0.1)', animation: 'floatSlow 12s ease-in-out infinite 5.5s' }}>志</div>
        <div className="absolute font-serif text-4xl font-light" style={{ top: '85%', left: '35%', color: 'rgba(139, 92, 246, 0.08)', animation: 'floatSlow 14s ease-in-out infinite 6s' }}>未</div>
        <div className="absolute font-serif text-4xl font-light" style={{ top: '3%', left: '40%', color: 'rgba(59, 130, 246, 0.1)', animation: 'floatSlow 11s ease-in-out infinite 7s' }}>来</div>

        <div 
          className="absolute"
          style={{
            top: '15%',
            right: '8%',
            animation: 'floatSlow 8s ease-in-out infinite',
          }}
          data-testid="decorative-iphone"
        >
          <div className="relative w-32 h-48 sm:w-44 sm:h-64">
            <div className="absolute -inset-4 rounded-[2.5rem] bg-gradient-to-br from-violet-500/20 via-pink-500/15 to-blue-500/20 blur-2xl" />
            <div className="absolute -inset-2 rounded-[2rem] bg-gradient-to-br from-violet-400/10 to-pink-400/10 blur-xl" />
            <div 
              className="absolute inset-0 rounded-[1.5rem] border-2 border-white/20"
              style={{ 
                background: 'linear-gradient(180deg, rgba(30, 27, 75, 0.95) 0%, rgba(15, 23, 42, 0.98) 100%)',
                boxShadow: '0 25px 50px -12px rgba(139, 92, 246, 0.25), inset 0 1px 0 rgba(255,255,255,0.1)'
              }}
            >
              <div className="absolute top-3 left-1/2 -translate-x-1/2 flex items-center gap-2">
                <div className="w-12 h-1.5 rounded-full bg-slate-700/80" />
                <div className="w-2.5 h-2.5 rounded-full bg-slate-600/60" />
              </div>
              <div className="absolute inset-4 top-8 rounded-xl bg-gradient-to-br from-violet-500/10 via-transparent to-pink-500/10 flex items-center justify-center">
                <Smartphone className="w-12 h-12 sm:w-16 sm:h-16 text-violet-400/80" />
              </div>
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-sm font-medium text-violet-300/70">
                iPhone 17
              </div>
            </div>
          </div>
        </div>

        <div 
          className="absolute hidden sm:block"
          style={{
            bottom: '10%',
            left: '8%',
            animation: 'floatSlow 18s ease-in-out infinite 3s',
          }}
          data-testid="decorative-china-map"
        >
          <svg viewBox="0 0 200 150" className="w-48 h-36 opacity-30" aria-hidden="true">
            <defs>
              <linearGradient id="mapGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="rgb(139, 92, 246)" stopOpacity="0.4" />
                <stop offset="100%" stopColor="rgb(59, 130, 246)" stopOpacity="0.4" />
              </linearGradient>
            </defs>
            <path 
              d="M20,75 Q50,30 100,40 Q150,50 180,75 Q150,100 100,110 Q50,120 20,75 Z" 
              fill="none" 
              stroke="url(#mapGradient)"
              strokeWidth="2"
            />
            <circle cx="60" cy="70" r="4" fill="rgba(236, 72, 153, 0.5)" />
            <circle cx="100" cy="60" r="5" fill="rgba(139, 92, 246, 0.5)" />
            <circle cx="140" cy="75" r="4" fill="rgba(59, 130, 246, 0.5)" />
          </svg>
        </div>
      </div>

      <style>{`
        @keyframes floatSlow {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33% { transform: translateY(-12px) rotate(1deg); }
          66% { transform: translateY(-6px) rotate(-0.5deg); }
        }
      `}</style>

      <Card className="w-full max-w-sm relative z-10 border-white/10 bg-slate-900/70 backdrop-blur-xl shadow-2xl shadow-violet-500/10">
        <CardHeader className="text-center space-y-3 pb-4">
          <div className="flex justify-center">
            <img 
              src={foorsaLogo} 
              alt="Foorsa" 
              className="h-10 w-auto"
            />
          </div>
          <div>
            <CardTitle className="text-xl text-white">{t.login.title}</CardTitle>
            <CardDescription className="mt-1 text-slate-400 text-sm">
              {t.login.subtitle}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-slate-300 text-sm">{t.login.email}</Label>
              <div className="relative">
                <Mail className={`absolute top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 ${dir === 'rtl' ? 'right-3' : 'left-3'}`} />
                <Input
                  id="email"
                  type="email"
                  placeholder={t.login.emailPlaceholder}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`${dir === 'rtl' ? 'pr-10' : 'pl-10'} bg-slate-800/50 border-slate-700/50 text-white placeholder:text-slate-500 focus:border-violet-500/50 focus:ring-violet-500/20`}
                  data-testid="input-email"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-slate-300 text-sm">{t.login.password}</Label>
              <div className="relative">
                <Lock className={`absolute top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 ${dir === 'rtl' ? 'right-3' : 'left-3'}`} />
                <Input
                  id="password"
                  type="password"
                  placeholder={t.login.passwordPlaceholder}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`${dir === 'rtl' ? 'pr-10' : 'pl-10'} bg-slate-800/50 border-slate-700/50 text-white placeholder:text-slate-500 focus:border-violet-500/50 focus:ring-violet-500/20`}
                  data-testid="input-password"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-violet-600 to-violet-700 hover:from-violet-500 hover:to-violet-600 border-0 shadow-lg shadow-violet-500/25"
              disabled={loginMutation.isPending}
              data-testid="button-login"
            >
              {loginMutation.isPending ? (
                t.login.submitting
              ) : (
                <>
                  <LogIn className="h-4 w-4" />
                  {t.login.submit}
                </>
              )}
            </Button>
          </form>

          <div className="mt-4 pt-3 border-t border-slate-700/50">
            <Button
              variant="ghost"
              className="w-full text-slate-400 hover:text-white hover:bg-slate-800/50"
              onClick={() => setLocation("/")}
              data-testid="button-back-home"
            >
              <BackArrow className="h-4 w-4" />
              {t.login.backToHome}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
