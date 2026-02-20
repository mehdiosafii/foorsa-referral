import { Star } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SiGoogle } from "react-icons/si";
import { useLanguage } from "@/context/LanguageContext";

const googleReviews = {
  en: [
    {
      name: "Youssef El Amrani",
      date: "2 months ago",
      image: "https://foorsa.ma/wp-content/uploads/2024/06/Copie-de-fahd.png",
      quote: "I had an excellent experience working with Nawfal from Foorsa. Professional, efficient, and highly knowledgeable. The team guided me through every step of my scholarship application. I'm now studying medicine at Beijing University!",
      rating: 5
    },
    {
      name: "Sara Benjelloun",
      date: "3 months ago",
      image: "https://foorsa.ma/wp-content/uploads/2024/06/Copie-de-lina-min.png",
      quote: "Meryem was incredibly helpful throughout the entire process. She answered all my questions patiently and made sure I understood every step. Thanks to Foorsa, I received a full CSC scholarship to study engineering in Nanjing!",
      rating: 5
    },
    {
      name: "Amine Rachidi",
      date: "1 month ago",
      image: "https://foorsa.ma/wp-content/uploads/2024/06/Copie-de-walid-min.png",
      quote: "Un service tellement parfait et bien structuré! The Foorsa team picked me up from the airport and helped me settle into my dorm. They're still available whenever I need anything. Highly recommend!",
      rating: 5
    },
    {
      name: "Fatima Zahra Alaoui",
      date: "2 weeks ago",
      image: "https://foorsa.ma/wp-content/uploads/2024/06/Copie-de-salma-min.png",
      quote: "J'ai vécu une expérience rassurante et professionnelle avec Foorsa. From visa processing to university registration, everything was handled smoothly. The cultural orientation really prepared me for life in China.",
      rating: 5
    },
    {
      name: "Omar Bennis",
      date: "3 weeks ago",
      image: "https://foorsa.ma/wp-content/uploads/2024/07/Copie-de-fahd-thumbnails-1.png",
      quote: "Best decision I ever made was trusting Foorsa with my application. Nawfal and his team are extremely professional and responsive. Got accepted to Shandong University with a 100% scholarship!",
      rating: 5
    },
    {
      name: "Khadija Mansouri",
      date: "1 month ago",
      image: "https://foorsa.ma/wp-content/uploads/2024/07/website-oumaima.png",
      quote: "The support doesn't stop after you arrive in China - that's what makes Foorsa special. They have an office here and a community of 500+ Moroccan students. I never felt alone!",
      rating: 5
    }
  ],
  ar: [
    {
      name: "يوسف العمراني",
      date: "منذ شهرين",
      image: "https://foorsa.ma/wp-content/uploads/2024/06/Copie-de-fahd.png",
      quote: "تجربة ممتازة مع نوفل من فرصة. محترف وفعال وعلى دراية كبيرة. الفريق رافقني في كل خطوة من طلب المنحة. أدرس الآن الطب في جامعة بكين!",
      rating: 5
    },
    {
      name: "سارة بنجلون",
      date: "منذ 3 أشهر",
      image: "https://foorsa.ma/wp-content/uploads/2024/06/Copie-de-lina-min.png",
      quote: "مريم كانت مساعدة بشكل لا يصدق طوال العملية. أجابت على جميع أسئلتي بصبر. بفضل فرصة، حصلت على منحة CSC كاملة لدراسة الهندسة في نانجينغ!",
      rating: 5
    },
    {
      name: "أمين الرشيدي",
      date: "منذ شهر",
      image: "https://foorsa.ma/wp-content/uploads/2024/06/Copie-de-walid-min.png",
      quote: "خدمة مثالية ومنظمة! فريق فرصة استقبلني من المطار وساعدني في الاستقرار. لا يزالون متاحين كلما احتجت أي شيء. أنصح بشدة!",
      rating: 5
    },
    {
      name: "فاطمة الزهراء العلوي",
      date: "منذ أسبوعين",
      image: "https://foorsa.ma/wp-content/uploads/2024/06/Copie-de-salma-min.png",
      quote: "عشت تجربة مطمئنة واحترافية مع فرصة. من معالجة التأشيرة إلى التسجيل الجامعي، كل شيء تم بسلاسة. التوجيه الثقافي أعدني تماماً للحياة في الصين.",
      rating: 5
    },
    {
      name: "عمر بنيس",
      date: "منذ 3 أسابيع",
      image: "https://foorsa.ma/wp-content/uploads/2024/07/Copie-de-fahd-thumbnails-1.png",
      quote: "أفضل قرار اتخذته هو الوثوق بفرصة لتقديم طلبي. نوفل وفريقه محترفون للغاية وسريعو الاستجابة. تم قبولي في جامعة شاندونغ بمنحة 100%!",
      rating: 5
    },
    {
      name: "خديجة المنصوري",
      date: "منذ شهر",
      image: "https://foorsa.ma/wp-content/uploads/2024/07/website-oumaima.png",
      quote: "الدعم لا يتوقف بعد وصولك إلى الصين - هذا ما يميز فرصة. لديهم مكتب هنا ومجتمع من 500+ طالب مغربي. لم أشعر بالوحدة أبداً!",
      rating: 5
    }
  ],
  fr: [
    {
      name: "Youssef El Amrani",
      date: "il y a 2 mois",
      image: "https://foorsa.ma/wp-content/uploads/2024/06/Copie-de-fahd.png",
      quote: "J'ai eu une excellente expérience avec Nawfal de Foorsa. Professionnel, efficace et très compétent. L'équipe m'a guidé à chaque étape de ma demande de bourse. J'étudie maintenant la médecine à l'Université de Pékin!",
      rating: 5
    },
    {
      name: "Sara Benjelloun",
      date: "il y a 3 mois",
      image: "https://foorsa.ma/wp-content/uploads/2024/06/Copie-de-lina-min.png",
      quote: "Meryem a été incroyablement utile tout au long du processus. Elle a répondu à toutes mes questions patiemment. Grâce à Foorsa, j'ai reçu une bourse CSC complète pour étudier l'ingénierie à Nanjing!",
      rating: 5
    },
    {
      name: "Amine Rachidi",
      date: "il y a 1 mois",
      image: "https://foorsa.ma/wp-content/uploads/2024/06/Copie-de-walid-min.png",
      quote: "Un service tellement parfait et bien structuré! L'équipe Foorsa m'a récupéré à l'aéroport et m'a aidé à m'installer. Ils sont toujours disponibles. Je recommande vivement!",
      rating: 5
    },
    {
      name: "Fatima Zahra Alaoui",
      date: "il y a 2 semaines",
      image: "https://foorsa.ma/wp-content/uploads/2024/06/Copie-de-salma-min.png",
      quote: "J'ai vécu une expérience rassurante et professionnelle avec Foorsa. Du traitement du visa à l'inscription universitaire, tout s'est passé en douceur. L'orientation culturelle m'a vraiment préparée à la vie en Chine.",
      rating: 5
    },
    {
      name: "Omar Bennis",
      date: "il y a 3 semaines",
      image: "https://foorsa.ma/wp-content/uploads/2024/07/Copie-de-fahd-thumbnails-1.png",
      quote: "La meilleure décision que j'ai prise était de faire confiance à Foorsa. Nawfal et son équipe sont extrêmement professionnels et réactifs. Accepté à l'Université de Shandong avec une bourse à 100%!",
      rating: 5
    },
    {
      name: "Khadija Mansouri",
      date: "il y a 1 mois",
      image: "https://foorsa.ma/wp-content/uploads/2024/07/website-oumaima.png",
      quote: "Le soutien ne s'arrête pas après votre arrivée en Chine - c'est ce qui rend Foorsa spécial. Ils ont un bureau ici et une communauté de 500+ étudiants marocains. Je ne me suis jamais sentie seule!",
      rating: 5
    }
  ]
};

