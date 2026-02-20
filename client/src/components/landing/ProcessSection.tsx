import { ClipboardList, CheckCircle2, FileText, Plane } from "lucide-react";

const steps = [
  {
    icon: ClipboardList,
    title: "Apply",
    description: "Submit your application with our expert guidance on choosing the right university and program."
  },
  {
    icon: CheckCircle2,
    title: "Get Accepted",
    description: "We work directly with universities to secure your admission and scholarship."
  },
  {
    icon: FileText,
    title: "Prepare",
    description: "Complete visa processing, documentation, and pre-departure orientation."
  },
  {
    icon: Plane,
    title: "Study in China",
    description: "Begin your journey with airport pickup, accommodation setup, and ongoing support."
  }
];

export function ProcessSection() {
  return (
    <section className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            How It Works
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Your journey to China in four simple steps
          </p>
        </div>
        
        <div className="relative">
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-border -translate-y-1/2" />
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div 
                key={index}
                className="relative text-center"
                data-testid={`process-step-${index}`}
              >
                <div className="relative z-10 mx-auto w-20 h-20 rounded-full bg-primary flex items-center justify-center mb-6">
                  <step.icon className="h-8 w-8 text-primary-foreground" />
                  <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-[#EACA91] flex items-center justify-center text-[#1a2744] font-bold">
                    {index + 1}
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">
                  {step.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
