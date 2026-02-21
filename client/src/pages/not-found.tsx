import { Button } from "@/components/ui/button";
import { AlertCircle, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/30">
      <div className="text-center space-y-6 px-4">
        <div className="flex justify-center">
          <div className="rounded-full bg-destructive/10 p-4">
            <AlertCircle className="h-12 w-12 text-destructive" />
          </div>
        </div>
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">404</h1>
          <p className="text-lg text-muted-foreground">
            Page not found. The page you're looking for doesn't exist.
          </p>
        </div>
        <Button asChild variant="default" className="gap-2">
          <a href="/">
            <Home className="h-4 w-4" />
            Back to Home
          </a>
        </Button>
      </div>
    </div>
  );
}
