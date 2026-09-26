import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Clock,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Activity,
  X,
  RefreshCw,
  FileText
} from "lucide-react";
import { supabase } from "@/lib/supabase.js";

export default function ProcessMonitoring() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  const calculateMetrics = (campaigns) => {
    const now = new Date();
    const draftTimeoutThreshold = 24 * 60 * 60 * 1000; // 24 hours
    const reviewTimeoutThreshold = 48 * 60 * 60 * 1000; // 48 hours

    const totalCampaigns = campaigns.length;
    const pendingApproval = campaigns.filter(c => c.status === 'pending_approval' || c.status === 'submitted').length;
    
    console.log('Campaign breakdown by status:');
    const statusCounts = {};
    campaigns.forEach(c => {
      statusCounts[c.status] = (statusCounts[c.status] || 0) + 1;
    });
    console.log(statusCounts);
    console.log('Pending approval count (including submitted):', pendingApproval);
    
    // Calculate draft timeout (drafts older than 24 hours)
    const draftTimeout = campaigns.filter(c => {
      if (c.status !== 'draft') return false;
      const createdAt = new Date(c.created_at);
      return (now - createdAt) > draftTimeoutThreshold;
    }).length;

    // Calculate review timeout (pending reviews older than 48 hours)
    const reviewTimeout = campaigns.filter(c => {
      if (c.status !== 'pending_approval' && c.status !== 'submitted') return false;
      const createdAt = new Date(c.created_at);
      return (now - createdAt) > reviewTimeoutThreshold;
    }).length;

    // Calculate average approval time for approved campaigns
    const approvedCampaigns = campaigns.filter(c => 
      (c.status === 'approved' || c.status === 'published') && c.approved_at
    );
    let avgApprovalTimeHours = 0;
    if (approvedCampaigns.length > 0) {
      const totalApprovalTime = approvedCampaigns.reduce((sum, c) => {
        const created = new Date(c.created_at);
        const approved = new Date(c.approved_at);
        return sum + (approved - created);
      }, 0);
      avgApprovalTimeHours = (totalApprovalTime / approvedCampaigns.length) / (1000 * 60 * 60);
    }

    // Calculate SLA compliance rate (campaigns approved within 48 hours)
    const slaCompliantCampaigns = approvedCampaigns.filter(c => {
      const created = new Date(c.created_at);
      const approved = new Date(c.approved_at);
      return (approved - created) <= reviewTimeoutThreshold;
    }).length;
    const slaComplianceRate = approvedCampaigns.length > 0 
      ? Math.round((slaCompliantCampaigns / approvedCampaigns.length) * 100) 
      : 0;

    return {
      total_campaigns: totalCampaigns,
      pending_approval: pendingApproval,
      draft_timeout: draftTimeout,
      review_timeout: reviewTimeout,
      avg_approval_time_hours: avgApprovalTimeHours.toFixed(1),
      sla_compliance_rate: slaComplianceRate
    };
  };

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      // Direct query to avoid deduplication - we need all campaigns including those with same title
      const { data: campaigns, error } = await supabase
        .from('campaigns')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Failed to fetch campaigns:', error);
        setMetrics(null);
      } else {
        console.log('Fetched campaigns for metrics:', campaigns?.length, 'total');
        console.log('Campaign statuses:', campaigns?.map(c => ({ id: c.id, title: c.title, status: c.status })));
        const calculatedMetrics = calculateMetrics(campaigns || []);
        setMetrics(calculatedMetrics);
      }
      
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to fetch metrics:', error);
      setMetrics(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
    
    // Set up real-time subscription for campaigns
    const channel = supabase
      .channel('process-monitoring-campaigns')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'campaigns' },
        (payload) => {
          console.log('Campaign change detected:', payload);
          fetchMetrics();
        }
      )
      .subscribe((status) => {
        console.log('Real-time subscription status:', status);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const MetricCard = ({ title, value, icon: Icon, color, trend }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={`h-4 w-4 ${color}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {trend && (
          <p className="text-xs text-muted-foreground mt-1">{trend}</p>
        )}
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">Process Monitoring</h1>
          <p className="text-muted-foreground text-xs sm:text-sm mt-1">Track campaign performance and system metrics</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
          {lastUpdated && (
            <span className="text-xs text-muted-foreground">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </span>
          )}
          <Button onClick={fetchMetrics} size="sm" variant="outline" className="w-full sm:w-auto">
            <RefreshCw className="h-4 w-4 mr-1" /> Refresh
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Campaigns"
          value={metrics?.total_campaigns ?? 0}
          icon={FileText}
          color="text-blue-500"
        />
        <MetricCard
          title="Pending Approval"
          value={metrics?.pending_approval ?? 0}
          icon={Clock}
          color="text-yellow-500"
          trend="Awaiting review"
        />
        <MetricCard
          title="Draft Timeout"
          value={metrics?.draft_timeout ?? 0}
          icon={AlertTriangle}
          color="text-red-500"
          trend="Requires attention"
        />
        <MetricCard
          title="Review Timeout"
          value={metrics?.review_timeout ?? 0}
          icon={AlertTriangle}
          color="text-red-500"
          trend="SLA exceeded"
        />
      </div>

      {/* Performance Metrics */}
      <div className="grid gap-4 md:grid-cols-2">
        <MetricCard
          title="Average Approval Time"
          value={`${metrics?.avg_approval_time_hours ?? 0}h`}
          icon={Activity}
          color="text-purple-500"
          trend="Time to approval"
        />
        <MetricCard
          title="SLA Compliance Rate"
          value={`${metrics?.sla_compliance_rate ?? 0}%`}
          icon={CheckCircle}
          color="text-green-500"
          trend="On-time approvals"
        />
      </div>
    </div>
  );
}
