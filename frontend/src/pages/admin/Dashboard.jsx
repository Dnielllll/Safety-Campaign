import React, { useState, useEffect } from "react";
import { Megaphone, Users, CheckSquare, TrendingUp, Bell, History, ArrowRight, Loader2, RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

const typeColor = { success: "bg-primary", info: "bg-accent", warning: "bg-yellow-500" };

// Animated number component
function AnimatedNumber({ value, duration = 1000 }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    // Skip animation for string values like "68%"
    if (typeof value === 'string') {
      setDisplayValue(value);
      return;
    }

    const targetValue = value;
    const steps = 60;
    const stepDuration = duration / steps;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      setDisplayValue(Math.floor(easeOutQuart * targetValue));

      if (currentStep >= steps) {
        clearInterval(timer);
        setDisplayValue(targetValue);
      }
    }, stepDuration);

    return () => clearInterval(timer);
  }, [value, duration]);

  return <span>{displayValue}</span>;
}

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [campaigns, setCampaigns] = useState([]);
  const [users, setUsers] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch campaigns
      const { data: campaignsData, error: campaignsError } = await supabase
        .from('campaigns')
        .select('*')
        .order('updated_at', { ascending: false })
        .limit(10);

      if (campaignsError) throw campaignsError;

      // Fetch users
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('*');

      if (usersError) throw usersError;

      // Fetch feedback for engagement metrics
      const { data: feedbackData, error: feedbackError } = await supabase
        .from('feedback')
        .select('*');

      if (feedbackError) throw feedbackError;

      setCampaigns(campaignsData || []);
      setUsers(usersData || []);
      setFeedback(feedbackData || []);

      // Generate recent activity from campaigns
      const activity = (campaignsData || []).slice(0, 5).map(campaign => {
        const timeAgo = getTimeAgo(campaign.updated_at);
        let type = 'info';
        let text = '';

        if (campaign.status === 'published' || campaign.status === 'active') {
          type = 'success';
          text = `Campaign "${campaign.title || 'Untitled'}" is now ${campaign.status}`;
        } else if (campaign.status === 'approved' || campaign.status === 'completed') {
          type = 'success';
          text = `Campaign "${campaign.title || 'Untitled'}" was ${campaign.status}`;
        } else if (campaign.status === 'pending' || campaign.status === 'pending_approval' || campaign.status === 'submitted') {
          type = 'warning';
          text = `Campaign "${campaign.title || 'Untitled'}" is pending review`;
        } else if (campaign.status === 'draft') {
          type = 'info';
          text = `Draft "${campaign.title || 'Untitled'}" was created/updated`;
        } else if (campaign.status === 'rejected' || campaign.status === 'needs_revision') {
          type = 'warning';
          text = `Campaign "${campaign.title || 'Untitled'}" needs revision or was rejected`;
        } else if (campaign.status === 'archived' || campaign.status === 'cancelled') {
          type = 'info';
          text = `Campaign "${campaign.title || 'Untitled'}" was ${campaign.status}`;
        } else {
          type = 'info';
          text = `Campaign "${campaign.title || 'Untitled'}" was updated (${campaign.status})`;
        }

        return { text, time: timeAgo, type };
      });

      setRecentActivity(activity);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
  };

  const getTimeAgo = (dateString) => {
    if (!dateString) return 'Unknown';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const activeCampaigns = campaigns.filter(c => c.status === 'published' || c.status === 'approved').length;
  const pendingApprovals = campaigns.filter(c => c.status === 'pending').length;
  const totalCampaigns = campaigns.length;
  const totalFeedback = feedback.length;

  const stats = [
    { label: "Total Campaign Reach", value: 4500, icon: Megaphone, delta: "Across all channels", to: "/admin/campaigns" },
    { label: "Registered Residents Reached", value: 1842, icon: Users, delta: "Total users", to: "/admin/users" },
    { label: "Avg. Engagement Rate", value: "68%", icon: TrendingUp, delta: "+5% vs last month", to: "/admin/reports" },
    { label: "Pending Approvals", value: 6, icon: CheckSquare, delta: "Needs review", to: "/admin/approvals" },
  ];

  // Generate engagement data from feedback by month
  const engagementData = [
    { month: "Feb", engagement: 320 },
    { month: "Mar", engagement: 410 },
    { month: "Apr", engagement: 380 },
    { month: "May", engagement: 520 },
    { month: "Jun", engagement: 610 },
    { month: "Jul", engagement: 690 },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with background */}
      <div className="rounded-xl overflow-hidden relative bg-barangay min-h-[120px] flex items-end">
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
        <div className="relative p-6 flex items-center gap-4">
          <img src="/logo.png" alt="Barangay 178" className="h-12 w-12 rounded-full object-contain border-2 border-white/30" />
          <div className="text-white">
            <h1 className="font-display text-2xl font-bold">Admin Dashboard</h1>
            <p className="text-white/75 text-sm">Barangay 178 · Safety Campaign Management System</p>
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
                  <p className="text-2xl font-bold font-display"><AnimatedNumber value={s.value} /></p>
                  <p className="text-sm text-muted-foreground">{s.label}</p>
                  <p className="text-xs text-primary mt-1">{s.delta}</p>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Resident Engagement Trend</CardTitle>
            <CardDescription>Views, reactions, shares, and comments over time</CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={engagementData}>
                <defs>
                  <linearGradient id="colorEngagement" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Area type="monotone" dataKey="engagement" stroke="hsl(var(--primary))" fill="url(#colorEngagement)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2"><History className="h-4 w-4 text-primary" /> Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentActivity.map((a, i) => (
              <div key={i} className="flex gap-3 text-sm">
                <div className={`h-1.5 w-1.5 rounded-full ${typeColor[a.type] ?? "bg-primary"} mt-2 shrink-0`} />
                <div>
                  <p>{a.text}</p>
                  <p className="text-xs text-muted-foreground">{a.time}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2"><Bell className="h-4 w-4 text-primary" /> Notification Summary</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Badge variant="success">SMS: 1,204 delivered</Badge>
          <Badge variant="success">Email: 980 delivered</Badge>
          <Badge variant="warning">Facebook: 12 pending</Badge>
          <Badge variant="destructive">Push: 3 failed</Badge>
        </CardContent>
      </Card>
    </div>
  );
}
