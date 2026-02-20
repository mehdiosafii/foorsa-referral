import { Button } from "@/components/ui/button";
import { InteractiveHoverButton } from "@/components/ui/interactive-hover-button";
import { Phone, ArrowRight, GraduationCap, Shield, Globe } from "lucide-react";
import foorsaLogo from "@assets/logo_official.png";

interface HeroSectionProps {
  referralCode?: string;
}

export function HeroSection({ referralCode }: HeroSectionProps) {
  const scrollToForm = () => {
    document.getElementById("lead-form")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-[#1a2744] via-[#1e3a5f] to-[#1a2744]">
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=2070')] bg-cover bg-center opacity-20" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#1a2744]/80 via-[#1a2744]/60 to-[#1a2744]/90" />
      
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-24 text-center">
        <div className="flex justify-center mb-8">
          <img 
            src={foorsaLogo} 
            alt="Foorsa" 
            className="h-20 md:h-28 object-contain brightness-0 invert"
            data-testid="img-foorsa-logo"
          />
        </div>
        
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
          Your Future Starts in{" "}
          <span className="text-[#EACA91]">China</span>
        </h1>
        
        <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto mb-8 leading-relaxed">
          Join 500+ students who transformed their dreams into reality. 
          Get full scholarship support and end-to-end guidance for your journey to China's top universities.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <InteractiveHoverButton 
            text="Enter Now"
            onClick={scrollToForm}
            className="w-auto px-8 py-4 bg-[#EACA91] text-[#1a2744] border-[#EACA91] text-lg"
            data-testid="button-hero-get-started"
          />
          <InteractiveHoverButton 
            text="Free Consultation"
            onClick={scrollToForm}
            className="w-auto px-8 py-4 border-white/30 text-white bg-white/10 backdrop-blur-sm text-lg"
            data-testid="button-hero-call"
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <div className="flex items-center justify-center gap-3 bg-white/10 backdrop-blur-sm rounded-lg px-6 py-4">
            <GraduationCap className="h-8 w-8 text-[#EACA91]" />
            <div className="text-left">
              <p className="text-2xl font-bold text-white">500+</p>
              <p className="text-white/80 text-sm">Students Placed</p>
            </div>
          </div>
          <div className="flex items-center justify-center gap-3 bg-white/10 backdrop-blur-sm rounded-lg px-6 py-4">
            <Globe className="h-8 w-8 text-[#EACA91]" />
            <div className="text-left">
              <p className="text-2xl font-bold text-white">15+</p>
              <p className="text-white/80 text-sm">Partner Universities</p>
            </div>
          </div>
          <div className="flex items-center justify-center gap-3 bg-white/10 backdrop-blur-sm rounded-lg px-6 py-4">
            <Shield className="h-8 w-8 text-[#EACA91]" />
            <div className="text-left">
              <p className="text-2xl font-bold text-white">100%</p>
              <p className="text-white/80 text-sm">Success Rate</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
          <div className="w-1.5 h-3 bg-white/70 rounded-full mt-2" />
        </div>
      </div>
    </section>
  );
}
