import { Button } from "@/components/ui/button";
import { CheckCircle, Phone } from "lucide-react";
import { SiWhatsapp } from "react-icons/si";
import { Link } from "wouter";
import foorsaLogo from "@assets/logo_official.png";

export default function ThankYouPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        <Link href="/landing">
          <img 
            src={foorsaLogo} 
            alt="Foorsa" 
            className="h-12 mx-auto mb-12 cursor-pointer"
            data-testid="img-logo"
          />
        </Link>
        
        <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-8">
          <CheckCircle className="h-10 w-10 text-green-500" />
        </div>
        
        <h1 className="text-3xl font-semibold tracking-tight text-foreground mb-4" data-testid="text-title">
          Thank You for Registering!
        </h1>
        
        <p className="text-muted-foreground text-lg mb-10 leading-relaxed" data-testid="text-message">
          WhatsApp has been opened in a new window. Please press "Send" to complete your registration. If the window didn't open, click the button below.
        </p>
        
        <div className="space-y-4">
          <Button 
            className="w-full h-12 bg-green-500 hover:bg-green-600 text-white font-medium" 
            asChild
          >
            <a 
              href="https://wa.me/212537911271" 
              target="_blank" 
              rel="noopener noreferrer"
              data-testid="link-whatsapp"
            >
              <SiWhatsapp className="h-5 w-5 mr-2" />
              Contact Us on WhatsApp
            </a>
          </Button>
          
          <Button 
            variant="outline" 
            className="w-full h-12 font-medium" 
            asChild
          >
            <a 
              href="tel:+212537911271"
              data-testid="link-phone"
            >
              <Phone className="h-5 w-5 mr-2" />
              Call Us
            </a>
          </Button>
        </div>
        
        <p className="text-sm text-muted-foreground/70 mt-12">
          Good luck!
        </p>
      </div>
    </div>
  );
}
