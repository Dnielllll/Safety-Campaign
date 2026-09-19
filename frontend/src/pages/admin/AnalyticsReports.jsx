import React, { useState, useEffect } from "react";
import { BarChart3, Download, TrendingUp, Users, Eye, Share2, Filter, Calendar, X, Brain, AlertTriangle, Lightbulb, ArrowUp, ArrowDown, Loader2, Play, RefreshCw } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
} from "recharts";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Papa from "papaparse";
import ExportPasswordDialog from "@/components/ExportPasswordDialog";

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

const reachData = [
  { campaign: "Fire Safety", reach: 1240, engagement: 842 },
  { campaign: "Flood Advisory", reach: 1560, engagement: 1102 },
  { campaign: "Dengue Prev.", reach: 980, engagement: 610 },
  { campaign: "Anti-Scam", reach: 720, engagement: 401 },
];

const channelSplit = [
  { name: "SMS", value: 42 },
  { name: "Facebook", value: 28 },
  { name: "Email", value: 18 },
  { name: "Website", value: 12 },
];

const engagementTrend = [
  { month: "Jan", actual: 280, predicted: 290 },
  { month: "Feb", actual: 320, predicted: 310 },
  { month: "Mar", actual: 410, predicted: 400 },
  { month: "Apr", actual: 380, predicted: 390 },
  { month: "May", actual: 520, predicted: 500 },
  { month: "Jun", actual: 610, predicted: 600 },
  { month: "Jul", actual: 690, predicted: 680 },
  { month: "Aug", predicted: 750 },
  { month: "Sep", predicted: 820 },
  { month: "Oct", predicted: 890 },
];

const aiInsights = [
  {
    type: "insight",
    icon: Lightbulb,
    title: "Peak Engagement Hours",
    description: "Residents are most active between 6-8 PM. Schedule notifications during this window for 23% higher engagement.",
    impact: "positive"
  },
  {
    type: "warning",
    icon: AlertTriangle,
    title: "SMS Delivery Decline",
    description: "SMS delivery rates dropped 5% this month. Consider increasing email campaigns as a backup channel.",
    impact: "warning"
  },
  {
    type: "trend",
    icon: TrendingUp,
    title: "Rising Interest in Health Topics",
    description: "Health-related campaigns show 40% higher engagement. Consider more health-focused content.",
    impact: "positive"
  },
  {
    type: "prediction",
    icon: Brain,
    title: "Predicted Growth",
    description: "Based on current trends, engagement is projected to increase by 18% next month.",
    impact: "neutral"
  }
];

const COLORS = ["hsl(var(--primary))", "hsl(var(--accent))", "hsl(var(--muted-foreground))", "hsl(var(--border))"];

const summary = [
  { label: "Total Campaign Reach", value: 4500, icon: Eye },
  { label: "Registered Residents Reached", value: 1842, icon: Users },
  { label: "Avg. Engagement Rate", value: "68%", icon: TrendingUp },
  { label: "Channels Used", value: 6, icon: Share2 },
];

