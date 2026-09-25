import React, { useState, useEffect } from "react";
import { Upload, FileText, Image as ImageIcon, Video, Volume2, Trash2, Sparkles, RefreshCw, AlertCircle, CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { supabase } from "@/lib/supabase";

const BACKEND_URL = import.meta.env.VITE_API_GATEWAY_URL || "https://barangay178-backend.onrender.com";

const typeIcon = {
  announcement: FileText,
  poster: ImageIcon,
  infographic: ImageIcon,
  video: Video,
  advisory: FileText,
  voice_script: Volume2,
};

export default function ContentManagement() {
  const [content, setContent] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [open, setOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form, setForm] = useState({ campaign_id: "", type: "poster", file: null, activity_date: "" });
  const [uploading, setUploading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingCampaigns, setLoadingCampaigns] = useState(true);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchCampaigns();
    fetchContent();
  }, []);

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchCampaigns = async () => {
    setLoadingCampaigns(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/campaigns`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();

      let list = [];
      if (Array.isArray(json)) {
        list = json;
      } else if (Array.isArray(json.campaigns)) {
        list = json.campaigns;
      } else if (Array.isArray(json.data)) {
        list = json.data;
      }

      setCampaigns(list);
    } catch (err) {
      console.error("fetchCampaigns backend error:", err);
      try {
        const { data, error } = await supabase
          .from("campaigns")
          .select("id, title, status")
          .order("created_at", { ascending: false });
        if (!error && data) {
          setCampaigns(data);
        }
      } catch (supaErr) {
        console.error("Supabase fallback error:", supaErr);
      }
    } finally {
      setLoadingCampaigns(false);
    }
  };

  const fetchContent = async () => {
    try {
      const { data, error } = await supabase
        .from("content")
        .select("*, campaigns(title)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      setContent(data || []);
    } catch (error) {
      console.error("fetchContent error:", error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchCampaigns(), fetchContent()]);
    setRefreshing(false);
  };

  const remove = async (id) => {
    if (!confirm("Are you sure you want to delete this content?")) return;
    try {
      const { error } = await supabase.from("content").delete().eq("id", id);
      if (error) throw error;
      await fetchContent();
      showToast("success", "Content deleted successfully!");
    } catch (error) {
      console.error("Delete error:", error);
      showToast("error", `Failed to delete: ${error.message}`);
    }
  };

  const openUpload = () => {
    setEditingItem(null);
    setForm({ campaign_id: "", type: "poster", file: null, activity_date: "" });
    setOpen(true);
  };

  const openEdit = (item) => {
    setEditingItem(item);
    setForm({
      campaign_id: String(item.campaign_id || ""),
      type: item.content_type || item.type || "poster",
      file: null,
      activity_date: item.activity_date || "",
    });
    setOpen(true);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) setForm((prev) => ({ ...prev, file }));
  };

  const handleSave = async () => {
    if (!form.campaign_id) {
      showToast("error", "Please select a campaign.");
      return;
    }
    if (!editingItem && !form.file) {
      showToast("error", "Please select a file to upload.");
      return;
    }

    setUploading(true);
    try {
      let mediaUrl = editingItem?.media_url || null;

      if (form.file && !editingItem) {
        const fileExt = form.file.name.split(".").pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
        const filePath = `content/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("campaign-content")
          .upload(filePath, form.file, { upsert: true });

        if (uploadError) {
          throw new Error(
            `Storage upload failed: ${uploadError.message}. Make sure the "campaign-content" bucket exists in Supabase Storage and is set to public.`
          );
        }

        const { data: { publicUrl } } = supabase.storage
          .from("campaign-content")
          .getPublicUrl(filePath);

        mediaUrl = publicUrl;
      }

      if (editingItem) {
        const { error } = await supabase
          .from("content")
          .update({
            content_type: form.type,
            media_url: mediaUrl,
            activity_date: form.activity_date || null,
            updated_at: new Date().toISOString(),
          })
          .eq("id", editingItem.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("content").insert({
          campaign_id: form.campaign_id,
          content_type: form.type,
          media_url: mediaUrl,
          ai_generated: false,
          order_index: 0,
          activity_date: form.activity_date || null,
        });
        if (error) throw error;
      }

      await fetchContent();
      setOpen(false);
      showToast(
        "success",
        editingItem
          ? "Content updated successfully!"
          : "Content uploaded! It will now appear in the Safety Campaigns page."
      );
    } catch (error) {
      console.error("Save error:", error);
      showToast("error", error.message || "Failed to save content.");
    } finally {
      setUploading(false);
    }
  };

  const getCampaignTitle = (campaign_id) => {
    const c = campaigns.find((c) => String(c.id) === String(campaign_id));
    return c?.title || "";
  };

  return (
    <div className="space-y-6 relative">
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg text-white text-sm max-w-sm ${
            toast.type === "success" ? "bg-green-600" : "bg-red-600"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle2 className="h-4 w-4 shrink-0" />
          ) : (
            <AlertCircle className="h-4 w-4 shrink-0" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-xl sm:text-2xl font-bold">Content Management</h1>
          <p className="text-muted-foreground text-xs sm:text-sm">
            Upload posters, infographics, videos, and advisories for your campaigns.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
          <Button variant="outline" onClick={handleRefresh} disabled={refreshing} className="w-full sm:w-auto">
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button onClick={openUpload} className="w-full sm:w-auto">
                <Upload className="h-4 w-4 mr-1" /> Upload Content
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>{editingItem ? "Edit Content" : "Upload Content"}</DialogTitle>
              </DialogHeader>

              <div className="space-y-4 py-2">
                <div className="space-y-2">
                  <Label>
                    Campaign <span className="text-destructive">*</span>
                  </Label>
                  {loadingCampaigns ? (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
                      <RefreshCw className="h-3 w-3 animate-spin" />
                      Loading campaigns…
                    </div>
                  ) : campaigns.length === 0 ? (
                    <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
                      No campaigns found. Please create a campaign first in Campaign Management.
                    </div>
                  ) : (
                    <Select
                      value={form.campaign_id}
                      onValueChange={(v) => setForm((prev) => ({ ...prev, campaign_id: v }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a campaign" />
                      </SelectTrigger>
                      <SelectContent>
                        {campaigns.map((c) => (
                          <SelectItem key={c.id} value={String(c.id)}>
                            {c.title}
                            {c.status && (
                              <span className="ml-2 text-xs text-muted-foreground capitalize">
                                ({c.status})
                              </span>
                            )}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>
                    Content Type <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={form.type}
                    onValueChange={(v) => setForm((prev) => ({ ...prev, type: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="poster">Poster</SelectItem>
                      <SelectItem value="infographic">Infographic</SelectItem>
                      <SelectItem value="video">Video</SelectItem>
                      <SelectItem value="advisory">Advisory</SelectItem>
                      <SelectItem value="announcement">Announcement</SelectItem>
                      <SelectItem value="voice_script">Voice Script</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Activity Date</Label>
                  <Input
                    type="date"
                    value={form.activity_date}
                    onChange={(e) => setForm((prev) => ({ ...prev, activity_date: e.target.value }))}
                  />
                  <p className="text-xs text-muted-foreground">
                    Date when the campaign activity was conducted (optional)
                  </p>
                </div>

                {!editingItem && (
                  <div className="space-y-2">
                    <Label>
                      File Upload <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      type="file"
                      onChange={handleFileChange}
                      accept="image/*,video/*,.pdf"
                    />
                    <p className="text-xs text-muted-foreground">
                      Supported: JPG, PNG, GIF, WebP, PDF, MP4, MOV
                    </p>
                    {form.file && (
                      <p className="text-xs text-green-600 font-medium">
                        ✓ {form.file.name} ({(form.file.size / 1024 / 1024).toFixed(2)} MB)
                      </p>
                    )}
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)} disabled={uploading}>
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={uploading || !form.campaign_id}>
                  {uploading ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Uploading…
                    </>
                  ) : editingItem ? (
                    "Save Changes"
                  ) : (
                    "Upload"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {!loadingCampaigns && (
        <p className="text-xs text-muted-foreground">
          {campaigns.length > 0
            ? `${campaigns.length} campaign${campaigns.length !== 1 ? "s" : ""} available`
            : "No campaigns found — create one in Campaign Management first."}
        </p>
      )}

      <Tabs defaultValue="all">
        <TabsList className="flex-wrap h-auto">
          <TabsTrigger value="all">All ({content.length})</TabsTrigger>
          <TabsTrigger value="poster">Posters</TabsTrigger>
          <TabsTrigger value="infographic">Infographics</TabsTrigger>
          <TabsTrigger value="video">Videos</TabsTrigger>
          <TabsTrigger value="announcement">Announcements</TabsTrigger>
          <TabsTrigger value="advisory">Advisories</TabsTrigger>
        </TabsList>

        {["all", "poster", "infographic", "video", "announcement", "advisory"].map((tab) => {
          const filtered = content.filter(
            (c) => tab === "all" || (c.content_type || c.type) === tab
          );
          return (
            <TabsContent key={tab} value={tab}>
              {filtered.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Upload className="h-10 w-10 mx-auto mb-3 opacity-30" />
                  <p className="text-sm font-medium">
                    No {tab === "all" ? "" : tab} content yet
                  </p>
                  <p className="text-xs mt-1">
                    Click "Upload Content" to add content to a campaign.
                  </p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filtered.map((c) => {
                    const Icon = typeIcon[c.content_type || c.type] || FileText;
                    const campaignName =
                      c.campaigns?.title || getCampaignTitle(c.campaign_id) || "Unknown Campaign";
                    const contentType = c.content_type || c.type;

                    return (
                      <Card key={c.id} className="overflow-hidden">
                        <CardContent className="p-0">
                          {c.media_url ? (
                            <div className="bg-muted overflow-hidden">
                              {contentType === "video" ? (
                                <video
                                  src={c.media_url}
                                  className="w-full h-40 object-cover"
                                  controls
                                  preload="metadata"
                                />
                              ) : (
                                <img
                                  src={c.media_url}
                                  alt={campaignName}
                                  className="w-full h-40 object-cover"
                                  onError={(e) => {
                                    e.target.style.display = "none";
                                    e.target.parentElement.innerHTML =
                                      '<div class="h-40 flex items-center justify-center text-xs text-muted-foreground">Image unavailable</div>';
                                  }}
                                />
                              )}
                            </div>
                          ) : (
                            <div className="h-40 bg-muted flex items-center justify-center">
                              <Icon className="h-10 w-10 opacity-30 text-muted-foreground" />
                            </div>
                          )}

                          <div className="p-4 space-y-2">
                            <p
                              className="font-medium text-sm truncate"
                              title={campaignName}
                            >
                              {campaignName}
                            </p>
                            <div className="flex items-center gap-2 flex-wrap">
                              <Badge variant="outline" className="text-[10px] capitalize">
                                <Icon className="h-3 w-3 mr-1" />
                                {contentType?.replace("_", " ")}
                              </Badge>
                              {c.ai_generated && (
                                <Badge variant="accent" className="text-[10px] gap-1">
                                  <Sparkles className="h-3 w-3" /> AI
                                </Badge>
                              )}
                            </div>
                            {c.activity_date && (
                              <p className="text-xs text-muted-foreground">
                                📅{" "}
                                {new Date(c.activity_date).toLocaleDateString("en-PH", {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                })}
                              </p>
                            )}
                            <div className="flex gap-2 pt-1">
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex-1"
                                onClick={() => openEdit(c)}
                              >
                                Edit
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => remove(c.id)}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}
