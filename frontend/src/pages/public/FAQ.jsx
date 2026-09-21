import React, { useState } from "react";
import { HelpCircle, ChevronDown, AlertCircle, Info, CheckCircle, MessageSquare, Button as ButtonIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function FAQ() {
  const [openFaq, setOpenFaq] = useState(null);

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
            <HelpCircle className="h-8 w-8" />
            <h1 className="text-3xl font-bold">Frequently Asked Questions</h1>
          </div>
          <p className="text-lg opacity-90 max-w-2xl">
            Find answers to common questions about the Barangay 178 Safety Campaign System.
          </p>
        </div>
      </div>

      <div className="container py-8">
        {/* FAQ Section */}
        <div>
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
