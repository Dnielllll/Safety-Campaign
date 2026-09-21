import React, { useState } from "react";
import { BookOpen, ChevronRight, ChevronDown, AlertTriangle, Megaphone, Volume2, Bell, MessageSquare, ClipboardList, HelpCircle, CheckCircle, AlertCircle, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Guides() {
  const [openGuide, setOpenGuide] = useState(null);
  const [openFaq, setOpenFaq] = useState(null);

  const guides = [
    {
      id: "getting-started",
      title: "Getting Started",
      icon: BookOpen,
      description: "Learn how to use the Barangay 178 Safety Campaign System",
      content: (
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">Creating an Account</h4>
            <p className="text-sm text-muted-foreground">
              To create a resident account, click the "Sign up" button on the homepage. You can sign up using your email and password, or use Google Sign-In for quick access. Residents can use Google Sign-In for instant access without creating a password.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Logging In</h4>
            <p className="text-sm text-muted-foreground">
              Click "Log in" on the homepage and enter your email and password, or use Google Sign-In if you registered with Google. If you forgot your password, click "Forgot password?" to reset it.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Dashboard Overview</h4>
            <p className="text-sm text-muted-foreground">
              After logging in, you'll see your resident dashboard with quick access to Safety Campaigns, Notifications, Feedback, Surveys, and more. Use the sidebar navigation to access different features.
            </p>
          </div>
        </div>
      )
    },
    {
      id: "safety-campaigns",
      title: "Safety Campaigns",
      icon: Megaphone,
      description: "How to view and interact with safety campaigns",
      content: (
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">Viewing Campaigns</h4>
            <p className="text-sm text-muted-foreground">
              Safety Campaigns are educational posts about various safety topics like fire safety, dengue prevention, anti-drug awareness, and more. Click on any campaign to read the full details.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Voice Announcements</h4>
            <p className="text-sm text-muted-foreground">
              Many campaigns have a "Listen" button that uses text-to-speech to read the campaign content aloud. This is helpful for residents who prefer audio or have visual impairments.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Language Translation</h4>
            <p className="text-sm text-muted-foreground">
              Safety Campaigns support both English and Tagalog. Click "Translate to Tagalog" to switch languages, and "Translate to English" to switch back.
            </p>
          </div>
        </div>
      )
    },
    {
      id: "emergency-procedures",
      title: "Emergency Procedures",
      icon: AlertTriangle,
      description: "What to do during emergencies",
      content: (
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">Emergency Information</h4>
            <p className="text-sm text-muted-foreground">
              The Emergency Info section contains critical procedures for various emergencies like floods, fires, earthquakes, and medical emergencies. Familiarize yourself with these procedures before an emergency occurs.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-2">AI Voice Announcements</h4>
            <p className="text-sm text-muted-foreground">
              Use the AI Voice feature to listen to emergency announcements. This can be especially helpful when you need hands-free information during an emergency.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Emergency Contacts</h4>
            <p className="text-sm text-muted-foreground">
              Emergency contact information for barangay officials, emergency services, and medical facilities are available in the Emergency Info section. Save these numbers for quick access.
            </p>
          </div>
        </div>
      )
    },
    {
      id: "notifications",
      title: "Notifications",
      icon: Bell,
      description: "How to receive and manage notifications",
      content: (
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">Receiving Notifications</h4>
            <p className="text-sm text-muted-foreground">
              Logged-in residents receive notifications about new safety campaigns, emergency alerts, and important barangay announcements. Check your Notifications page regularly for updates.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Notification Types</h4>
            <p className="text-sm text-muted-foreground">
              Notifications include campaign updates, emergency alerts, weather advisories, and community announcements. Each notification shows the date and a preview of the content.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Managing Notifications</h4>
            <p className="text-sm text-muted-foreground">
              Click on any notification to view the full content. Use "Mark all read" to clear unread notifications. Notifications link directly to the relevant campaign or information.
            </p>
          </div>
        </div>
      )
    },
    {
      id: "feedback",
      title: "Submitting Feedback",
      icon: MessageSquare,
      description: "How to provide feedback to the barangay",
      content: (
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">Feedback Submission</h4>
            <p className="text-sm text-muted-foreground">
              Logged-in residents can submit feedback about safety campaigns, suggestions for improvement, or report issues. Your feedback helps improve the barangay's safety initiatives.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Feedback Types</h4>
            <p className="text-sm text-muted-foreground">
              You can submit general feedback, campaign-specific feedback, suggestions, or report issues. Choose the appropriate category to help barangay staff understand your feedback better.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Privacy</h4>
            <p className="text-sm text-muted-foreground">
              Your feedback is submitted securely and reviewed by barangay staff. You can choose to submit anonymously or include your name for follow-up.
            </p>
          </div>
        </div>
      )
    },
    {
      id: "surveys",
      title: "Surveys",
      icon: ClipboardList,
      description: "How to complete safety surveys",
      content: (
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">Survey Participation</h4>
            <p className="text-sm text-muted-foreground">
              Safety surveys help the barangay understand community needs and improve safety campaigns. Your responses are anonymous and used for planning better safety initiatives.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Completing Surveys</h4>
            <p className="text-sm text-muted-foreground">
              Click on an available survey and answer the questions. Most surveys include multiple-choice questions and may have an optional comments section. Submit your responses when complete.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Survey Topics</h4>
            <p className="text-sm text-muted-foreground">
              Surveys cover topics like fire safety awareness, dengue prevention, road safety, and more. Your input helps the barangay focus on the most important safety issues.
            </p>
          </div>
        </div>
      )
    }
  ];

  const faqs = [
    {
      id: "general-1",
      category: "General",
      question: "What is the Barangay 178 Safety Campaign System?",
      answer: "The Barangay 178 Safety Campaign System is a digital platform that provides residents with safety information, emergency alerts, safety campaigns, and tools to engage with barangay safety initiatives. It helps keep the community informed and prepared for emergencies.",
      icon: Info
    },
    {
      id: "general-2",
      category: "General",
      question: "Do I need an account to use the system?",
      answer: "You can view Safety Campaigns, Emergency Info, AI Voice, and About Barangay without an account. However, to submit feedback, complete surveys, and receive personalized notifications, you need to create a resident account.",
      icon: Info
    },
    {
      id: "account-1",
      category: "Account",
      question: "How do I create a resident account?",
      answer: "Click 'Sign up' on the homepage and fill in your details, or use Google Sign-In for quick registration. Residents can use Google Sign-In without creating a password. Your account will be automatically created with 'resident' role.",
      icon: HelpCircle
    },
    {
      id: "account-2",
      category: "Account",
      question: "I forgot my password. What should I do?",
      answer: "On the login page, click 'Forgot password?' and enter your email. You'll receive a password reset link via email. Follow the instructions to create a new password.",
      icon: HelpCircle
    },
    {
      id: "account-3",
      category: "Account",
      question: "Can I use Google Sign-In?",
      answer: "Yes, residents can use Google Sign-In for quick access. Staff, admin, and super admin accounts must use email/password login. Google Sign-In is only available for residents.",
      icon: HelpCircle
    },
    {
      id: "emergency-1",
      category: "Emergency",
      question: "What should I do during an emergency?",
      answer: "Check the Emergency Info section for specific procedures. Follow the instructions for the type of emergency (flood, fire, earthquake, etc.). If it's a life-threatening emergency, call emergency services immediately.",
      icon: AlertCircle
    },
    {
      id: "emergency-2",
      category: "Emergency",
      question: "How do I receive emergency alerts?",
      answer: "Logged-in residents receive emergency notifications. Check your Notifications page regularly for emergency alerts. Important alerts may also be sent via SMS if you've provided your phone number.",
      icon: AlertCircle
    },
    {
      id: "technical-1",
      category: "Technical",
      question: "I'm having trouble logging in. What should I do?",
      answer: "Make sure you're using the correct email and password. If using Google Sign-In, ensure you're logged into the correct Google account. If problems persist, contact barangay staff for assistance.",
      icon: HelpCircle
    },
    {
      id: "technical-2",
      category: "Technical",
      question: "Is my personal information secure?",
      answer: "Yes, your personal information is stored securely using Supabase's secure database. Your data is encrypted and only accessible by authorized barangay staff. We never share your information with third parties.",
      icon: CheckCircle
    },
    {
      id: "technical-3",
      category: "Technical",
      question: "Can I access the system on my phone?",
      answer: "Yes, the system is mobile-responsive and works on smartphones, tablets, and desktop computers. Access it through your web browser for the best experience.",
      icon: CheckCircle
    }
  ];

  const faqCategories = [...new Set(faqs.map(faq => faq.category))];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-primary text-primary-foreground py-12">
        <div className="container">
          <div className="flex items-center gap-3 mb-4">
            <BookOpen className="h-8 w-8" />
            <h1 className="text-3xl font-bold">Guides & FAQ</h1>
          </div>
          <p className="text-lg opacity-90 max-w-2xl">
            Learn how to use the Barangay 178 Safety Campaign System effectively. Find answers to common questions and get the most out of our safety features.
          </p>
        </div>
      </div>

      <div className="container py-8">
        {/* Guides Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <BookOpen className="h-6 w-6" />
            User Guides
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {guides.map((guide) => {
              const Icon = guide.icon;
              const isOpen = openGuide === guide.id;
              return (
                <Card key={guide.id} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardHeader onClick={() => setOpenGuide(isOpen ? null : guide.id)}>
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 text-left">
                        <CardTitle className="text-lg">{guide.title}</CardTitle>
                        <CardDescription className="mt-1">{guide.description}</CardDescription>
                      </div>
                      <ChevronDown className={`h-5 w-5 text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                    </div>
                  </CardHeader>
                  {isOpen && (
                    <CardContent className="pt-0 border-t">
                      <div className="pt-4">
                        {guide.content}
                      </div>
                    </CardContent>
                  )}
                </Card>
              );
            })}
          </div>
        </div>

        {/* FAQ Section */}
        <div>
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <HelpCircle className="h-6 w-6" />
            Frequently Asked Questions
          </h2>

          {faqCategories.map((category) => (
            <div key={category} className="mb-8">
              <h3 className="text-xl font-semibold mb-4 text-primary">{category}</h3>
              <div className="space-y-3">
                {faqs.filter(faq => faq.category === category).map((faq) => {
                  const Icon = faq.icon;
                  const isOpen = openFaq === faq.id;
                  return (
                    <Card key={faq.id} className="cursor-pointer hover:shadow-sm transition-shadow">
                      <CardHeader className="py-4" onClick={() => setOpenFaq(isOpen ? null : faq.id)}>
                        <div className="flex items-start gap-3">
                          <Icon className="h-5 w-5 text-primary mt-0.5" />
                          <div className="flex-1 text-left">
                            <CardTitle className="text-base font-medium">{faq.question}</CardTitle>
                          </div>
                          <ChevronDown className={`h-5 w-5 text-muted-foreground transition-transform shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
                        </div>
                      </CardHeader>
                      {isOpen && (
                        <CardContent className="pt-0 border-t">
                          <p className="text-sm text-muted-foreground pt-4 pl-8">
                            {faq.answer}
                          </p>
                        </CardContent>
                      )}
                    </Card>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Contact Support */}
        <div className="mt-12 p-6 bg-primary/5 rounded-lg border border-primary/20">
          <div className="flex items-start gap-4">
            <MessageSquare className="h-6 w-6 text-primary mt-1" />
            <div>
              <h3 className="font-semibold text-lg mb-2">Still Have Questions?</h3>
              <p className="text-sm text-muted-foreground mb-4">
                If you couldn't find the answer you're looking for, please contact barangay staff for assistance.
              </p>
              <Button asChild>
                <a href="/feedback">Submit a Question</a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
