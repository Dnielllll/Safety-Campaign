import React, { useState, useEffect } from "react";
import { Search, Loader2, User, Calendar, Eye, Plus, AlertTriangle } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { supabaseHelpers, supabase } from "@/lib/supabase.js";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth.jsx";

const statusVariant = {
  published: "success",
};

const statusLabel = {
  published: "Published",
};

const categoryOptions = {
  emergency: "Emergency",
  health: "Health",
  fire_safety: "Fire Safety",
  disaster_prep: "Disaster Prep",
  crime_prevention: "Crime Prevention",
  general: "General",
  other: "Other (specify below)"
};

export default function AllCampaigns() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: "", objectives: "", category: "general" });
  const [saving, setSaving] = useState(false);
  const [viewCampaign, setViewCampaign] = useState(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [customCategory, setCustomCategory] = useState("");

  useEffect(() => {
    fetchAllCampaigns();
  }, []);

  const fetchAllCampaigns = async () => {
    setLoading(true);
    try {
      // Only fetch published campaigns to avoid showing rejected/needs revision campaigns
      const { data: campaigns, error } = await supabase
        .from("campaigns")
        .select("*, creator:users!campaigns_created_by_fkey(name, email)")
        .eq("status", "published")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching campaigns:", error.message, error);
        throw error;
      }

      console.log("Fetched published campaigns:", campaigns);

      // Get current user
      const { user } = await supabaseHelpers.getAuthUser();

      // Add creator information to each campaign (now included in the query)
      const campaignsWithCreators = (campaigns || []).map(campaign => ({
        ...campaign,
        creatorName: campaign.creator?.name || campaign.creator?.email || "Unknown",
        isCreatedByUser: user?.id ? campaign.created_by === user.id : false
      }));

      setCampaigns(campaignsWithCreators);
    } catch (err) {
      console.error("Failed to fetch campaigns:", err.message, err);
      setCampaigns([]);
    } finally {
      setLoading(false);
    }
  };

  const filtered = campaigns.filter((c) =>
    c.title?.toLowerCase().includes(query.toLowerCase()) ||
    c.creatorName?.toLowerCase().includes(query.toLowerCase())
  );

  const checkForSimilarCampaigns = (title) => {
    if (!title || title.length < 3) return [];
    
    const lowerTitle = title.toLowerCase();
    return campaigns.filter(c => 
      c.title.toLowerCase().includes(lowerTitle) || 
      lowerTitle.includes(c.title.toLowerCase()) ||
      (c.description && c.description.toLowerCase().includes(lowerTitle))
    );
  };

  const handleNewCampaign = () => {
    setForm({ title: "", objectives: "", category: "general" });
    setCustomCategory("");
    setOpen(true);
  };

  const saveCampaign = async () => {
    if (!form.title.trim()) return;
    if (form.category === "other" && !customCategory.trim()) {
      alert("Please enter a custom category");
      return;
    }
    setSaving(true);
    try {
      const { user } = await supabaseHelpers.getAuthUser();
      const { data, error } = await supabase
        .from("campaigns")
        .insert({
          title: form.title,
          description: form.objectives,
          campaign_type: form.category === "other" ? customCategory : form.category,
          status: "draft",
          created_by: user?.id,
        })
        .select()
        .single();

      if (error) throw error;

      // Refresh campaigns list
      await fetchAllCampaigns();
      
      // Close dialog and reset form
      setForm({ title: "", objectives: "", category: "general" });
      setOpen(false);
    } catch (error) {
      console.error("Failed to save campaign:", error);
      alert("Failed to save campaign. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const submitCampaignForApproval = async () => {
    if (!form.title.trim()) return;
    if (form.category === "other" && !customCategory.trim()) {
      alert("Please enter a custom category");
      return;
    }
    setSaving(true);
    try {
      const { data, error } = await supabase
        .from("campaigns")
        .insert({
          title: form.title,
          description: form.objectives,
          campaign_type: form.category === "other" ? customCategory : form.category,
          status: "submitted",
          created_by: user?.id,
        })
        .select()
        .single();

      if (error) throw error;

      // Create notification for admin when staff submits campaign for approval
      if (data) {
        try {
          console.log("AllCampaigns - Creating admin notification for campaign:", data);
          const { data: admins } = await supabase
            .from("users")
            .select("id")
            .in("role", ["admin", "super_admin"]);

          console.log("AllCampaigns - Found admins for notification:", admins?.length || 0);

          if (admins && admins.length > 0) {
            const notifications = admins.map(admin => ({
              user_id: admin.id,
              campaign_id: data.id,
              title: `New Campaign Submitted for Approval: ${data.title}`,
              message: `A campaign "${data.title}" has been submitted by ${user?.name || user?.email || 'Staff'} and is awaiting your approval in Campaign Approval.`,
              type: "campaign",
              status: "unread"
            }));

            const { error: notifError } = await supabase
              .from("notifications")
              .insert(notifications);

            if (notifError) {
              console.error("AllCampaigns - Error creating admin notification:", notifError);
            } else {
              console.log("AllCampaigns - Admin notifications created successfully");
            }
          }
        } catch (notifError) {
          console.error("AllCampaigns - Error creating admin notification:", notifError);
        }
      }

      // Refresh campaigns list
      await fetchAllCampaigns();
      
      // Close dialog and reset form
      setForm({ title: "", objectives: "", category: "general" });
      setOpen(false);
      
      alert("Campaign submitted for approval! Admins will review it in Campaign Approval.");
      
      // Navigate to Submission page to see the submitted campaign
      navigate('/staff/submission');
    } catch (error) {
      console.error("Failed to submit campaign:", error);
      alert("Failed to submit campaign. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleViewCampaign = (campaign) => {
    setViewCampaign(campaign);
    setViewOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-xl sm:text-2xl font-bold">Published Campaigns</h1>
          <p className="text-muted-foreground text-xs sm:text-sm">
            View published campaigns from all staff members to avoid creating duplicates.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
          <Button variant="outline" onClick={fetchAllCampaigns} disabled={loading} className="w-full sm:w-auto">
            <Loader2 className={`h-4 w-4 mr-1 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Dialog open={open} onOpenChange={(val) => {
            if (!val) {
              setForm({ title: "", objectives: "", category: "general" });
              setCustomCategory("");
            }
            setOpen(val);
          }}>
            <DialogTrigger asChild>
              <Button onClick={handleNewCampaign} className="w-full sm:w-auto"><Plus className="h-4 w-4 mr-1" /> Create New Campaign</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Campaign</DialogTitle>
                <DialogDescription>
                  Create a new campaign draft or submit for approval.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Campaign title" />
                  {form.title && (
                    <div className="text-xs text-muted-foreground">
                      {(() => {
                        const similar = checkForSimilarCampaigns(form.title);
                        if (similar.length > 0) {
                          return (
                            <div className="mt-1 p-2 bg-amber-50 border border-amber-200 rounded">
                              <div className="flex items-start gap-2">
                                <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-amber-500" />
                                <div>
                                  <p className="font-medium text-amber-800">Similar campaigns found:</p>
                                  <ul className="mt-1 space-y-1">
                                    {similar.slice(0, 3).map(c => (
                                      <li key={c.id} className="text-amber-700">
                                        • "{c.title}" (by {c.creatorName})
                                      </li>
                                    ))}
                                  </ul>
                                  <p className="mt-1 text-xs text-amber-600">
                                    Consider editing the existing campaign or choose a different title.
                                  </p>
                                </div>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      })()}
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Description / Objectives</Label>
                  <Textarea value={form.objectives} onChange={(e) => setForm({ ...form, objectives: e.target.value })} placeholder="Describe the campaign objectives and key messages..." rows={4} />
                </div>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={form.category} onValueChange={(v) => {
                    setForm({ ...form, category: v });
                    if (v !== "other") setCustomCategory("");
                  }}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="emergency">Emergency</SelectItem>
                      <SelectItem value="health">Health</SelectItem>
                      <SelectItem value="fire_safety">Fire Safety</SelectItem>
                      <SelectItem value="disaster_prep">Disaster Prep</SelectItem>
                      <SelectItem value="crime_prevention">Crime Prevention</SelectItem>
                      <SelectItem value="general">General</SelectItem>
                      <SelectItem value="other">Other (specify below)</SelectItem>
                    </SelectContent>
                  </Select>
                  {form.category === "other" && (
                    <Input
                      value={customCategory}
                      onChange={(e) => setCustomCategory(e.target.value)}
                      placeholder="Enter custom category (e.g., Environmental, Community Service, etc.)"
                      className="mt-2"
                    />
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button onClick={saveCampaign} disabled={saving || !form.title.trim()} variant="outline">
                  {saving ? "Saving..." : "Save as Draft"}
                </Button>
                <Button onClick={submitCampaignForApproval} disabled={saving || !form.title.trim()}>
                  {saving ? "Submitting..." : "Submit for Approval"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* View Campaign Dialog */}
          <Dialog open={viewOpen} onOpenChange={setViewOpen}>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Campaign Details</DialogTitle>
              </DialogHeader>
              {viewCampaign && (
                <div className="space-y-4">
                  <div>
                    <Label>Title</Label>
                    <p className="text-lg font-semibold">{viewCampaign.title}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Status</Label>
                      <Badge variant={statusVariant[viewCampaign.status] || "outline"}>
                        {statusLabel[viewCampaign.status] || viewCampaign.status}
                      </Badge>
                    </div>
                    <div>
                      <Label>Category</Label>
                      <p className="text-sm capitalize">{viewCampaign.campaign_type || "general"}</p>
                    </div>
                    <div>
                      <Label>Created by</Label>
                      <p className="text-sm">{viewCampaign.creatorName}</p>
                    </div>
                    <div>
                      <Label>Created Date</Label>
                      <p className="text-sm">{viewCampaign.created_at ? new Date(viewCampaign.created_at).toLocaleDateString() : "N/A"}</p>
                    </div>
                  </div>
                  <div>
                    <Label>Description</Label>
                    <div className="text-sm whitespace-pre-wrap max-h-40 overflow-y-auto border rounded p-3 bg-muted/50">
                      {viewCampaign.description || "No description provided"}
                    </div>
                  </div>
                </div>
              )}
              <DialogFooter>
                <Button variant="outline" onClick={() => setViewOpen(false)}>Close</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Search campaigns by title or creator..." 
          className="pl-9" 
          value={query} 
          onChange={(e) => setQuery(e.target.value)} 
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
          <span className="text-muted-foreground text-sm">Loading campaigns...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <p className="font-medium">No published campaigns found.</p>
          <p className="text-sm mt-1">Published campaigns will appear here once approved by admins.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-4">
          {filtered.map((c) => {
            return (
              <Card key={c.id} className={c.isCreatedByUser ? "border-primary/30" : ""}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="success" className="text-xs">
                      Published
                    </Badge>
                    {c.isCreatedByUser && (
                      <Badge variant="outline" className="text-xs">Your Campaign</Badge>
                    )}
                  </div>
                  <CardTitle className="text-base line-clamp-2">{c.title}</CardTitle>
                  
                  <div className="flex flex-col gap-1 mt-2">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <User className="h-3 w-3" />
                      <span className="truncate">{c.creatorName}</span>
                    </div>
                    {c.created_at && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span>{new Date(c.created_at).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="pb-3">
                  <CardDescription className="line-clamp-3 text-sm">
                    {c.description || "No description provided"}
                  </CardDescription>
                </CardContent>
                <CardFooter>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => handleViewCampaign(c)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View Details
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}