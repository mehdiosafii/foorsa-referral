import { useEffect, useState, useRef, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { InteractiveHoverButton } from "@/components/ui/interactive-hover-button";
import { ShinyButton } from "@/components/ui/shiny-button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { apiRequest } from "@/lib/queryClient";
import { normalizePhoneNumber } from "@/lib/phoneUtils";
import { useLanguage } from "@/context/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import { GraduationCap, Star, MapPin, Building2, Clock, Bell, ShieldCheck, Plane, Users, HeartHandshake, Languages, Home, CheckCircle2, FileText, Send, Award, ChevronDown, Quote, Play } from "lucide-react";
import { SiWhatsapp } from "react-icons/si";

// Real Google logo component with official colors
function GoogleLogo({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}
import foorsaLogo from "@assets/logo_official.png";

interface RecentSubmission {
  firstName: string;
  city: string;
  timestamp: number;
}

interface LandingPageProps {
  referralCode?: string;
}

const universityDeadlines = [
  { name: "Top Chinese Universities", shortName: "2026", date: new Date("2025-12-30T23:59:59") },
];

const moroccanCities = [
  "Casablanca", "Rabat", "Marrakech", "Fez", "Tangier", "Agadir",
  "Meknes", "Oujda", "Kenitra", "Tetouan", "Sale", "Nador",
  "El Jadida", "Beni Mellal", "Khouribga", "Safi", "Al Hoceima", "Laayoune",
  "Dakhla", "Taza", "Settat", "Berrechid", "Mohammedia", "Khenifra",
  "Ouarzazate", "Errachidia", "Tinghir", "Ifrane", "Midelt", "Azrou",
  "Taroudant", "Tiznit", "Guelmim", "Tan-Tan", "Essaouira", "Chefchaouen",
  "Larache", "Asilah", "Ouezzane", "Fquih Ben Salah", "Kelaat Sraghna"
];



const moroccanNames = [
   "Youssef", "Mohammed", "Amine", "Adam", "Imane", "Sara", "Houda", "Leila",
   "Omar", "Yassine", "Ayoub", "Zakariae", "Maryam", "Fatima", "Noura", "Rim",
   "Ahmed", "Khalid", "Abdullah", "Hamza", "Idriss", "Younes", "Bilal", "Said",
   "Othman", "Tarik", "Karim", "Rachid", "Nabil", "Jamal", "Adil", "Hassan",
   "Ibrahim", "Soulaimane", "Abderrahman", "Abdelkarim", "Mustapha", "Hicham", "Riad", "Aziz",
   "Hanae", "Salma", "Nadia", "Latifa", "Hanan", "Sanaa", "Najat", "Wafaa",
   "Asma", "Khadija", "Zainab", "Aicha", "Halima", "Soukaina", "Roqaya", "Safia",
   "Amina", "Siham", "Basma", "Ikram", "Samira", "Fatiha", "Najwa", "Mouna",
   "Walid", "Fouad", "Anas", "Imad", "Salah", "Tawfik", "Mourad", "Samir",
   "Redouane", "Abdellatif", "Abdellilah", "El Mehdi", "Badr", "Mounir", "Imran", "Ziad",
   "Yasmine", "Lamiae", "Sara", "Dounia", "Chaimae", "Hajar", "Nour", "Malak",
   "Rahma", "Jihad", "Israa", "Alae", "Rawaa", "Ghizlane", "Ilham", "Ibtissam"
];

const youtubeShorts = [
  { id: "fpAU2-SCO7U" },
  { id: "0JHgGP2DhSY" },
  { id: "UbdUTD_dsLM" },
  { id: "E19L-c8oUKE" },
  { id: "JUv1f7PUy7Y" },
  { id: "_nYQm4MAsCw" },
  { id: "Xi7RW40eX_0" },
];

const partnerUniversities = [
  "Tsinghua University",
  "Peking University", 
  "Zhejiang University",
  "Shanghai Jiao Tong University",
  "Fudan University",
  "Nanjing University",
  "University of Science and Technology of China (USTC)",
  "Wuhan University",
  "Harbin Institute of Technology",
  "Xi'an Jiaotong University",
  "Beijing Institute of Technology",
  "Tongji University",
  "Tianjin University",
  "Southeast University",
  "China University of Petroleum (UPC)",
  "Nanjing University of Aeronautics and Astronautics (NUAA)",
  "Beijing Normal University",
  "Sun Yat-sen University",
  "Dalian University of Technology",
  "Huazhong University",
];

const benefitIcons = [GraduationCap, ShieldCheck, Building2, Plane, Users, HeartHandshake, Languages, Home];
const benefitColors = ["text-primary", "text-green-600", "text-primary", "text-primary", "text-primary", "text-primary", "text-primary", "text-primary"];

const stepIcons = [FileText, Users, Send, GraduationCap];

const googleReviews = [
  {
    name: "Youssef El Amrani",
    date: "2 months ago",
    text: "I had an excellent experience working with Nawfal from Foorsa. Professional, efficient, and highly knowledgeable. The team guided me through every step of my scholarship application. I'm now studying medicine at Beijing University!"
  },
  {
    name: "Sara Benjelloun",
    date: "3 months ago",
    text: "Meryem was incredibly helpful throughout the entire process. She answered all my questions patiently and made sure I understood every step. Thanks to Foorsa, I received a full CSC scholarship to study engineering in Nanjing!"
  },
  {
    name: "Amine Rachidi",
    date: "1 month ago",
    text: "Un service tellement parfait et bien structuré! The Foorsa team picked me up from the airport and helped me settle into my dorm. They're still available whenever I need anything. Highly recommend!"
  },
  {
    name: "Fatima Zahra Alaoui",
    date: "2 weeks ago",
    text: "From visa processing to university registration, everything was handled smoothly. The cultural orientation really prepared me for life in China. Best decision I ever made!"
  },
  {
    name: "Omar Bennis",
    date: "3 weeks ago",
    text: "Best decision I ever made was trusting Foorsa with my application. Nawfal and his team are extremely professional and responsive. Got accepted to Shandong University with a 100% scholarship!"
  },
  {
    name: "Khadija Mansouri",
    date: "1 month ago",
    text: "The support doesn't stop after you arrive in China - that's what makes Foorsa special. They have an office here and a community of 500+ Moroccan students. I never felt alone!"
  },
  {
    name: "Mohamed Tazi",
    date: "1 week ago",
    text: "Merci infiniment à toute l'équipe Foorsa! J'ai obtenu ma bourse CSC grâce à leur accompagnement. Le processus était clair et bien organisé du début à la fin."
  },
  {
    name: "Imane El Idrissi",
    date: "4 months ago",
    text: "I was skeptical at first, but Foorsa exceeded all my expectations. They handled my visa, university application, and even helped me find accommodation. Now I'm studying Computer Science at Tsinghua!"
  },
  {
    name: "Zakaria Bouazza",
    date: "2 months ago",
    text: "L'équipe est très réactive et professionnelle. Nawfal m'a aidé à choisir le meilleur programme pour mon profil. Je recommande Foorsa à tous les étudiants marocains!"
  },
  {
    name: "Nadia Chraibi",
    date: "3 weeks ago",
    text: "The community of Moroccan students in China that Foorsa connects you with is invaluable. I made friends before even arriving! The WhatsApp group is super helpful."
  },
  {
    name: "Rachid Amrani",
    date: "5 months ago",
    text: "Foorsa changed my life. I come from a modest family and never thought I could study abroad. Thanks to their guidance, I got a full scholarship covering tuition, accommodation, and monthly stipend!"
  },
  {
    name: "Salma Kettani",
    date: "1 month ago",
    text: "Ce qui distingue Foorsa c'est leur suivi même après l'arrivée en Chine. Ils ont un bureau sur place qui nous aide avec tout. Service exceptionnel!"
  }
];

function getNextDeadline() {
  const now = new Date();
  for (const deadline of universityDeadlines) {
    if (deadline.date > now) {
      return deadline;
    }
  }
  return null;
}

function getTimeRemaining(targetDate: Date) {
  const now = new Date();
  const diff = targetDate.getTime() - now.getTime();
  
  if (diff <= 0) return null;
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  
  return { days, hours, minutes, seconds };
}

function generateRandomSubmission(): RecentSubmission {
  return {
    firstName: moroccanNames[Math.floor(Math.random() * moroccanNames.length)],
    city: moroccanCities[Math.floor(Math.random() * moroccanCities.length)],
    timestamp: Date.now()
  };
}

const pressLogos = [
  { name: "Le Matin", url: "https://lematin.ma/enseignement/faire-des-etudes-en-chine-seduit-les-jeunes-marocains-ce-quil-faut-savoir/225646", style: { fontFamily: 'Georgia, serif', color: '#c8102e' }, className: "font-bold tracking-tight" },
  { name: "TELQUEL", url: "https://telquel.ma/2025/06/30/etudier-en-chine-une-opportunite-abordable-et-ouverte-sur-le-monde_1940217", style: { color: '#e31837' }, className: "font-black tracking-tighter uppercase" },
  { name: "L'Opinion", url: "https://www.lopinion.ma/Etudes-a-l-etranger-La-Chine-nouvel-eldorado-pour-les-etudiants-marocains_a22930.html", style: { fontFamily: 'Georgia, serif', color: '#1a5276' }, className: "font-semibold" },
  { name: "Morocco World News", url: "https://www.moroccoworldnews.com/2021/09/54924/moroccan-students-flock-to-chinese-universities/", style: { color: '#c8102e' }, className: "font-bold" },
  { name: "Doukkalia Press", url: "https://www.doukkalia.press.ma/fr/etudes-a-letranger-le-programme-pedagogique-foorsa-accompagne-les-etudiants-marocains-en-espagne-et-en-chine/", style: { fontFamily: 'Georgia, serif', color: '#2e7d32' }, className: "font-medium" },
  { name: "Msalkhir", url: "https://www.msalkhir.com/fr/etudes-a-letranger-le-programme-pedagogique-foorsa-accompagne-les-etudiants-marocains-en-espagne-et-en-chine/", style: { color: '#1565c0' }, className: "font-bold" },
  { name: "WeLoveBuzz", url: "https://www.welovebuzz.com/etudes-en-chine-500-bourses-octroyees-a-des-bacheliers-marocains-par-la-fusaaa/", style: { color: '#ff6b00' }, className: "font-black" },
];

function PressMarquee({ title }: { title: string }) {
  return (
    <div className="flex flex-col items-center gap-1.5 mb-8">
      <p className="text-[10px] text-muted-foreground uppercase tracking-widest">{title}</p>
      <div 
        className="relative w-full max-w-md mx-auto overflow-hidden"
        dir="ltr"
        style={{ 
          maskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)', 
          WebkitMaskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)' 
        }}
      >
        <div className="flex animate-marquee hover:pause-animation">
          <div className="flex items-center gap-8 px-4 shrink-0">
            {pressLogos.map((logo, i) => (
              <a 
                key={`a-${i}`}
                href={logo.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:opacity-80 transition-opacity shrink-0"
                data-testid={`link-press-${logo.name.toLowerCase().replace(/\s+/g, '-')}-0`}
              >
                <span className={`text-xs whitespace-nowrap ${logo.className}`} style={logo.style}>{logo.name}</span>
              </a>
            ))}
          </div>
          <div className="flex items-center gap-8 px-4 shrink-0">
            {pressLogos.map((logo, i) => (
              <a 
                key={`b-${i}`}
                href={logo.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:opacity-80 transition-opacity shrink-0"
                data-testid={`link-press-${logo.name.toLowerCase().replace(/\s+/g, '-')}-1`}
              >
                <span className={`text-xs whitespace-nowrap ${logo.className}`} style={logo.style}>{logo.name}</span>
              </a>
            ))}
          </div>
        </div>
      </div>
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 20s linear infinite;
        }
        .hover\\:pause-animation:hover {
          animation-play-state: paused !important;
        }
      `}</style>
    </div>
  );
}

export default function LandingPage({ referralCode }: LandingPageProps) {
  const { t } = useLanguage();
  const language = "en" as const;
  const dir = "ltr" as const;
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [countdown, setCountdown] = useState(getTimeRemaining(getNextDeadline()?.date || new Date()));
  const [currentDeadline, setCurrentDeadline] = useState(getNextDeadline());
  const [notification, setNotification] = useState<RecentSubmission | null>(null);
  const [showNotification, setShowNotification] = useState(false);
  const [showStickyButton, setShowStickyButton] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);
  const [trackingCode, setTrackingCode] = useState<string | null>(null);
  const [ambassadorName, setAmbassadorName] = useState<string | null>(null);
  const [trackingLinkInfo, setTrackingLinkInfo] = useState<{ name: string; platform: string } | null>(null);
  
  const reviewsRef = useRef<HTMLDivElement>(null);
  const benefitsRef = useRef<HTMLDivElement>(null);
  const universitiesRef = useRef<HTMLDivElement>(null);
  const shortsRef = useRef<HTMLDivElement>(null);
  const testimonialsRef = useRef<HTMLDivElement>(null);

  const cities = moroccanCities;

  const leadFormSchema = useMemo(() => z.object({
    fullName: z.string().min(2, "Full name is required"),
    whatsappNumber: z.string().min(10, "WhatsApp number is required"),
  }), []);

  type LeadFormData = z.infer<typeof leadFormSchema>;

  const programs = [
    { value: "medicine", label: t.programs.medicine },
    { value: "engineering", label: t.programs.engineering },
    { value: "business", label: t.programs.business },
    { value: "computer_science", label: t.programs.computer_science },
    { value: "pharmacy", label: t.programs.pharmacy },
    { value: "dentistry", label: t.programs.dentistry },
    { value: "language", label: t.programs.language },
    { value: "other", label: t.programs.other },
  ];

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  // Store referral code in localStorage for persistent tracking
  // This ensures leads are attributed even if user doesn't submit immediately
  useEffect(() => {
    // Check for tracking link code in URL (?track=code)
    const urlParams = new URLSearchParams(window.location.search);
    const trackParam = urlParams.get("track");
    if (trackParam) {
      setTrackingCode(trackParam);
      localStorage.setItem("foorsa_tracking_code", trackParam);
      localStorage.setItem("foorsa_tracking_timestamp", Date.now().toString());
    } else {
      // Check localStorage for previously stored tracking code (valid for 30 days)
      const storedTrackCode = localStorage.getItem("foorsa_tracking_code");
      const storedTrackTimestamp = localStorage.getItem("foorsa_tracking_timestamp");
      if (storedTrackCode && storedTrackTimestamp) {
        const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
        if (Date.now() - parseInt(storedTrackTimestamp) < thirtyDaysMs) {
          setTrackingCode(storedTrackCode);
        } else {
          localStorage.removeItem("foorsa_tracking_code");
          localStorage.removeItem("foorsa_tracking_timestamp");
        }
      }
    }

    if (referralCode && referralCode !== "direct") {
      // Store referral code in localStorage for later attribution
      localStorage.setItem("foorsa_referral_code", referralCode);
      localStorage.setItem("foorsa_referral_timestamp", Date.now().toString());
      
      // Fetch ambassador name for this referral code
      fetch(`/api/ambassador/by-code/${referralCode}`)
        .then(res => res.json())
        .then(data => {
          if (data.firstName) {
            setAmbassadorName(`${data.firstName}${data.lastName ? ' ' + data.lastName : ''}`);
          }
        })
        .catch(() => {});
      
      // Track the click for legacy /ref/:code links only
      // The /r/:code redirect adds ?tracked=1 query param after tracking server-side
      // So we only track here if that param is NOT present (direct /ref/:code access)
      const alreadyTracked = urlParams.get("tracked") === "1";
      
      if (!alreadyTracked) {
        // Use sessionStorage to prevent repeat tracking on page refresh
        const sessionKey = `foorsa_tracked_${referralCode}`;
        if (!sessionStorage.getItem(sessionKey)) {
          fetch(`/api/track/${referralCode}`, { method: "POST" }).catch(() => {});
          sessionStorage.setItem(sessionKey, "1");
        }
      }
    }
    
    // If we have a tracking code, fetch the tracking link info
    if (trackParam) {
      fetch(`/api/tracking-link/by-code/${trackParam}`)
        .then(res => res.json())
        .then(data => {
          if (data.name) {
            setTrackingLinkInfo({ name: data.name, platform: data.platform || 'unknown' });
          }
        })
        .catch(() => {});
    }
  }, [referralCode]);

  // Get stored referral code (either from URL or localStorage)
  const getEffectiveReferralCode = () => {
    if (referralCode && referralCode !== "direct") {
      return referralCode;
    }
    // Check localStorage for previously stored referral code (valid for 30 days)
    const storedCode = localStorage.getItem("foorsa_referral_code");
    const storedTimestamp = localStorage.getItem("foorsa_referral_timestamp");
    if (storedCode && storedTimestamp) {
      const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
      if (Date.now() - parseInt(storedTimestamp) < thirtyDaysMs) {
        return storedCode;
      }
      // Clear expired referral code
      localStorage.removeItem("foorsa_referral_code");
      localStorage.removeItem("foorsa_referral_timestamp");
    }
    return null;
  };

  useEffect(() => {
    const timer = setInterval(() => {
      const deadline = getNextDeadline();
      setCurrentDeadline(deadline);
      if (deadline) {
        setCountdown(getTimeRemaining(deadline.date));
      }
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const { data: recentLeads = [] } = useQuery<{ firstName: string; city: string }[]>({
    queryKey: ["/api/leads/recent"],
    refetchInterval: 30000,
  });

  useEffect(() => {
    let currentIndex = 0;
    
    // Generate 100 dummy leads to mix with real ones
    const dummyLeads: RecentSubmission[] = Array.from({ length: 100 }, () => generateRandomSubmission());
    
    // Combine real leads with dummy leads for variety
    const allLeads = [...recentLeads, ...dummyLeads];
    
    // Shuffle the array for random order
    const shuffledLeads = allLeads.sort(() => Math.random() - 0.5);
    
    const showNextNotification = () => {
      const lead = shuffledLeads[currentIndex % shuffledLeads.length];
      setNotification({ firstName: lead.firstName, city: lead.city, timestamp: Date.now() });
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 4000);
      currentIndex++;
    };

    const initialDelay = setTimeout(showNextNotification, 5000);
    const interval = setInterval(showNextNotification, 15000 + Math.random() * 10000);
    
    return () => {
      clearTimeout(initialDelay);
      clearInterval(interval);
    };
  }, [recentLeads]);

  // Always default to Morocco country code (+212) since target audience is Moroccan
  const getCountryCode = () => {
    return '+212';
  };

  const form = useForm<LeadFormData>({
    resolver: zodResolver(leadFormSchema),
    defaultValues: {
      fullName: "",
      whatsappNumber: getCountryCode(),
    },
  });

  useEffect(() => {
    form.clearErrors();
  }, [language, form]);

  // Track when form section is scrolled past to show sticky button
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        // Show sticky button when form is NOT in view
        setShowStickyButton(!entry.isIntersecting);
      },
      { threshold: 0, rootMargin: "-100px 0px 0px 0px" }
    );
    
    if (formRef.current) {
      observer.observe(formRef.current);
    }
    
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const scrollRefs = [reviewsRef, benefitsRef, universitiesRef, shortsRef, testimonialsRef];
    const scrollIntervals: Map<HTMLDivElement, NodeJS.Timeout> = new Map();
    
    const startAutoScroll = (element: HTMLDivElement) => {
      if (scrollIntervals.has(element)) return;
      
      let scrollDirection = dir === 'rtl' ? -1 : 1;
      const scrollSpeed = 1;
      
      const interval = setInterval(() => {
        if (!element) return;
        
        const maxScroll = element.scrollWidth - element.clientWidth;
        const currentScroll = element.scrollLeft;
        
        if (dir === 'rtl') {
          if (currentScroll <= -maxScroll + 10) {
            scrollDirection = 1;
          } else if (currentScroll >= -10) {
            scrollDirection = -1;
          }
        } else {
          if (currentScroll >= maxScroll - 10) {
            scrollDirection = -1;
          } else if (currentScroll <= 10) {
            scrollDirection = 1;
          }
        }
        
        element.scrollLeft += scrollSpeed * scrollDirection;
      }, 30);
      
      scrollIntervals.set(element, interval);
    };
    
    const stopAutoScroll = (element: HTMLDivElement) => {
      const interval = scrollIntervals.get(element);
      if (interval) {
        clearInterval(interval);
        scrollIntervals.delete(element);
      }
    };
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const element = entry.target as HTMLDivElement;
          if (entry.isIntersecting) {
            startAutoScroll(element);
          } else {
            stopAutoScroll(element);
          }
        });
      },
      { threshold: 0.3 }
    );
    
    scrollRefs.forEach((ref) => {
      if (ref.current) {
        observer.observe(ref.current);
        
        ref.current.addEventListener('mouseenter', () => stopAutoScroll(ref.current!));
        ref.current.addEventListener('mouseleave', () => startAutoScroll(ref.current!));
        ref.current.addEventListener('touchstart', () => stopAutoScroll(ref.current!));
        ref.current.addEventListener('touchend', () => {
          setTimeout(() => startAutoScroll(ref.current!), 2000);
        });
      }
    });
    
    return () => {
      observer.disconnect();
      scrollIntervals.forEach((interval) => clearInterval(interval));
    };
  }, [dir]);

  // WhatsApp business number
  const WHATSAPP_NUMBER = "212537911271";
  
  // Build WhatsApp message from form data - Giveaway entry
  const buildWhatsAppMessage = (data: LeadFormData) => {
    const normalizedPhone = normalizePhoneNumber(data.whatsappNumber);
    const parts = [
      `Hello, I want to enter the giveaway`,
      ``,
      `${'Name'}: ${data.fullName}`,
      `WhatsApp: ${normalizedPhone}`,
    ];
    
    // Add source information - Ambassador or Tracking Link
    const effectiveCode = getEffectiveReferralCode();
    if (effectiveCode && effectiveCode !== 'direct') {
      const sourceLabel = 'Source';
      if (ambassadorName) {
        parts.push(``, `${sourceLabel}: ${'Ambassador'} - ${ambassadorName} (${effectiveCode})`);
      } else {
        parts.push(``, `${sourceLabel}: ${'Ambassador'} (${effectiveCode})`);
      }
    } else if (trackingCode) {
      const sourceLabel = 'Source';
      if (trackingLinkInfo) {
        parts.push(``, `${sourceLabel}: ${trackingLinkInfo.platform} - ${trackingLinkInfo.name} (${trackingCode})`);
      } else {
        parts.push(``, `${sourceLabel}: ${'Tracking link'} (${trackingCode})`);
      }
    }
    
    return parts.join('\n');
  };

  const submitMutation = useMutation({
    mutationFn: async (data: LeadFormData) => {
      // Normalize phone before saving
      const normalizedPhone = normalizePhoneNumber(data.whatsappNumber);
      
      // Check if we have a tracking code (campaign tracking link)
      if (trackingCode) {
        return await apiRequest("POST", `/api/track/${trackingCode}/lead`, {
          fullName: data.fullName,
          whatsappNumber: normalizedPhone,
        });
      }
      // Otherwise use referral code (ambassador link)
      const effectiveCode = getEffectiveReferralCode();
      return await apiRequest("POST", "/api/leads", {
        fullName: data.fullName,
        whatsappNumber: normalizedPhone,
        referralCode: effectiveCode || "direct",
      });
    },
    onSuccess: (_, data) => {
      // Track Lead event with Facebook Pixel (client-side)
      if (typeof window !== 'undefined' && (window as any).fbq) {
        (window as any).fbq('track', 'Lead');
      }
      // Fire Google Ads conversion event
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'conversion', {
          'send_to': 'AW-10979569577/CJQRCMGTuLQZEKnfu_Mo'
        });
      }
      // Clear stored codes after successful submission
      localStorage.removeItem("foorsa_referral_code");
      localStorage.removeItem("foorsa_referral_timestamp");
      localStorage.removeItem("foorsa_tracking_code");
      localStorage.removeItem("foorsa_tracking_timestamp");
      
      // Build WhatsApp URL and open in new tab
      const message = buildWhatsAppMessage(data);
      const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, "_blank");
      
      navigate("/shukran");
    },
    onError: (error: any, data) => {
      // Check if this is a duplicate submission error - still open WhatsApp for giveaway entry
      if (error?.duplicate || error?.message?.includes("already been submitted") || error?.error?.includes("already registered")) {
        // Still open WhatsApp so they can send the message
        const message = buildWhatsAppMessage(data);
        const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, "_blank");
        
        toast({
          title: "Welcome back!",
          description: "Send the WhatsApp message to enter the giveaway",
          variant: "default",
        });
        navigate("/shukran");
      } else {
        toast({
          title: "Something went wrong",
          description: "Please try again or contact us directly",
          variant: "destructive",
        });
      }
    },
  });

  const onSubmit = (data: LeadFormData) => {
    submitMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-background" dir="ltr">
      {/* Countdown Banner - Sticky */}
      {currentDeadline && countdown && (
        <div className="sticky top-0 z-50 bg-[#EACA91] text-[#1a2744] py-2 md:py-2.5 px-3 md:px-4 shadow-sm" data-testid="countdown-banner">
          <div className="container mx-auto max-w-6xl flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-3 text-xs sm:text-sm">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="font-medium">
                {t.countdown.deadline}
                <span className="sm:hidden"> {currentDeadline.shortName}</span>
                <span className="hidden sm:inline"> {currentDeadline.name}</span>:
              </span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2 font-mono text-sm sm:text-base" dir="ltr">
              <span className="bg-[#1a2744]/20 px-1.5 sm:px-2 py-0.5 rounded text-xs sm:text-sm">{countdown.days}{'d'}</span>
              <span className="text-xs sm:text-sm">:</span>
              <span className="bg-[#1a2744]/20 px-1.5 sm:px-2 py-0.5 rounded text-xs sm:text-sm">{String(countdown.hours).padStart(2, '0')}{'h'}</span>
              <span className="text-xs sm:text-sm">:</span>
              <span className="bg-[#1a2744]/20 px-1.5 sm:px-2 py-0.5 rounded text-xs sm:text-sm">{String(countdown.minutes).padStart(2, '0')}{'m'}</span>
              <span className="text-xs sm:text-sm">:</span>
              <span className="bg-[#1a2744]/20 px-1.5 sm:px-2 py-0.5 rounded text-xs sm:text-sm">{String(countdown.seconds).padStart(2, '0')}{'s'}</span>
            </div>
          </div>
        </div>
      )}

      {/* Social Proof Notification */}
      {showNotification && notification && (
        <div 
          className="fixed bottom-20 sm:bottom-6 left-4 right-4 sm:right-auto sm:left-6 z-50 animate-in slide-in-from-bottom sm:slide-in-from-left fade-in duration-300"
          data-testid="submission-notification"
        >
          <div className="bg-card border shadow-lg rounded-lg p-3 flex items-center gap-3 max-w-xs mx-auto sm:mx-0">
            <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0">
              <Bell className="h-4 w-4 text-green-600" />
            </div>
            <p className="text-xs text-foreground leading-relaxed">
              <span className="font-medium">{notification.firstName}</span> {t.notification.from} {notification.city} {t.notification.registered}
            </p>
          </div>
        </div>
      )}

      {/* Hero Section - Compact with Logo + Headline */}
      <section className="relative overflow-hidden">
        {/* Animated background gradients */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-background" />
        <div className="absolute top-0 left-1/4 w-48 md:w-96 h-48 md:h-96 bg-[#EACA91]/20 rounded-full blur-3xl opacity-60 animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-40 md:w-80 h-40 md:h-80 bg-[#EACA91]/15 rounded-full blur-3xl opacity-50" />
        
        <div className="container relative mx-auto px-4 sm:px-6 pt-8 sm:pt-10 pb-6 sm:pb-10 max-w-6xl">
          {/* Logo with subtle glow */}
          <div className="flex justify-center mb-4 sm:mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full scale-150 opacity-40" />
              <img 
                src={foorsaLogo} 
                alt="Foorsa" 
                className="h-10 sm:h-14 relative"
                data-testid="img-logo"
              />
            </div>
          </div>

          {/* Press Logos - Infinite Scroll */}
          <PressMarquee title={t.press.title} />

          {/* Compact Hero Content */}
          <div className="text-center max-w-3xl mx-auto">
            {/* Floating badge with glass effect */}
            <div className="inline-flex items-center gap-1.5 sm:gap-2 bg-card/80 backdrop-blur-sm border border-primary/20 text-primary px-3 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm mb-4 sm:mb-6 shadow-lg shadow-primary/5">
              <Award className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="font-medium">{t.hero.badge}</span>
            </div>
            
            <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground mb-3 sm:mb-4 leading-tight px-2" data-testid="text-headline">
              {t.hero.headline}
              <span className="block bg-gradient-to-r from-primary via-[#EACA91] to-[#EACA91] bg-clip-text text-transparent mt-2 sm:mt-3">{t.hero.slogan}</span>
            </h1>
            
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed px-2" data-testid="text-subheadline">
              {t.hero.subheadline}
            </p>
          </div>
        </div>
      </section>

      {/* Registration Form Section - Immediately after hero */}
      <section className="py-10 sm:py-16 relative" ref={formRef}>
        <div className="absolute inset-0 bg-gradient-to-b from-[#EACA91]/10 via-[#EACA91]/5 to-background" />
        <div className="container relative mx-auto px-4 sm:px-6 max-w-xl">
          <div className="relative rounded-2xl sm:rounded-3xl bg-gradient-to-br from-card via-card to-card border-2 border-[#EACA91]/40 shadow-[0_8px_60px_-12px_rgba(234,202,145,0.4)] overflow-hidden">
            {/* Decorative gradient overlay */}
            <div className="absolute top-0 right-0 w-32 sm:w-40 h-32 sm:h-40 bg-gradient-to-bl from-[#EACA91]/30 to-transparent rounded-bl-full" />
            <div className="absolute bottom-0 left-0 w-28 sm:w-32 h-28 sm:h-32 bg-gradient-to-tr from-[#EACA91]/25 to-transparent rounded-tr-full" />
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#EACA91]/60 via-[#EACA91] to-[#EACA91]/60" />
            <div className="relative pb-3 sm:pb-4 pt-6 sm:pt-8 text-center px-4 sm:px-8">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mx-auto mb-3 sm:mb-5">
                <CheckCircle2 className="h-6 w-6 sm:h-7 sm:w-7 text-primary" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-foreground">
                {t.form.title}
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1.5 sm:mt-2">
                {t.form.subtitle}
              </p>
            </div>
            <div className="px-4 sm:px-8 pb-6 sm:pb-8 relative" >
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">{t.form.fullName}</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder={t.form.fullNamePlaceholder}
                            className="h-12 bg-muted/50 border-0"
                            autoComplete="name"
                            {...field} 
                            data-testid="input-fullname"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="whatsappNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">{t.form.whatsapp}</FormLabel>
                        <FormControl>
                          <Input 
                            type="tel" 
                            placeholder={t.form.whatsappPlaceholder}
                            className="h-12 bg-muted/50 border-0"
                            autoComplete="tel"
                            {...field}
                            dir="ltr"
                            data-testid="input-whatsapp"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <ShinyButton 
                    type="submit" 
                    className="w-full h-14 text-lg bg-[#25D366] text-white border border-[#25D366]"
                    disabled={submitMutation.isPending}
                  >
                    <span className="flex items-center justify-center gap-2">
                      <SiWhatsapp className="h-5 w-5" />
                      {submitMutation.isPending 
                        ? t.form.submitting 
                        : ('Enter Now')
                      }
                    </span>
                  </ShinyButton>

                  <p className="text-xs text-center mt-3 text-muted-foreground">
                    By clicking, you auto-enter the giveaway and can ask any questions about studying in China - free consultation!
                  </p>

                  {submitMutation.isError && (
                    <p className="text-sm text-destructive text-center" data-testid="text-error">
                      {t.form.error}
                    </p>
                  )}

                  <p className="text-xs text-muted-foreground text-center mt-4">
                    {t.form.privacy}
                  </p>
                </form>
              </Form>
            </div>
          </div>
        </div>
      </section>

      {/* Featured University Section - China University of Petroleum */}
      <section className="py-12 sm:py-20 relative overflow-hidden bg-gradient-to-b from-[#1a2744] to-[#0f1729]">
        <div className="container mx-auto px-4 sm:px-6 max-w-5xl">
          <div className="text-center mb-8">
            <Badge className="bg-[#EACA91] text-[#1a2744] hover:bg-[#EACA91]/90 mb-4">
              {'Limited Seats'}
            </Badge>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3">
              Study at One of China's Best Universities
            </h2>
            <div className="flex items-center justify-center gap-2 text-white/80">
              <Clock className="h-4 w-4" />
              <span>{'Deadline:'}</span>
              <div className="flex items-center gap-1.5 font-mono text-sm" dir="ltr">
                <span className="bg-white/20 px-2 py-1 rounded">{countdown?.days || 0}d</span>
                <span>:</span>
                <span className="bg-white/20 px-2 py-1 rounded">{String(countdown?.hours || 0).padStart(2, '0')}h</span>
                <span>:</span>
                <span className="bg-white/20 px-2 py-1 rounded">{String(countdown?.minutes || 0).padStart(2, '0')}m</span>
                <span>:</span>
                <span className="bg-white/20 px-2 py-1 rounded">{String(countdown?.seconds || 0).padStart(2, '0')}s</span>
              </div>
            </div>
          </div>

          <div className="relative rounded-2xl overflow-hidden shadow-2xl mb-8">
            <div className="aspect-video">
              <iframe
                src="https://www.youtube.com/embed/VofNsOvoVhk?autoplay=0&rel=0&modestbranding=1"
                title="University Video"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
                data-testid="video-upc"
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 text-center border border-white/10">
              <div className="text-3xl font-bold text-[#EACA91] mb-2">TOP 100</div>
              <p className="text-white/80 text-sm">
                {'Top 100 out of 3000+ Universities in China'}
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 text-center border border-white/10">
              <div className="text-3xl font-bold text-[#EACA91] mb-2">1953</div>
              <p className="text-white/80 text-sm">
                {'Established over 70 years ago'}
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 text-center border border-white/10">
              <div className="text-3xl font-bold text-[#EACA91] mb-2">100%</div>
              <p className="text-white/80 text-sm">
                {'Full Scholarship Available'}
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 text-center border border-white/10">
              <div className="text-3xl font-bold text-[#EACA91] mb-2">
                <MapPin className="inline h-7 w-7" />
              </div>
              <p className="text-white/80 text-sm">
                {'Qingdao - Beautiful Coastal City'}
              </p>
            </div>
          </div>

          <div className="mt-8 text-center">
            <Button
              onClick={() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "center" })}
              size="lg"
              className="bg-[#EACA91] text-[#1a2744] hover:bg-[#EACA91]/90 font-semibold px-8"
              data-testid="button-upc-apply"
            >
              {'Apply Now - Limited Seats'}
            </Button>
          </div>
        </div>
      </section>

      {/* Trust Stats Section - Social Proof */}
      <section className="py-6 sm:py-10 relative">
        <div className="container mx-auto px-4 sm:px-6 max-w-4xl">
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6">
            <div className="flex items-center gap-2 sm:gap-3 bg-card/80 backdrop-blur-sm border border-border/50 rounded-xl sm:rounded-2xl px-4 sm:px-6 py-3 sm:py-4 shadow-sm">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                <GraduationCap className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-foreground text-lg sm:text-xl">+400</span>
                <span className="text-muted-foreground text-xs">{t.stats.universities}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 bg-card/80 backdrop-blur-sm border border-border/50 rounded-xl sm:rounded-2xl px-4 sm:px-6 py-3 sm:py-4 shadow-sm">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                <Users className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-foreground text-lg sm:text-xl">+3000</span>
                <span className="text-muted-foreground text-xs">{'students'}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 bg-card/80 backdrop-blur-sm border border-border/50 rounded-xl sm:rounded-2xl px-4 sm:px-6 py-3 sm:py-4 shadow-sm">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                <MapPin className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-foreground text-lg sm:text-xl">2</span>
                <span className="text-muted-foreground text-xs">{t.stats.offices}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-12 sm:py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-muted/40 via-muted/20 to-background" />
        <div className="container relative mx-auto px-4 sm:px-6 max-w-6xl">
          <div className="text-center mb-8 sm:mb-14">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm mb-3 sm:mb-4">
              <span className="font-medium">{t.howItWorks.title}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-3 sm:mb-4">{t.howItWorks.title}</h2>
            <p className="text-muted-foreground max-w-xl mx-auto text-sm sm:text-lg">{t.howItWorks.subtitle}</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6">
            {t.howItWorks.steps.map((step, index) => {
              const Icon = stepIcons[index];
              return (
                <div key={index} className="relative group">
                  {/* Connection line */}
                  {index < 3 && (
                    <div className={`hidden md:block absolute top-10 ${dir === 'rtl' ? 'right-0 -translate-x-1/2' : 'left-full -translate-x-1/2'} w-full h-0.5 bg-gradient-to-r from-primary/30 to-primary/10`} />
                  )}
                  
                  <div className="relative bg-card/80 backdrop-blur-sm border border-border/50 rounded-xl sm:rounded-2xl p-3 sm:p-6 text-center transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1 h-full">
                    <div className="w-10 h-10 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mx-auto mb-3 sm:mb-5 group-hover:scale-110 transition-transform duration-300">
                      <Icon className="h-5 w-5 sm:h-7 sm:w-7 text-primary" />
                    </div>
                    <div className={`absolute top-2 sm:top-4 ${dir === 'rtl' ? 'left-2 sm:left-4' : 'right-2 sm:right-4'} w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-primary to-primary/80 text-primary-foreground flex items-center justify-center text-xs sm:text-sm font-bold shadow-lg shadow-primary/25`}>
                      {index + 1}
                    </div>
                    <h3 className="font-semibold text-foreground mb-1 sm:mb-2 text-sm sm:text-lg leading-tight">{step.title}</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed hidden sm:block">{step.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Google Reviews Section */}
      <section className="py-12 sm:py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-muted/40 via-muted/20 to-background" />
        <div className="container relative mx-auto px-4 sm:px-6 max-w-6xl">
          <div className="text-center mb-8 sm:mb-14">
            {/* Floating Google badge - Compact on mobile */}
            <div className="inline-flex flex-wrap items-center justify-center gap-2 sm:gap-4 bg-card/80 backdrop-blur-sm rounded-xl sm:rounded-2xl px-4 sm:px-6 py-3 sm:py-4 shadow-lg border border-border/50 mb-6 sm:mb-8">
              <GoogleLogo className="h-6 w-6 sm:h-8 sm:w-8" />
              <div className="flex items-center gap-2 sm:gap-3">
                <span className="font-bold text-xl sm:text-2xl text-foreground">4.9</span>
                <div className="flex">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 sm:h-5 sm:w-5 fill-[#EACA91] text-[#EACA91]" />
                  ))}
                </div>
              </div>
              <div className="hidden sm:block h-8 w-px bg-border" />
              <span className="text-xs sm:text-sm text-muted-foreground font-medium">1,255+ reviews</span>
            </div>
            
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-3 sm:mb-4">
              {'Real Google Reviews'}
            </h2>
            <p className="text-muted-foreground text-sm sm:text-lg max-w-xl mx-auto px-2">
              {'See what our students say about their experience with Foorsa'}
            </p>
          </div>
          
          {/* Auto-scrolling reviews carousel */}
          <div className="relative overflow-hidden">
            <div className="flex gap-3 sm:gap-5 animate-scroll-reviews hover:pause-animation" style={{ width: 'max-content' }}>
              {/* Duplicate reviews for seamless loop */}
              {[...googleReviews, ...googleReviews].map((review, index) => (
                <div key={index} className="group p-4 sm:p-6 flex-shrink-0 w-[280px] sm:w-[320px] md:w-[360px] rounded-xl sm:rounded-2xl bg-card/80 backdrop-blur-sm border border-border/50 hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300" data-testid={`card-review-${index % googleReviews.length}`}>
                  <div className="flex items-start justify-between mb-3 sm:mb-4">
                    <div className={dir === 'rtl' ? 'text-right' : 'text-left'}>
                      <p className="font-semibold text-foreground text-sm sm:text-base">{review.name}</p>
                      <p className="text-xs text-muted-foreground">{review.date}</p>
                    </div>
                    <GoogleLogo className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                  </div>
                  <div className={`flex gap-0.5 mb-2 sm:mb-3 ${dir === 'rtl' ? 'justify-end' : 'justify-start'}`}>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="h-3 w-3 sm:h-3.5 sm:w-3.5 fill-[#FBBC04] text-[#FBBC04]" />
                    ))}
                  </div>
                  <p className={`text-muted-foreground text-xs sm:text-sm leading-relaxed line-clamp-4 ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>
                    "{review.text}"
                  </p>
                </div>
              ))}
            </div>
            <div className="absolute left-0 top-0 bottom-0 w-8 sm:w-16 bg-gradient-to-r from-background to-transparent pointer-events-none z-10" />
            <div className="absolute right-0 top-0 bottom-0 w-8 sm:w-16 bg-gradient-to-l from-background to-transparent pointer-events-none z-10" />
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-12 sm:py-20 relative">
        <div className="container mx-auto px-4 sm:px-6 max-w-6xl">
          <div className="text-center mb-8 sm:mb-14">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm mb-3 sm:mb-4">
              <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="font-medium">{t.benefits.title}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground">{t.benefits.title}</h2>
          </div>
          
          <div ref={benefitsRef} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {t.benefits.items.map((item, index) => {
              const Icon = benefitIcons[index];
              return (
                <div key={index} className="group flex flex-col items-center text-center p-4 sm:p-6 rounded-xl sm:rounded-2xl bg-card/80 backdrop-blur-sm border border-border/50 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Icon className="h-6 w-6 sm:h-7 sm:w-7 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-1.5 text-sm sm:text-base">{item.title}</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Partner Universities */}
      <section className="py-10 sm:py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-[#EACA91]/5" />
        <div className="container relative mx-auto px-4 sm:px-6 max-w-6xl">
          <div className="text-center mb-6 sm:mb-10">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm mb-3 sm:mb-4">
              <Building2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="font-medium">+400 {t.stats.universities}</span>
            </div>
            <p className="text-sm sm:text-lg text-muted-foreground">{t.partners.title}</p>
          </div>
          <div className="relative">
            <div ref={universitiesRef} className="flex gap-2.5 sm:gap-4 overflow-x-auto pb-4 scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              {partnerUniversities.map((uni, index) => (
                <div 
                  key={index}
                  className="group flex items-center gap-2 sm:gap-3 bg-card/80 backdrop-blur-sm border border-border/50 px-3 sm:px-5 py-2.5 sm:py-4 rounded-xl sm:rounded-2xl flex-shrink-0 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300"
                >
                  <div className="w-8 h-8 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                    <GraduationCap className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                  </div>
                  <span className="text-xs sm:text-sm font-medium text-foreground whitespace-nowrap">{uni}</span>
                </div>
              ))}
            </div>
            <div className="absolute left-0 top-0 bottom-4 w-8 sm:w-12 bg-gradient-to-r from-background to-transparent pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-4 w-8 sm:w-12 bg-gradient-to-l from-background to-transparent pointer-events-none" />
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-12 sm:py-20 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-muted/30 via-background to-background" />
        <div className="container relative mx-auto px-4 sm:px-6 max-w-3xl">
          <div className="text-center mb-8 sm:mb-14">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm mb-3 sm:mb-4">
              <span className="font-medium">{t.faq.title}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-3 sm:mb-4">{t.faq.title}</h2>
            <p className="text-muted-foreground text-sm sm:text-lg">{t.faq.subtitle}</p>
          </div>

          <Accordion type="single" collapsible className="space-y-3 sm:space-y-4">
            {t.faq.items.map((faq, index) => (
              <AccordionItem 
                key={index} 
                value={`faq-${index}`}
                className="bg-card/80 backdrop-blur-sm rounded-xl sm:rounded-2xl border border-border/50 px-4 sm:px-6 data-[state=open]:shadow-lg data-[state=open]:shadow-primary/5 transition-all duration-300"
              >
                <AccordionTrigger className={`${dir === 'rtl' ? 'text-right' : 'text-left'} hover:no-underline py-4 sm:py-5 text-sm sm:text-base`} data-testid={`accordion-faq-${index}`}>
                  <span className="font-medium">{faq.question}</span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-4 sm:pb-5 text-sm">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* YouTube Shorts Section */}
      <section className="py-12 sm:py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-muted/40 via-muted/20 to-background" />
        <div className="container relative mx-auto px-4 sm:px-6 max-w-6xl">
          <div className="text-center mb-8 sm:mb-12">
            <div className="inline-flex items-center gap-2 bg-red-500/10 text-red-600 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm mb-3 sm:mb-4">
              <Play className="h-3.5 w-3.5 sm:h-4 sm:w-4 fill-red-600" />
              <span className="font-medium">YouTube Shorts</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-3 sm:mb-4">{t.shorts.title}</h2>
            <p className="text-muted-foreground text-sm sm:text-lg">{t.shorts.subtitle}</p>
          </div>
          
          {/* Auto-scrolling shorts carousel */}
          <div className="relative overflow-hidden">
            <div className="flex gap-3 sm:gap-5 animate-scroll-shorts hover:pause-animation" style={{ width: 'max-content' }}>
              {/* Duplicate shorts for seamless loop */}
              {[...youtubeShorts, ...youtubeShorts].map((short, index) => (
                <a
                  key={index}
                  href={`https://www.youtube.com/shorts/${short.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-shrink-0 group"
                  data-testid={`short-video-${index % youtubeShorts.length}`}
                >
                  <div className="relative w-[160px] h-[284px] sm:w-[200px] sm:h-[356px] md:w-[220px] md:h-[390px] rounded-xl sm:rounded-2xl overflow-hidden bg-black shadow-lg shadow-black/20 group-hover:shadow-xl group-hover:shadow-black/30 transition-all duration-300">
                    <img 
                      src={`https://img.youtube.com/vi/${short.id}/maxresdefault.jpg`}
                      alt="Foorsa Short"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-white/95 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                        <Play className="h-5 w-5 sm:h-7 sm:w-7 text-red-600 fill-red-600 ml-0.5 sm:ml-1" />
                      </div>
                    </div>
                    <div className="absolute top-2 sm:top-4 left-2 sm:left-4">
                      <div className="bg-red-600 text-white text-[10px] sm:text-xs font-bold px-2 sm:px-3 py-1 sm:py-1.5 rounded-md sm:rounded-lg shadow-lg">
                        Shorts
                      </div>
                    </div>
                  </div>
                </a>
              ))}
            </div>
            <div className="absolute left-0 top-0 bottom-0 w-8 sm:w-16 bg-gradient-to-r from-background to-transparent pointer-events-none z-10" />
            <div className="absolute right-0 top-0 bottom-0 w-8 sm:w-16 bg-gradient-to-l from-background to-transparent pointer-events-none z-10" />
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-16 sm:py-24 relative overflow-hidden">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-primary/90" />
        {/* Decorative elements */}
        <div className="absolute top-0 left-1/4 w-48 sm:w-96 h-48 sm:h-96 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-40 sm:w-80 h-40 sm:h-80 bg-[#EACA91]/20 rounded-full blur-3xl" />
        
        <div className="container relative mx-auto px-4 sm:px-6 max-w-4xl text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 text-primary-foreground px-2">{t.finalCta.title}</h2>
          <p className="text-primary-foreground/80 mb-8 sm:mb-10 max-w-xl mx-auto text-sm sm:text-lg leading-relaxed px-2">
            {t.finalCta.subtitle}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 px-2">
            <InteractiveHoverButton 
              text={t.finalCta.ctaPrimary}
              onClick={scrollToForm}
              className="w-auto px-8 py-4 bg-white text-primary border-white text-base sm:text-lg shadow-lg"
              data-testid="button-final-cta"
            />
            <Button 
              size="lg" 
              variant="outline"
              className="w-full sm:w-auto text-sm sm:text-base px-6 sm:px-10 py-5 sm:py-6 rounded-xl border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 backdrop-blur-sm"
              asChild
            >
              <a href="https://wa.me/212537911271" target="_blank" rel="noopener noreferrer">
                <SiWhatsapp className={`h-5 w-5 ${dir === 'rtl' ? 'ml-2' : 'mr-2'}`} />
                {t.finalCta.ctaWhatsapp}
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 sm:py-10 border-t bg-card/50">
        <div className="container mx-auto px-4 sm:px-6 max-w-6xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6">
            <div className="flex items-center gap-3 sm:gap-4">
              <img src={foorsaLogo} alt="Foorsa" className="h-8 sm:h-10" />
              <div className="h-6 sm:h-8 w-px bg-border" />
              <span className="text-xs sm:text-sm text-muted-foreground">{t.footer.tagline}</span>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground">
              {t.footer.rights} 2026 Foorsa
            </p>
          </div>
        </div>
      </footer>

      {/* Sticky CTA Buttons - appears when form is scrolled past */}
      {showStickyButton && (
        <div className="fixed bottom-0 left-0 right-0 z-40 p-4 bg-gradient-to-t from-background via-background/95 to-transparent">
          <div className="container mx-auto max-w-lg flex gap-3">
            <ShinyButton 
              type="button"
              className="flex-1 h-14 text-lg bg-[#EACA91] text-[#1a2744] border border-[#EACA91] shadow-lg"
              onClick={scrollToForm}
            >
              {t.form.submit}
            </ShinyButton>
            <a
              href={`https://wa.me/212537911271?text=${encodeURIComponent(
                (() => {
                  const effectiveCode = getEffectiveReferralCode();
                  if (effectiveCode && effectiveCode !== 'direct') {
                    const ambassadorInfo = ambassadorName ? `${ambassadorName} (${effectiveCode})` : effectiveCode;
                    return `Hello, I want to enter the giveaway.\n\nSource: Ambassador - ${ambassadorInfo}`;
                  } else if (trackingCode) {
                    const trackInfo = trackingLinkInfo 
                      ? `${trackingLinkInfo.platform} - ${trackingLinkInfo.name} (${trackingCode})` 
                      : trackingCode;
                    return `Hello, I want to enter the giveaway.\n\nSource: ${trackInfo}`;
                  } else {
                    return 'Hello, I want to enter the giveaway.';
                  }
                })()
              )}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <ShinyButton 
                type="button"
                className="h-14 px-6 bg-[#25D366] text-white border border-[#25D366] shadow-lg"
              >
                <SiWhatsapp className="h-6 w-6" />
              </ShinyButton>
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
