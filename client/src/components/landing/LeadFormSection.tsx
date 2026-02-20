import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { normalizePhoneNumber } from "@/lib/phoneUtils";
import { CheckCircle2, Phone, Mail, Clock, ArrowRight, Loader2, MessageCircle } from "lucide-react";
import { SiWhatsapp } from "react-icons/si";

const leadFormSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  phone: z.string().min(8, "Please enter a valid phone number"),
  preferredProgram: z.string().optional(),
  preferredCity: z.string().optional(),
  message: z.string().optional(),
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
  "Law",
  "Arts & Design",
  "Other"
];

const cities = [
  "Beijing",
  "Shanghai",
  "Nanjing",
  "Hangzhou",
  "Guangzhou",
  "Chengdu",
  "Xi'an",
  "Wuhan",
  "Other"
];

export function LeadFormSection({ referralCode, ambassadorName }: LeadFormSectionProps) {
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);
  
  const form = useForm<LeadFormData>({
    resolver: zodResolver(leadFormSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "+212 ",
      preferredProgram: "",
      preferredCity: "",
      message: "",
    },
  });

  // WhatsApp business number
  const WHATSAPP_NUMBER = "212537911271";
  
  // Build WhatsApp message from form data - Giveaway entry
  const buildWhatsAppMessage = (data: LeadFormData) => {
    const normalizedPhone = normalizePhoneNumber(data.phone);
    const parts = [
      `مرحبا، أريد المشاركة في المسابقة`,
      ``,
      `الاسم: ${data.fullName}`,
      `الهاتف: ${normalizedPhone}`,
      `البريد: ${data.email}`,
    ];
    
    if (data.preferredProgram) {
      parts.push(`التخصص: ${data.preferredProgram}`);
    }
    if (data.preferredCity) {
      parts.push(`المدينة المفضلة: ${data.preferredCity}`);
    }
    if (data.message) {
      parts.push(``, `ملاحظة: ${data.message}`);
    }
    
    // Add source information - Ambassador with name
    if (referralCode) {
      if (ambassadorName) {
        parts.push(``, `المصدر: سفير - ${ambassadorName} (${referralCode})`);
      } else {
        parts.push(``, `المصدر: سفير (${referralCode})`);
      }
    }
    
    return parts.join('\n');
  };

  const submitMutation = useMutation({
    mutationFn: async (data: LeadFormData) => {
      // Normalize phone before saving
      const normalizedData = {
        ...data,
        phone: normalizePhoneNumber(data.phone),
        referralCode,
      };
      return await apiRequest("POST", "/api/leads", normalizedData);
    },
    onSuccess: (_, data) => {
      // Fire Google Ads conversion event
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'conversion', {
          'send_to': 'AW-10979569577/CJQRCMGTuLQZEKnfu_Mo'
        });
      }
      
      // Build WhatsApp URL and redirect
      const message = buildWhatsAppMessage(data);
      const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
      
      // Open WhatsApp in new tab
      window.open(whatsappUrl, "_blank");
      
      setSubmitted(true);
      toast({
        title: "تم التسجيل!",
        description: "أرسل الرسالة عبر واتساب للمشاركة في المسابقة.",
      });
    },
    onError: (error: any, data) => {
      // Check if this is a duplicate submission - still open WhatsApp for giveaway entry
      if (error?.duplicate || error?.message?.includes("already been submitted") || error?.error?.includes("مسجل مسبقاً")) {
        // Still open WhatsApp so they can send the message
        const message = buildWhatsAppMessage(data);
        const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, "_blank");
        
        setSubmitted(true);
        toast({
          title: "مرحباً بك مجدداً!",
          description: "أرسل الرسالة عبر واتساب للمشاركة في المسابقة",
        });
      } else {
        toast({
          title: "حدث خطأ",
          description: "يرجى المحاولة مرة أخرى أو التواصل معنا مباشرة.",
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
              أرسل الرسالة عبر واتساب!
            </h2>
            <p className="text-xl text-white/90 mb-6">
              تم فتح واتساب في نافذة جديدة. يرجى الضغط على "إرسال" للمشاركة في المسابقة.
            </p>
            <Button
              onClick={() => {
                const message = `مرحبا، أريد المشاركة في المسابقة`;
                window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, "_blank");
              }}
              className="bg-[#25D366] text-white hover:bg-[#25D366]/90"
            >
              <SiWhatsapp className="mr-2 h-5 w-5" />
              افتح واتساب مرة أخرى
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
                            data-testid="input-fullname"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">Email *</FormLabel>
                          <FormControl>
                            <Input 
                              type="email"
                              placeholder="your@email.com" 
                              className="bg-white/10 border-white/30 text-white placeholder:text-white/50"
                              data-testid="input-email"
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
                          <FormLabel className="text-white">Phone *</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="+212 6XX XXX XXX" 
                              className="bg-white/10 border-white/30 text-white placeholder:text-white/50"
                              data-testid="input-phone"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="preferredProgram"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">Preferred Program</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger 
                                className="bg-white/10 border-white/30 text-white"
                                data-testid="select-program"
                              >
                                <SelectValue placeholder="Select program" />
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
                    
                    <FormField
                      control={form.control}
                      name="preferredCity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">Preferred City</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger 
                                className="bg-white/10 border-white/30 text-white"
                                data-testid="select-city"
                              >
                                <SelectValue placeholder="Select city" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {cities.map((city) => (
                                <SelectItem key={city} value={city}>
                                  {city}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Message (Optional)</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Tell us about your goals and any questions you have..."
                            className="bg-white/10 border-white/30 text-white placeholder:text-white/50 resize-none"
                            rows={3}
                            data-testid="textarea-message"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button 
                    type="submit" 
                    size="lg"
                    className="w-full bg-[#25D366] text-white hover:bg-[#25D366]/90 font-semibold"
                    disabled={submitMutation.isPending}
                    data-testid="button-submit-lead"
                  >
                    {submitMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        جاري الإرسال...
                      </>
                    ) : (
                      <>
                        <SiWhatsapp className="mr-2 h-5 w-5" />
                        سجل الآن
                      </>
                    )}
                  </Button>
                  
                  <p className="text-xs text-center mt-3 text-white/70">
                    بالضغط على الزر، تشارك تلقائياً في المسابقة ويمكنك طرح أي سؤال حول الدراسة في الصين - استشارة مجانية!
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
