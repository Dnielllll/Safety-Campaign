import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Siren, Megaphone, Volume2, ArrowRight, Bell, MessageSquare, ClipboardList, ShieldAlert, Building2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabaseHelpers } from "@/lib/supabase.js";
import { useAuth } from "@/hooks/useAuth.jsx";
import { useLanguage, getLocalizedField } from "@/components/LanguageToggle.jsx";

const priorityVariant = { critical: "destructive", high: "warning", medium: "secondary", low: "outline" };

const quickLinks = [
  { to: "/campaigns", label: "Safety Campaigns", icon: Megaphone, color: "bg-orange-200 text-orange-600" },
  { to: "/voice-announcements", label: "AI Voice Announcements", icon: Volume2, color: "bg-orange-200 text-orange-600", requirePublic: true },
  { to: "/emergency", label: "Emergency Info", icon: ShieldAlert, color: "bg-orange-200 text-orange-600" },
  { to: "/notifications", label: "Notifications", icon: Bell, color: "bg-orange-200 text-orange-600" },
  { to: "/feedback", label: "Submit Feedback", icon: MessageSquare, color: "bg-muted text-muted-foreground" },
  { to: "/surveys", label: "Surveys", icon: ClipboardList, color: "bg-muted text-muted-foreground" },
  { to: "/about", label: "About Barangay", icon: Building2, color: "bg-orange-200 text-orange-600" },
];

