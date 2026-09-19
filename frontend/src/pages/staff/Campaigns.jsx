import React, { useState, useEffect } from "react";
import { Plus, Save, Search, Loader2, AlertTriangle, MessageSquare, User, Calendar, Volume2, Play, AlertCircle, Eye, X } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { supabaseHelpers, supabase } from "@/lib/supabase.js";
import { AIAPI } from "@/lib/api.js";
import { useAutoSave } from "@/hooks/useAutoSave.js";
import AutoSaveIndicator from "@/components/AutoSaveIndicator.jsx";
import { useAuth } from "@/hooks/useAuth.jsx";

const statusVariant = {
  draft: "outline",
  pending_approval: "warning",
  submitted: "warning",
  published: "success",
  rejected: "destructive",
  needs_revision: "destructive",
  active: "success",
  completed: "secondary",
  cancelled: "destructive",
};

const statusLabel = {
  draft: "Draft",
  pending_approval: "Pending Review",
  submitted: "Pending Review",
  published: "Published",
  rejected: "Rejected",
  needs_revision: "Needs Revision",
  active: "Active",
  completed: "Completed",
  cancelled: "Cancelled",
};

export default function StaffCampaigns() {
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState([]);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  
  // Auto-save for campaign form
  const [form, setForm, isFormSaved, clearFormSave] = useAutoSave(
    'campaign_draft',
    { title: "", objectives: "", category: "general" },
    3000 // Save every 3 seconds
  );
  
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [voice, setVoice] = useState("fil-PH-Wavenet-A");
  const [isPlaying, setIsPlaying] = useState(false);
  const [voiceError, setVoiceError] = useState(null);
  const [viewCampaign, setViewCampaign] = useState(null);
  const [viewOpen, setViewOpen] = useState(false);

  useEffect(() => {
    fetchCampaigns();
    
    // Load voices for browser TTS fallback
    const loadVoices = () => {
      window.speechSynthesis.getVoices();
    };
    
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }, []);

  const fetchCampaigns = async () => {
    setFetching(true);
    try {
      if (user) {
        console.log("Current user ID:", user.id);
        console.log("Current user email:", user.email);
        
        // Fetch ONLY user's own campaigns for this page
        const { data, error } = await supabase
          .from("campaigns")
          .select("*, users!campaigns_created_by_fkey(name, email)")
          .eq("created_by", user.id)
          .order("created_at", { ascending: false });

        if (error) throw error;

        console.log("Fetched campaigns for current user:", data);

        // Add creator information to each campaign
        const campaignsWithCreators = (data || []).map(campaign => ({
          ...campaign,
          creatorName: campaign.users?.name || campaign.users?.email || "Unknown",
          isCreatedByUser: campaign.created_by === user.id
        }));

        setCampaigns(campaignsWithCreators);
      }
    } catch (err) {
      console.error("Failed to fetch campaigns:", err);
    } finally {
      setFetching(false);
    }
  };

  const filtered = campaigns.filter((c) =>
    c.title?.toLowerCase().includes(query.toLowerCase())
  );

  const handleEdit = (campaign) => {
    setForm({
      id: campaign.id,
      title: campaign.title,
      objectives: campaign.description || "",
      category: campaign.campaign_type || "general",
      currentStatus: campaign.status,
      adminNotes: campaign.admin_notes || "",
    });
    setOpen(true);
  };

  const handleNew = () => {
    setForm({ title: "", objectives: "", category: "general" });
    setOpen(true);
  };

  const handleViewCampaign = (campaign) => {
    setViewCampaign(campaign);
    setViewOpen(true);
  };

  const saveDraft = async () => {
    if (!form.title.trim()) return;
    setLoading(true);
    try {
      if (form.id) {
        const { data } = await supabaseHelpers.updateCampaign(form.id, {
          title: form.title,
          description: form.objectives,
          campaign_type: form.category,
          status: "draft",
        });
        if (data) {
          setCampaigns((prev) => prev.map((c) => (c.id === form.id ? data : c)));
        }
      } else {
        const { data } = await supabaseHelpers.createCampaign({
          title: form.title,
          description: form.objectives,
          campaign_type: form.category,
          status: "draft",
          created_by: user?.id,
        });
        if (data) {
          setCampaigns((prev) => [data, ...prev]);
        }
      }
    } catch (error) {
      console.error("Failed to save draft:", error);
    } finally {
      setForm({ title: "", objectives: "", category: "general" });
      clearFormSave(); // Clear auto-save data after successful submission
      setOpen(false);
      setLoading(false);
    }
  };

  const canEdit = (status) => status === "draft" || status === "needs_revision";

  const generateVoicePreview = async () => {
    if (!form.objectives) return;
    
    setVoiceError(null);
    setIsPlaying(true);
    
    try {
      const { data } = await AIAPI.textToSpeech({
        text: form.objectives,
        voice: voice
      });
      
      if (data && data.audioContent) {
        // Convert base64 to audio and play
        const audioSrc = `data:audio/mp3;base64,${data.audioContent}`;
        const audio = new Audio(audioSrc);
        
        audio.onended = () => setIsPlaying(false);
        audio.onerror = () => {
          setIsPlaying(false);
          setVoiceError('Audio playback failed. Using browser TTS fallback.');
          fallbackToBrowserTTS();
        };
        
        audio.play();
      } else {
        setIsPlaying(false);
        setVoiceError('No audio content received from server. Using browser TTS fallback.');
        fallbackToBrowserTTS();
      }
    } catch (error) {
      setIsPlaying(false);
      console.error('Failed to generate voice preview:', error);
      setVoiceError('Google Cloud TTS unavailable. Using browser TTS fallback.');
      // Fallback to browser TTS if Google Cloud fails
      fallbackToBrowserTTS();
    }
  };

  const fallbackToBrowserTTS = () => {
    if (!form.objectives) return;
    
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(form.objectives);
    
    // Set voice based on selection
    const voices = window.speechSynthesis.getVoices();
    let selectedVoice = null;
    
    if (voice === "fil-PH-Wavenet-A") {
      // Try to find a Filipino female voice
      selectedVoice = voices.find(v => v.lang.includes('fil') && v.name.toLowerCase().includes('female')) ||
                     voices.find(v => v.lang.includes('fil')) ||
                     voices.find(v => v.lang.includes('tl'));
    } else if (voice === "fil-PH-Wavenet-B") {
      // Try to find a Filipino male voice
      selectedVoice = voices.find(v => v.lang.includes('fil') && v.name.toLowerCase().includes('male')) ||
                     voices.find(v => v.lang.includes('fil')) ||
                     voices.find(v => v.lang.includes('tl'));
    } else {
      // English voice
      selectedVoice = voices.find(v => v.lang.includes('en-US'));
    }
    
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }
    
    utterance.rate = 0.9; // Slightly slower for better clarity
    utterance.pitch = 1;
    
    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);
    
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-xl sm:text-2xl font-bold">Campaign Management</h1>
          <p className="text-muted-foreground text-xs sm:text-sm">
            Create and manage your own campaigns. Check <a href="/staff/all-campaigns" className="text-primary hover:underline">All Campaigns</a> to see existing campaigns and avoid duplicates.
          </p>
        </div>
        <Dialog open={open} onOpenChange={(val) => {
          if (!val) setForm({ title: "", objectives: "", category: "general" });
          setOpen(val);
        }}>
          <DialogTrigger asChild>
            <Button onClick={handleNew} className="w-full sm:w-auto"><Plus className="h-4 w-4 mr-1" /> New Draft</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <div className="flex items-center justify-between">
                <DialogTitle>{form.id ? "Edit Campaign" : "New Campaign Draft"}</DialogTitle>
                <AutoSaveIndicator isSaved={isFormSaved} />
              </div>
            </DialogHeader>
            {form.currentStatus === "needs_revision" && (
              <div className="flex gap-2 items-start rounded-md border border-amber-300 bg-amber-50 p-3 text-sm">
                <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-amber-500" />
                <div className="text-amber-800">
                  <p className="font-semibold">Needs Revision</p>
                  {form.adminNotes && (
                    <p className="mt-1">Admin comment: &ldquo;{form.adminNotes}&rdquo;</p>
                  )}
                  <p className="mt-1 text-xs text-amber-600">
                    Make your edits, then go to <strong>Submission</strong> to resubmit for review.
                  </p>
                </div>
              </div>
            )}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Campaign title" />
              </div>
              <div className="space-y-2">
                <Label>Description / Objectives</Label>
                <Textarea value={form.objectives} onChange={(e) => setForm({ ...form, objectives: e.target.value })} placeholder="Describe the campaign objectives and key messages..." rows={4} />
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="emergency">Emergency</SelectItem>
                    <SelectItem value="health">Health</SelectItem>
                    <SelectItem value="fire_safety">Fire Safety</SelectItem>
                    <SelectItem value="disaster_prep">Disaster Prep</SelectItem>
                    <SelectItem value="crime_prevention">Crime Prevention</SelectItem>
                    <SelectItem value="general">General</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Voice Announcement Preview</Label>
                <div className="flex items-center gap-2">
                  <Select value={voice} onValueChange={setVoice}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fil-PH-Wavenet-A">Filipino — Wavenet A (Female)</SelectItem>
                      <SelectItem value="fil-PH-Wavenet-B">Filipino — Wavenet B (Male)</SelectItem>
                      <SelectItem value="en-US-Wavenet-D">English — Wavenet D (Male)</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={generateVoicePreview}
                    disabled={!form.objectives || isPlaying}
                  >
                    {isPlaying ? (
                      <Volume2 className="h-4 w-4 mr-1" />
                    ) : (
                      <Play className="h-4 w-4 mr-1" />
                    )}
                    {isPlaying ? "Playing..." : "Preview Voice"}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Preview your campaign description as a voice announcement before submitting.
                </p>
                {voiceError && (
                  <div className="flex items-start gap-2 text-xs text-amber-600 bg-amber-50 p-2 rounded">
                    <AlertCircle className="h-3 w-3 mt-0.5 shrink-0" />
                    <span>{voiceError}</span>
                  </div>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setForm({ title: "", objectives: "", category: "general" });
                clearFormSave();
                setOpen(false);
              }}>Cancel</Button>
              <Button onClick={saveDraft} disabled={loading || !form.title.trim()}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Save className="h-4 w-4 mr-1" />}
                {loading ? "Saving..." : "Save Draft"}
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
                {viewCampaign.isCreatedByUser && canEdit(viewCampaign.status) && (
                  <div className="flex justify-end">
                    <Button 
                      onClick={() => {
                        setViewOpen(false);
                        handleEdit(viewCampaign);
                      }}
                    >
                      Edit This Campaign
                    </Button>
                  </div>
                )}
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setViewOpen(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search your campaigns..." className="pl-9" value={query} onChange={(e) => setQuery(e.target.value)} />
      </div>

      {fetching ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
          <span className="text-muted-foreground text-sm">Loading campaigns...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <p className="font-medium">No campaigns yet.</p>
          <p className="text-sm mt-1">Click <strong>New Draft</strong> to create your first campaign.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-4">
          {filtered.map((c) => {
            const status = c.status || "draft";
            const editable = canEdit(status) && c.isCreatedByUser;
            return (
              <Card key={c.id} className={status === "needs_revision" ? "border-amber-300" : !c.isCreatedByUser ? "opacity-70" : ""}>
                <CardHeader>
                  <div className="flex items-center justify-between mb-1">
                    <Badge variant={statusVariant[status] || "outline"}>
                      {statusLabel[status] || status}
                    </Badge>
                    {c.isCreatedByUser && (
                      <Badge variant="outline" className="text-xs">Your Campaign</Badge>
                    )}
                  </div>
                  <CardTitle className="text-base">{c.title}</CardTitle>
                  
                  <div className="flex flex-col gap-1 mt-2">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <User className="h-3 w-3" />
                      <span>Created by: {c.creatorName}</span>
                    </div>
                    {c.created_at && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span>{new Date(c.created_at).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>

                  {status === "needs_revision" && c.admin_notes ? (
                    <div className="flex gap-1.5 items-start mt-2">
                      <MessageSquare className="h-3.5 w-3.5 shrink-0 mt-0.5 text-amber-500" />
                      <CardDescription className="text-amber-700 text-xs">
                        Admin: &ldquo;{c.admin_notes}&rdquo;
                      </CardDescription>
                    </div>
                  ) : (
                    <CardDescription className="mt-2">
                      {status === "draft" ? "Continue editing when ready" : 
                       status === "needs_revision" ? "Revision requested - click to edit" : 
                       status === "submitted" || status === "pending_approval" ? "Pending admin review" :
                       status === "published" ? "Published and visible to public" :
                       status === "rejected" ? "Rejected by admin" :
                       "Awaiting or completed review"}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardFooter>
                  {editable ? (
                    <Button
                      variant={status === "needs_revision" ? "default" : "outline"}
                      size="sm"
                      className="w-full"
                      onClick={() => handleEdit(c)}
                    >
                      {status === "draft" ? "Continue Editing" : status === "needs_revision" ? "Edit & Revise" : "View Details"}
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => handleViewCampaign(c)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View Details
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
