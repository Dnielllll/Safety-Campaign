import React, { useState, useEffect } from "react";
import { Send, Clock, CheckCircle2, XCircle, MessageSquare, Loader2, AlertTriangle, RefreshCw } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabaseHelpers, supabase } from "@/lib/supabase.js";

const statusMeta = {
  draft: { label: "Not Submitted", variant: "outline", icon: Clock },
  submitted: { label: "Pending Review", variant: "warning", icon: Clock },
  pending_approval: { label: "Pending Review", variant: "warning", icon: Clock },
  approved: { label: "Approved", variant: "success", icon: CheckCircle2 },
  published: { label: "Published", variant: "success", icon: CheckCircle2 },
  rejected: { label: "Rejected", variant: "destructive", icon: XCircle },
  needs_revision: { label: "Needs Revision", variant: "destructive", icon: MessageSquare },
};

export default function CampaignSubmission() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    setFetching(true);
    try {
      const { user } = await supabaseHelpers.getAuthUser();
      if (user) {
        const { data } = await supabaseHelpers.getCampaigns({ created_by: user.id });
        console.log("Submission - Fetched campaigns for user:", data);
        // Show all campaigns except published ones — staff needs to track status
        const relevant = (data || []).filter(c => c.status !== "published");
        console.log("Submission - Relevant campaigns (excluding published):", relevant);
        setCampaigns(relevant);
      }
    } catch (err) {
      console.error("Failed to fetch campaigns:", err);
    } finally {
      setFetching(false);
    }
  };

  const submitCampaign = async (id, currentStatus) => {
    setLoading(true);
    try {
      const updateData = { status: "submitted" };
      // Clear admin_notes when resubmitting so previous comment is removed
      if (currentStatus === "needs_revision") {
        updateData.admin_notes = null;
      }

      console.log("Submission - Submitting campaign for approval:", { id, currentStatus, updateData });

      const { data, error } = await supabaseHelpers.updateCampaign(id, updateData);
      console.log("Submission - Campaign update result:", { data, error });

      if (error) {
        console.error("Submission - Error updating campaign:", error);
        alert(`Failed to submit campaign: ${error.message}`);
        throw error;
      }

      if (data) {
        setCampaigns((prev) => prev.map((c) => c.id === id ? { ...c, status: "submitted", admin_notes: null } : c));
        console.log("Submission - Campaign status updated successfully");
        // Refresh campaigns to ensure we have the latest data
        await fetchCampaigns();

        // Create notification for admin when staff submits campaign for approval
        try {
          const { user } = await supabaseHelpers.getAuthUser();
          const campaign = campaigns.find(c => c.id === id);

          console.log("Submission - Creating admin notification for campaign:", campaign);

          const { data: admins } = await supabase
            .from("users")
            .select("id")
            .in("role", ["admin", "super_admin"]);

          console.log("Submission - Found admins for notification:", admins?.length || 0);

          if (admins && admins.length > 0 && campaign) {
            const notifications = admins.map(admin => ({
              user_id: admin.id,
              campaign_id: id,
              title: `New Campaign Submitted for Approval: ${campaign.title}`,
              message: `A campaign "${campaign.title}" has been submitted by ${user?.name || user?.email || 'Staff'} and is awaiting your approval in Campaign/Survey Approval.`,
              type: "campaign",
              status: "unread"
            }));

            const { error: notifError } = await supabase
              .from("notifications")
              .insert(notifications);

            if (notifError) {
              console.error("Submission - Error creating admin notification:", notifError);
            } else {
              console.log("Submission - Admin notifications created successfully");
            }
          }
        } catch (notifError) {
          console.error("Submission - Error creating admin notification:", notifError);
        }

        alert("Campaign submitted for approval! Admins will review it in Campaign/Survey Approval.");
      }
    } catch (err) {
      console.error("Submission - Failed to submit:", err);
      alert("Failed to submit campaign. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold flex items-center gap-2">
            <Send className="h-6 w-6 text-primary" /> Campaign Submission
          </h1>
          <p className="text-muted-foreground text-sm">
            Submit completed drafts for admin review and track their approval status.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchCampaigns} disabled={fetching}>
          {fetching ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-1" />}
          {fetching ? "" : "Refresh"}
        </Button>
      </div>

      {fetching ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
          <span className="text-muted-foreground text-sm">Loading submissions...</span>
        </div>
      ) : campaigns.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Send className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p className="font-medium">No campaigns to submit.</p>
          <p className="text-sm mt-1">Create a draft in Campaign Management first.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {campaigns.map((c) => {
            const meta = statusMeta[c.status] || statusMeta.draft;
            const Icon = meta.icon;
            const canSubmit = c.status === "draft" || c.status === "needs_revision";
            const isRevision = c.status === "needs_revision";
            return (
              <Card key={c.id} className={isRevision ? "border-amber-300 bg-amber-50/30" : ""}>
                <CardHeader>
                  <Badge variant={meta.variant} className="w-fit mb-1 gap-1">
                    <Icon className="h-3 w-3" /> {meta.label}
                  </Badge>
                  <CardTitle className="text-base">{c.title}</CardTitle>
                  {c.description && (
                    <CardDescription className="line-clamp-2">{c.description}</CardDescription>
                  )}

                  {/* Admin comment box — shown prominently when needs revision */}
                  {isRevision && c.admin_notes && (
                    <div className="mt-3 flex gap-2 items-start rounded-md border border-amber-300 bg-amber-50 p-3">
                      <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-amber-500" />
                      <div>
                        <p className="text-xs font-semibold text-amber-800 mb-0.5">Admin Comment:</p>
                        <p className="text-sm text-amber-900">&ldquo;{c.admin_notes}&rdquo;</p>
                        <p className="text-xs text-amber-600 mt-1">
                          Please edit the campaign in <strong>Campaign Management</strong> before resubmitting.
                        </p>
                      </div>
                    </div>
                  )}
                </CardHeader>
                <CardFooter>
                  {canSubmit ? (
                    <Button
                      onClick={() => submitCampaign(c.id, c.status)}
                      disabled={loading}
                      className="w-full"
                    >
                      {loading ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Send className="h-4 w-4 mr-1" />}
                      {isRevision ? "Resubmit for Review" : "Submit for Review"}
                    </Button>
                  ) : (
                    <Button variant="outline" className="w-full" disabled>
                      {c.status === "submitted" || c.status === "pending_approval"
                        ? "Awaiting Admin Decision"
                        : c.status === "published"
                        ? "Published"
                        : c.status === "rejected"
                        ? "Rejected by Admin"
                        : "No action needed"}
                    </Button>
                  )}
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
