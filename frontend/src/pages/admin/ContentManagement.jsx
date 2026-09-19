import React, { useState, useEffect } from "react";
import { Upload, FileText, Image as ImageIcon, Video, Volume2, Trash2, Sparkles, RefreshCw } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { supabase } from "@/lib/supabase";

const typeIcon = { announcement: FileText, poster: ImageIcon, infographic: ImageIcon, video: Video, advisory: FileText, voice_script: Volume2 };

const initialContent = [
  { id: 1, campaign: "Fire Safety Reminders", type: "announcement", aiGenerated: true },
  { id: 2, campaign: "Flood Evacuation Route Advisory", type: "infographic", aiGenerated: false },
  { id: 3, campaign: "Dengue Prevention Campaign", type: "poster", aiGenerated: false },
  { id: 4, campaign: "Fire Safety Reminders", type: "voice_script", aiGenerated: true },
  { id: 5, campaign: "Anti-Scam Awareness", type: "video", aiGenerated: false },
];

export default function ContentManagement() {
  const [content, setContent] = useState(initialContent);
  const [campaigns, setCampaigns] = useState([]);
  const [open, setOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form, setForm] = useState({ campaign: "", type: "announcement", file: null, activity_date: "" });
  const [uploading, setUploading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchCampaigns();
    fetchContent();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const { data, error } = await supabase
        .from('campaigns')
        .select('id, title')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCampaigns(data || []);
    } catch (error) {
      console.error('Error fetching campaigns:', error);
    }
  };

  const fetchContent = async () => {
    try {
      const { data, error } = await supabase
        .from('content')
        .select('*, campaigns(title)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      console.log('Fetched content:', data);
      setContent(data || []);
    } catch (error) {
      console.error('Error fetching content:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchCampaigns(), fetchContent()]);
    setRefreshing(false);
  };

  const remove = async (id) => {
    if (!confirm("Are you sure you want to delete this content?")) {
      return;
    }

    try {
      const { error } = await supabase
        .from('content')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Refresh content list
      await fetchContent();
      alert("Content deleted successfully!");
    } catch (error) {
      console.error('Error deleting content:', error);
      alert("Failed to delete content. Please try again.");
    }
  };

  const openUpload = () => {
    setEditingItem(null);
    setForm({ campaign: "", type: "announcement", file: null });
    setOpen(true);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setForm({ ...form, file });
    }
  };

  const handleSave = async () => {
    if (!form.campaign) {
      alert("Please select a campaign.");
      return;
    }

    if (!editingItem && !form.file) {
      alert("Please select a file to upload.");
      return;
    }

    try {
      setUploading(true);

      let mediaUrl = editingItem?.media_url;

      // Upload file if it's a new upload
      if (form.file && !editingItem) {
        const fileExt = form.file.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `content/${fileName}`;

        console.log('Uploading file to storage:', filePath);
        console.log('File size:', form.file.size, 'bytes');

        const { error: uploadError, data: uploadData } = await supabase.storage
          .from('campaign-content')
          .upload(filePath, form.file);

        if (uploadError) {
          console.error('Storage upload error:', uploadError);
          console.error('Error details:', JSON.stringify(uploadError, null, 2));
          alert(`Storage upload failed: ${uploadError.message}. Please check if the storage bucket 'campaign-content' exists and is public.`);
          return;
        }

        console.log('Upload successful:', uploadData);

        const { data: { publicUrl } } = supabase.storage
          .from('campaign-content')
          .getPublicUrl(filePath);

        mediaUrl = publicUrl;
        console.log('File uploaded successfully, public URL:', publicUrl);
      }

      // Find campaign ID from title
      const selectedCampaign = campaigns.find(c => c.title === form.campaign);
      if (!selectedCampaign) {
        alert("Campaign not found.");
        return;
      }

      console.log('Attempting to insert content with:', {
        campaign_id: selectedCampaign.id,
        content_type: form.type,
        media_url: mediaUrl
      });

      if (editingItem) {
        // Update existing content
        const { error } = await supabase
          .from('content')
          .update({
            content_type: form.type,
            media_url: mediaUrl,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingItem.id);

        if (error) throw error;
      } else {
        // Create new content
        const { error, data } = await supabase
          .from('content')
          .insert({
            campaign_id: selectedCampaign.id,
            content_type: form.type,
            media_url: mediaUrl,
            ai_generated: false,
            order_index: 0,
            activity_date: form.activity_date || null
          })
          .select();

        if (error) {
          console.error('Database insert error:', error);
          console.error('Error details:', JSON.stringify(error, null, 2));
          throw error;
        }
        
        console.log('Insert successful:', data);
      }

      // Refresh content list
      await fetchContent();
      setOpen(false);
      alert(editingItem ? "Content updated successfully!" : "Content uploaded successfully!");
    } catch (error) {
      console.error('Error saving content:', error);
      console.error('Full error:', JSON.stringify(error, null, 2));
      alert(`Failed to save content: ${error.message || 'Unknown error'}. Check console for details.`);
    } finally {
      setUploading(false);
    }
  };

  const openEdit = (item) => {
    setEditingItem(item);
    setForm({ 
      campaign: item.campaigns?.title || item.campaign, 
      type: item.content_type || item.type, 
      file: null,
      activity_date: item.activity_date || ""
    });
    setOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-xl sm:text-2xl font-bold">Content Management</h1>
          <p className="text-muted-foreground text-xs sm:text-sm">Manage announcements, posters, infographics, videos, and advisories.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
          <Button variant="outline" onClick={handleRefresh} disabled={refreshing} className="w-full sm:w-auto">
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button onClick={openUpload} className="w-full sm:w-auto"><Upload className="h-4 w-4 mr-1" /> Upload Content</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingItem ? "Edit Content" : "Upload Content"}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Campaign</Label>
                <Select value={form.campaign} onValueChange={(v) => setForm({ ...form, campaign: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder={campaigns.length === 0 ? "No campaigns available" : "Select a campaign"} />
                  </SelectTrigger>
                  <SelectContent>
                    {campaigns.length === 0 ? (
                      <div className="p-2 text-sm text-muted-foreground">No campaigns found. Create a campaign first.</div>
                    ) : (
                      campaigns.map((c) => (
                        <SelectItem key={c.id} value={c.title}>{c.title}</SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Content Type</Label>
                <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="announcement">Announcement</SelectItem>
                    <SelectItem value="poster">Poster</SelectItem>
                    <SelectItem value="infographic">Infographic</SelectItem>
                    <SelectItem value="video">Video</SelectItem>
                    <SelectItem value="advisory">Advisory</SelectItem>
                    <SelectItem value="voice_script">Voice Script</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Activity Date</Label>
                <Input 
                  type="date" 
                  value={form.activity_date} 
                  onChange={(e) => setForm({ ...form, activity_date: e.target.value })} 
                />
                <p className="text-xs text-muted-foreground">Date when the campaign activity was conducted</p>
              </div>
              {!editingItem && (
                <div className="space-y-2">
                  <Label>File Upload</Label>
                  <Input type="file" onChange={handleFileChange} accept="image/*,video/*,.pdf" />
                  <p className="text-xs text-muted-foreground">Supported formats: JPG, PNG, PDF, MP4.</p>
                </div>
              )}
              </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)} disabled={uploading}>Cancel</Button>
              <Button onClick={handleSave} disabled={uploading}>
                {uploading ? "Uploading..." : (editingItem ? "Save Changes" : "Upload")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="announcement">Announcements</TabsTrigger>
          <TabsTrigger value="poster">Posters</TabsTrigger>
          <TabsTrigger value="video">Videos</TabsTrigger>
          <TabsTrigger value="voice_script">Voice Scripts</TabsTrigger>
        </TabsList>

        {["all", "announcement", "poster", "video", "voice_script"].map((tab) => (
          <TabsContent key={tab} value={tab}>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {content
                .filter((c) => tab === "all" || c.content_type === tab || c.type === tab)
                .map((c) => {
                  const Icon = typeIcon[c.content_type || c.type] || FileText;
                  const campaignName = c.campaigns?.title || c.campaign;
                  const contentType = c.content_type || c.type;
                  console.log('Rendering content card:', { id: c.id, media_url: c.media_url, contentType });
                  return (
                    <Card key={c.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                            <Icon className="h-5 w-5" />
                          </div>
                          {c.ai_generated && (
                            <Badge variant="accent" className="text-[10px] gap-1">
                              <Sparkles className="h-3 w-3" /> AI
                            </Badge>
                          )}
                        </div>
                        {c.media_url ? (
                          <div className="mb-3 rounded-lg overflow-hidden bg-muted">
                            {contentType === 'video' ? (
                              <video src={c.media_url} className="w-full h-32 object-cover" controls />
                            ) : (
                              <img src={c.media_url} alt={campaignName} className="w-full h-32 object-cover" onError={(e) => {
                                console.error('Image load error:', c.media_url);
                                e.target.style.display = 'none';
                                e.target.parentElement.innerHTML = `<div class="p-2 text-xs text-red-500 break-all">Failed to load: ${c.media_url}</div>`;
                              }} onLoad={() => console.log('Image loaded successfully:', c.media_url)} />
                            )}
                          </div>
                        ) : (
                          <div className="mb-3 rounded-lg bg-muted h-32 flex items-center justify-center text-muted-foreground text-xs">
                            No image uploaded
                          </div>
                        )}
                        <p className="font-medium text-sm mb-1">{campaignName}</p>
                        <p className="text-xs text-muted-foreground capitalize mb-1">{contentType?.replace("_", " ")}</p>
                        {c.activity_date && (
                          <p className="text-xs text-muted-foreground mb-3">
                            Activity Date: {new Date(c.activity_date).toLocaleDateString()}
                          </p>
                        )}
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" className="flex-1" onClick={() => openEdit(c)}>Edit</Button>
                          <Button variant="ghost" size="icon" onClick={() => remove(c.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
