import React, { useState, useEffect } from "react";
import { MessageSquareText, Reply, RefreshCw, Loader2, ClipboardList, User, CheckCircle2, XCircle, AlertTriangle, Edit } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
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
  const [surveyLoading, setSurveyLoading] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(null);

  useEffect(() => {
    fetchFeedback();
    fetchSurveys();
  }, []);

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
      alert("Survey rejected with feedback. Staff will be notified to make revisions.");
    } catch (err) {
      console.error("Error rejecting survey:", err);
      alert("Failed to reject survey");
    }
  };



  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-xl sm:text-2xl font-bold flex items-center gap-2">
            <MessageSquareText className="h-5 w-5 sm:h-6 sm:w-6 text-primary" /> Feedback & Survey Management
          </h1>
          <p className="text-muted-foreground text-xs sm:text-sm">Review resident feedback, survey responses, and approve/reject staff-created surveys.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
          <Button variant="outline" onClick={handleRefresh} disabled={refreshing} className="w-full sm:w-auto">
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      <Tabs defaultValue="feedback" className="space-y-4">
        <TabsList>
          <TabsTrigger value="feedback"><MessageSquareText className="h-4 w-4 mr-2" /> Feedback Messages</TabsTrigger>
          <TabsTrigger value="survey-results"><ClipboardList className="h-4 w-4 mr-2" /> Survey Feedback</TabsTrigger>
          <TabsTrigger value="surveys"><ClipboardList className="h-4 w-4 mr-2" /> Survey Approval</TabsTrigger>
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
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setRespondingTo(f.id)}
                      >
                        <Reply className="h-4 w-4 mr-1" /> Respond
                      </Button>
                    )}

                    {respondingTo === f.id && (
                      <Dialog open={respondingTo === f.id} onOpenChange={(open) => !open && setRespondingTo(null)}>
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
                            <Button variant="outline" onClick={() => setRespondingTo(null)}>Cancel</Button>
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
                  <p className="font-medium">No surveys pending approval.</p>
                  <p className="text-xs mt-1">Staff-created surveys awaiting review will appear here.</p>
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
                            <p className="text-sm font-semibold">Response Summary:</p>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <div className="p-2 bg-muted/30 rounded">
                                <span className="font-medium">Total Responses:</span> {responses.length}
                              </div>
                              {avgScore && (
                                <div className="p-2 bg-muted/30 rounded">
                                  <span className="font-medium">Average Score:</span> {avgScore}/5
                                </div>
                              )}
                            </div>
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
                          <Button 
                            variant="destructive" 
                            className="flex-1"
                            onClick={() => setRejectDialogOpen(survey.id)}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                        </CardFooter>
                      )}
                    </Card>
                  );
                })
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="survey-results">
          {surveyLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="space-y-3">
              {surveyResponses.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <ClipboardList className="h-10 w-10 mx-auto mb-2 opacity-30" />
                  <p className="font-medium">No survey responses yet.</p>
                  <p className="text-xs mt-1">Resident survey responses will appear here.</p>
                </div>
              ) : (
                surveyResponses.map((response) => {
                  const relatedSurvey = surveys.find(s => s.id === response.survey_id);
                  return (
                    <Card key={response.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <p className="font-medium text-sm">{response.users?.name || 'Resident'}</p>
                              <Badge variant="outline">{relatedSurvey?.title || 'Unknown Survey'}</Badge>
                              {response.score && (
                                <Badge variant="secondary">{response.score}/5</Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground mb-2">
                              Responded: {new Date(response.created_at).toLocaleDateString()}
                            </p>
                            {response.comments && (
                              <div className="p-3 bg-muted/50 rounded-md mb-2">
                                <p className="text-sm font-semibold text-primary mb-1">Comments:</p>
                                <p className="text-sm text-muted-foreground">{response.comments}</p>
                              </div>
                            )}
                            {response.answers && (
                              <div className="p-3 bg-muted/50 rounded-md">
                                <p className="text-sm font-semibold text-primary mb-1">Survey Answers:</p>
                                <pre className="text-xs text-muted-foreground whitespace-pre-wrap">{JSON.stringify(response.answers, null, 2)}</pre>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {rejectDialogOpen && (
        <Dialog open={!!rejectDialogOpen} onOpenChange={(open) => !open && setRejectDialogOpen(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reject Survey</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-muted-foreground">
              Please provide feedback for the staff member about why this survey was rejected and what revisions are needed.
            </p>
            <Textarea 
              placeholder="Enter your feedback and revision requirements..."
              id={`reject-notes-${rejectDialogOpen}`}
            />
            <DialogFooter>
              <Button variant="outline" onClick={() => setRejectDialogOpen(null)}>Cancel</Button>
              <Button 
                onClick={() => {
                  const notes = document.getElementById(`reject-notes-${rejectDialogOpen}`).value;
                  if (notes.trim()) {
                    rejectSurvey(rejectDialogOpen, notes);
                    setRejectDialogOpen(null);
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
      )}
    </div>
  );
}
