import React, { useState, useEffect } from "react";
import { MessageSquareText, Reply, RefreshCw, Loader2, ClipboardList } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
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
  const [allSurveys, setAllSurveys] = useState([]);

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
      
      // Fetch questions for each survey
      const surveysWithQuestions = await Promise.all(
        (data || []).map(async (survey) => {
          const { data: questions } = await supabase
            .from("survey_questions")
            .select("*")
            .eq("survey_id", survey.id)
            .order("order_index", { ascending: true });
          
          return {
            ...survey,
            questions: (questions || []).map(q => ({
              question_text: q.question_text,
              question_type: q.question_type,
              options: q.options
            }))
          };
        })
      );
      
      setSurveys(surveysWithQuestions);
      setAllSurveys(surveysWithQuestions);
      
      // Fetch responses for each survey
      if (data && data.length > 0) {
        const surveyIds = data.map(s => s.id);
        const { data: responses } = await supabase
          .from("survey_responses")
          .select("*, survey_id, users(name), surveys(title)")
          .in("survey_id", surveyIds);
        
        // Map submitted_at to created_at for compatibility with existing code
        const responsesWithCreatedAt = (responses || []).map(response => ({
          ...response,
          created_at: response.submitted_at,
          survey_title: response.surveys?.title || 'Unknown Survey'
        }));
        
        setSurveyResponses(responsesWithCreatedAt);
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



  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-xl sm:text-2xl font-bold flex items-center gap-2">
            <MessageSquareText className="h-5 w-5 sm:h-6 sm:w-6 text-primary" /> Feedback & Survey Management
          </h1>
          <p className="text-muted-foreground text-xs sm:text-sm">Review resident feedback and survey responses.</p>
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
                  const relatedSurvey = allSurveys.find(s => s.id === response.survey_id);
                  return (
                    <Card key={response.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <p className="font-medium text-sm">{response.users?.name || 'Resident'}</p>
                              <Badge variant="outline">{response.survey_title || relatedSurvey?.title || 'Unknown Survey'}</Badge>
                            </div>
                            <p className="text-xs text-muted-foreground mb-2">
                              Responded: {new Date(response.submitted_at).toLocaleDateString()}
                            </p>
                            {response.comments && (
                              <div className="p-3 bg-muted/50 rounded-md mb-2">
                                <p className="text-sm font-semibold text-primary mb-1">Comments:</p>
                                <p className="text-sm text-muted-foreground">{response.comments}</p>
                              </div>
                            )}
                            {response.response_data && Object.keys(response.response_data).length > 0 && (
                              <div className="p-3 bg-muted/50 rounded-md">
                                <p className="text-sm font-semibold text-primary mb-2">Survey Answers:</p>
                                <div className="space-y-2">
                                  {Object.entries(response.response_data).map(([questionIndex, answer]) => {
                                    const question = relatedSurvey?.questions?.[parseInt(questionIndex)];
                                    return (
                                      <div key={questionIndex} className="text-sm">
                                        <p className="font-medium text-muted-foreground mb-1">
                                          Question {parseInt(questionIndex) + 1}: {question?.question_text || 'Unknown question'}
                                        </p>
                                        <p className="text-foreground font-semibold">{answer}</p>
                                      </div>
                                    );
                                  })}
                                </div>
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
    </div>
  );
}
