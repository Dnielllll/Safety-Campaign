import React, { useState, useEffect } from "react";
import { ClipboardList, CheckCircle2, ChevronRight } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { supabase, supabaseHelpers } from "@/lib/supabase.js";

export default function Surveys() {
  const [surveys, setSurveys] = useState([]);
  const [selected, setSelected] = useState(null);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.from('surveys').select('*, survey_questions(*)').eq('status', 'active').order('created_at', { ascending: false })
      .then(({ data }) => setSurveys(Array.isArray(data) && data.length > 0 ? data : mockSurveys))
      .catch(() => setSurveys(mockSurveys));
  }, []);

  const list = surveys.length ? surveys : mockSurveys;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { user } = await supabaseHelpers.getAuthUser();
      const { error } = await supabaseHelpers.submitSurveyResponse({
        survey_id: selected.id,
        user_id: user?.id,
        response_data: answers
      });
      if (error) throw error;
      setSubmitted(true);
    } catch (error) {
      console.error(error);
      alert("Failed to submit survey. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="container py-8 flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-sm">
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="h-8 w-8 text-primary" />
          </div>
          <h2 className="font-display text-xl font-bold mb-2">Survey submitted!</h2>
          <p className="text-muted-foreground text-sm mb-4">Thank you for participating. Your responses help evaluate our campaigns.</p>
          <Button onClick={() => { setSubmitted(false); setSelected(null); setAnswers({}); }}>Back to Surveys</Button>
        </div>
      </div>
    );
  }

  if (selected) {
    return (
      <div className="container py-8 max-w-2xl">
        <button onClick={() => setSelected(null)} className="text-sm text-primary mb-4 hover:underline">← Back to surveys</button>
        <Card>
          <CardHeader>
            <Badge variant="secondary" className="w-fit mb-1">{selected.category}</Badge>
            <CardTitle>{selected.title}</CardTitle>
            <CardDescription>{selected.description}</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
              {selected.questions.map((q, i) => (
                <div key={i} className="space-y-2">
                  <Label className="font-medium">{i + 1}. {q.question}</Label>
                  {q.type === "radio" && (
                    <div className="space-y-2">
                      {q.options.map((opt) => (
                        <label key={opt} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name={`q${i}`}
                            value={opt}
                            checked={answers[i] === opt}
                            onChange={() => setAnswers({ ...answers, [i]: opt })}
                            className="accent-primary"
                          />
                          <span className="text-sm">{opt}</span>
                        </label>
                      ))}
                    </div>
                  )}
                  {q.type === "text" && (
                    <textarea
                      rows={3}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      placeholder="Your answer…"
                      value={answers[i] || ""}
                      onChange={(e) => setAnswers({ ...answers, [i]: e.target.value })}
                    />
                  )}
                  {q.type === "scale" && (
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <button
                          key={n}
                          type="button"
                          onClick={() => setAnswers({ ...answers, [i]: n })}
                          className={`h-9 w-9 rounded-md border text-sm font-medium transition-colors ${answers[i] === n ? "bg-primary text-primary-foreground border-primary" : "border-border hover:bg-secondary"}`}
                        >
                          {n}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Submitting…" : "Submit Survey"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-8 space-y-6">
      <div>
        <h1 className="font-display text-xl sm:text-2xl font-bold flex items-center gap-2">
          <ClipboardList className="h-5 w-5 sm:h-6 sm:w-6 text-primary" /> Community Surveys
        </h1>
        <p className="text-muted-foreground text-xs sm:text-sm mt-1">
          Participate in surveys to help evaluate the effectiveness of public safety campaigns in Barangay 178.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {list.map((s) => (
          <Card key={s.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setSelected(s)}>
            <CardHeader>
              <div className="flex items-center justify-between mb-1">
                <Badge variant="secondary">{s.category}</Badge>
                <span className="text-xs text-muted-foreground">{s.questions?.length ?? 0} questions</span>
              </div>
              <CardTitle className="text-base">{s.title}</CardTitle>
              <CardDescription>{s.description}</CardDescription>
            </CardHeader>
            <CardFooter>
              <Button variant="ghost" size="sm">
                Take Survey <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {list.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <ClipboardList className="h-10 w-10 mx-auto mb-2 opacity-30" />
          <p>No active surveys at the moment.</p>
        </div>
      )}
    </div>
  );
}

const mockSurveys = [
  {
    id: 1,
    title: "Fire Safety Awareness Survey",
    description: "Help us assess the community's level of fire safety awareness.",
    category: "Fire Safety",
    questions: [
      { question: "Do you have a fire extinguisher at home?", type: "radio", options: ["Yes", "No", "Planning to get one"] },
      { question: "How would you rate the barangay's fire safety campaign?", type: "scale" },
      { question: "What improvements would you suggest?", type: "text" },
      { question: "Do you know the emergency fire hotline number?", type: "radio", options: ["Yes", "No"] },
      { question: "How often do you check electrical appliances for safety?", type: "radio", options: ["Daily", "Weekly", "Monthly", "Rarely"] },
    ],
  },
  {
    id: 2,
    title: "Dengue Prevention Campaign Evaluation",
    description: "Evaluate the effectiveness of the dengue prevention campaign.",
    category: "Health",
    questions: [
      { question: "Have you applied the 4S strategy in your home?", type: "radio", options: ["Yes, all 4 steps", "Some steps only", "Not yet"] },
      { question: "Rate the campaign's impact in your area", type: "scale" },
      { question: "Additional comments", type: "text" },
      { question: "How often do you clean potential mosquito breeding sites?", type: "radio", options: ["Daily", "Weekly", "Monthly", "Rarely"] },
      { question: "Have you or a family member had dengue in the past year?", type: "radio", options: ["Yes", "No"] },
    ],
  },
  {
    id: 3,
    title: "Flood Evacuation Route Awareness",
    description: "Assess awareness of flood evacuation procedures and routes.",
    category: "Disaster Preparedness",
    questions: [
      { question: "Do you know the designated evacuation route for your area?", type: "radio", options: ["Yes", "No"] },
      { question: "Rate the clarity of evacuation route signage", type: "scale" },
      { question: "Have you participated in a flood drill?", type: "radio", options: ["Yes", "No"] },
      { question: "Do you have an emergency preparedness kit?", type: "radio", options: ["Yes", "No", "In progress"] },
      { question: "Suggestions for improving evacuation procedures", type: "text" },
    ],
  },
  {
    id: 4,
    title: "Anti-Scam Awareness Campaign",
    description: "Evaluate the effectiveness of anti-scam awareness efforts.",
    category: "Public Safety",
    questions: [
      { question: "Are you aware of common scam tactics?", type: "radio", options: ["Yes, very aware", "Somewhat aware", "Not aware"] },
      { question: "Rate the usefulness of anti-scam information provided", type: "scale" },
      { question: "Have you encountered a scam attempt recently?", type: "radio", options: ["Yes", "No"] },
      { question: "Do you know how to report scams?", type: "radio", options: ["Yes", "No"] },
      { question: "What additional anti-scam topics would you like to learn about?", type: "text" },
    ],
  },
  {
    id: 5,
    title: "Environmental Cleanliness Campaign",
    description: "Assess the impact of environmental cleanliness initiatives.",
    category: "Environment",
    questions: [
      { question: "How would you rate the cleanliness of your neighborhood?", type: "scale" },
      { question: "Do you participate in community clean-up activities?", type: "radio", options: ["Regularly", "Sometimes", "Never"] },
      { question: "Rate the effectiveness of waste management in your area", type: "scale" },
      { question: "Do you practice proper waste segregation?", type: "radio", options: ["Always", "Sometimes", "Never"] },
      { question: "Suggestions for improving environmental cleanliness", type: "text" },
    ],
  },
  {
    id: 6,
    title: "Road Safety Awareness Survey",
    description: "Evaluate road safety awareness and campaign effectiveness.",
    category: "Public Safety",
    questions: [
      { question: "Do you follow traffic rules consistently?", type: "radio", options: ["Always", "Sometimes", "Rarely"] },
      { question: "Rate the visibility of road safety signs in your area", type: "scale" },
      { question: "Have you attended a road safety seminar?", type: "radio", options: ["Yes", "No"] },
      { question: "How would you rate pedestrian safety in your area?", type: "scale" },
      { question: "Suggestions for improving road safety", type: "text" },
    ],
  },
];
