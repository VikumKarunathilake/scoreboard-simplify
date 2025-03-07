
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AdminScores from "@/components/admin/AdminScores";
import AdminEvents from "@/components/admin/AdminEvents";

export default function Admin() {
  const [activeTab, setActiveTab] = useState("scores");
  const { user, isAuthenticated } = useAuth();

  // If not authenticated or not an admin, redirect to home
  if (!isAuthenticated || !user?.isAdmin) {
    return <Navigate to="/" />;
  }

  return (
    <div className="container py-8 animate-fade-in">
      <h1 className="text-3xl font-bold tracking-tight mb-8">Admin Dashboard</h1>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="scores">Manage Scores</TabsTrigger>
          <TabsTrigger value="events">Manage Events</TabsTrigger>
        </TabsList>
        
        <TabsContent value="scores" className="space-y-4">
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
            <div className="p-6">
              <h2 className="text-xl font-semibold">House Scores</h2>
              <p className="text-sm text-muted-foreground">
                Update scores for each house
              </p>
            </div>
            <AdminScores />
          </div>
        </TabsContent>
        
        <TabsContent value="events" className="space-y-4">
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
            <div className="p-6">
              <h2 className="text-xl font-semibold">Events Management</h2>
              <p className="text-sm text-muted-foreground">
                Create, edit and delete events
              </p>
            </div>
            <AdminEvents />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
