import React, { useState, useEffect } from "react";
import { Upload, FileText, Image as ImageIcon, Video, Volume2, Trash2, Loader2, Save } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { supabaseHelpers } from "@/lib/supabase.js";
import { supabase } from "@/lib/supabase";

const typeIcon = { announcement: FileText, poster: ImageIcon, infographic: ImageIcon, video: Video, advisory: FileText, voice_script: Volume2 };

const initialContent = [
  { id: 1, campaign_id: 1, campaign: "Anti-Scam Awareness", content_type: "poster" },
];

export default function StaffContent() {
  const [content, setContent] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form, setForm] = useState({ campaign: "", type: "announcement", file: null, activity_date: "" });
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchCampaigns();
    fetchContent();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const { user } = await supabaseHelpers.getAuthUser();
      if (!user) return;
      
      const { data, error } = await supabase
        .from('campaigns')
        .select('id, title')
        .in('status', ['published', 'active'])
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCampaigns(data || []);
    } catch (error) {
      console.error('Error fetching campaigns:', error);
    }
  };

  const fetchContent = async () => {
    setLoading(true);
    try {
      const { user } = await supabaseHelpers.getAuthUser();
      if (!user) {
        setContent([]);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('content')
        .select('*, campaigns(title)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      console.log('Fetched content:', data);
      setContent(data || []);
    } catch (error) {
      console.error('Error fetching content:', error);
      setContent([]);
    } finally {
      setLoading(false);
    }
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
      setContent((prev) => prev.filter((c) => c.id !== id));
    } catch (error) {
      console.error("Failed to delete content:", error);
      alert("Failed to delete content. Please try again.");
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setForm({ ...form, file });
    }
  };

  const openUpload = () => {
    setEditingItem(null);
    setForm({ campaign: "", type: "announcement", file: null, activity_date: "" });
    setOpen(true);
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

  const handleSave = async () => {
    if (!form.campaign) {
      alert("Please select a campaign");
      return;
    }

    setUploading(true);
    try {
      const selectedCampaign = campaigns.find(c => c.title === form.campaign);
      if (!selectedCampaign) {
        throw new Error("Campaign not found");
      }

      let mediaUrl = editingItem?.media_url || "";

      // Upload file if provided
      if (form.file && !editingItem) {
        const fileExt = form.file.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `${selectedCampaign.id}/${fileName}`;

        console.log('Uploading file to Supabase storage...');
        console.log('File size:', form.file.size, 'bytes');

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('campaign-content')
          .upload(filePath, form.file);

        if (uploadError) {
          console.error('Storage upload error:', uploadError);
          if (uploadError.message.includes('Bucket not found')) {
            throw new Error("Storage bucket 'campaign-content' not found. Please create it in Supabase Dashboard → Storage and make it public.");
          }
          throw uploadError;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('campaign-content')
          .getPublicUrl(filePath);

        mediaUrl = publicUrl;
        console.log('File uploaded successfully. Public URL:', mediaUrl);
      }

      if (editingItem) {
        // Update existing content
        const { error } = await supabase
          .from('content')
          .update({
            campaign_id: selectedCampaign.id,
            content_type: form.type,
            activity_date: form.activity_date || null
          })
          .eq('id', editingItem.id);

        if (error) throw error;
      } else {
        // Create new content
        const { error } = await supabase
          .from('content')
          .insert({
            campaign_id: selectedCampaign.id,
            content_type: form.type,
            media_url: mediaUrl,
            ai_generated: false,
            order_index: 0,
            activity_date: form.activity_date || null
          });

        if (error) throw error;
      }

      await fetchContent();
      setOpen(false);
      setEditingItem(null);
      setForm({ campaign: "", type: "announcement", file: null, activity_date: "" });
    } catch (error) {
      console.error('Error saving content:', error);
      alert(`Failed to save content: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">Content Management</h1>
          <p className="text-muted-foreground text-sm">Upload posters, infographics, videos, and advisories for your campaigns.</p>
        </div>
        
        <Dialog open={open} onOpenChange={(val) => {
          if (!val) {
            setEditingItem(null);
            setForm({ campaign: "", type: "announcement", file: null, activity_date: "" });
          }
          setOpen(val);
        }}>
          <DialogTrigger asChild>
            <Button onClick={openUpload}><Upload className="h-4 w-4 mr-1" /> Upload Content</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingItem ? "Edit Content" : "Upload Content"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label>Campaign</Label>
                <Select value={form.campaign} onValueChange={(v) => setForm({ ...form, campaign: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder={campaigns.length === 0 ? "No campaigns available" : "Select a campaign"} />
                  </SelectTrigger>
                  <SelectContent>
                    {campaigns.map((c) => (
                      <SelectItem key={c.id} value={c.title}>{c.title}</SelectItem>
                    ))}
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
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={handleSave} disabled={uploading}>
                {uploading ? "Saving..." : editingItem ? "Save Changes" : "Upload"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {content.map((c) => {
          const Icon = typeIcon[c.content_type] || FileText;
          const campaignName = c.campaigns?.title || c.campaign;
          const contentType = c.content_type || c.type;
          return (
            <Card key={c.id}>
              <CardContent className="p-4">
                {c.media_url && (
                  <div className="mb-3 rounded-lg overflow-hidden bg-muted">
                    {contentType === 'video' ? (
                      <video src={c.media_url} className="w-full h-32 object-cover" />
                    ) : (
                      <img 
                        src={c.media_url} 
                        alt={campaignName} 
                        className="w-full h-32 object-cover"
                        onError={(e) => {
                          console.error('Failed to load image:', c.media_url);
                          e.target.style.display = 'none';
                        }}
                      />
                    )}
                  </div>
                )}
                <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-3">
                  <Icon className="h-5 w-5" />
                </div>
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
    </div>
  );
}
