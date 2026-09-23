import React, { useState, useEffect } from "react";
import { Plus, Search, Calendar, Archive, Trash2, Wand2, Loader2, RefreshCw, CheckSquare, MessageSquare, AlertTriangle, User, ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { generateAIResponse } from "@/lib/ai.js";
import { supabase, supabaseHelpers } from "@/lib/supabase.js";
import { logAuditEvent } from "@/lib/auditLogger.js";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "react-router-dom";

const statusVariant = {
  draft: "outline",
  pending_approval: "warning",
  submitted: "warning",
  needs_revision: "destructive",
  approved: "secondary",
  published: "success",
  rejected: "destructive",
  archived: "outline",
};

const statusLabel = {
  draft: "Draft",
  submitted: "Submitted",
  pending_approval: "Pending Review",
  needs_revision: "Needs Revision",
  approved: "Approved",
  published: "Published",
  rejected: "Rejected",
  archived: "Archived",
};

export default function CampaignManagement() {
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("overall"); // New status filter
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editingStatus, setEditingStatus] = useState("");
  const [form, setForm] = useState({ title: "", objectives: "", audience: "", category: "community", priority: "medium", status: "draft" });
  const [isGenerating, setIsGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [revisionComment, setRevisionComment] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [showDebug, setShowDebug] = useState(false);
  const [customCategory, setCustomCategory] = useState("");

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    setLoading(true);
    try {
      // First try with users join
      let { data, error } = await supabase
        .from("campaigns")
        .select("*, creator:users!campaigns_created_by_fkey(name, email, role)")
        .order("created_at", { ascending: false });

      if (error) {
        console.log("Error with users join, trying without:", error);
        // Fallback: fetch without users join
        const fallback = await supabase
          .from("campaigns")
          .select("*")
          .order("created_at", { ascending: false });

        data = fallback.data;
        error = fallback.error;
      }

      if (error) throw error;

      console.log("Fetched campaigns:", data);
      console.log("Total campaigns:", data?.length || 0);

      // Debug: Log campaigns that might have bypassed approval
      const suspiciousCampaigns = data?.filter(c =>
        c.status === "published" && c.creator?.role === "staff"
      );
      if (suspiciousCampaigns?.length > 0) {
        console.warn("Found staff-created campaigns that are published (might have bypassed approval):", suspiciousCampaigns);
      }

      if (data) {
        // If users join didn't work, fetch user names separately
        if (data.length > 0 && !data[0].users) {
          const userIds = [...new Set(data.map(c => c.created_by).filter(Boolean))];
          const { data: users } = await supabase
            .from("users")
            .select("id, name, email, role")
            .in("id", userIds);

          const userMap = {};
          users?.forEach(u => {
            userMap[u.id] = { name: u.name || u.email || "Unknown", role: u.role };
          });

          setCampaigns(data.map(c => ({
            ...c,
            category: c.campaign_type || "community",
            creatorName: userMap[c.created_by]?.name || c.created_by || "Unknown",
            creatorRole: userMap[c.created_by]?.role || "unknown",
            createdAt: c.created_at ? new Date(c.created_at).toLocaleDateString() : "N/A",
            creator: userMap[c.created_by], // Add creator object for consistency
          })));
        } else {
          setCampaigns(data.map(c => ({
            ...c,
            category: c.campaign_type || "community",
            creatorName: c.creator?.name || c.creator?.email || c.created_by || "Unknown",
            creatorRole: c.creator?.role || "unknown",
            createdAt: c.created_at ? new Date(c.created_at).toLocaleDateString() : "N/A",
          })));
        }
      }
    } catch (err) {
      console.error("Error fetching campaigns:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchCampaigns();
    setRefreshing(false);
  };

  const filtered = campaigns.filter((c) => {
    const titleMatch = (c.title || "").toLowerCase().includes(query.toLowerCase());
    const creatorMatch = (c.creatorName || "").toLowerCase().includes(query.toLowerCase());
    const statusMatch = statusFilter === "overall" ? true : // Show all campaigns for overall
                        statusFilter === "awaiting_review" ? (c.status === "submitted" || c.status === "pending_approval") :
                        c.status === statusFilter;
    return (titleMatch || creatorMatch) && statusMatch;
  });

  // Count campaigns by status for filter labels
  const statusCounts = campaigns.reduce((acc, c) => {
    acc[c.status] = (acc[c.status] || 0) + 1;
    return acc;
  }, {});

  // Reset to page 1 when search query or status filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [query, statusFilter]);

  // Pagination logic
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedCampaigns = filtered.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleAIGenerate = async () => {
    if (!form.title) {
      alert("Please enter a topic in the title field first (e.g. 'Typhoon Preparation')");
      return;
    }
    setIsGenerating(true);
    try {
      const prompt = `Write a professional public safety campaign about: "${form.title}". Return a JSON object with strictly these keys: "title": a catchy official title, "objectives": 2-3 sentences explaining the goal and actions, "audience": who this is for (e.g. All residents), "category": one of (emergency, health, safety, environment, community), "priority": one of (low, medium, high, critical). Do not wrap in markdown or backticks, return raw JSON string.`;

      const response = await generateAIResponse("You are an expert public safety officer for a local government.", prompt);
      const data = JSON.parse(response.replace(/```json/g, "").replace(/```/g, "").trim());

      // Fix: update ALL AI-generated fields including title
      setForm(prev => ({
        ...prev,
        title: data.title || prev.title,
        objectives: data.objectives || prev.objectives,
        audience: data.audience || prev.audience,
        category: data.category || prev.category,
        priority: data.priority || prev.priority,
      }));
    } catch (error) {
      console.error(error);
      alert("Failed to generate AI content. Error: " + error.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const openNewCampaign = () => {
    setEditingId(null);
    setEditingStatus("");
    setRevisionComment("");
    setForm({ title: "", objectives: "", audience: "", category: "community", priority: "medium", status: "draft" });
    setOpen(true);
  };

  const openEditCampaign = (campaign) => {
    setEditingId(campaign.id);
    setEditingStatus(campaign.status || "draft");
    setRevisionComment("");
    const category = campaign.category || campaign.campaign_type || "community";
    setForm({
      title: campaign.title || "",
      objectives: campaign.description || "",
      audience: "",
      category: Object.keys(categoryOptions).includes(category) ? category : "other",
      priority: campaign.priority || "medium",
      status: campaign.status || "draft",
    });
    setCustomCategory(Object.keys(categoryOptions).includes(category) ? "" : category);
    setOpen(true);
  };

  const saveCampaign = async () => {
    if (form.category === "other" && !customCategory.trim()) {
      alert("Please enter a custom category");
      return;
    }
    setSaving(true);
    try {
      const { user: authUser } = await supabaseHelpers.getAuthUser();
      const payload = {
        title: form.title,
        description: form.objectives,
        campaign_type: form.category === "other" ? customCategory : form.category,
        priority: form.priority,
        status: form.status,
      };

      if (editingId) {
        const { error } = await supabase.from("campaigns").update(payload).eq("id", editingId);
        if (error) throw error;
        
        // Log campaign update event
        try {
          await logAuditEvent('campaign.updated', 'Campaign Management', user.id, {
            campaign_id: editingId,
            campaign_name: form.title
          });
        } catch (auditError) {
          console.error('Failed to log campaign update:', auditError);
        }
      } else {
        payload.created_by = authUser?.id;
        const { data, error } = await supabase.from("campaigns").insert(payload).select('id').single();
        if (error) throw error;
        
        // Log campaign creation event
        try {
          await logAuditEvent('campaign.created', 'Campaign Management', user.id, {
            campaign_id: data.id,
            campaign_name: form.title
          });
        } catch (auditError) {
          console.error('Failed to log campaign creation:', auditError);
        }
      }

      await fetchCampaigns();
      setOpen(false);
    } catch (err) {
      console.error(err);
      alert("Failed to save campaign.");
    } finally {
      setSaving(false);
    }
  };

  // Admin approves a submitted campaign → publish it
  const approveCampaign = async () => {
    if (!editingId) return;
    setActionLoading(true);
    try {
      const campaign = campaigns.find(c => c.id === editingId);
      const { error } = await supabase
        .from("campaigns")
        .update({ status: "published" })
        .eq("id", editingId);
      if (error) throw error;

      // Create notification for approved campaign
      if (campaign) {
        try {
          const { data: users } = await supabase
            .from("users")
            .select("id")
            .in("role", ["staff", "citizen", "public"]);

          if (users && users.length > 0) {
            const notifications = users.map(user => ({
              recipient_id: user.id,
              campaign_id: editingId,
              title: `New Campaign Published: ${campaign.title}`,
              message: `A new safety campaign "${campaign.title}" by ${campaign.creatorName} has been published and is now available for viewing.`,
              type: "campaign",
              status: "unread"
            }));

            await supabase
              .from("notifications")
              .insert(notifications);
          }
        } catch (notifError) {
          console.error("Error creating notifications:", notifError);
        }
      }

      await fetchCampaigns();
      setOpen(false);
    } catch (err) {
      console.error(err);
      alert("Failed to approve campaign.");
    } finally {
      setActionLoading(false);
    }
  };

  // Admin requests revision on a submitted campaign
  const requestRevision = async () => {
    if (!editingId || !revisionComment.trim()) return;
    setActionLoading(true);
    try {
      const { error } = await supabase
        .from("campaigns")
        .update({ status: "needs_revision", admin_notes: revisionComment.trim() })
        .eq("id", editingId);
      if (error) throw error;
      await fetchCampaigns();
      setOpen(false);
    } catch (err) {
      console.error(err);
      alert("Failed to send revision request.");
    } finally {
      setActionLoading(false);
    }
  };

  const archive = async (id) => {
    try {
      const { error } = await supabase.from("campaigns").update({ status: "archived" }).eq("id", id);
      if (error) throw error;
      setCampaigns((p) => p.map((c) => (c.id === id ? { ...c, status: "archived" } : c)));
    } catch (err) {
      console.error("Error archiving:", err);
    }
  };

  const remove = async (id) => {
    if (!confirm("Are you sure you want to delete this campaign?")) return;
    try {
      const { error } = await supabase.from("campaigns").delete().eq("id", id);
      if (error) throw error;
      setCampaigns((p) => p.filter((c) => c.id !== id));
    } catch (err) {
      console.error("Error deleting:", err);
    }
  };

  const isSubmittedForReview = editingStatus === "submitted" || editingStatus === "pending_approval";

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-xl sm:text-2xl font-bold">Campaign Management</h1>
          <p className="text-muted-foreground text-xs sm:text-sm">Review, edit, approve, and manage public safety campaigns.</p>
          <div className="flex items-center gap-2 mt-2">
            <Link to="/admin/approvals" className="text-xs text-primary hover:underline flex items-center gap-1">
              <CheckSquare className="h-3 w-3" />
              Go to Campaign Approval for submitted campaigns
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
          <Button variant="outline" onClick={handleRefresh} disabled={refreshing} className="w-full sm:w-auto">
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Dialog open={open} onOpenChange={(val) => {
            setOpen(val);
            if (!val) { setRevisionComment(""); setEditingStatus(""); }
          }}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingId ? "Edit Campaign" : "Review Campaign"}</DialogTitle>
              </DialogHeader>

              {/* Submitted-for-review notice */}
              {isSubmittedForReview && (
                <div className="flex gap-2 items-start rounded-md border border-amber-300 bg-amber-50 p-3 text-sm">
                  <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-amber-500" />
                  <div className="text-amber-800">
                    <p className="font-semibold">Staff submitted this campaign for review.</p>
                    <p className="text-xs mt-0.5 text-amber-600">
                      You can approve and publish it, or send it back to the staff with a revision comment below.
                    </p>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Campaign Topic or Title</Label>
                  <Input
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    disabled={isSubmittedForReview}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Objectives / Description</Label>
                  <Textarea
                    rows={6}
                    value={form.objectives}
                    onChange={(e) => setForm({ ...form, objectives: e.target.value })}
                    disabled={isSubmittedForReview}
                    placeholder="Describe the campaign objectives..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select value={form.category} onValueChange={(v) => {
                      setForm({ ...form, category: v });
                      if (v !== "other") setCustomCategory("");
                    }} disabled={isSubmittedForReview}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="emergency">Emergency</SelectItem>
                        <SelectItem value="health">Health</SelectItem>
                        <SelectItem value="safety">Safety</SelectItem>
                        <SelectItem value="environment">Environment</SelectItem>
                        <SelectItem value="community">Community</SelectItem>
                        <SelectItem value="other">Other (specify below)</SelectItem>
                      </SelectContent>
                    </Select>
                    {form.category === "other" && !isSubmittedForReview && (
                      <Input
                        value={customCategory}
                        onChange={(e) => setCustomCategory(e.target.value)}
                        placeholder="Enter custom category"
                        className="mt-2"
                      />
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Priority</Label>
                    <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v })} disabled={isSubmittedForReview}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {!isSubmittedForReview && (
                    <div className="space-y-2">
                      <Label>Status</Label>
                      <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="archived">Archived</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">
                        Note: To publish campaigns, use the <strong>Campaign Approval</strong> page to review and approve staff-submitted campaigns.
                      </p>
                    </div>
                  )}
                </div>

                {/* Review Actions — only shown when staff submitted for review */}
                {isSubmittedForReview && (
                  <div className="space-y-3 rounded-md border border-border p-4 bg-muted/30">
                    <p className="text-sm font-semibold flex items-center gap-1.5">
                      <MessageSquare className="h-4 w-4 text-primary" /> Admin Review Actions
                    </p>

                    <div className="flex gap-2">
                      <Button
                        className="flex-1"
                        onClick={approveCampaign}
                        disabled={actionLoading}
                      >
                        {actionLoading ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <CheckSquare className="h-4 w-4 mr-1" />}
                        Approve & Publish
                      </Button>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">
                        Or send back for revision with a comment:
                      </Label>
                      <Textarea
                        rows={3}
                        placeholder="e.g. Please add emergency contact numbers and clarify the evacuation route..."
                        value={revisionComment}
                        onChange={(e) => setRevisionComment(e.target.value)}
                      />
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={requestRevision}
                        disabled={!revisionComment.trim() || actionLoading}
                      >
                        {actionLoading ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <MessageSquare className="h-4 w-4 mr-1" />}
                        Send Back for Revision
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)} disabled={saving}>Cancel</Button>
                {!isSubmittedForReview && (
                  <Button onClick={saveCampaign} disabled={saving || !form.title}>
                    {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    {editingId ? "Save Changes" : "Save Campaign"}
                  </Button>
                )}
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search campaigns..."
            className="pl-9"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Label className="text-sm whitespace-nowrap">Filter by Status:</Label>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[220px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="overall">Overall Campaign ({campaigns.length})</SelectItem>
              <SelectItem value="awaiting_review">🔴 Awaiting Review ({(statusCounts.submitted || 0) + (statusCounts.pending_approval || 0)})</SelectItem>
              <SelectItem value="submitted">🔴 Submitted ({statusCounts.submitted || 0})</SelectItem>
              <SelectItem value="pending_approval">🟠 Pending Approval ({statusCounts.pending_approval || 0})</SelectItem>
              <SelectItem value="needs_revision">🟡 Needs Revision ({statusCounts.needs_revision || 0})</SelectItem>
              <SelectItem value="published">🟢 Published ({statusCounts.published || 0})</SelectItem>
              <SelectItem value="draft">⚪ Draft ({statusCounts.draft || 0})</SelectItem>
              <SelectItem value="rejected">❌ Rejected ({statusCounts.rejected || 0})</SelectItem>
              <SelectItem value="archived">📦 Archived ({statusCounts.archived || 0})</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>



      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table className="min-w-[800px]">
                <TableHeader>
                  <TableRow>
                    <TableHead className="whitespace-nowrap">Campaign Title</TableHead>
                    <TableHead className="whitespace-nowrap">Creator</TableHead>
                    <TableHead className="whitespace-nowrap">Category</TableHead>
                    <TableHead className="whitespace-nowrap">Status</TableHead>
                    <TableHead className="whitespace-nowrap">Priority</TableHead>
                    <TableHead className="whitespace-nowrap">Created Date</TableHead>
                    <TableHead className="whitespace-nowrap text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedCampaigns.map((c) => {
                    const isStaffPublished = c.status === "published" && c.creatorRole === "staff";
                    const isAwaitingReview = c.status === "submitted" || c.status === "pending_approval";

                    return (
                    <TableRow key={c.id} className={isAwaitingReview ? "bg-amber-50/50" : isStaffPublished ? "bg-red-50/30" : ""}>
                      <TableCell className="font-medium">
                        {c.title || "Untitled Campaign"}
                        {isAwaitingReview && (
                          <span className="block text-xs text-amber-600 mt-1">⚠️ Awaiting review</span>
                        )}
                        {isStaffPublished && (
                          <span className="block text-xs text-red-600 mt-1">⚠️ Staff published (bypassed approval)</span>
                        )}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm">{c.creatorName}</span>
                          {c.creatorRole === "staff" && (
                            <Badge variant="outline" className="text-xs">Staff</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="whitespace-nowrap capitalize">
                        {(c.category || c.campaign_type || "general").replace(/_/g, " ")}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        <Badge variant={statusVariant[c.status] || "outline"}>
                          {statusLabel[c.status] || c.status?.replace(/_/g, " ")}
                        </Badge>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        <Badge variant="outline">{c.priority || "medium"}</Badge>
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                        {c.createdAt}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="sm" onClick={() => openEditCampaign(c)}>
                            <Calendar className="h-4 w-4 mr-1" />
                            {isAwaitingReview ? "Review" : "Edit"}
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => archive(c.id)} title="Archive">
                            <Archive className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => remove(c.id)} title="Delete">
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                    );
                  })}
                  {paginatedCampaigns.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                        No campaigns found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            
            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-3 border-t">
                <div className="text-sm text-muted-foreground">
                  Showing {startIndex + 1} to {Math.min(endIndex, filtered.length)} of {filtered.length} campaigns
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(page)}
                        className="w-8 h-8"
                      >
                        {page}
                      </Button>
                    ))}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
