
import { useState, useEffect } from "react";
import { format, parseISO } from "date-fns";
import { eventsAPI } from "@/lib/api";
import { Event } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar } from "lucide-react";

export default function EventList() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const response = await eventsAPI.getEvents();
        setEvents(response.data);
      } catch (error) {
        console.error("Failed to fetch events", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const formatDate = (dateString: string) => {
    try {
      const date = parseISO(dateString);
      return format(date, "PPp"); // Format as "Jan 1, 2021, 12:00 PM"
    } catch (error) {
      return dateString; // Return the original string if parsing fails
    }
  };

  if (loading) {
    return (
      <div className="w-full max-w-4xl mx-auto p-6">
        <h2 className="text-2xl font-semibold text-center mb-6">Upcoming Events</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <CardHeader className="pb-3">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-5/6" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Sort events by date (newest first)
  const sortedEvents = [...events].sort((a, b) => {
    try {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    } catch {
      return 0;
    }
  });

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-semibold text-center mb-6">Upcoming Events</h2>
      
      {sortedEvents.length === 0 ? (
        <div className="text-center text-muted-foreground py-12">
          <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground/60" />
          <p>No upcoming events scheduled</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {sortedEvents.map((event) => (
            <Card key={event.id} className="overflow-hidden hover:shadow-md transition-shadow animate-scale-in">
              <CardHeader className="pb-3">
                <CardTitle className="text-xl">{event.name}</CardTitle>
                <div className="text-sm text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>{formatDate(event.date)}</span>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{event.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
