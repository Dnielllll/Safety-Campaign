import React, { useState, useEffect } from "react";
import { CheckSquare, X, MessageSquare, Loader2, RefreshCw, FileText, AlertTriangle, Calendar, User } from "lucide-react";
import { supabase } from "@/lib/supabase.js";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth.jsx";

export default function CampaignApproval() {
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState("");
  const [activeRevisionId, setActiveRevisionId] = useState(null);
  const [activeRejectId, setActiveRejectId] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const { user } = useAuth();
  const API_BASE = import.meta.env.VITE_API_URL || "https://barangay178-backend.onrender.com/api";

  useEffect(() => {
    fetchPending();
  }, []);

  const fetchPending = async () => {
    setLoading(true);
    try {
      // First, fetch campaigns without the join to see if there are any
      const { data: campaignsData, error: campaignsError } = await supabase
        .from("campaigns")
        .select("id, title, description, campaign_type, status, created_at, created_by, admin_notes")
        .in("status", ["submitted", "pending_approval"])
        .order("created_at", { ascending: false });

      console.log("Campaign Approval - Fetching submitted campaigns:", { campaignsData, campaignsError });
      console.log("Campaign Approval - Number of campaigns found:", campaignsData?.length || 0);

      if (campaignsError) {
        console.error("Campaign Approval - Error fetching campaigns:", campaignsError);
        alert(`Error fetching campaigns: ${campaignsError.message}`);
        throw campaignsError;
      }

      let pendingItems = [];

      if (campaignsData && campaignsData.length > 0) {
        const campaignsWithCreators = await Promise.all(
          campaignsData.map(async (c) => {
            let submittedBy = "Staff Member";
            if (c.created_by) {
              try {
                const { data: creatorData } = await supabase
                  .from("users")
                  .select("name, email")
                  .eq("id", c.created_by)
                  .single();
                if (creatorData) submittedBy = creatorData.name || creatorData.email || "Staff Member";
              } catch (e) {}
            }
            return {
              id: c.id,
              type: "campaign",
              title: c.title || "Untitled Campaign",
              description: c.description || "",
              submittedBy,
              category: c.campaign_type || "general",
              status: c.status,
              created_at: c.created_at,
              previousNotes: c.admin_notes || "",
            };
          })
        );
        pendingItems = [...pendingItems, ...campaignsWithCreators];
      }

      // Fetch pending surveys
      const { data: surveysData, error: surveysError } = await supabase
        .from("surveys")
        .select("id, title, description, status, created_at, created_by, admin_notes")
        .eq("status", "pending_approval")
        .order("created_at", { ascending: false });

      if (!surveysError && surveysData && surveysData.length > 0) {
        const surveysWithCreators = await Promise.all(
          surveysData.map(async (s) => {
            let submittedBy = "Staff Member";
            if (s.created_by) {
              try {
                const { data: creatorData } = await supabase
                  .from("users")
                  .select("name, email")
                  .eq("id", s.created_by)
                  .single();
                if (creatorData) submittedBy = creatorData.name || creatorData.email || "Staff Member";
              } catch (e) {}
            }
            
            // Fetch questions for this survey
            const { data: questions } = await supabase
              .from("survey_questions")
              .select("*")
              .eq("survey_id", s.id)
              .order("order_index", { ascending: true });
            
            return {
              id: s.id,
              type: "survey",
              title: s.title || "Untitled Survey",
              description: s.description || "",
              submittedBy,
              category: "survey",
              status: s.status,
              created_at: s.created_at,
              previousNotes: s.admin_notes || "",
              questionsCount: questions?.length || 0
            };
          })
        );
        pendingItems = [...pendingItems, ...surveysWithCreators];
      }

      // Sort all items by created_at descending
      pendingItems.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      
      setPending(pendingItems);
    } catch (err) {
      console.error("Error fetching pending items:", err);
      setPending([]);
    } finally {
      setLoading(false);
    }
  };

  const decide = async (id, decision, revisionComment = "") => {
    setActionLoading(true);

    console.log("Campaign Approval - Deciding campaign:", { id, decision });

    try {
      const item = pending.find(c => c.id === id);
      if (!item) return;

      if (item.type === "survey") {
        // Handle Survey Approval via direct Supabase update
        let newStatus = "pending_approval";
        if (decision === "approved") newStatus = "published";
        else if (decision === "revision") newStatus = "draft";
        else if (decision === "rejected") newStatus = "rejected";

        const { error } = await supabase
          .from("surveys")
          .update({ status: newStatus, admin_notes: revisionComment })
          .eq("id", id);
        
        if (error) throw error;
        
      } else {
        // Handle Campaign Approval via API
        let endpoint = "";
        let body = {};

        if (decision === "approved") {
          endpoint = `${API_BASE}/campaigns/${id}/approve`;
          body = { admin_notes: revisionComment };
        } else if (decision === "revision") {
          endpoint = `${API_BASE}/campaigns/${id}/request-revision`;
          body = { admin_notes: revisionComment };
        } else if (decision === "rejected") {
          endpoint = `${API_BASE}/campaigns/${id}/reject`;
          body = { admin_notes: revisionComment };
        }

        const response = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${user?.token || ""}`,
          },
          body: JSON.stringify(body),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || data.error || "Unknown error");
        }
      }

      // Create notification for approved campaigns
      if (decision === "approved") {
        const campaign = pending.find(c => c.id === id);
        if (campaign) {
          try {
            // Get all users to notify (staff, residents, public users)
            const { data: users } = await supabase
              .from("users")
              .select("id")
              .in("role", ["staff", "citizen", "public"]);

            if (users && users.length > 0) {
              const notifications = users.map(user => ({
                user_id: user.id,
                campaign_id: id,
                title: `New Campaign Published: ${campaign.title}`,
                message: `A new safety campaign "${campaign.title}" by ${campaign.submittedBy} has been published and is now available for viewing.`,
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
      }
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setPending(p => p.filter(c => c.id !== id));
      setComment("");
      setActiveRevisionId(null);
      setActiveRejectId(null);
      setActionLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("en-PH", {
      month: "short", day: "numeric", year: "numeric",
      hour: "2-digit", minute: "2-digit"
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold flex items-center gap-2">
            <CheckSquare className="h-6 w-6 text-primary" /> Campaign/Survey Approval
          </h1>
          <p className="text-muted-foreground text-sm">
            Review and approve staff-submitted campaigns and surveys before they are published.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchPending} disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-1" />}
          {loading ? "" : "Refresh"}
        </Button>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span className="ml-2 text-muted-foreground text-sm">Loading pending campaigns...</span>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        {!loading && pending.map((c) => (
          <Card key={c.id} className="flex flex-col">
            <CardHeader>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <Badge variant="warning">Pending</Badge>
                  <Badge variant={c.type === "survey" ? "secondary" : "outline"} className={c.type === "survey" ? "bg-purple-100 text-purple-800 border-purple-200" : ""}>
                    {c.type === "survey" ? "Survey" : "Campaign"}
                  </Badge>
                </div>
                {c.type !== "survey" && <Badge variant="outline">{c.category.replace(/_/g, " ")}</Badge>}
              </div>
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                {c.title}
              </CardTitle>

              <div className="flex flex-col gap-1 mt-1">
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <User className="h-3 w-3" /> Submitted by {c.submittedBy}
                </span>
                {c.created_at && (
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" /> {formatDate(c.created_at)}
                  </span>
                )}
                {c.type === "survey" && c.questionsCount !== undefined && (
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MessageSquare className="h-3 w-3" /> {c.questionsCount} question{c.questionsCount !== 1 ? 's' : ''}
                  </span>
                )}
              </div>

              {c.description && (
                <p className="text-xs text-muted-foreground mt-2 line-clamp-3 whitespace-pre-wrap border-l-2 border-primary/30 pl-2">
                  {c.description}
                </p>
              )}

              {/* Show previous admin comment if this is a resubmission */}
              {c.previousNotes && (
                <div className="mt-3 flex gap-2 items-start rounded-md border border-blue-200 bg-blue-50 p-2.5">
                  <MessageSquare className="h-3.5 w-3.5 shrink-0 mt-0.5 text-blue-500" />
                  <div>
                    <p className="text-xs font-semibold text-blue-800 mb-0.5">Your previous comment:</p>
                    <p className="text-xs text-blue-700">&ldquo;{c.previousNotes}&rdquo;</p>
                  </div>
                </div>
              )}
            </CardHeader>

            <CardFooter className="gap-2 mt-auto">
              {/* Approve */}
              <Button
                onClick={() => decide(c.id, "approved")}
                disabled={actionLoading}
                className="flex-1"
              >
                <CheckSquare className="h-4 w-4 mr-1" /> Approve
              </Button>

              {/* Request Revision */}
              <Dialog
                open={activeRevisionId === c.id}
                onOpenChange={(open) => {
                  setActiveRevisionId(open ? c.id : null);
                  if (!open) setComment("");
                }}
              >
                <DialogTrigger asChild>
                  <Button variant="outline" className="flex-1" disabled={actionLoading}>
                    <MessageSquare className="h-4 w-4 mr-1" /> Request Revision
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Request Revision — {c.title}</DialogTitle>
                  </DialogHeader>
                  <p className="text-xs text-muted-foreground">
                    Write a comment explaining what the staff member needs to change. They will see this comment in their Campaign Management and Submission pages.
                  </p>
                  {c.previousNotes && (
                    <div className="flex gap-2 items-start rounded-md border border-blue-200 bg-blue-50 p-2.5">
                      <MessageSquare className="h-3.5 w-3.5 shrink-0 mt-0.5 text-blue-400" />
                      <p className="text-xs text-blue-700">Previous: &ldquo;{c.previousNotes}&rdquo;</p>
                    </div>
                  )}
                  <Textarea
                    rows={4}
                    placeholder="e.g. Please clarify the curfew hours and add emergency contact numbers..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                  />
                  <DialogFooter>
                    <Button variant="outline" onClick={() => { setActiveRevisionId(null); setComment(""); }}>
                      Cancel
                    </Button>
                    <Button
                      disabled={!comment.trim() || actionLoading}
                      onClick={() => decide(c.id, "revision", comment)}
                    >
                      {actionLoading ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <MessageSquare className="h-4 w-4 mr-1" />}
                      Send Back to Staff
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              {/* Reject */}
              <Dialog
                open={activeRejectId === c.id}
                onOpenChange={(open) => setActiveRejectId(open ? c.id : null)}
              >
                <DialogTrigger asChild>
                  <Button variant="ghost" size="icon" disabled={actionLoading} title="Reject Campaign">
                    <X className="h-4 w-4 text-destructive" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-destructive">
                      <AlertTriangle className="h-5 w-5" /> Reject Campaign
                    </DialogTitle>
                  </DialogHeader>
                  <p className="text-sm text-muted-foreground">
                    Are you sure you want to <strong>reject</strong> &ldquo;{c.title}&rdquo;? The staff member will be notified.
                  </p>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setActiveRejectId(null)}>Cancel</Button>
                    <Button variant="destructive" onClick={() => decide(c.id, "rejected")} disabled={actionLoading}>
                      {actionLoading ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <X className="h-4 w-4 mr-1" />}
                      Reject Campaign
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardFooter>
          </Card>
        ))}

        {!loading && pending.length === 0 && (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            <CheckSquare className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p className="font-medium">No items pending approval</p>
            <p className="text-xs mt-1">When staff submit campaigns or surveys for review, they will appear here.</p>
          </div>
        )}
      </div>
    </div>
  );
}
