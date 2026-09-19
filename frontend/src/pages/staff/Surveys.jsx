import React, { useState, useEffect } from "react";
import { ClipboardList, Plus, Send, Clock, CheckCircle2, XCircle, MessageSquare, Loader2, AlertTriangle, RefreshCw, User, Edit } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { supabase } from "@/lib/supabase";

const statusMeta = {
  draft: { label: "Draft", variant: "outline", icon: Clock },
  pending_approval: { label: "Pending Review", variant: "warning", icon: Clock },
  published: { label: "Published", variant: "success", icon: CheckCircle2 },
  rejected: { label: "Rejected", variant: "destructive", icon: XCircle },
  archived: { label: "Archived", variant: "secondary", icon: MessageSquare },
};

export default function StaffSurveys() {
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [surveyDialogOpen, setSurveyDialogOpen] = useState(false);
  const [editingSurvey, setEditingSurvey] = useState(null);
  const [surveyForm, setSurveyForm] = useState({
    title: "",
    description: "",
    campaign_id: "",
    questions: [{ question: "", type: "radio", options: ["Yes", "No"] }]
  });
  const [campaigns, setCampaigns] = useState([]);

  useEffect(() => {
    fetchSurveys();
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const { data } = await supabase
        .from("campaigns")
        .select("id, title")
        .in("status", ["published", "approved"])
        .order("created_at", { ascending: false });
      
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

  const fetchSurveys = async () => {
    setFetching(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from("surveys")
          .select("*, campaigns(title)")
          .eq("created_by", user.id)
          .order("created_at", { ascending: false });
        
        if (error) throw error;
        setSurveys(data || []);
      }
    } catch (err) {
      console.error("Failed to fetch surveys:", err);
    } finally {
      setFetching(false);
    }
  };

  const addQuestion = () => {
    setSurveyForm(prev => ({
      ...prev,
      questions: [...prev.questions, { question: "", type: "radio", options: ["Yes", "No"] }]
    }));
  };

  const removeQuestion = (index) => {
    setSurveyForm(prev => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index)
    }));
  };

  const updateQuestion = (index, field, value) => {
    setSurveyForm(prev => ({
      ...prev,
      questions: prev.questions.map((q, i) => 
        i === index ? { ...q, [field]: value } : q
      )
    }));
  };

  const createSurvey = async () => {
    if (!surveyForm.title || surveyForm.questions.length === 0) {
      alert("Please provide a title and at least one question");
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase.from("surveys").insert({
        title: surveyForm.title,
        description: surveyForm.description,
        campaign_id: surveyForm.campaign_id || null,
        created_by: user?.id,
        status: "draft",
        questions: surveyForm.questions
      });

      if (error) throw error;

      closeSurveyDialog();
      await fetchSurveys();
      alert("Survey created successfully!");
    } catch (err) {
      console.error("Error creating survey:", err);
      alert("Failed to create survey");
    }
  };

  const submitSurvey = async (id) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from("surveys")
        .update({ status: "pending_approval", admin_notes: null })
        .eq("id", id);

      if (error) throw error;
      setSurveys((prev) => prev.map((s) => s.id === id ? { ...s, status: "pending_approval", admin_notes: null } : s));
    } catch (err) {
      console.error("Failed to submit survey:", err);
    } finally {
      setLoading(false);
    }
  };

  const editSurvey = (survey) => {
    setEditingSurvey(survey);
    setSurveyForm({
      title: survey.title,
      description: survey.description,
      campaign_id: survey.campaign_id || "",
      questions: survey.questions || [{ question: "", type: "radio", options: ["Yes", "No"] }]
    });
    setSurveyDialogOpen(true);
  };

  const updateSurvey = async () => {
    if (!surveyForm.title || surveyForm.questions.length === 0) {
      alert("Please provide a title and at least one question");
      return;
    }

    try {
      const { error } = await supabase
        .from("surveys")
        .update({
          title: surveyForm.title,
          description: surveyForm.description,
          campaign_id: surveyForm.campaign_id || null,
          questions: surveyForm.questions
        })
        .eq("id", editingSurvey.id);

      if (error) throw error;

      setSurveyDialogOpen(false);
      setEditingSurvey(null);
      setSurveyForm({
        title: "",
        description: "",
        campaign_id: "",
        questions: [{ question: "", type: "rating" }]
      });
      await fetchSurveys();
      alert("Survey updated successfully!");
    } catch (err) {
      console.error("Error updating survey:", err);
      alert("Failed to update survey");
    }
  };

  const closeSurveyDialog = () => {
    setSurveyDialogOpen(false);
    setEditingSurvey(null);
    setSurveyForm({
      title: "",
      description: "",
      campaign_id: "",
      questions: [{ question: "", type: "radio", options: ["Yes", "No"] }]
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold flex items-center gap-2">
            <ClipboardList className="h-6 w-6 text-primary" /> Survey Management
          </h1>
          <p className="text-muted-foreground text-sm">
            Create surveys and submit them for admin approval and publishing.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchSurveys} disabled={fetching}>
            {fetching ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-1" />}
            {fetching ? "" : "Refresh"}
          </Button>
          <Dialog open={surveyDialogOpen} onOpenChange={closeSurveyDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-1" /> Create Survey
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingSurvey ? "Edit Survey" : "Create New Survey"}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div className="space-y-2">
                  <Label>Survey Title</Label>
                  <Input
                    value={surveyForm.title}
                    onChange={(e) => setSurveyForm({ ...surveyForm, title: e.target.value })}
                    placeholder="e.g., Fire Safety Campaign Feedback"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={surveyForm.description}
                    onChange={(e) => setSurveyForm({ ...surveyForm, description: e.target.value })}
                    placeholder="Describe the purpose of this survey..."
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Related Campaign (Optional)</Label>
                  <Select value={surveyForm.campaign_id} onValueChange={(v) => setSurveyForm({ ...surveyForm, campaign_id: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a campaign (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">No campaign</SelectItem>
                      {campaigns.map((c) => (
                        <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Questions</Label>
                    <Button variant="outline" size="sm" onClick={addQuestion}>
                      <Plus className="h-4 w-4 mr-1" /> Add Question
                    </Button>
                  </div>
                  {surveyForm.questions.map((q, index) => (
                    <div key={index} className="border rounded-md p-3 space-y-3">
                      <div className="flex gap-2 items-start">
                        <div className="flex-1 space-y-2">
                          <Input
                            value={q.question}
                            onChange={(e) => updateQuestion(index, "question", e.target.value)}
                            placeholder={`Question ${index + 1}`}
                          />
                          <Select
                            value={q.type}
                            onValueChange={(v) => updateQuestion(index, "type", v)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="radio">Multiple Choice</SelectItem>
                              <SelectItem value="text">Text Answer</SelectItem>
                              <SelectItem value="scale">Rating (1-5)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        {surveyForm.questions.length > 1 && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeQuestion(index)}
                          >
                            ×
                          </Button>
                        )}
                      </div>
                      
                      {q.type === "radio" && (
                        <div className="space-y-2">
                          <Label className="text-sm">Options (comma-separated)</Label>
                          <Input
                            value={q.options?.join(", ") || ""}
                            onChange={(e) => updateQuestion(index, "options", e.target.value.split(", ").filter(opt => opt.trim()))}
                            placeholder="e.g., Always, Sometimes, Rarely"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={closeSurveyDialog}>Cancel</Button>
                <Button onClick={editingSurvey ? updateSurvey : createSurvey}>
                  {editingSurvey ? "Update Survey" : "Create Draft"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {fetching ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
          <span className="text-muted-foreground text-sm">Loading surveys...</span>
        </div>
      ) : surveys.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <ClipboardList className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p className="font-medium">No surveys created yet.</p>
          <p className="text-sm mt-1">Create a survey to gather resident feedback.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {surveys.map((survey) => {
            const meta = statusMeta[survey.status] || statusMeta.draft;
            const Icon = meta.icon;
            const canSubmit = survey.status === "draft" || survey.status === "rejected";
            const isRejected = survey.status === "rejected";

            return (
              <Card key={survey.id} className={isRejected ? "border-red-300 bg-red-50/30" : ""}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <Badge variant={meta.variant} className="w-fit mb-1 gap-1">
                        <Icon className="h-3 w-3" /> {meta.label}
                      </Badge>
                      <CardTitle className="text-base">{survey.title}</CardTitle>
                      <CardDescription className="line-clamp-2">{survey.description}</CardDescription>
                    </div>
                    {(survey.status === 'draft' || survey.status === 'rejected') && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => editSurvey(survey)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  
                  {survey.campaigns && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Campaign: {survey.campaigns.title}
                    </p>
                  )}

                  {/* Admin comment box for rejected surveys */}
                  {isRejected && survey.admin_notes && (
                    <div className="mt-3 flex gap-2 items-start rounded-md border border-red-300 bg-red-50 p-3">
                      <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-red-500" />
                      <div>
                        <p className="text-xs font-semibold text-red-800 mb-0.5">Admin Comment:</p>
                        <p className="text-sm text-red-900">&ldquo;{survey.admin_notes}&rdquo;</p>
                        <p className="text-xs text-red-600 mt-1">
                          Please edit the survey before resubmitting.
                        </p>
                      </div>
                    </div>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      <span>{survey.questions?.length || 0} questions</span>
                    </div>
                    <span>•</span>
                    <span>{new Date(survey.created_at).toLocaleDateString()}</span>
                  </div>
                </CardContent>
                <CardFooter>
                  {canSubmit ? (
                    <Button
                      onClick={() => submitSurvey(survey.id)}
                      disabled={loading}
                      className="w-full"
                    >
                      {loading ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Send className="h-4 w-4 mr-1" />}
                      {isRejected ? "Resubmit for Review" : "Submit for Review"}
                    </Button>
                  ) : (
                    <Button variant="outline" className="w-full" disabled>
                      {survey.status === "pending_approval"
                        ? "Awaiting Admin Decision"
                        : survey.status === "published"
                        ? "Published"
                        : survey.status === "rejected"
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