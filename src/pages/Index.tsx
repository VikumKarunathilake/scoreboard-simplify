
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
      <div className="space-y-16">
        <ScoreBoard />
        <EventList />
      </div>
    </div>
  );
}
