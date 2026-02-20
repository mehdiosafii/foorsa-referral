import { InteractiveHoverButton } from "@/components/ui/interactive-hover-button";
import { Clock, Sparkles } from "lucide-react";

export function CTASection() {
  const scrollToForm = () => {
    document.getElementById("lead-form")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="py-20 bg-gradient-to-br from-[#1a2744] to-[#1e3a5f] relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-32 h-32 rounded-full bg-[#EACA91]" />
        <div className="absolute bottom-10 right-10 w-48 h-48 rounded-full bg-[#EACA91]" />
        <div className="absolute top-1/2 left-1/4 w-20 h-20 rounded-full bg-[#EACA91]" />
      </div>
      
      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        <div className="inline-flex items-center gap-2 bg-[#EACA91]/20 text-[#EACA91] px-4 py-2 rounded-full mb-6">
          <Sparkles className="h-4 w-4" />
          <span className="text-sm font-medium">Limited Spots Available</span>
        </div>
        
        <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
          Ready to Start Your Journey?
        </h2>
        
        <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
          Join hundreds of successful students who are now studying at top Chinese universities. 
          Don't miss this opportunity to transform your future.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <InteractiveHoverButton 
            text="Enter Now"
            onClick={scrollToForm}
            className="w-auto px-8 py-4 bg-[#EACA91] text-[#1a2744] border-[#EACA91] text-lg"
            data-testid="button-cta-apply"
          />
        </div>
        
        <div className="flex items-center justify-center gap-2 text-white/70">
          <Clock className="h-5 w-5" />
          <span>Applications for 2025 intake are now open</span>
        </div>
      </div>
    </section>
  );
}