export default function AnalyticsReports() {
  const [filters, setFilters] = useState({
    dateRange: "30days",
    campaign: "all",
    channel: "all"
  });
  const [showFilters, setShowFilters] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [pendingExportFormat, setPendingExportFormat] = useState(null);

  const handleExport = (format) => {
    setPendingExportFormat(format);
    setShowExportDialog(true);
  };

  const handleConfirmedExport = () => {
    if (pendingExportFormat === 'pdf') exportPDF();
    else if (pendingExportFormat === 'csv') exportCSV();
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Barangay 178 - Analytics Report", 14, 22);
    doc.setFontSize(11);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 30);

    // Summary table
    autoTable(doc, {
      startY: 40,
      head: [['Metric', 'Value']],
      body: summary.map(s => [s.label, s.value]),
      theme: 'grid',
      headStyles: { fillColor: [255, 140, 0] }
    });

    // Campaign reach table
    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 10,
      head: [['Campaign', 'Reach', 'Engagement']],
      body: reachData.map(d => [d.campaign, d.reach, d.engagement]),
      theme: 'grid',
      headStyles: { fillColor: [255, 140, 0] }
    });

    // Channel split table
    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 10,
      head: [['Channel', 'Percentage']],
      body: channelSplit.map(c => [c.name, `${c.value}%`]),
      theme: 'grid',
      headStyles: { fillColor: [255, 140, 0] }
    });

    doc.save('barangay178-analytics-report.pdf');
  };

  const exportCSV = () => {
    const csvData = [
      ...reachData.map(d => ({ type: 'campaign', name: d.campaign, reach: d.reach, engagement: d.engagement })),
      ...channelSplit.map(c => ({ type: 'channel', name: c.name, percentage: c.value }))
    ];

    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'barangay178-analytics-report.csv';
    link.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-xl sm:text-2xl font-bold flex items-center gap-2">
            <BarChart3 className="h-5 w-5 sm:h-6 sm:w-6 text-primary" /> Analytics & Reports
          </h1>
          <p className="text-muted-foreground text-xs sm:text-sm">Campaign reach, engagement, participation, and performance.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
          <Button variant="outline" onClick={() => setShowFilters(!showFilters)} className="w-full sm:w-auto">
            <Filter className="h-4 w-4 mr-1" /> Filters
          </Button>
          <Button variant="outline" onClick={() => handleExport('pdf')} className="w-full sm:w-auto">
            <Download className="h-4 w-4 mr-1" /> Export PDF
          </Button>
          <Button variant="outline" onClick={() => handleExport('csv')} className="w-full sm:w-auto">
            <Download className="h-4 w-4 mr-1" /> Export CSV
          </Button>
        </div>
      </div>

      {showFilters && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Filter className="h-4 w-4 text-primary" /> Report Filters
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setShowFilters(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Date Range</Label>
                <Select value={filters.dateRange} onValueChange={(v) => setFilters({ ...filters, dateRange: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7days">Last 7 days</SelectItem>
                    <SelectItem value="30days">Last 30 days</SelectItem>
                    <SelectItem value="90days">Last 90 days</SelectItem>
                    <SelectItem value="1year">Last 1 year</SelectItem>
                    <SelectItem value="custom">Custom range</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Campaign</Label>
                <Select value={filters.campaign} onValueChange={(v) => setFilters({ ...filters, campaign: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Campaigns</SelectItem>
                    <SelectItem value="fire-safety">Fire Safety</SelectItem>
                    <SelectItem value="flood-advisory">Flood Advisory</SelectItem>
                    <SelectItem value="dengue-prevention">Dengue Prevention</SelectItem>
                    <SelectItem value="anti-scam">Anti-Scam</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Channel</Label>
                <Select value={filters.channel} onValueChange={(v) => setFilters({ ...filters, channel: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Channels</SelectItem>
                    <SelectItem value="sms">SMS</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="facebook">Facebook</SelectItem>
                    <SelectItem value="website">Website</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {summary.map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.label}>
              <CardContent className="p-5">
                <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-2">
                  <Icon className="h-5 w-5" />
                </div>
                <p className="text-2xl font-bold font-display"><AnimatedNumber value={s.value} /></p>
                <p className="text-sm text-muted-foreground">{s.label}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Campaign Reach vs. Engagement</CardTitle>
            <CardDescription>Comparing total reach to actual resident engagement per campaign</CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={reachData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="campaign" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip
                  contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
                />
                <Bar dataKey="reach" fill="hsl(var(--muted-foreground))" radius={[4, 4, 0, 0]} opacity={0.4} />
                <Bar dataKey="engagement" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Notification Channel Split</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={channelSplit} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={2}>
                  {channelSplit.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Available Reports</CardTitle>
        </CardHeader>
        <CardContent className="divide-y divide-border">
          {["Monthly Campaign Performance — June 2026", "Resident Engagement Summary — Q2 2026", "Notification Delivery Report — June 2026"].map((r) => (
            <div key={r} className="flex items-center justify-between py-3">
              <span className="text-sm font-medium">{r}</span>
              <div className="flex items-center gap-2">
                <Badge variant="outline">PDF</Badge>
                <Button variant="ghost" size="sm"><Download className="h-4 w-4" /></Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">AI-Powered Analytics</CardTitle>
          <CardDescription>Machine learning insights and predictions based on campaign data</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={engagementTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip
                  contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
                />
                <Line type="monotone" dataKey="actual" stroke="hsl(var(--primary))" strokeWidth={2} name="Actual" dot={{ fill: "hsl(var(--primary))" }} />
                <Line type="monotone" dataKey="predicted" stroke="hsl(var(--accent))" strokeWidth={2} strokeDasharray="5 5" name="Predicted" dot={{ fill: "hsl(var(--accent))" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {aiInsights.map((insight, i) => {
              const Icon = insight.icon;
              const bgColor = insight.impact === 'positive' ? 'bg-green-50 border-green-200' : 
                              insight.impact === 'warning' ? 'bg-yellow-50 border-yellow-200' : 
                              'bg-blue-50 border-blue-200';
              const iconColor = insight.impact === 'positive' ? 'text-green-600' : 
                               insight.impact === 'warning' ? 'text-yellow-600' : 
                               'text-blue-600';
              return (
                <div key={i} className={`p-4 rounded-lg border ${bgColor}`}>
                  <div className="flex items-start gap-3">
                    <Icon className={`h-5 w-5 ${iconColor} shrink-0 mt-0.5`} />
                    <div>
                      <p className="font-medium text-sm text-foreground">{insight.title}</p>
                      <p className="text-xs text-muted-foreground mt-1">{insight.description}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
      <ExportPasswordDialog
        open={showExportDialog}
        onClose={() => setShowExportDialog(false)}
        onConfirm={handleConfirmedExport}
        title={`Export ${pendingExportFormat?.toUpperCase() ?? ''} Report`}
      />
    </div>
  );
}
