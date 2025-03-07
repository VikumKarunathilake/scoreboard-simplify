
import { useAuth } from "@/contexts/AuthContext";
import ScoreBoard from "@/components/scores/ScoreBoard";
import EventList from "@/components/events/EventList";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export default function Index() {
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="container py-8 animate-fade-in">
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-4">
          Sports Meet Live Scores
        </h1>
        <p className="max-w-2xl text-lg text-muted-foreground mb-8">
          Track house scores and upcoming events in real-time for the school sports meet.
        </p>
        
        {!isAuthenticated && (
          <div className="flex gap-4 mt-2">
            <Button asChild>
              <Link to="/signup">Sign up</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/login">Log in</Link>
            </Button>
          </div>
        )}
        
        {user?.isAdmin && (
          <Button className="mt-6" asChild>
            <Link to="/admin">
              Go to Admin Dashboard
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        )}
      </div>
      
      <div className="space-y-16">
        <ScoreBoard />
        <EventList />
      </div>
    </div>
  );
}
