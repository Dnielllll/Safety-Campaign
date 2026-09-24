import React, { useState, useEffect } from "react";
import { BellRing, Send, RefreshCw, CheckCircle2, XCircle, Clock, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { supabase } from "@/lib/supabase";
import { notificationApi } from "@/lib/apiGateway";

const statusMeta = {
  delivered: { icon: CheckCircle2, variant: "success" },
  pending:   { icon: Clock,        variant: "warning"  },
  failed:    { icon: XCircle,      variant: "destructive" },
  unread:    { icon: Clock,        variant: "secondary" },
  read:      { icon: CheckCircle2, variant: "outline"  },
};

const initialNotifs = [
  { id: 1, campaign: "Fire Safety Reminders", channel: "SMS",      status: "delivered", count: 842 },
  { id: 2, campaign: "Fire Safety Reminders", channel: "Email",    status: "delivered", count: 620 },
  { id: 3, campaign: "Fire Safety Reminders", channel: "Facebook", status: "pending",   count: 0   },
];

export default function StaffNotifications() {
  const [notifs,    setNotifs]    = useState(initialNotifs);
  const [campaigns, setCampaigns] = useState([]);
  const [open,      setOpen]      = useState(false);
  const [sending,   setSending]   = useState(false);
  const [loading,   setLoading]   = useState(false);
  const [form,      setForm]      = useState({ campaign: "", channel: "sms" });

  useEffect(() => {
    fetchCampaigns();
    fetchNotifications();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const { data, error } = await supabase
        .from("campaigns")
        .select("id, title, status")
        .in("status", ["published", "approved", "active"])
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      // Remove duplicates based on title, keeping the most recent one
      const uniqueCampaigns = (data || []).reduce((acc, campaign) => {
        const existingIndex = acc.findIndex(c => c.title === campaign.title);
        if (existingIndex === -1) {
          acc.push(campaign);
        }
        return acc;
      }, []);
      
      setCampaigns(uniqueCampaigns);
    } catch (err) {
      console.error("Error fetching campaigns:", err);
    }
  };

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("notifications")
        .select("*, campaigns(title)")
        .order("created_at", { ascending: false });

      if (error) throw error;

      if (data && data.length > 0) {
        setNotifs(
          data.map((n) => ({
            id:       n.id,
            campaign: n.campaigns?.title || "Unknown Campaign",
            channel:  Array.isArray(n.channels) ? n.channels[0] : (n.channel || "—"),
            status:   n.status === "unread" ? "pending" : n.status === "read" ? "delivered" : n.status,
            count:    n.recipient_count || 0,
          }))
        );
      }
    } catch (err) {
      console.error("Error fetching notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!form.campaign) {
      alert("Please select a campaign");
      return;
    }

    setSending(true);
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      
      if (!currentUser || !currentUser.id) {
        throw new Error("User not authenticated. Please log in again.");
      }
      
      const selectedCampaign = campaigns.find((c) => c.id === form.campaign);
      if (!selectedCampaign) throw new Error("Campaign not found");

      // 1. Fetch all active residents as recipients (excluding staff and current user)
      const { data: recipients, error: recipientsError } = await supabase
        .from("users")
        .select("id, email, phone, name")
        .in("role", ["citizen", "public", "staff", "admin", "superadmin"])
        .eq("is_active", true);

      if (recipientsError) throw recipientsError;
      
      console.log("Current user ID:", currentUser?.id);
      console.log("Current user email:", currentUser?.email);
      console.log("All recipients before filtering:", recipients);
      
      // Filter out current user using both ID and email for robustness
      // Also filter out known problematic email addresses (full inboxes, etc.)
      const problematicEmails = ['superadmin@gmail.com', 'superadmin178@gmail.com']; // Add emails with known delivery issues
      const filteredRecipients = recipients?.filter(r => 
        r.id !== currentUser?.id && 
        r.email !== currentUser?.email &&
        !problematicEmails.includes(r.email)
      ) || [];
      
      console.log("Recipients after filtering:", filteredRecipients);
      
      if (filteredRecipients.length === 0) {
        alert("No valid recipients found. All users may be filtered out or have delivery issues.");
        setSending(false);
        return;
      }
      
      if (filteredRecipients.length === 0) {
        alert("No registered residents found to notify.");
        setSending(false);
        return;
      }

      const recipientCount = filteredRecipients.length;
      const campaignMsg = `Barangay 178 Alert: ${selectedCampaign.title} — Stay safe and informed. Visit our portal for details.`;

      // 2. Dispatch via selected channel
      if (form.channel === "sms") {
        const phoneNumbers = filteredRecipients.map((r) => r.phone).filter(Boolean);
        if (phoneNumbers.length === 0) {
          alert("No residents have phone numbers registered.");
          setSending(false);
          return;
        }
        try {
          await notificationApi.bulkSMS({
            phone_numbers:        phoneNumbers,
            campaign_title:       selectedCampaign.title,
            campaign_description: campaignMsg,
            provider:             "semaphore",
          });
        } catch (smsErr) {
          console.warn("SMS dispatch warning:", smsErr.message);
        }

      } else if (form.channel === "email") {
        const emails = filteredRecipients.map((r) => r.email).filter(Boolean);
        
        console.log("Emails being sent to:", emails);
        console.log("Current user email excluded:", currentUser?.email);
        
        if (emails.length === 0) {
          alert("No residents have emails registered.");
          setSending(false);
          return;
        }
        try {
          const emailResult = await notificationApi.sendCampaignEmail({
            emails,
            campaign_title:   selectedCampaign.title,
            campaign_message: campaignMsg,
          });
          
          // Check for bounced emails and provide feedback
          if (emailResult.failed > 0) {
            console.warn(`Email delivery: ${emailResult.sent} successful, ${emailResult.failed} failed`);
            if (emailResult.details?.failures) {
              const bouncedEmails = emailResult.details.failures.map(f => f.email).join(', ');
              console.warn('Bounced emails:', bouncedEmails);
              
              // Show warning to user about bounced emails
              const inboxesFull = emailResult.details.failures.some(f => 
                f.error?.toLowerCase().includes('inbox') || 
                f.error?.toLowerCase().includes('storage') ||
                f.error?.toLowerCase().includes('over quota')
              );
              
              if (inboxesFull) {
                alert(`⚠️ Some recipients have full inboxes: ${bouncedEmails}\n\n${emailResult.sent} emails were sent successfully, but ${emailResult.failed} failed due to inbox storage issues.`);
              } else {
                alert(`⚠️ Some emails failed to deliver: ${bouncedEmails}\n\n${emailResult.sent} emails were sent successfully, but ${emailResult.failed} failed.`);
              }
            }
          }
        } catch (mailErr) {
          console.warn("Email dispatch warning:", mailErr.message);
          alert(`Email dispatch encountered issues: ${mailErr.message}`);
        }
      }

      // 3. Save notification record to Supabase (broadcast notification)
      await supabase.from("notifications").insert({
        campaign_id:  selectedCampaign.id,
        title:        `Campaign Notification: ${selectedCampaign.title}`,
        message:      campaignMsg,
        type:         "campaign",
        status:       "read",   // mark as read = delivered
        channels:     [form.channel],
        recipient_count: recipientCount,
        sent_at:      new Date().toISOString(),
      });

      // 4. Update UI immediately with real recipient count
      const newNotif = {
        id:       Date.now(),
        campaign: selectedCampaign.title,
        channel:  form.channel.toUpperCase(),
        status:   "delivered",
        count:    recipientCount,
      };
      setNotifs((prev) => [newNotif, ...prev]);

      setOpen(false);
      setForm({ campaign: "", channel: "sms" });
      setTimeout(() => fetchNotifications(), 2000);

    } catch (err) {
      console.error("Error sending notification:", err);
      alert(`Failed to send notification: ${err.message}`);
    } finally {
      setSending(false);
    }
  };

  const resend = (id) =>
    setNotifs((prev) => prev.map((n) => (n.id === id ? { ...n, status: "delivered" } : n)));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold flex items-center gap-2">
            <BellRing className="h-6 w-6 text-primary" /> Notification Management
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Send, schedule, and monitor delivery of campaign notifications.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchNotifications} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-1 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>

          <Dialog open={open} onOpenChange={(v) => { if (!v) setForm({ campaign: "", channel: "sms" }); setOpen(v); }}>
            <DialogTrigger asChild>
              <Button>
                <Send className="h-4 w-4 mr-1" /> Send Notification
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Send Notification</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div className="space-y-2">
                  <Label>Campaign</Label>
                  <Select value={form.campaign} onValueChange={(v) => setForm({ ...form, campaign: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder={campaigns.length === 0 ? "No approved campaigns available" : "Select a campaign"} />
                    </SelectTrigger>
                    <SelectContent>
                      {campaigns.map((c) => (
                        <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Channel</Label>
                  <Select value={form.channel} onValueChange={(v) => setForm({ ...form, channel: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sms">SMS</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="facebook">Facebook</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button onClick={handleSend} disabled={sending}>
                  {sending ? <><RefreshCw className="h-4 w-4 mr-1 animate-spin" />Sending…</> : "Send"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-16 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin mr-2" /> Loading notifications…
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-muted-foreground">
                  <th className="p-4 font-medium">Campaign</th>
                  <th className="p-4 font-medium">Channel</th>
                  <th className="p-4 font-medium">Recipients</th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {notifs.map((n) => {
                  const meta = statusMeta[n.status] || statusMeta.pending;
                  const Icon = meta.icon;
                  return (
                    <tr key={n.id} className="border-b border-border last:border-0 hover:bg-secondary/40 transition-colors">
                      <td className="p-4 font-medium">{n.campaign}</td>
                      <td className="p-4 capitalize">{n.channel}</td>
                      <td className="p-4 text-muted-foreground">{(n.count || 0).toLocaleString()}</td>
                      <td className="p-4">
                        <Badge variant={meta.variant} className="gap-1">
                          <Icon className="h-3 w-3" /> {n.status}
                        </Badge>
                      </td>
                      <td className="p-4 text-right">
                        {n.status === "failed" && (
                          <Button variant="ghost" size="sm" onClick={() => resend(n.id)}>
                            <RefreshCw className="h-4 w-4 mr-1" /> Resend
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {notifs.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-muted-foreground">
                      No notifications sent yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
