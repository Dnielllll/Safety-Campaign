import React, { useState, useEffect } from "react";
import { MessageSquareText, Reply, RefreshCw, Loader2, ClipboardList, Plus, User, CheckCircle2, XCircle, AlertTriangle, Edit } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { supabaseHelpers } from "@/lib/supabase.js";
import { supabase } from "@/lib/supabase";

const typeVariant = { comment: "secondary", suggestion: "success", complaint: "destructive", concern: "warning" };

const initialFeedback = [
  { id: 1, resident: "Ana Reyes", type: "suggestion", message: "Maybe add a Tagalog voice option for the announcements.", status: "new" },
  { id: 2, resident: "Liza Cruz", type: "complaint", message: "I didn't receive the SMS alert about the flood advisory.", status: "new" },
];

export default function FeedbackManagement() {
  const [feedback, setFeedback] = useState(initialFeedback);
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [respondingTo, setRespondingTo] = useState(null);
  
  // Survey states
  const [surveys, setSurveys] = useState([]);
  const [surveyResponses, setSurveyResponses] = useState([]);
  const [surveyDialogOpen, setSurveyDialogOpen] = useState(false);
  const [editingSurvey, setEditingSurvey] = useState(null);
  const [surveyForm, setSurveyForm] = useState({
    title: "",
    description: "",
    campaign_id: "",
    questions: [{ question: "", type: "radio", options: ["Yes", "No"] }]
  });
  const [surveyLoading, setSurveyLoading] = useState(false);
  const [campaigns, setCampaigns] = useState([]);

  useEffect(() => {
    fetchFeedback();
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

  const fetchSurveys = async () => {
    setSurveyLoading(true);
    try {
      const { data, error } = await supabase
        .from("surveys")
        .select("*, users(name), campaigns(title)")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      setSurveys(data || []);
      
      // Fetch responses for each survey
      if (data && data.length > 0) {
        const surveyIds = data.map(s => s.id);
        const { data: responses } = await supabase
          .from("survey_responses")
          .select("*, survey_id, users(name)")
          .in("survey_id", surveyIds);
        
        setSurveyResponses(responses || []);
      }
    } catch (err) {
      console.error("Error fetching surveys:", err);
    } finally {
      setSurveyLoading(false);
    }
  };

  const fetchFeedback = async () => {
    setLoading(true);
    try {
      const { data } = await supabaseHelpers.getFeedback();
      if (data) {
        const parsedItems = data.map(f => {
          let type = "comment";
          let message = f.comment || "";
          
          const match = message.match(/^\[(.*?)\] (.*?)\n\n([\s\S]*)$/);
          if (match) {
            type = match[1].toLowerCase().includes("suggestion") ? "suggestion" : 
                   match[1].toLowerCase().includes("complaint") ? "complaint" :
                   match[1].toLowerCase().includes("concern") ? "concern" : "comment";
            message = `Subject: ${match[2]}\n\n${match[3]}`;
          }
          
          return {
            id: f.id,
            resident: f.users?.name || 'Resident',
            type,
            message,
            status: f.status || "new",
            response: f.response || ""
          };
        });
        
        setFeedback([...parsedItems, ...initialFeedback]);
      }
    } catch (err) {
      console.error("Error fetching feedback", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchFeedback(), fetchSurveys()]);
    setRefreshing(false);
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

  const respond = async (id) => {
    try {
      if (typeof id === 'string') {
        const { error } = await supabaseHelpers.respondToFeedback(id, { response, status: 'responded' });
        if (error) {
          console.error("Failed to respond in Supabase:", error);
          alert("Error saving response to database. See console for details.");
          return;
        }
      }
      
      setFeedback((f) => f.map((x) => (x.id === id ? { ...x, status: "responded", response } : x)));
      setResponse("");
      setRespondingTo(null);
    } catch (err) {
      console.error("Unexpected error saving response:", err);
      alert("Unexpected error. Check console.");
    }
  };

  const approveSurvey = async (surveyId) => {
    try {
      const { error } = await supabase
        .from("surveys")
        .update({ 
          status: "published",
          published_at: new Date().toISOString(),
          admin_notes: null
        })
        .eq("id", surveyId);

      if (error) throw error;
      await fetchSurveys();
      alert("Survey approved and published successfully!");
    } catch (err) {
      console.error("Error approving survey:", err);
      alert("Failed to approve survey");
    }
  };

  const rejectSurvey = async (surveyId, notes) => {
    try {
      const { error } = await supabase
        .from("surveys")
        .update({ 
          status: "rejected",
          admin_notes: notes
        })
        .eq("id", surveyId);

      if (error) throw error;
      await fetchSurveys();
      alert("Survey rejected. Staff will be notified.");
    } catch (err) {
      console.error("Error rejecting survey:", err);
      alert("Failed to reject survey");
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-xl sm:text-2xl font-bold flex items-center gap-2">
            <MessageSquareText className="h-5 w-5 sm:h-6 sm:w-6 text-primary" /> Feedback & Surveys
          </h1>
          <p className="text-muted-foreground text-xs sm:text-sm">Review resident feedback, complaints, suggestions, and survey responses.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
          <Button variant="outline" onClick={handleRefresh} disabled={refreshing} className="w-full sm:w-auto">
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Dialog open={surveyDialogOpen} onOpenChange={closeSurveyDialog}>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto">
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

      <Tabs defaultValue="feedback" className="space-y-4">
        <TabsList>
          <TabsTrigger value="feedback"><MessageSquareText className="h-4 w-4 mr-2" /> Feedback Messages</TabsTrigger>
          <TabsTrigger value="surveys"><ClipboardList className="h-4 w-4 mr-2" /> Survey Results</TabsTrigger>
        </TabsList>

        <TabsContent value="feedback">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="space-y-3">
              {feedback.map((f) => (
                <Card key={f.id}>
                  <CardContent className="p-4 flex items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium text-sm">{f.resident}</p>
                        <Badge variant={typeVariant[f.type] || "secondary"}>{f.type}</Badge>
                        {f.status === "responded" && <Badge variant="outline">Responded</Badge>}
                      </div>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">{f.message}</p>
                      
                      {f.status === "responded" && f.response && (
                        <div className="mt-3 p-3 bg-muted/50 rounded-md border text-sm">
                          <span className="font-semibold text-primary block mb-1">Your Response:</span>
                          {f.response}
                        </div>
                      )}
                    </div>
                    
                    {f.status !== "responded" && (
                      <Dialog open={respondingTo === f.id} onOpenChange={(open) => setRespondingTo(open ? f.id : null)}>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm"><Reply className="h-4 w-4 mr-1" /> Respond</Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader><DialogTitle>Respond to {f.resident}</DialogTitle></DialogHeader>
                          <p className="text-sm text-muted-foreground whitespace-pre-wrap">"{f.message}"</p>
                          <Textarea 
                            rows={4} 
                            placeholder="Write your response…" 
                            value={response} 
                            onChange={(e) => setResponse(e.target.value)} 
                          />
                          <DialogFooter>
                            <Button onClick={() => respond(f.id)} disabled={!response.trim()}>Send Response</Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    )}
                  </CardContent>
                </Card>
              ))}
              {feedback.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  No feedback found.
                </div>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="surveys">
          {surveyLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="space-y-4">
              {surveys.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <ClipboardList className="h-10 w-10 mx-auto mb-2 opacity-30" />
                  <p className="font-medium">No surveys created yet.</p>
                  <p className="text-xs mt-1">Create a survey to gather resident feedback.</p>
                </div>
              ) : (
                surveys.map((survey) => {
                  const responses = surveyResponses.filter(r => r.survey_id === survey.id);
                  const avgScore = responses.length > 0 && responses.some(r => r.score)
                    ? (responses.filter(r => r.score).reduce((sum, r) => sum + r.score, 0) / responses.filter(r => r.score).length).toFixed(1)
                    : null;
                  
                  const statusVariant = {
                    draft: 'outline',
                    pending_approval: 'warning',
                    published: 'success',
                    rejected: 'destructive',
                    archived: 'secondary'
                  }[survey.status] || 'secondary';

                  const isPending = survey.status === 'pending_approval';
                  const isRejected = survey.status === 'rejected';

                  return (
                    <Card key={survey.id} className={isPending ? "border-amber-300 bg-amber-50/30" : isRejected ? "border-red-300 bg-red-50/30" : ""}>
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <CardTitle className="text-base">{survey.title}</CardTitle>
                            <p className="text-sm text-muted-foreground mt-1">{survey.description}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={statusVariant}>
                              {survey.status.replace('_', ' ')}
                            </Badge>
                            {(survey.status === 'draft' || survey.status === 'pending_approval' || survey.status === 'rejected') && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => editSurvey(survey)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                          <User className="h-3 w-3" />
                          Created by: {survey.users?.name || 'Staff'}
                          {survey.campaigns && (
                            <span>• Campaign: {survey.campaigns.title}</span>
                          )}
                        </div>
                        {isRejected && survey.admin_notes && (
                          <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-md text-xs">
                            <span className="font-semibold text-red-800">Admin notes:</span> {survey.admin_notes}
                          </div>
                        )}
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          <div className="text-center p-3 bg-muted/50 rounded-md">
                            <p className="text-2xl font-bold text-primary">{responses.length}</p>
                            <p className="text-xs text-muted-foreground">Responses</p>
                          </div>
                          {avgScore && (
                            <div className="text-center p-3 bg-muted/50 rounded-md">
                              <p className="text-2xl font-bold text-primary">{avgScore}</p>
                              <p className="text-xs text-muted-foreground">Avg Score</p>
                            </div>
                          )}
                          <div className="text-center p-3 bg-muted/50 rounded-md">
                            <p className="text-2xl font-bold text-primary">{survey.questions?.length || 0}</p>
                            <p className="text-xs text-muted-foreground">Questions</p>
                          </div>
                          <div className="text-center p-3 bg-muted/50 rounded-md">
                            <p className="text-xs text-muted-foreground">
                              {new Date(survey.created_at).toLocaleDateString()}
                            </p>
                            <p className="text-xs text-muted-foreground">Created</p>
                          </div>
                        </div>
                        {responses.length > 0 && (
                          <div className="space-y-2">
                            <p className="text-sm font-semibold">Recent Responses:</p>
                            {responses.slice(0, 3).map((response) => (
                              <div key={response.id} className="p-3 bg-muted/30 rounded-md text-sm">
                                <div className="flex justify-between items-center mb-1">
                                  <span className="font-medium">{response.users?.name || 'Resident'}</span>
                                  {response.score && (
                                    <Badge variant="outline">{response.score}/5</Badge>
                                  )}
                                </div>
                                {response.comments && (
                                  <p className="text-muted-foreground text-xs">{response.comments}</p>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                      {isPending && (
                        <CardFooter className="flex gap-2">
                          <Button 
                            onClick={() => approveSurvey(survey.id)}
                            className="flex-1"
                          >
                            <CheckCircle2 className="h-4 w-4 mr-1" />
                            Approve & Publish
                          </Button>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="destructive" className="flex-1">
                                <XCircle className="h-4 w-4 mr-1" />
                                Reject
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Reject Survey</DialogTitle>
                              </DialogHeader>
                              <p className="text-sm text-muted-foreground">
                                Please provide feedback for the staff member about why this survey was rejected.
                              </p>
                              <Textarea 
                                placeholder="Enter your feedback..."
                                id={`reject-notes-${survey.id}`}
                              />
                              <DialogFooter>
                                <DialogTrigger asChild>
                                  <Button variant="outline">Cancel</Button>
                                </DialogTrigger>
                                <Button 
                                  onClick={() => {
                                    const notes = document.getElementById(`reject-notes-${survey.id}`).value;
                                    if (notes.trim()) {
                                      rejectSurvey(survey.id, notes);
                                    } else {
                                      alert("Please provide feedback for rejection");
                                    }
                                  }}
                                >
                                  Reject Survey
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </CardFooter>
                      )}
                    </Card>
                  );
                })
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
