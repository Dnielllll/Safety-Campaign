import React, { useState, useEffect } from "react";
import { ClipboardList, CheckCircle2, ChevronRight, AlertCircle } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { supabase, supabaseHelpers } from "@/lib/supabase.js";
import { useTheme } from "@/components/ThemeProvider.jsx";

export default function Surveys() {
  const { resetTheme } = useTheme();
  const [surveys, setSurveys] = useState([]);
  const [selected, setSelected] = useState(null);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [alreadySubmitted, setAlreadySubmitted] = useState({});
  const [user, setUser] = useState(null);

  // Force light mode for public pages
  useEffect(() => {
    resetTheme();
  }, [resetTheme]);

  // Get current user
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getCurrentUser();
  }, []);

  // Check which surveys the user has already submitted
  useEffect(() => {
    const checkSubmissions = async () => {
      if (!user) return;
      
      try {
        const { data: responses } = await supabase
          .from('survey_responses')
          .select('survey_id')
          .eq('user_id', user.id);
        
        const submittedSurveys = {};
        (responses || []).forEach(response => {
          submittedSurveys[response.survey_id] = true;
        });
        setAlreadySubmitted(submittedSurveys);
      } catch (error) {
        console.error('Error checking submissions:', error);
      }
    };
    
    checkSubmissions();
  }, [user]);

  useEffect(() => {
    const fetchSurveys = async () => {
      try {
        const { data: surveysData } = await supabase
          .from('surveys')
          .select('*')
          .eq('status', 'published')
          .order('created_at', { ascending: false });
        
        if (surveysData && surveysData.length > 0) {
          // Fetch questions for each survey
          const surveysWithQuestions = await Promise.all(
            surveysData.map(async (survey) => {
              const { data: questions } = await supabase
                .from('survey_questions')
                .select('*')
                .eq('survey_id', survey.id)
                .order('order_index', { ascending: true });
              
              // Convert questions to the frontend format
              const formattedQuestions = (questions || []).map(q => ({
                question: q.question_text,
                type: q.question_type === 'multiple_choice' ? 'radio' : q.question_type === 'rating' ? 'scale' : q.question_type,
                options: q.options || []
              }));
              
              return {
                ...survey,
                questions: formattedQuestions,
                category: 'Community' // Default category since it's not in the database
              };
            })
          );
          
          setSurveys(surveysWithQuestions);
        } else {
          setSurveys([]); // Don't show mock surveys when no published surveys exist
        }
      } catch (error) {
        console.error('Error fetching surveys:', error);
        setSurveys([]); // Don't show mock surveys on error
      }
    };
    
    fetchSurveys();
  }, []);

  const list = surveys;

  const calculateScore = (responseData) => {
    if (!responseData || typeof responseData !== 'object' || !selected?.questions) return 0;
    
    let totalScore = 0;
    let maxScore = 0;
    
    Object.entries(responseData).forEach(([key, answer]) => {
      const questionIndex = parseInt(key);
      const question = selected.questions[questionIndex];
      
      if (!question) return;
      
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
    
    // Normalize to 5-point scale
    if (maxScore > 0) {
      return Math.round((totalScore / maxScore) * 5);
    }
    return 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { user } = await supabaseHelpers.getAuthUser();
      
      // Check if already submitted
      if (alreadySubmitted[selected.id]) {
        alert("You have already submitted this survey. Each survey can only be taken once.");
        return;
      }
      
      const score = calculateScore(answers);
      const { error } = await supabaseHelpers.submitSurveyResponse({
        survey_id: selected.id,
        user_id: user?.id,
        response_data: answers,
        score: score
      });
      
      if (error) {
        // Handle duplicate submission error
        if (error.message.includes('duplicate') || error.message.includes('unique')) {
          alert("You have already submitted this survey. Each survey can only be taken once.");
          setAlreadySubmitted(prev => ({ ...prev, [selected.id]: true }));
          return;
        }
        throw error;
      }
      
      setSubmitted(true);
      setAlreadySubmitted(prev => ({ ...prev, [selected.id]: true }));
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
    // Check if already submitted before showing form
    if (alreadySubmitted[selected.id]) {
      return (
        <div className="container py-8 max-w-2xl">
          <button onClick={() => setSelected(null)} className="text-sm text-primary mb-4 hover:underline">← Back to surveys</button>
          <Card>
            <CardHeader>
              <Badge variant="secondary" className="w-fit mb-1">{selected.category}</Badge>
              <CardTitle>{selected.title}</CardTitle>
              <CardDescription>{selected.description}</CardDescription>
            </CardHeader>
            <CardContent className="text-center py-8">
              <AlertCircle className="h-12 w-12 text-amber-600 mx-auto mb-4" />
              <h3 className="font-semibold text-lg mb-2">Already Submitted</h3>
              <p className="text-muted-foreground text-sm">You have already submitted this survey. Each survey can only be taken once.</p>
            </CardContent>
            <CardFooter>
              <Button onClick={() => setSelected(null)} className="w-full">Back to Surveys</Button>
            </CardFooter>
          </Card>
        </div>
      );
    }

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
        {list.map((s) => {
          const isSubmitted = alreadySubmitted[s.id];
          return (
            <Card 
              key={s.id} 
              className={`hover:shadow-md transition-shadow ${isSubmitted ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`} 
              onClick={() => !isSubmitted && setSelected(s)}
            >
              <CardHeader>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{s.category}</Badge>
                    {isSubmitted && (
                      <Badge variant="outline" className="text-green-600 border-green-600">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Submitted
                      </Badge>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">{s.questions?.length ?? 0} questions</span>
                </div>
                <CardTitle className="text-base">{s.title}</CardTitle>
                <CardDescription>{s.description}</CardDescription>
              </CardHeader>
              <CardFooter>
                {isSubmitted ? (
                  <Button variant="outline" size="sm" disabled>
                    Already Submitted
                  </Button>
                ) : (
                  <Button variant="ghost" size="sm">
                    Take Survey <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                )}
              </CardFooter>
            </Card>
          );
        })}
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

