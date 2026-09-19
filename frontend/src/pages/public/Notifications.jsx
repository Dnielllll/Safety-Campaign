import React, { useState, useEffect } from "react";
import { Bell, CheckCheck, Megaphone, Siren, BellOff, RefreshCw } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabaseHelpers, supabase } from "@/lib/supabase.js";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

export default function Notifications() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNotifications = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      let notifications = [];
      
      // Try to fetch user's personal notifications first
      if (user?.id) {
        const { data, error } = await supabase
          .from("notifications")
          .select("*, campaigns(id, title)")
          .eq("recipient_id", user.id)
          .order("created_at", { ascending: false })
          .limit(50);

        if (!error && data) {
          notifications = data.map(n => ({
            id: n.id,
            type: n.type || "reminder",
            title: n.title,
            message: n.message,
            time: n.created_at ? formatTimeAgo(n.created_at) : "Just now",
            read: n.status === "read",
            campaignId: n.campaign_id,
            link: n.campaign_id ? `/campaigns/${n.campaign_id}` : null
          }));
        }
      }

      // If no personal notifications, fetch published campaigns and show them as notifications
      if (notifications.length === 0) {
        const { data: campaigns, error: campaignError } = await supabase
          .from("campaigns")
          .select("id, title, description, campaign_type, created_at")
          .eq("status", "published")
          .order("created_at", { ascending: false })
          .limit(20);

        if (!campaignError && campaigns) {
          notifications = campaigns.map(c => ({
            id: `campaign-${c.id}`,
            type: "campaign",
            title: c.title,
            message: c.description ? c.description.substring(0, 150) + "..." : "View this campaign for more details.",
            time: c.created_at ? formatTimeAgo(c.created_at) : "Just now",
            read: true, // Mark as read since they're just filler content
            campaignId: c.id,
            link: `/campaigns/${c.id}`
          }));
        }
      }

      setNotifications(notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      setNotifications([]);
    }
  };

  const formatTimeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  useEffect(() => {
    fetchNotifications().finally(() => setLoading(false));
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchNotifications();
    setRefreshing(false);
  };

  const markRead = async (id) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.id) return;

      await supabase
        .from("notifications")
        .update({ status: "read", read_at: new Date().toISOString() })
        .eq("id", id)
        .eq("recipient_id", user.id);

      setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
    } catch (error) {
      console.error("Error marking notification as read:", error);
      // Update local state even if API fails
      setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
    }
  };

  const handleNotificationClick = (notification) => {
    // Mark as read
    markRead(notification.id);
    
    // Redirect based on notification type
    if (notification.type === 'campaign' && notification.campaignId) {
      navigate(`/campaigns/${notification.campaignId}`);
    } else if (notification.type === 'emergency') {
      navigate('/emergency');
    } else if (notification.link) {
      navigate(notification.link);
    }
  };

  const markAllRead = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.id) return;

      await supabase
        .from("notifications")
        .update({ status: "read", read_at: new Date().toISOString() })
        .eq("recipient_id", user.id)
        .eq("status", "unread");

      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (error) {
      console.error("Error marking all as read:", error);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    }
  };

  const unread = notifications.filter((n) => !n.read).length;
  const list = notifications;

  const typeIcon = { emergency: Siren, campaign: Megaphone, reminder: Bell };
  const typeColor = { emergency: "text-destructive", campaign: "text-primary", reminder: "text-accent" };

  return (
    <div className="container py-8 space-y-6 max-w-3xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-xl sm:text-2xl font-bold flex items-center gap-2">
            <Bell className="h-5 w-5 sm:h-6 sm:w-6 text-primary" /> Notifications
          </h1>
          <p className="text-muted-foreground text-xs sm:text-sm mt-1">Real-time campaign alerts and emergency notifications.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
          {unread > 0 && <Badge>{unread} unread</Badge>}
          <Button variant="ghost" size="sm" onClick={handleRefresh} disabled={refreshing} className="w-full sm:w-auto">
            <RefreshCw className={cn("h-4 w-4 mr-1", refreshing && "animate-spin")} /> Refresh
          </Button>
          <Button variant="ghost" size="sm" onClick={markAllRead} disabled={unread === 0} className="w-full sm:w-auto">
            <CheckCheck className="h-4 w-4 mr-1" /> Mark all read
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        {list.map((n) => {
          const Icon = typeIcon[n.type] ?? Bell;
          const color = typeColor[n.type] ?? "text-muted-foreground";
          return (
            <Card
              key={n.id}
              className={cn("transition-colors cursor-pointer hover:shadow-sm", !n.read && "border-primary/40 bg-primary/3")}
              onClick={() => handleNotificationClick(n)}
            >
              <CardContent className="p-4 flex gap-3">
                <div className={`mt-0.5 shrink-0 ${color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <p className={cn("text-sm font-medium", !n.read && "text-primary")}>{n.title}</p>
                    {!n.read && <div className="h-2 w-2 rounded-full bg-primary shrink-0 mt-1" />}
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">{n.message}</p>
                  <p className="text-xs text-muted-foreground mt-2">{n.time}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {list.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <BellOff className="h-10 w-10 mx-auto mb-2 opacity-30" />
          <p>No notifications yet. You'll be notified about new campaigns and emergencies.</p>
        </div>
      )}
    </div>
  );
}
