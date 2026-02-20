import { motion } from "framer-motion";
import { GraduationCap, Shield, Globe, Users, BookOpen, HeartHandshake, LucideIcon } from "lucide-react";

interface Benefit {
  icon: LucideIcon;
  title: string;
  description: string;
}

const benefits: Benefit[] = [
  {
    icon: GraduationCap,
    title: "Full Scholarship Support",
    description: "We help you secure scholarships covering tuition, accommodation, and living expenses at top Chinese universities."
  },
  {
    icon: Shield,
    title: "End-to-End Guidance",
    description: "From application to arrival, we handle visa processing, documentation, and everything in between."
  },
  {
    icon: Globe,
    title: "Cultural Integration",
    description: "We prepare you for life in China with language basics, cultural orientation, and local support networks."
  },
  {
    icon: Users,
    title: "Student Community",
    description: "Join a vibrant community of Moroccan students in China for support, networking, and friendship."
  },
  {
    icon: BookOpen,
    title: "Academic Excellence",
    description: "Access world-class education at universities ranked among the best in Asia and globally."
  },
  {
    icon: HeartHandshake,
    title: "Ongoing Support",
    description: "Our commitment doesn't end at enrollment. We're here throughout your entire academic journey."
  },
  {
    icon: GraduationCap,
    title: "400+ Partner Universities",
    description: "Choose from a wide network of prestigious universities across China, from Beijing to Shanghai."
  },
  {
    icon: Shield,
    title: "Visa Guarantee",
    description: "Our expert team ensures your visa application is processed correctly the first time."
  },
  {
    icon: Globe,
    title: "Offices in Morocco & China",
    description: "Local support in Rabat and on-ground assistance in major Chinese cities."
  }
];

const firstColumn = benefits.slice(0, 3);
const secondColumn = benefits.slice(3, 6);
const thirdColumn = benefits.slice(6, 9);

function BenefitsColumn({ 
  benefits, 
  className, 
  duration = 15 
}: { 
  benefits: Benefit[]; 
  className?: string; 
  duration?: number;
}) {
  return (
    <div className={className}>
      <motion.div
        animate={{
          translateY: "-50%",
        }}
        transition={{
          duration,
          repeat: Infinity,
          ease: "linear",
          repeatType: "loop",
        }}
        className="flex flex-col gap-6 pb-6"
      >
        {[...Array(2)].map((_, repeatIndex) => (
          <div key={repeatIndex} className="flex flex-col gap-6">
            {benefits.map((benefit, index) => (
              <motion.div
                key={`${repeatIndex}-${index}`}
                aria-hidden={repeatIndex === 1}
                whileHover={{ 
                  scale: 1.03,
                  y: -8,
                  transition: { type: "spring", stiffness: 400, damping: 17 }
                }}
                className="p-8 rounded-2xl border border-border/50 dark:border-neutral-800 shadow-lg bg-card dark:bg-neutral-900/80 backdrop-blur-sm cursor-default select-none group transition-all duration-300 max-w-xs w-full"
                data-testid={`card-benefit-${repeatIndex}-${index}`}
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 group-hover:from-primary/30 group-hover:to-primary/10 transition-all duration-300">
                    <benefit.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-foreground mb-2 tracking-tight">
                      {benefit.title}
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {benefit.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ))}
      </motion.div>
    </div>
  );
}

export function WhyChooseSection() {
  return (
    <section 
      aria-labelledby="why-choose-heading"
      className="py-24 bg-background relative overflow-hidden"
    >
      <motion.div 
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ 
          duration: 1.2, 
          ease: [0.16, 1, 0.3, 1],
        }}
        className="container px-4 z-10 mx-auto"
      >
        <div className="flex flex-col items-center justify-center max-w-[600px] mx-auto mb-16">
          <div className="flex justify-center">
            <div className="border border-primary/30 py-1.5 px-5 rounded-full text-xs font-semibold tracking-wide uppercase text-primary bg-primary/5 transition-colors">
              Why Foorsa
            </div>
          </div>

          <h2 
            id="why-choose-heading" 
            className="text-4xl md:text-5xl font-extrabold tracking-tight mt-6 text-center text-foreground"
          >
            Why Choose Foorsa?
          </h2>
          <p className="text-center mt-5 text-muted-foreground text-lg leading-relaxed max-w-md">
            We believe every student deserves a smooth, fulfilling journey to China, free from worries and difficulties.
          </p>
        </div>

        <div 
          className="flex justify-center gap-6 mt-10 [mask-image:linear-gradient(to_bottom,transparent,black_10%,black_90%,transparent)] max-h-[740px] overflow-hidden"
          role="region"
          aria-label="Scrolling Benefits"
        >
          <BenefitsColumn benefits={firstColumn} duration={18} />
          <BenefitsColumn benefits={secondColumn} className="hidden md:block" duration={22} />
          <BenefitsColumn benefits={thirdColumn} className="hidden lg:block" duration={20} />
        </div>
      </motion.div>
    </section>
  );
}
