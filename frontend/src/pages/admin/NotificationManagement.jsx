import React, { useState, useEffect } from "react";
import { BellRing, Send, RefreshCw, CheckCircle2, XCircle, Clock, Loader2, Check, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/lib/supabase";
import { notificationApi } from "@/lib/apiGateway";

const statusMeta = {
  delivered: { icon: CheckCircle2, variant: "success" },
  pending:   { icon: Clock,        variant: "warning"  },
  failed:    { icon: XCircle,      variant: "destructive" },
  unread:    { icon: Clock,        variant: "secondary" },
  read:      { icon: CheckCircle2, variant: "outline"  },
};

export default function NotificationManagement() {
  const [notifs,    setNotifs]    = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [residents, setResidents] = useState([]);
  const [open,      setOpen]      = useState(false);
  const [sending,   setSending]   = useState(false);
  const [loading,   setLoading]   = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [form,      setForm]      = useState({ 
    selectedCampaigns: [], 
    selectedResidents: [],
    channel: "sms" 
  });

  useEffect(() => {
    fetchCampaigns();
    fetchResidents();
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

  const fetchResidents = async () => {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("id, name, email, phone, role, is_active")
        .in("role", ["citizen", "public"])
        .eq("is_active", true)
        .order("name", { ascending: true });

      if (error) throw error;
      setResidents(data || []);
    } catch (err) {
      console.error("Error fetching residents:", err);
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
            channel: Array.isArray(n.channels) ? n.channels[0] : (n.channel || "—"),
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

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchCampaigns(), fetchResidents(), fetchNotifications()]);
    setRefreshing(false);
  };

  const handleCampaignToggle = (campaignId) => {
    setForm(prev => ({
      ...prev,
      selectedCampaigns: prev.selectedCampaigns.includes(campaignId)
        ? prev.selectedCampaigns.filter(id => id !== campaignId)
        : [...prev.selectedCampaigns, campaignId]
    }));
  };

  const handleResidentToggle = (residentId) => {
    setForm(prev => ({
      ...prev,
      selectedResidents: prev.selectedResidents.includes(residentId)
        ? prev.selectedResidents.filter(id => id !== residentId)
        : [...prev.selectedResidents, residentId]
    }));
  };

  const handleSelectAllCampaigns = () => {
    if (form.selectedCampaigns.length === campaigns.length) {
      setForm(prev => ({ ...prev, selectedCampaigns: [] }));
    } else {
      setForm(prev => ({ ...prev, selectedCampaigns: campaigns.map(c => c.id) }));
    }
  };

  const handleSelectAllResidents = () => {
    if (form.selectedResidents.length === residents.length) {
      setForm(prev => ({ ...prev, selectedResidents: [] }));
    } else {
      setForm(prev => ({ ...prev, selectedResidents: residents.map(r => r.id) }));
    }
  };

  const handleSend = async () => {
    if (form.selectedCampaigns.length === 0) {
      alert("Please select at least one campaign");
      return;
    }

    if (form.selectedResidents.length === 0) {
      alert("Please select at least one resident");
      return;
    }

    setSending(true);
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      
      if (!currentUser || !currentUser.id) {
        throw new Error("User not authenticated. Please log in again.");
      }

      const selectedCampaignDetails = campaigns.filter(c => form.selectedCampaigns.includes(c.id));
      const selectedResidentDetails = residents.filter(r => form.selectedResidents.includes(r.id));

      const recipientCount = selectedResidentDetails.length;
      const campaignTitles = selectedCampaignDetails.map(c => c.title).join(", ");
      const campaignMsg = `Barangay 178 Alert: ${campaignTitles} — Stay safe and informed. Visit our portal for details.`;

      if (form.channel === "sms") {
        const phoneNumbers = selectedResidentDetails.map((r) => r.phone).filter(Boolean);
        if (phoneNumbers.length === 0) {
          alert("No selected residents have phone numbers registered.");
          setSending(false);
          return;
        }
        try {
          await notificationApi.bulkSMS({
            phone_numbers:        phoneNumbers,
            campaign_title:       campaignTitles,
            campaign_description: campaignMsg,
            provider:             "semaphore",
          });
        } catch (smsErr) {
          console.warn("SMS dispatch warning:", smsErr.message);
        }

      } else if (form.channel === "email") {
        const emails = selectedResidentDetails.map((r) => r.email).filter(Boolean);
        if (emails.length === 0) {
          alert("No selected residents have emails registered.");
          setSending(false);
          return;
        }
        try {
          const emailResult = await notificationApi.sendCampaignEmail({
            emails,
            campaign_title:   campaignTitles,
            campaign_message: campaignMsg,
          });
          
          if (emailResult.failed > 0) {
            console.warn(`Email delivery: ${emailResult.sent} successful, ${emailResult.failed} failed`);
            if (emailResult.details?.failures) {
              const bouncedEmails = emailResult.details.failures.map(f => f.email).join(', ');
              console.warn('Bounced emails:', bouncedEmails);
              
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

      for (const campaign of selectedCampaignDetails) {
        await supabase.from("notifications").insert({
          campaign_id:  campaign.id,
          title:        `Campaign Notification: ${campaign.title}`,
          message:      campaignMsg,
          type:         "campaign",
          status:       "read",
          channels:     [form.channel],
          recipient_count: recipientCount,
          sent_at:      new Date().toISOString(),
        });
      }

      const newNotif = {
        id:       Date.now(),
        campaign: `${selectedCampaignDetails.length} campaign(s)`,
        channel: form.channel.toUpperCase(),
        status:   "delivered",
        count:    recipientCount,
      };
      setNotifs((prev) => [newNotif, ...prev]);

      setOpen(false);
      setForm({ selectedCampaigns: [], selectedResidents: [], channel: "sms" });
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-xl sm:text-2xl font-bold flex items-center gap-2">
            <BellRing className="h-5 w-5 sm:h-6 sm:w-6 text-primary" /> Multi-Channel Dissemination
          </h1>
          <p className="text-muted-foreground text-xs sm:text-sm mt-0.5">
            Select multiple campaigns and residents, then disseminate via SMS, Email, or Facebook.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing} className="w-full sm:w-auto">
            <RefreshCw className={`h-4 w-4 mr-1 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin mr-2" /> Loading notifications…
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[600px]">
                <thead>
                  <tr className="border-b border-border text-left text-muted-foreground">
                    <th className="p-3 sm:p-4 font-medium whitespace-nowrap">Campaign</th>
                    <th className="p-3 sm:p-4 font-medium whitespace-nowrap">Channel</th>
                    <th className="p-3 sm:p-4 font-medium whitespace-nowrap">Recipients</th>
                    <th className="p-3 sm:p-4 font-medium whitespace-nowrap">Status</th>
                    <th className="p-3 sm:p-4 font-medium text-right whitespace-nowrap">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {notifs.map((n) => {
                    const meta = statusMeta[n.status] || statusMeta.pending;
                    const Icon = meta.icon;
                    return (
                      <tr key={n.id} className="border-b border-border last:border-0 hover:bg-secondary/40 transition-colors">
                        <td className="p-3 sm:p-4 font-medium whitespace-nowrap">{n.campaign}</td>
                        <td className="p-3 sm:p-4 capitalize whitespace-nowrap">{n.channel}</td>
                        <td className="p-3 sm:p-4 text-muted-foreground whitespace-nowrap">{(n.count || 0).toLocaleString()}</td>
                        <td className="p-3 sm:p-4 whitespace-nowrap">
                          <Badge variant={meta.variant} className="gap-1">
                            <Icon className="h-3 w-3" /> {n.status}
                          </Badge>
                        </td>
                        <td className="p-3 sm:p-4 text-right whitespace-nowrap">
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
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
