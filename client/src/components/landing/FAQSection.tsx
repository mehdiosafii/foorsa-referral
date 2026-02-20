import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { InteractiveHoverButton } from "@/components/ui/interactive-hover-button";
import { Phone } from "lucide-react";

const faqs = [
  {
    question: "How much does it cost to study in China?",
    answer: "Costs vary by university and program, but many students receive full or partial scholarships that cover tuition, accommodation, and living expenses. We help you find and apply for the best scholarship opportunities based on your profile."
  },
  {
    question: "Do I need to speak Chinese?",
    answer: "Not necessarily! Many universities offer programs taught entirely in English, especially for international students. We'll help you find English-taught programs that match your field of study. If you're interested, language courses are also available."
  },
  {
    question: "How long does the application process take?",
    answer: "The typical application process takes 2-4 months from initial consultation to receiving your acceptance letter. We recommend starting at least 6 months before your intended start date to ensure a smooth process."
  },
  {
    question: "Is China safe for international students?",
    answer: "China is very safe for international students. The crime rate is low, and universities provide excellent security and support services. Our students consistently report feeling safe and welcomed in their campus communities."
  },
  {
    question: "What documents do I need to apply?",
    answer: "Basic requirements include your passport, academic transcripts, diploma, health certificate, and language proficiency certificates. Our team will guide you through the complete documentation process and help you prepare everything properly."
  },
  {
    question: "Can I work while studying in China?",
    answer: "International students can work part-time on campus with university approval. Some students also find internship opportunities related to their field of study. We can help you understand the regulations and find appropriate opportunities."
  }
];

export function FAQSection() {
  const scrollToForm = () => {
    document.getElementById("lead-form")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="py-20 bg-background">
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-muted-foreground">
            Have questions? We have answers.
          </p>
        </div>
        
        <Accordion type="single" collapsible className="space-y-4">
          {faqs.map((faq, index) => (
            <AccordionItem 
              key={index} 
              value={`item-${index}`}
              className="border rounded-lg px-6"
              data-testid={`faq-item-${index}`}
            >
              <AccordionTrigger className="text-left text-foreground hover:no-underline py-4">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground pb-4">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
        
        <div className="mt-12 text-center">
          <p className="text-muted-foreground mb-4">
            Still have questions? We're here to help!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <InteractiveHoverButton 
              text="Contact Us"
              onClick={scrollToForm}
              className="w-auto px-6"
              data-testid="button-faq-contact"
            />
            <Button 
              variant="outline"
              data-testid="button-faq-call"
            >
              <Phone className="mr-2 h-4 w-4" />
              Call Us Free
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
