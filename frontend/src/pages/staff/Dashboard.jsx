import React, { useState, useEffect } from "react";
import { Megaphone, CheckSquare, Bell, Clock, ArrowRight, FileText } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth.jsx";
import { supabase } from "@/lib/supabase";

const stats = [
  { label: "Assigned Campaigns", value: 5, icon: Megaphone, delta: "2 due this week", to: "/staff/campaigns" },
  { label: "Pending Submissions", value: 2, icon: CheckSquare, delta: "Awaiting approval", to: "/staff/submission" },
  { label: "Drafts In Progress", value: 3, icon: FileText, delta: "Saved locally", to: "/staff/campaigns" },
  { label: "Notifications Sent", value: 18, icon: Bell, delta: "This month", to: "/staff/notifications" },
];

const tasks = [
  { text: 'Complete content for "Fire Safety Campaign"', due: "Due today", urgent: true },
  { text: 'Submit "Road Safety" draft for approval', due: "Due tomorrow", urgent: false },
  { text: 'Review resident feedback for "Dengue Campaign"', due: "Due in 3 days", urgent: false },
  { text: 'Update "Anti-Drug" campaign schedule', due: "Due in 5 days", urgent: false },
];



export default function StaffDashboard() {
  const { user } = useAuth();
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchRecentActivity();
    }
  }, [user]);

  const fetchRecentActivity = async () => {
    try {
      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .eq('created_by', user.id)
        .order('updated_at', { ascending: false })
        .limit(5);

      if (error) throw error;

      const activity = (data || []).map(campaign => {
        const date = new Date(campaign.updated_at || campaign.created_at);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);
        
        let timeAgo = 'Just now';
        if (diffMins >= 1 && diffMins < 60) timeAgo = `${diffMins}m ago`;
        else if (diffHours >= 1 && diffHours < 24) timeAgo = `${diffHours}h ago`;
        else if (diffDays >= 1 && diffDays < 7) timeAgo = `${diffDays}d ago`;
        else if (diffDays >= 7) timeAgo = date.toLocaleDateString();

        let text = `Campaign "${campaign.title}" was updated`;
        if (campaign.status === 'published' || campaign.status === 'active') text = `Campaign "${campaign.title}" is now published`;
        else if (campaign.status === 'pending_approval' || campaign.status === 'submitted') text = `You submitted "${campaign.title}" for review`;
        else if (campaign.status === 'needs_revision' || campaign.status === 'rejected') text = `Campaign "${campaign.title}" needs your attention`;
        else if (campaign.status === 'draft') text = `You saved "${campaign.title}" as draft`;

        return { text, time: timeAgo };
      });

      setRecentActivity(activity.length > 0 ? activity : [{ text: 'No recent activity yet', time: '' }]);
    } catch (err) {
      console.error('Error fetching recent activity:', err);
      setRecentActivity([{ text: 'Failed to load activity', time: '' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with background */}
      <div className="rounded-xl overflow-hidden relative bg-barangay min-h-[120px] flex items-end">
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
        <div className="relative p-6 flex items-center gap-4">
          <img src="/logo.png" alt="Barangay 178" className="h-12 w-12 rounded-full object-contain border-2 border-white/30" />
          <div className="text-white">
            <h1 className="font-display text-2xl font-bold">Staff Dashboard</h1>
            <p className="text-white/75 text-sm">Welcome back, {user?.name ?? "Staff Member"} · Barangay 178</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <Link key={s.label} to={s.to} className="group">
              <Card className="hover:shadow-md transition-shadow group-hover:border-primary/40">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-2">
                    <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                      <Icon className="h-5 w-5" />
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <p className="text-2xl font-bold font-display">{s.value}</p>
                  <p className="text-sm text-muted-foreground">{s.label}</p>
                  <p className="text-xs text-primary mt-1">{s.delta}</p>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        {/* Pending Tasks */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" /> Pending Tasks
            </CardTitle>
            <CardDescription>Your current campaign-related tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {tasks.map((t, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-lg border border-border hover:bg-secondary/50 transition-colors">
                <div className={`h-2 w-2 rounded-full mt-1.5 shrink-0 ${t.urgent ? "bg-destructive" : "bg-primary"}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{t.text}</p>
                  <p className={`text-xs mt-0.5 ${t.urgent ? "text-destructive" : "text-muted-foreground"}`}>{t.due}</p>
                </div>
                {t.urgent && <Badge variant="destructive" className="text-xs shrink-0">Urgent</Badge>}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Bell className="h-4 w-4 text-primary" /> Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentActivity.map((a, i) => (
              <div key={i} className="flex gap-3 text-sm">
                <div className="h-1.5 w-1.5 rounded-full bg-primary mt-2 shrink-0" />
                <div>
                  <p>{a.text}</p>
                  <p className="text-xs text-muted-foreground">{a.time}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
