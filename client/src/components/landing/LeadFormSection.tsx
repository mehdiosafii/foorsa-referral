import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { normalizePhoneNumber } from "@/lib/phoneUtils";
import { CheckCircle2, Phone, Mail, Clock, Loader2 } from "lucide-react";
import { SiWhatsapp } from "react-icons/si";

const leadFormSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().min(8, "Please enter a valid phone number"),
  email: z.string().email("Please enter a valid email").optional().or(z.literal("")),
  preferredProgram: z.string().optional(),
});

type LeadFormData = z.infer<typeof leadFormSchema>;

interface LeadFormSectionProps {
  referralCode?: string;
  ambassadorName?: string;
}

const programs = [
  "Medicine",
  "Engineering",
  "Computer Science",
  "Business Administration",
  "Architecture",
  "Pharmacy",
  "Dentistry",
  "Chinese Language",
  "Other"
];

// WhatsApp business number
const WHATSAPP_NUMBER = "212537911271";

export function LeadFormSection({ referralCode, ambassadorName }: LeadFormSectionProps) {
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);
  
  const form = useForm<LeadFormData>({
    resolver: zodResolver(leadFormSchema),
    defaultValues: {
      fullName: "",
      phone: "+212 ",
      email: "",
      preferredProgram: "",
    },
  });

  const buildWhatsAppMessage = (data: LeadFormData) => {
    const normalizedPhone = normalizePhoneNumber(data.phone);
    const parts = [
      `Hi, I'm interested in studying in China!`,
      ``,
      `Name: ${data.fullName}`,
      `Phone: ${normalizedPhone}`,
    ];
    if (data.email) parts.push(`Email: ${data.email}`);
    if (data.preferredProgram) parts.push(`Program: ${data.preferredProgram}`);
    if (referralCode) {
      parts.push(``, `Referred by: ${ambassadorName || referralCode}`);
    }
    return parts.join('\n');
  };

  const submitMutation = useMutation({
    mutationFn: async (data: LeadFormData) => {
      const normalizedData = {
        ...data,
        phone: normalizePhoneNumber(data.phone),
        referralCode,
      };
      return await apiRequest("POST", "/api/leads", normalizedData);
    },
    onSuccess: (_, data) => {
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'conversion', {
          'send_to': 'AW-10979569577/CJQRCMGTuLQZEKnfu_Mo'
        });
      }
      const message = buildWhatsAppMessage(data);
      window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, "_blank");
      setSubmitted(true);
      toast({
        title: "Registered!",
        description: "Send the WhatsApp message to complete your registration.",
      });
    },
    onError: (error: any, data) => {
      if (error?.duplicate || error?.message?.includes("already been submitted") || error?.error?.includes("already")) {
        const message = buildWhatsAppMessage(data);
        window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, "_blank");
        setSubmitted(true);
        toast({
          title: "Welcome back!",
          description: "Send the WhatsApp message to continue.",
        });
      } else {
        toast({
          title: "Something went wrong",
          description: "Please try again or contact us directly.",
          variant: "destructive",
        });
      }
    },
  });

  const onSubmit = (data: LeadFormData) => {
    submitMutation.mutate(data);
  };

  if (submitted) {
    return (
      <section id="lead-form" className="py-20 bg-gradient-to-br from-[#1a2744] to-[#1e3a5f]">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-12">
            <div className="w-20 h-20 rounded-full bg-[#25D366] mx-auto mb-6 flex items-center justify-center">
              <SiWhatsapp className="h-10 w-10 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-4">
              Send the message on WhatsApp!
            </h2>
            <p className="text-xl text-white/90 mb-6">
              WhatsApp has been opened in a new tab. Please tap "Send" to complete your registration.
            </p>
            <Button
              onClick={() => {
                const message = `Hi, I'm interested in studying in China!`;
                window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, "_blank");
              }}
              className="bg-[#25D366] text-white hover:bg-[#25D366]/90"
            >
              <SiWhatsapp className="mr-2 h-5 w-5" />
              Open WhatsApp Again
            </Button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="lead-form" className="py-20 bg-gradient-to-br from-[#1a2744] to-[#1e3a5f]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Start Your Journey Today
            </h2>
            <p className="text-lg text-white/80 mb-8">
              Fill out the form and our expert team will guide you through every step of your application process.
            </p>
            
            <Card className="bg-white/10 border-white/20 p-6 mb-6">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Full Name *</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Enter your full name" 
                            className="bg-white/10 border-white/30 text-white placeholder:text-white/50"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Phone (WhatsApp) *</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="+212 6XX XXX XXX" 
                            className="bg-white/10 border-white/30 text-white placeholder:text-white/50"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Email</FormLabel>
                        <FormControl>
                          <Input 
                            type="email"
                            placeholder="your@email.com (optional)" 
                            className="bg-white/10 border-white/30 text-white placeholder:text-white/50"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="preferredProgram"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Preferred Program</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-white/10 border-white/30 text-white">
                              <SelectValue placeholder="Select program (optional)" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {programs.map((program) => (
                              <SelectItem key={program} value={program}>
                                {program}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button 
                    type="submit" 
                    size="lg"
                    className="w-full bg-[#25D366] text-white hover:bg-[#25D366]/90 font-semibold"
                    disabled={submitMutation.isPending}
                  >
                    {submitMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <SiWhatsapp className="mr-2 h-5 w-5" />
                        Register Now
                      </>
                    )}
                  </Button>
                  
                  <p className="text-xs text-center mt-3 text-white/70">
                    Free consultation — no obligations. We'll contact you within 24 hours.
                  </p>
                </form>
              </Form>
            </Card>
          </div>
          
          <div className="space-y-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
              <h3 className="text-xl font-semibold text-white mb-4">What Happens Next?</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#EACA91] flex items-center justify-center flex-shrink-0 text-[#1a2744] font-bold">1</div>
                  <div>
                    <p className="text-white font-medium">Free Consultation Call</p>
                    <p className="text-white/70 text-sm">We'll discuss your goals and recommend the best path forward.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#EACA91] flex items-center justify-center flex-shrink-0 text-[#1a2744] font-bold">2</div>
                  <div>
                    <p className="text-white font-medium">University Matching</p>
                    <p className="text-white/70 text-sm">We'll match you with universities that fit your profile.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#EACA91] flex items-center justify-center flex-shrink-0 text-[#1a2744] font-bold">3</div>
                  <div>
                    <p className="text-white font-medium">Application Support</p>
                    <p className="text-white/70 text-sm">We handle all paperwork and communication with universities.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 text-center">
                <Clock className="h-8 w-8 text-[#EACA91] mx-auto mb-2" />
                <p className="text-white font-semibold">24h Response</p>
                <p className="text-white/70 text-sm">Quick turnaround</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 text-center">
                <Phone className="h-8 w-8 text-[#EACA91] mx-auto mb-2" />
                <p className="text-white font-semibold">Free Call</p>
                <p className="text-white/70 text-sm">No obligations</p>
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Contact Us Directly</h3>
              <div className="space-y-3">
                <a href="tel:+212537911271" className="flex items-center gap-3 text-white/90 hover:text-white transition-colors">
                  <Phone className="h-5 w-5 text-[#EACA91]" />
                  +212 537 911 271
                </a>
                <a href="mailto:contact@foorsa.ma" className="flex items-center gap-3 text-white/90 hover:text-white transition-colors">
                  <Mail className="h-5 w-5 text-[#EACA91]" />
                  contact@foorsa.ma
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
