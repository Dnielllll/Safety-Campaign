import React, { useState } from "react";
import { BookOpen, ChevronDown, AlertTriangle, Megaphone, Bell, MessageSquare, ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Guides() {
  const [openGuide, setOpenGuide] = useState(null);

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
              You can submit general feedback, campaign-specific feedback, suggestions, or report issues. Choose the appropriate category to help the barangay understand your feedback better.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Privacy</h4>
            <p className="text-sm text-muted-foreground">
              Your feedback is submitted securely and reviewed by the barangay team. You can choose to submit anonymously or include your name for follow-up.
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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-primary text-primary-foreground py-12">
        <div className="container">
          <div className="flex items-center gap-3 mb-4">
            <BookOpen className="h-8 w-8" />
            <h1 className="text-3xl font-bold">User Guides</h1>
          </div>
          <p className="text-lg opacity-90 max-w-2xl">
            Learn how to use the Barangay 178 Safety Campaign System effectively.
          </p>
        </div>
      </div>

      <div className="container py-8">
        {/* Guides Section */}
        <div>
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
      </div>
    </div>
  );
}