const sectionText = {
  en: {
    title: "Real Reviews from Google",
    subtitle: "See what our students say about their experience with Foorsa",
    rating: "4.9",
    reviews: "1,255+ reviews",
    basedOn: "Based on"
  },
  ar: {
    title: "تقييمات حقيقية من Google",
    subtitle: "شاهد ما يقوله طلابنا عن تجربتهم مع فرصة",
    rating: "4.9",
    reviews: "+1,255 تقييم",
    basedOn: "بناءً على"
  },
  fr: {
    title: "Avis Réels de Google",
    subtitle: "Découvrez ce que nos étudiants disent de leur expérience avec Foorsa",
    rating: "4.9",
    reviews: "1 255+ avis",
    basedOn: "Basé sur"
  }
};

export function TestimonialsSection() {
  const { language, dir } = useLanguage();
  const reviews = googleReviews[language] || googleReviews.en;
  const text = sectionText[language] || sectionText.en;

  return (
    <section className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 bg-white dark:bg-card rounded-full px-6 py-3 shadow-sm border mb-6">
            <SiGoogle className="h-6 w-6 text-[#4285F4]" />
            <div className="flex items-center gap-2">
              <span className="font-bold text-xl text-foreground">{text.rating}</span>
              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-[#FBBC04] text-[#FBBC04]" />
                ))}
              </div>
            </div>
            <span className="text-sm text-muted-foreground">{text.basedOn} {text.reviews}</span>
          </div>
          
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            {text.title}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {text.subtitle}
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviews.map((review, index) => (
            <Card 
              key={index}
              className="p-6"
              data-testid={`card-testimonial-${index}`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`flex items-center gap-3 ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}>
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={review.image} alt={review.name} />
                    <AvatarFallback>{review.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className={dir === 'rtl' ? 'text-right' : 'text-left'}>
                    <p className="font-semibold text-foreground">{review.name}</p>
                    <p className="text-xs text-muted-foreground">{review.date}</p>
                  </div>
                </div>
                <SiGoogle className="h-5 w-5 text-muted-foreground flex-shrink-0" />
              </div>
              <div className={`flex gap-0.5 mb-3 ${dir === 'rtl' ? 'justify-end' : 'justify-start'}`}>
                {Array.from({ length: review.rating }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-[#FBBC04] text-[#FBBC04]" />
                ))}
              </div>
              <p className={`text-muted-foreground text-sm leading-relaxed ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>
                "{review.quote}"
              </p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