export default function PublicDashboard() {
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState([]);

  useEffect(() => {
    supabaseHelpers.getCampaigns({ status: "published" })
      .then(({ data }) => {
        // Deduplicate campaigns by ID to prevent duplicates
        const uniqueCampaigns = Array.isArray(data) 
          ? data.filter((campaign, index, self) =>
              index === self.findIndex((c) => c.id === campaign.id)
            )
          : [];
        setCampaigns(uniqueCampaigns);
      })
      .catch(() => setCampaigns(mockCampaigns));
  }, []);

  const list = campaigns.length ? campaigns : mockCampaigns;
  const urgent = list.filter((c) => c.priority === "critical" || c.priority === "high");

  return (
    <div className="flex flex-col">
      {/* Hero section with barangay building background */}
      <div className="relative bg-barangay min-h-[420px] flex items-end">
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/10" />
        <div className="relative container py-12 text-white">
          <div className="flex items-center gap-3 mb-4">
            <img src="/logo.png" alt="Barangay 178 Seal" className="h-14 w-14 rounded-full object-contain border-2 border-white/30 shadow-lg" />
            <div>
              <Badge className="bg-primary/80 text-white border-0 mb-1">Barangay 178 · Camarin, North Caloocan City</Badge>
              <h1 className="font-display text-3xl md:text-4xl font-bold leading-tight">Stay Informed. Stay Safe.</h1>
            </div>
          </div>
          <p className="text-white/85 max-w-2xl text-sm md:text-base mb-6">
            Get the latest public safety announcements, emergency alerts, and community campaigns —
            available in text and AI-generated voice for all residents.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button asChild className="bg-primary hover:bg-primary/90 text-white shadow-lg">
              <Link to="/campaigns">Browse Campaigns <ArrowRight className="h-4 w-4 ml-1" /></Link>
            </Button>
            <Button variant="outline" asChild className="bg-white/10 border-white/30 text-white hover:bg-white/20 backdrop-blur-sm">
              <Link to="/emergency"><Siren className="h-4 w-4 mr-1" /> Emergency Info</Link>
            </Button>
            {!user && (
              <Button variant="outline" asChild className="bg-white/10 border-white/30 text-white hover:bg-white/20 backdrop-blur-sm">
                <Link to="/voice-announcements"><Volume2 className="h-4 w-4 mr-1" /> Voice Announcement</Link>
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="container py-8 space-y-8">
        {/* Quick access links */}
        <section>
          <h2 className="font-display text-lg font-semibold mb-4 text-orange-600">Quick Access</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {quickLinks.map((ql) => {
              if (!user && (ql.to === "/feedback" || ql.to === "/surveys")) return null;
              if (user && ql.requirePublic) return null; // Hide voice announcements for logged-in residents
              const Icon = ql.icon;
              const isQuickAccessCard = ["/campaigns", "/voice-announcements", "/emergency", "/notifications", "/about"].includes(ql.to);
              return (
                <Link
                  key={ql.to}
                  to={ql.to}
                  className="flex flex-col items-center gap-2 rounded-xl border border-border bg-white p-4 hover:shadow-md hover:-translate-y-0.5 hover:bg-gray-50 transition-all text-center group"
                >
                  <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${ql.color} group-hover:scale-110 transition-transform`}>
                    <Icon className={`h-5 w-5 ${isQuickAccessCard ? 'animate-bounce' : ''}`} />
                  </div>
                  <span className="text-xs font-medium leading-tight text-gray-900">{ql.label}</span>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Priority alerts */}
        {urgent.length > 0 && (
          <section>
            <h2 className="font-display text-lg font-semibold mb-3 flex items-center gap-2">
              <Siren className="h-5 w-5 text-destructive" /> Priority Alerts
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              {urgent.map((c) => (
                <CampaignCard key={c.id} campaign={c} />
              ))}
            </div>
          </section>
        )}

        {/* Latest campaigns */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display text-lg font-semibold flex items-center gap-2">
              <Megaphone className="h-5 w-5 text-primary" /> Latest Campaigns
            </h2>
            <Link to="/campaigns" className="text-sm text-primary font-medium hover:underline">View all →</Link>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {list.slice(0, 6).map((c) => (
              <CampaignCard key={c.id} campaign={c} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function CampaignCard({ campaign }) {
  const [playing, setPlaying] = useState(false);
  const language = useLanguage();

  const handleListen = () => {
    if (playing) {
      window.speechSynthesis.cancel();
      setPlaying(false);
      return;
    }

    window.speechSynthesis.cancel();
    setPlaying(true);

    // Get localized content based on current language
    const title = getLocalizedField(campaign, 'title', language);
    const objectives = getLocalizedField(campaign, 'objectives', language);

    const utterance = new SpeechSynthesisUtterance(`${title}. ${objectives}`);
    utterance.rate = 0.9;
    utterance.lang = language === 'tl' ? 'fil-PH' : 'en-US';
    utterance.onend = () => setPlaying(false);
    utterance.onerror = () => setPlaying(false);

    // Try to set appropriate voice for the language
    const voices = window.speechSynthesis.getVoices();
    if (language === 'tl') {
      const tagalogVoice = voices.find(v => v.lang.includes('fil') || v.lang.includes('tl'));
      if (tagalogVoice) {
        utterance.voice = tagalogVoice;
      } else {
        // Fallback to English if Tagalog voice not available
        console.warn('Tagalog voice not available, using English voice');
        const englishVoice = voices.find(v => v.lang.includes('en'));
        if (englishVoice) utterance.voice = englishVoice;
      }
    } else {
      const englishVoice = voices.find(v => v.lang.includes('en'));
      if (englishVoice) utterance.voice = englishVoice;
    }

    window.speechSynthesis.speak(utterance);
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-center justify-between mb-1">
          <Badge variant={priorityVariant[campaign.priority] || "secondary"}>{campaign.priority}</Badge>
          <span className="text-xs text-muted-foreground">{campaign.category?.replace("_", " ")}</span>
        </div>
        <CardTitle className="text-base">{campaign.title}</CardTitle>
        <CardDescription>{campaign.objectives}</CardDescription>
      </CardHeader>
      <CardFooter className="justify-between">
        <Button variant="ghost" size="sm" asChild>
          <Link to={`/campaigns/${campaign.id}`}>Read more</Link>
        </Button>
        <Button variant="outline" size="sm" onClick={handleListen}>
          <Volume2 className="h-4 w-4 mr-1" /> {playing ? "Playing…" : "Listen"}
        </Button>
      </CardFooter>
    </Card>
  );
}

const mockCampaigns = [
  { id: 1, title: "Fire Safety Reminders for the Dry Season", objectives: "Reduce fire incidents in residential areas.", category: "fire_safety", priority: "high" },
  { id: 2, title: "Flood Evacuation Route Advisory", objectives: "Guide residents on the nearest evacuation centers.", category: "disaster_prep", priority: "critical" },
  { id: 3, title: "Dengue Prevention Campaign", objectives: "Promote 4S strategy against dengue.", category: "health", priority: "medium" },
  { id: 4, title: "Community Clean-Up Drive", objectives: "Keep our barangay clean and healthy.", category: "environment", priority: "low" },
  { id: 5, title: "Anti-Drug Awareness Program", objectives: "Educate residents on the dangers of drug abuse.", category: "anti_drug", priority: "high" },
  { id: 6, title: "Road Safety Campaign", objectives: "Promote safe driving and pedestrian habits.", category: "road_safety", priority: "medium" },
];
