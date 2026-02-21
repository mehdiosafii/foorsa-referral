import { Star } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SiGoogle } from "react-icons/si";
import { useLanguage } from "@/context/LanguageContext";

const googleReviews = [
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
    quote: "The Foorsa team picked me up from the airport and helped me settle into my dorm. They're still available whenever I need anything. Highly recommend!",
    rating: 5
  },
  {
    name: "Fatima Zahra Alaoui",
    date: "2 weeks ago",
    image: "https://foorsa.ma/wp-content/uploads/2024/06/Copie-de-salma-min.png",
    quote: "From visa processing to university registration, everything was handled smoothly. The cultural orientation really prepared me for life in China.",
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
];

const sectionText = {
  title: "Real Reviews from Google",
  subtitle: "See what our students say about their experience with Foorsa",
  rating: "4.9",
  reviews: "1,255+ reviews",
  basedOn: "Based on"
};

export function TestimonialsSection() {
  const { t, dir } = useLanguage();
  const reviews = googleReviews;
  const text = sectionText;

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
                <div className={`flex items-center gap-3 `}>
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
              <div className={`flex gap-0.5 mb-3 `}>
                {Array.from({ length: review.rating }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-[#FBBC04] text-[#FBBC04]" />
                ))}
              </div>
              <p className={`text-muted-foreground text-sm leading-relaxed `}>
                "{review.quote}"
              </p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
