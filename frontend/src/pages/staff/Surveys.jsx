import React, { useState, useEffect } from "react";
import { ClipboardList, Plus, Send, Clock, CheckCircle2, XCircle, MessageSquare, Loader2, AlertTriangle, RefreshCw, User, Edit, X } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
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
  const [surveyResponses, setSurveyResponses] = useState([]);
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
  const [activeTab, setActiveTab] = useState("surveys");

  useEffect(() => {
    fetchSurveys();
    fetchCampaigns();
    fetchSurveyResponses();
  }, []);

  useEffect(() => {
    if (activeTab === "responses") {
      fetchSurveyResponses();
    }
  }, [activeTab]);

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

  const calculateScore = (responseData) => {
    if (!responseData || typeof responseData !== 'object') return 0;
    
    let totalScore = 0;
    let maxScore = 0;
    
    Object.values(responseData).forEach((answer) => {
      // If answer is a number (rating), add it to total
      if (typeof answer === 'number') {
        totalScore += answer;
        maxScore += 5; // Assuming max rating is 5
      } 
      // If answer is a positive response (like "Yes"), give full points
      else if (typeof answer === 'string') {
        const positiveResponses = ['Yes', 'Always', 'Very aware', 'Regularly'];
        if (positiveResponses.some(response => answer.toLowerCase().includes(response.toLowerCase()))) {
          totalScore += 2;
          maxScore += 2;
        } else {
          maxScore += 2;
        }
      }
    });
    
    // Normalize to 10-point scale
    if (maxScore > 0) {
      return Math.round((totalScore / maxScore) * 10);
    }
    return 0;
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
        
        // Fetch questions for each survey
        const surveysWithQuestions = await Promise.all(
          (data || []).map(async (survey) => {
            const { data: questions } = await supabase
              .from("survey_questions")
              .select("*")
              .eq("survey_id", survey.id)
              .order("order_index", { ascending: true });
            
            // Convert questions back to the frontend format
            const formattedQuestions = (questions || []).map(q => ({
              question: q.question_text,
              type: q.question_type === 'multiple_choice' ? 'radio' : q.question_type === 'rating' ? 'scale' : q.question_type,
              options: q.options || []
            }));
            
            return {
              ...survey,
              questions: formattedQuestions
            };
          })
        );
        
        setSurveys(surveysWithQuestions);
      }
    } catch (err) {
      console.error("Failed to fetch surveys:", err);
    } finally {
      setFetching(false);
    }
  };

  const fetchSurveyResponses = async () => {
    try {
      // Get all published surveys (not just staff's own surveys)
      const { data: publishedSurveys } = await supabase
        .from("surveys")
        .select("id, title, created_at")
        .eq("status", "published");
      
      if (publishedSurveys && publishedSurveys.length > 0) {
        const surveyIds = publishedSurveys.map(s => s.id);
        
        // Fetch all responses for published surveys
        let query = supabase
          .from("survey_responses")
          .select("*, survey_id");
        
        // Use .in() for multiple surveys, .eq() for single survey
        if (surveyIds.length === 1) {
          query = query.eq("survey_id", surveyIds[0]);
        } else {
          query = query.in("survey_id", surveyIds);
        }
        
        const { data: responses } = await query.order("submitted_at", { ascending: false });
        
        // Merge survey information with responses
        const responsesWithSurveyInfo = (responses || []).map(response => {
          const survey = publishedSurveys.find(s => s.id === response.survey_id);
          return {
            ...response,
            survey_title: survey?.title || 'Unknown Survey',
            survey_created_at: survey?.created_at,
            // Map submitted_at to created_at for compatibility with existing code
            created_at: response.submitted_at
          };
        });
        
        setSurveyResponses(responsesWithSurveyInfo);
      } else {
        setSurveyResponses([]);
      }
    } catch (err) {
      console.error("Failed to fetch survey responses:", err);
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

  const addOption = (questionIndex) => {
    setSurveyForm(prev => ({
      ...prev,
      questions: prev.questions.map((q, i) => 
        i === questionIndex ? { ...q, options: [...(q.options || []), ""] } : q
      )
    }));
  };

  const removeOption = (questionIndex, optionIndex) => {
    setSurveyForm(prev => ({
      ...prev,
      questions: prev.questions.map((q, i) => 
        i === questionIndex ? { ...q, options: q.options.filter((_, optIdx) => optIdx !== optionIndex) } : q
      )
    }));
  };

  const updateOption = (questionIndex, optionIndex, value) => {
    setSurveyForm(prev => ({
      ...prev,
      questions: prev.questions.map((q, i) => 
        i === questionIndex ? { ...q, options: q.options.map((opt, optIdx) => optIdx === optionIndex ? value : opt) } : q
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
      
      if (!user?.id) {
        throw new Error("User not authenticated");
      }
      
      console.log("Creating survey with data:", {
        title: surveyForm.title,
        description: surveyForm.description,
        campaign_id: surveyForm.campaign_id || null,
        created_by: user.id,
        status: "draft"
      });
      
      // Prepare survey data - ensure campaign_id is null if empty
      const surveyDataToInsert = {
        title: surveyForm.title,
        description: surveyForm.description || null,
        created_by: user.id,
        status: "draft"
      };
      
      // Only add campaign_id if it's not empty
      if (surveyForm.campaign_id && surveyForm.campaign_id !== "") {
        surveyDataToInsert.campaign_id = surveyForm.campaign_id;
      }
      
      // First create the survey without questions
      const { data: surveyData, error: surveyError } = await supabase.from("surveys").insert(surveyDataToInsert).select().single();

      if (surveyError) {
        console.error("Survey creation error:", surveyError);
        throw surveyError;
      }

      // Then create the survey questions
      const questionsData = surveyForm.questions.map((q, index) => ({
        survey_id: surveyData.id,
        question_text: q.question,
        question_type: q.type === 'radio' ? 'multiple_choice' : q.type === 'scale' ? 'rating' : q.type === 'text' ? 'text' : 'text',
        options: q.type === 'radio' ? q.options : null,
        order_index: index,
        required: true
      }));

      const { error: questionsError } = await supabase.from("survey_questions").insert(questionsData);

      if (questionsError) {
        console.error("Questions creation error:", questionsError);
        throw questionsError;
      }

      closeSurveyDialog();
      await fetchSurveys();
      alert("Survey draft created successfully! You can submit it for approval when ready.");
    } catch (err) {
      console.error("Error creating survey:", err);
      alert("Failed to create survey: " + err.message);
    }
  };

  const submitSurvey = async (id) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from("surveys")
        .update({ status: "pending_approval" })
        .eq("id", id);

      if (error) throw error;
      setSurveys((prev) => prev.map((s) => s.id === id ? { ...s, status: "pending_approval" } : s));
    } catch (err) {
      console.error("Failed to submit survey:", err);
    } finally {
      setLoading(false);
    }
  };

  const editSurvey = async (survey) => {
    setEditingSurvey(survey);
    
    // Fetch questions for this survey
    const { data: questions } = await supabase
      .from("survey_questions")
      .select("*")
      .eq("survey_id", survey.id)
      .order("order_index", { ascending: true });
    
    // Convert questions to frontend format
    const formattedQuestions = (questions || []).map(q => ({
      question: q.question_text,
      type: q.question_type === 'multiple_choice' ? 'radio' : q.question_type === 'rating' ? 'scale' : q.question_type,
      options: q.options || []
    }));
    
    setSurveyForm({
      title: survey.title,
      description: survey.description,
      campaign_id: survey.campaign_id || "",
      questions: formattedQuestions.length > 0 ? formattedQuestions : [{ question: "", type: "radio", options: ["Yes", "No"] }]
    });
    setSurveyDialogOpen(true);
  };

  const updateSurvey = async () => {
    if (!surveyForm.title || surveyForm.questions.length === 0) {
      alert("Please provide a title and at least one question");
      return;
    }

    try {
      // Prepare survey data
      const surveyDataToUpdate = {
        title: surveyForm.title,
        description: surveyForm.description || null,
        status: "draft"
      };
      
      // Only add campaign_id if it's not empty
      if (surveyForm.campaign_id && surveyForm.campaign_id !== "") {
        surveyDataToUpdate.campaign_id = surveyForm.campaign_id;
      }
      
      // Update the survey
      const { error: surveyError } = await supabase
        .from("surveys")
        .update(surveyDataToUpdate)
        .eq("id", editingSurvey.id);

      if (surveyError) throw surveyError;

      // Delete existing questions
      const { error: deleteError } = await supabase
        .from("survey_questions")
        .delete()
        .eq("survey_id", editingSurvey.id);

      if (deleteError) throw deleteError;

      // Insert new questions
      const questionsData = surveyForm.questions.map((q, index) => ({
        survey_id: editingSurvey.id,
        question_text: q.question,
        question_type: q.type === 'radio' ? 'multiple_choice' : q.type === 'scale' ? 'rating' : q.type === 'text' ? 'text' : 'text',
        options: q.type === 'radio' ? q.options : null,
        order_index: index,
        required: true
      }));

      const { error: questionsError } = await supabase.from("survey_questions").insert(questionsData);

      if (questionsError) throw questionsError;

      setSurveyDialogOpen(false);
      setEditingSurvey(null);
      setSurveyForm({
        title: "",
        description: "",
        campaign_id: "",
        questions: [{ question: "", type: "radio", options: ["Yes", "No"] }]
      });
      await fetchSurveys();
      alert("Survey updated successfully!");
    } catch (err) {
      console.error("Error updating survey:", err);
      alert("Failed to update survey");
    }
  };

  const closeSurveyDialog = () => {
    console.log("Closing survey dialog");
    setSurveyDialogOpen(false);
    setTimeout(() => {
      setEditingSurvey(null);
      setSurveyForm({
        title: "",
        description: "",
        campaign_id: "",
        questions: [{ question: "", type: "radio", options: ["Yes", "No"] }]
      });
    }, 300);
  };

  const handleCreateSurveyClick = () => {
    console.log("Create survey button clicked");
    setEditingSurvey(null);
    setSurveyForm({
      title: "",
      description: "",
      campaign_id: "",
      questions: [{ question: "", type: "radio", options: ["Yes", "No"] }]
    });
    setSurveyDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold flex items-center gap-2">
            <ClipboardList className="h-6 w-6 text-primary" /> Survey Management
          </h1>
          <p className="text-muted-foreground text-sm">
            Create surveys and view resident responses.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => { fetchSurveys(); fetchSurveyResponses(); }} disabled={fetching}>
            {fetching ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-1" />}
            {fetching ? "" : "Refresh"}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="surveys" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="surveys"><ClipboardList className="h-4 w-4 mr-2" /> My Surveys</TabsTrigger>
          <TabsTrigger value="responses"><MessageSquare className="h-4 w-4 mr-2" /> Resident Responses</TabsTrigger>
        </TabsList>

        <TabsContent value="surveys">
          <div className="flex justify-end mb-4">
            <Button onClick={handleCreateSurveyClick}>
              <Plus className="h-4 w-4 mr-1" /> Create Survey
            </Button>
          </div>

        <Dialog open={surveyDialogOpen} onOpenChange={setSurveyDialogOpen}>
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
                        <div className="flex items-center justify-between">
                          <Label className="text-sm">Options</Label>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => addOption(index)}
                            className="h-6 text-xs"
                          >
                            <Plus className="h-3 w-3 mr-1" /> Add Option
                          </Button>
                        </div>
                        {(q.options || []).map((option, optIndex) => (
                          <div key={optIndex} className="flex gap-2">
                            <Input
                              value={option}
                              onChange={(e) => updateOption(index, optIndex, e.target.value)}
                              placeholder={`Option ${optIndex + 1}`}
                              className="flex-1"
                            />
                            {(q.options || []).length > 2 && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => removeOption(index, optIndex)}
                                className="h-8 w-8"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        ))}
                        {(q.options || []).length === 0 && (
                          <p className="text-xs text-muted-foreground">Add at least 2 options for multiple choice</p>
                        )}
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
              const hasAdminNotes = survey.admin_notes && survey.admin_notes.trim() !== "";
              const responses = surveyResponses.filter(r => r.survey_id === survey.id);

              return (
                <Card key={survey.id} className={isRejected ? "border-red-300 bg-red-50/30" : hasAdminNotes ? "border-amber-300 bg-amber-50/30" : ""}>
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

                    {/* Admin comment box for surveys with revision requests or rejections */}
                    {hasAdminNotes && (
                      <div className={`mt-3 flex gap-2 items-start rounded-md border p-3 ${isRejected ? "border-red-300 bg-red-50" : "border-amber-300 bg-amber-50"}`}>
                        <AlertTriangle className={`h-4 w-4 shrink-0 mt-0.5 ${isRejected ? "text-red-500" : "text-amber-500"}`} />
                        <div>
                          <p className={`text-xs font-semibold mb-0.5 ${isRejected ? "text-red-800" : "text-amber-800"}`}>
                            {isRejected ? "Admin Comment (Rejected):" : "Admin Comment (Revision Request):"}
                          </p>
                          <p className={`text-sm ${isRejected ? "text-red-900" : "text-amber-900"}`}>&ldquo;{survey.admin_notes}&rdquo;</p>
                          <p className={`text-xs mt-1 ${isRejected ? "text-red-600" : "text-amber-600"}`}>
                            Please edit the survey before resubmitting.
                          </p>
                        </div>
                      </div>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground mb-2">
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        <span>{survey.questions?.length || 0} questions</span>
                      </div>
                      <span>•</span>
                      <span>{new Date(survey.created_at).toLocaleDateString()}</span>
                      <span>•</span>
                      <span>{responses.length} responses</span>
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
                        {hasAdminNotes ? "Resubmit for Review" : "Submit for Review"}
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
        </TabsContent>

        <TabsContent value="responses">
          {surveyResponses.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <MessageSquare className="h-10 w-10 mx-auto mb-2 opacity-30" />
              <p className="font-medium">No resident responses yet.</p>
              <p className="text-xs mt-1">Resident survey responses will appear here.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {surveyResponses.map((response) => {
                return (
                  <Card key={response.id}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline">{response.survey_title}</Badge>
                            <p className="text-xs text-muted-foreground">
                              {new Date(response.submitted_at).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 mb-1">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <p className="font-medium text-sm">Resident</p>
                          </div>
                          {/* Score display */}
                          {response.response_data && (
                            <div className="flex items-center gap-2 mt-2">
                              <span className="text-sm font-medium">Score:</span>
                              <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
                                {calculateScore(response.response_data)}/10
                              </Badge>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {response.response_data && Object.keys(response.response_data).length > 0 && (
                        <div className="p-3 bg-muted/50 rounded-md">
                          <p className="text-sm font-semibold text-primary mb-2">Survey Answers:</p>
                          <div className="space-y-2">
                            {Object.entries(response.response_data).map(([questionIndex, answer]) => (
                              <div key={questionIndex} className="text-sm">
                                <p className="font-medium text-muted-foreground mb-1">
                                  Question {parseInt(questionIndex) + 1}:
                                </p>
                                <p className="text-foreground">{answer}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {response.comments && (
                        <div className="p-3 bg-primary/10 rounded-md border border-primary/20">
                          <p className="text-sm font-semibold text-primary mb-1">Comments:</p>
                          <p className="text-sm text-muted-foreground">{response.comments}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}