
import { useEffect, useState } from "react";
import { eventsAPI } from "@/lib/api";
import { Event } from "@/types";
import { format, parseISO } from "date-fns";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar } from "lucide-react";

export default function Events() {
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

  // Group events by date
  const groupedEvents = events.reduce((acc, event) => {
    const date = event.date.split('T')[0]; // Get just the date part
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(event);
    return acc;
  }, {} as Record<string, Event[]>);

  // Sort dates
  const sortedDates = Object.keys(groupedEvents).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

  return (
    <div className="container py-8 animate-fade-in">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold tracking-tight mb-8">Upcoming Events</h1>

        {loading ? (
          <div className="space-y-8">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i}>
                <Skeleton className="h-8 w-40 mb-4" />
                <div className="grid gap-4">
                  {Array.from({ length: 2 }).map((_, j) => (
                    <Card key={j}>
                      <CardHeader>
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
            ))}
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-16">
            <Calendar className="h-16 w-16 mx-auto mb-4 text-muted-foreground/60" />
            <h3 className="text-xl font-medium mb-2">No events scheduled</h3>
            <p className="text-muted-foreground">Check back later for upcoming events.</p>
          </div>
        ) : (
          <div className="space-y-12">
            {sortedDates.map((date) => {
              const dateObj = new Date(date);
              const formattedDate = format(dateObj, "EEEE, MMMM d, yyyy");
              
              return (
                <div key={date} className="animate-slide-in">
                  <h2 className="text-xl font-semibold mb-4 border-b pb-2">{formattedDate}</h2>
                  <div className="grid gap-4">
                    {groupedEvents[date].map((event) => (
                      <Card key={event.id} className="overflow-hidden hover:shadow-md transition-shadow">
                        <CardHeader>
                          <CardTitle>{event.name}</CardTitle>
                          <CardDescription>
                            {formatDate(event.date).split(', ')[1]} {/* Show just the time */}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <p>{event.description}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
