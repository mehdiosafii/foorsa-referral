import { Star } from "lucide-react";
import { Card } from "@/components/ui/card";
import { SiGoogle } from "react-icons/si";

const reviews = [
  {
    name: "Ahmed K.",
    rating: 5,
    date: "2 weeks ago",
    text: "Excellent service! Foorsa helped me get admission to Beijing University with a full scholarship. Highly professional team."
  },
  {
    name: "Sara M.",
    rating: 5,
    date: "1 month ago",
    text: "I was worried about the visa process but Foorsa made it so simple. They handled everything and I'm now studying in Shanghai!"
  },
  {
    name: "Youssef B.",
    rating: 5,
    date: "1 month ago",
    text: "Best decision I ever made. The team is responsive and really cares about students' success."
  },
  {
    name: "Fatima Z.",
    rating: 5,
    date: "2 months ago",
    text: "From application to arrival, Foorsa was with me every step. Can't recommend them enough!"
  }
];

export function GoogleReviewsSection() {
  const averageRating = 4.9;
  const totalReviews = 127;

  return (
    <section className="py-20 bg-muted/30">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <SiGoogle className="h-8 w-8 text-[#4285F4]" />
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              Google Reviews
            </h2>
          </div>
          
          <div className="flex items-center justify-center gap-4 mb-4">
            <span className="text-5xl font-bold text-foreground">{averageRating}</span>
            <div>
              <div className="flex gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star 
                    key={i} 
                    className={`h-6 w-6 ${i < Math.floor(averageRating) ? 'fill-[#EACA91] text-[#EACA91]' : 'text-muted'}`}
                  />
                ))}
              </div>
              <p className="text-muted-foreground text-sm">{totalReviews} reviews</p>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {reviews.map((review, index) => (
            <Card 
              key={index}
              className="p-6"
              data-testid={`card-review-${index}`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold">
                    {review.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground text-sm">{review.name}</p>
                    <p className="text-xs text-muted-foreground">{review.date}</p>
                  </div>
                </div>
                <SiGoogle className="h-5 w-5 text-[#4285F4]" />
              </div>
              <div className="flex gap-0.5 mb-3">
                {Array.from({ length: review.rating }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-[#EACA91] text-[#EACA91]" />
                ))}
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed">
                "{review.text}"
              </p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
