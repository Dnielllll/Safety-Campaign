import React, { useState, useEffect } from "react";
import { MessageSquare, Send, CheckCircle2, Star, Clock, Reply } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabaseHelpers } from "@/lib/supabase.js";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "@/components/ThemeProvider.jsx";

const feedbackTypes = ["General Comment", "Suggestion", "Complaint", "Concern", "Compliment"];

export default function Feedback() {
  const { resetTheme } = useTheme();
  const [form, setForm] = useState({ subject: "", type: "General Comment", message: "", rating: 0 });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [history, setHistory] = useState([]);
  const [fetchingHistory, setFetchingHistory] = useState(true);

  // Force light mode for public pages
  useEffect(() => {
    resetTheme();
  }, [resetTheme]);

  useEffect(() => {
    fetchMyFeedback();
  }, [submitted]);

  const fetchMyFeedback = async () => {
    setFetchingHistory(true);
    try {
      const { user } = await supabaseHelpers.getAuthUser();
      if (user) {
        const { data } = await supabaseHelpers.getFeedback({ user_id: user.id });
        setHistory(data || []);
      }
    } catch (err) {
      console.error("Failed to load history", err);
    } finally {
      setFetchingHistory(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { user } = await supabaseHelpers.getAuthUser();
      const formattedComment = `[${form.type}] ${form.subject}\n\n${form.message}`;
      
      const { error: submitError } = await supabaseHelpers.createFeedback({ 
        comment: formattedComment, 
        rating: form.rating || 3,
        user_id: user?.id
      });
      
      if (submitError) throw submitError;
      setSubmitted(true);
    } catch (err) {
      setError(err.message || "Failed to submit feedback.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-8 max-w-2xl">
      <div className="mb-6">
        <h1 className="font-display text-xl sm:text-2xl font-bold flex items-center gap-2">
          <MessageSquare className="h-5 w-5 sm:h-6 sm:w-6 text-primary" /> Submit Feedback
        </h1>
        <p className="text-muted-foreground text-xs sm:text-sm mt-1">
          Share your comments, suggestions, concerns, or complaints about public safety campaigns and barangay services.
        </p>
      </div>

      {submitted ? (
        <Card className="mb-8 py-8">
          <div className="text-center max-w-sm mx-auto">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="h-8 w-8 text-primary" />
            </div>
            <h2 className="font-display text-xl font-bold mb-2">Thank you for your feedback!</h2>
            <p className="text-muted-foreground text-sm mb-4">
              Your feedback has been received. The barangay officials will review it and respond if necessary.
            </p>
            <Button onClick={() => { setSubmitted(false); setForm({ subject: "", type: "General Comment", message: "", rating: 0 }); }}>
              Submit another
            </Button>
          </div>
        </Card>
      ) : (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-base">Your Feedback</CardTitle>
            <CardDescription>All feedback is reviewed by barangay officials. Your input helps improve our community services.</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="feedback-type">Feedback Type</Label>
              <select
                id="feedback-type"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
              >
                {feedbackTypes.map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="feedback-subject">Subject</Label>
              <Input
                id="feedback-subject"
                placeholder="Brief description of your feedback"
                required
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="feedback-message">Message</Label>
              <Textarea
                id="feedback-message"
                placeholder="Provide detailed feedback…"
                rows={5}
                required
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Overall Rating (Optional)</Label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setForm({ ...form, rating: star })}
                    className="transition-transform hover:scale-110"
                  >
                    <Star
                      className={`h-6 w-6 ${form.rating >= star ? "fill-primary text-primary" : "text-muted-foreground"}`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={loading}>
              <Send className="h-4 w-4 mr-2" />
              {loading ? "Submitting…" : "Submit Feedback"}
            </Button>
          </CardFooter>
        </form>
      </Card>
      )}

      <div className="mb-4">
        <h2 className="font-display text-xl font-bold flex items-center gap-2">
          <Clock className="h-5 w-5 text-muted-foreground" /> My Feedback History
        </h2>
      </div>

      {fetchingHistory ? (
        <div className="text-center py-4 text-muted-foreground text-sm">Loading history...</div>
      ) : history.length === 0 ? (
        <div className="text-center py-4 text-muted-foreground text-sm border rounded-lg border-dashed">
          You haven't submitted any feedback yet.
        </div>
      ) : (
        <div className="space-y-4">
          {history.map((item) => {
            const isResponded = item.status === "responded" || item.response;
            return (
              <Card key={item.id} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant={isResponded ? "success" : "secondary"}>
                      {isResponded ? "Responded" : "Sent to Admin"}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(item.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm font-medium mb-1 line-clamp-1">{item.comment.split('\n')[0]}</p>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{item.comment.substring(item.comment.indexOf('\n') + 2)}</p>
                  
                  {isResponded && item.response && (
                    <div className="mt-4 p-3 bg-muted/50 rounded-md border border-primary/20">
                      <div className="flex items-center gap-2 mb-1 text-primary">
                        <Reply className="h-4 w-4" />
                        <span className="text-xs font-bold">Admin Response</span>
                      </div>
                      <p className="text-sm text-foreground">{item.response}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
