
import { useState, useEffect } from "react";
import { eventsAPI } from "@/lib/api";
import { Event } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { Calendar, Clock, Edit, Loader2, Plus, Trash } from "lucide-react";
import { format, parseISO } from "date-fns";

export default function AdminEvents() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    date: "",
    description: "",
  });

  useEffect(() => {
    fetchEvents();
  }, []);

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

  const handleOpenForm = (event?: Event) => {
    if (event) {
      const dateObj = new Date(event.date);
      const formattedDate = format(dateObj, "yyyy-MM-dd'T'HH:mm");
      
      setFormData({
        name: event.name,
        date: formattedDate,
        description: event.description,
      });
      setSelectedEvent(event);
    } else {
      setFormData({
        name: "",
        date: "",
        description: "",
      });
      setSelectedEvent(null);
    }
    setFormOpen(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setFormLoading(true);
      
      if (selectedEvent) {
        // Update existing event
        await eventsAPI.updateEvent(
          selectedEvent.id,
          formData.name,
          formData.date,
          formData.description
        );
        toast({
          title: "Event updated",
          description: "The event has been updated successfully",
        });
      } else {
        // Create new event
        await eventsAPI.createEvent(
          formData.name,
          formData.date,
          formData.description
        );
        toast({
          title: "Event created",
          description: "The event has been created successfully",
        });
      }
      
      // Refresh events list
      await fetchEvents();
      setFormOpen(false);
    } catch (error) {
      console.error("Failed to save event", error);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await eventsAPI.deleteEvent(id);
      toast({
        title: "Event deleted",
        description: "The event has been deleted successfully",
      });
      // Refresh events list
      await fetchEvents();
      setDeleteDialogOpen(false);
    } catch (error) {
      console.error("Failed to delete event", error);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = parseISO(dateString);
      return format(date, "PPp"); // Format as "Jan 1, 2021, 12:00 PM"
    } catch (error) {
      return dateString; // Return the original string if parsing fails
    }
  };

  return (
    <div className="p-6 pt-0">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-medium">Upcoming Events</h3>
        <Button onClick={() => handleOpenForm()}>
          <Plus className="h-4 w-4 mr-2" />
          Add Event
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-40">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-12 border rounded-lg">
          <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground/60" />
          <h3 className="text-lg font-medium mb-2">No events yet</h3>
          <p className="text-muted-foreground mb-4">
            Create your first event to get started
          </p>
          <Button variant="outline" onClick={() => handleOpenForm()}>
            <Plus className="h-4 w-4 mr-2" />
            Add Event
          </Button>
        </div>
      ) : (
        <div className="grid gap-4">
          {[...events]
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
            .map((event) => (
              <Card key={event.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <CardTitle>{event.name}</CardTitle>
                </CardHeader>
                <CardContent className="pb-3">
                  <div className="flex items-center text-sm text-muted-foreground mb-4">
                    <Calendar className="h-4 w-4 mr-1" />
                    <span className="mr-4">{formatDate(event.date)}</span>
                  </div>
                  <p className="text-sm">{event.description}</p>
                </CardContent>
                <CardFooter className="flex justify-end space-x-2 border-t pt-3">
                  <Button variant="outline" size="sm" onClick={() => handleOpenForm(event)}>
                    <Edit className="h-3.5 w-3.5 mr-1" />
                    Edit
                  </Button>
                  <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="destructive" size="sm">
                        <Trash className="h-3.5 w-3.5 mr-1" />
                        Delete
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Delete Event</DialogTitle>
                      </DialogHeader>
                      <p className="py-4">
                        Are you sure you want to delete this event? This action cannot be undone.
                      </p>
                      <div className="flex justify-end space-x-2">
                        <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button 
                          variant="destructive" 
                          onClick={() => handleDelete(event.id)}
                        >
                          Delete Event
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardFooter>
              </Card>
            ))}
        </div>
      )}

      {/* Event Form Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {selectedEvent ? "Edit Event" : "Create New Event"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">
                Event Name
              </label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="date" className="text-sm font-medium flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                Date & Time
              </label>
              <Input
                id="date"
                name="date"
                type="datetime-local"
                value={formData.date}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium">
                Description
              </label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                required
              />
            </div>
            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" type="button" onClick={() => setFormOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={formLoading}>
                {formLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : selectedEvent ? (
                  "Update Event"
                ) : (
                  "Create Event"
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
