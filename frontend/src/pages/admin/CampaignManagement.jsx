import React, { useState, useEffect } from "react";
import { Plus, Search, Calendar, Archive, Trash2, Wand2, Loader2, RefreshCw, CheckSquare, MessageSquare, AlertTriangle, User } from "lucide-react";
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
import { generateAIResponse } from "@/lib/ai.js";
import { supabase, supabaseHelpers } from "@/lib/supabase.js";
import { logAuditEvent } from "@/lib/auditLogger.js";
import { useAuth } from "@/hooks/useAuth";

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
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editingStatus, setEditingStatus] = useState("");
  const [form, setForm] = useState({ title: "", objectives: "", audience: "", category: "community", priority: "medium", status: "draft" });
  const [isGenerating, setIsGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [revisionComment, setRevisionComment] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("campaigns")
        .select("*, users(name, email)")
        .order("created_at", { ascending: false });

      if (error) throw error;
      if (data) {
        setCampaigns(data.map(c => ({
          ...c,
          category: c.campaign_type || "community",
          creatorName: c.users?.name || c.users?.email || "Unknown",
        })));
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

  const filtered = campaigns.filter((c) =>
    (c.title || "").toLowerCase().includes(query.toLowerCase())
  );

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
    setForm({
      title: campaign.title || "",
      objectives: campaign.description || "",
      audience: "",
      category: campaign.category || campaign.campaign_type || "community",
      priority: campaign.priority || "medium",
      status: campaign.status || "draft",
    });
    setOpen(true);
  };

  const saveCampaign = async () => {
    setSaving(true);
    try {
      const { user: authUser } = await supabaseHelpers.getAuthUser();
      const payload = {
        title: form.title,
        description: form.objectives,
        campaign_type: form.category,
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
          <p className="text-muted-foreground text-xs sm:text-sm">Create, edit, schedule, and manage public safety campaigns.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
          <Button variant="outline" size="icon" onClick={handleRefresh} disabled={refreshing} className="w-full sm:w-auto sm:size-icon">
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          </Button>
          <Dialog open={open} onOpenChange={(val) => {
            setOpen(val);
            if (!val) { setRevisionComment(""); setEditingStatus(""); }
          }}>
            <DialogTrigger asChild>
              <Button onClick={openNewCampaign} className="w-full sm:w-auto"><Plus className="h-4 w-4 mr-1" /> New Campaign</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingId ? "Edit Campaign" : "Create New Campaign"}</DialogTitle>
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
                  <div className="flex items-center justify-between">
                    <Label>Campaign Topic or Title</Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleAIGenerate}
                      disabled={isGenerating || !form.title}
                      className="h-8 text-primary hover:text-primary hover:bg-primary/10"
                    >
                      {isGenerating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Wand2 className="h-4 w-4 mr-2" />}
                      {isGenerating ? "Generating..." : "Generate with AI"}
                    </Button>
                  </div>
                  <Input
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="Type a topic and click Generate with AI..."
                  />
                </div>

                <div className="space-y-2">
                  <Label>Objectives / Description</Label>
                  <Textarea
                    rows={6}
                    value={form.objectives}
                    onChange={(e) => setForm({ ...form, objectives: e.target.value })}
                    placeholder="Describe the campaign objectives..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="emergency">Emergency</SelectItem>
                        <SelectItem value="health">Health</SelectItem>
                        <SelectItem value="safety">Safety</SelectItem>
                        <SelectItem value="environment">Environment</SelectItem>
                        <SelectItem value="community">Community</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Priority</Label>
                    <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v })}>
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
                          <SelectItem value="published">Published</SelectItem>
                          <SelectItem value="archived">Archived</SelectItem>
                        </SelectContent>
                      </Select>
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

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search campaigns..."
          className="pl-9"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {filtered.map((c) => (
            <Card key={c.id} className={c.status === "submitted" || c.status === "pending_approval" ? "border-amber-300" : ""}>
              <CardHeader>
                <div className="flex items-center justify-between mb-1">
                  <Badge variant={statusVariant[c.status] || "outline"}>
                    {statusLabel[c.status] || c.status?.replace(/_/g, " ")}
                  </Badge>
                  <Badge variant="outline">{c.priority || "medium"}</Badge>
                </div>
                <CardTitle className="text-base">{c.title || "Untitled Campaign"}</CardTitle>
                <CardDescription className="capitalize">
                  {(c.category || c.campaign_type || "general").replace(/_/g, " ")}
                </CardDescription>
                <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                  <User className="h-3 w-3" />
                  <span>Created by: {c.creatorName}</span>
                </div>
                {(c.status === "submitted" || c.status === "pending_approval") && (
                  <p className="text-xs text-amber-600 mt-1">⚠️ Awaiting your review</p>
                )}
              </CardHeader>
              <CardFooter className="justify-between">
                <Button variant="ghost" size="sm" onClick={() => openEditCampaign(c)}>
                  <Calendar className="h-4 w-4 mr-1" />
                  {c.status === "submitted" || c.status === "pending_approval" ? "Review" : "Edit / Schedule"}
                </Button>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" onClick={() => archive(c.id)} title="Archive">
                    <Archive className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => remove(c.id)} title="Delete">
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full text-center py-12 text-muted-foreground">
              No campaigns found.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
