import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { Search, Filter, Volume2, ArrowRight, Megaphone, Image as ImageIcon, Video, Square, Languages } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabaseHelpers } from "@/lib/supabase.js";
import { supabase } from "@/lib/supabase";
import { generateAIResponse } from "@/lib/ai.js";

const categories = ["All", "Fire Safety", "Disaster Preparedness", "Health", "Anti-Drug", "Road Safety", "Environment", "Crime Prevention"];
const priorities = ["All", "critical", "high", "medium", "low"];
const priorityVariant = { critical: "destructive", high: "warning", medium: "secondary", low: "outline" };

// Translation dictionary for campaign content
const translations = {
  english: {
    backToCampaigns: "← Back to campaigns",
    listenVoiceAnnouncement: "Listen Voice Announcement",
    stop: "Stop",
    campaignContent: "Campaign Content",
    activityDate: "Activity Date",
    searchCampaigns: "Search campaigns…",
    loadingCampaigns: "Loading campaigns…",
    noPublishedCampaigns: "No published campaigns yet.",
    campaignsWillAppear: "Campaigns approved by the admin will appear here.",
    readMore: "Read more",
    listen: "Listen",
    // Anti-Drug Campaign translations
    antiDrugTitle: "Anti-Drug Awareness Program",
    antiDrugAdvisory: "🚫 ANTI-DRUG AWARENESS ADVISORY",
    antiDrugAttention: "ATTENTION Barangay 178 Residents:",
    antiDrugCommitment: "Our barangay is committed to being drug-free. Here is what you need to know:",
    antiDrugDangers: "Dangers of Drug Abuse:",
    antiDrugDanger1: "• Destroys health and family relationships",
    antiDrugDanger2: "• Leads to criminal behavior and imprisonment",
    antiDrugDanger3: "• Affects the entire community's safety",
    antiDrugWhatToDo: "What You Can Do:",
    antiDrugAction1: "• Report drug activities anonymously to the Barangay Anti-Drug Abuse Council (BADAC)",
    antiDrugAction2: "• Support community rehabilitation programs",
    antiDrugAction3: "• Educate your children about the dangers of drugs",
    antiDrugAction4: "• Participate in Barangay Drug Clearing activities",
    antiDrugSupport: "Support Services:",
    antiDrugBadac: "📍 BADAC Office: Barangay Hall, Room 2",
    antiDrugHotline: "📞 Anonymous Hotline: 0917-DRUG-FREE",
    antiDrugTogether: "Together, we build a drug-free Barangay 178. Mabuhay!",
  },
  tagalog: {
    backToCampaigns: "← Bumalik sa mga kampanya",
    listenVoiceAnnouncement: "Makinig sa Voice Announcement",
    stop: "Itigil",
    campaignContent: "Nilalaman ng Kampanya",
    activityDate: "Petsa ng Aktibidad",
    searchCampaigns: "Maghanap ng mga kampanya…",
    loadingCampaigns: "Naglo-load ng mga kampanya…",
    noPublishedCampaigns: "Walang nai-publish na mga kampanya pa.",
    campaignsWillAppear: "Ang mga kampanyang na-approve ng admin ay lalabas dito.",
    readMore: "Magbasa pa",
    listen: "Makinig",
    // Anti-Drug Campaign translations
    antiDrugTitle: "Programa sa Kamalayan Laban sa Droga",
    antiDrugAdvisory: "🚫 ADVISORY SA KAMALAYAN LABAN SA DROGA",
    antiDrugAttention: "PANSIN Mga Residente ng Barangay 178:",
    antiDrugCommitment: "Ang ating barangay ay nakatuon sa pagiging drug-free. Narito ang kailangan mong malaman:",
    antiDrugDangers: "Panganib ng Pag-abuso sa Droga:",
    antiDrugDanger1: "• Sumisira sa kalusugan at relasyon sa pamilya",
    antiDrugDanger2: "• Nangunguna sa kriminal na pag-uugali at pagkakapi",
    antiDrugDanger3: "• Nakakaapekto sa kaligtasan ng buong komunidad",
    antiDrugWhatToDo: "Ang Maaari Mong Gawin:",
    antiDrugAction1: "• I-ulat ang mga aktibidad sa droga nang anonymous sa Barangay Anti-Drug Abuse Council (BADAC)",
    antiDrugAction2: "• Suportahan ang mga programa sa rehabilitasyon ng komunidad",
    antiDrugAction3: "Edukahan ang iyong mga anak tungkol sa panganib ng droga",
    antiDrugAction4: "• Lumahok sa mga aktibidad sa Barangay Drug Clearing",
    antiDrugSupport: "Mga Serbisyong Suporta:",
    antiDrugBadac: "📍 Opisina ng BADAC: Barangay Hall, Room 2",
    antiDrugHotline: "📞 Anonymous Hotline: 0917-DRUG-FREE",
    antiDrugTogether: "Magkasama, binubuo natin ang drug-free na Barangay 178. Mabuhay!",
  }
};

export default function SafetyCampaigns() {
  const { id } = useParams();
  const [campaigns, setCampaigns] = useState([]);
  const [campaignContent, setCampaignContent] = useState({});
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [priority, setPriority] = useState("All");
  const [selected, setSelected] = useState(null);
  const [playing, setPlaying] = useState(false);
  const [language, setLanguage] = useState("english"); // 'english' or 'tagalog'

  const [loading, setLoading] = useState(true);
  const [useMock, setUseMock] = useState(false);

  // Stop voice announcement when component unmounts or page changes
  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
      setPlaying(null);
    };
  }, []);

  // Stop voice announcement when any button is clicked
  const stopVoiceOnClick = () => {
    window.speechSynthesis.cancel();
    setPlaying(null);
  };

  useEffect(() => {
    setLoading(true);
    supabaseHelpers.getCampaigns({ status: "published" })
      .then(({ data, error }) => {
        if (error) {
          console.error("Campaign fetch error:", error);
          setUseMock(true);
          setCampaigns([]);
        } else {
          // Use real data from Supabase (even if empty)
          // Deduplicate campaigns by ID to prevent duplicates
          const uniqueCampaigns = Array.isArray(data) 
            ? data.filter((campaign, index, self) =>
                index === self.findIndex((c) => c.id === campaign.id)
              )
            : [];
          
          setCampaigns(uniqueCampaigns);
          setUseMock(false);
          // Fetch content for campaigns
          fetchCampaignContent(uniqueCampaigns);
        }
      })
      .catch(() => {
        setUseMock(true);
        setCampaigns([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const fetchCampaignContent = async (campaignsList) => {
    if (!campaignsList.length) return;

    try {
      const campaignIds = campaignsList.map(c => c.id);
      console.log('Fetching content for campaign IDs:', campaignIds);
      
      const { data, error } = await supabase
        .from('content')
        .select('*')
        .in('campaign_id', campaignIds);

      if (error) throw error;

      console.log('Fetched content data:', data);

      // Group content by campaign_id
      const contentByCampaign = {};
      (data || []).forEach(item => {
        if (!contentByCampaign[item.campaign_id]) {
          contentByCampaign[item.campaign_id] = [];
        }
        contentByCampaign[item.campaign_id].push(item);
      });

      console.log('Content grouped by campaign:', contentByCampaign);
      setCampaignContent(contentByCampaign);
    } catch (error) {
      console.error('Error fetching campaign content:', error);
    }
  };



  useEffect(() => {
    if (id) {
      const found = campaigns.find((c) => String(c.id) === String(id));
      if (found) setSelected(found);
    }
  }, [id, campaigns]);

  // Only show mock campaigns if there was a connection error
  const displayed = (useMock ? mockCampaigns : campaigns).filter((c) => {
    const matchSearch = (c.title || "").toLowerCase().includes(search.toLowerCase()) || (c.objectives || c.description || "").toLowerCase().includes(search.toLowerCase());
    const matchCat = category === "All" || (c.category || c.campaign_type || "").replace(/_/g, " ").toLowerCase().includes(category.toLowerCase());
    const matchPri = priority === "All" || c.priority === priority;
    return matchSearch && matchCat && matchPri;
  });

  const handleListen = (campaign) => {
    if (playing === campaign.id) {
      window.speechSynthesis.cancel();
      setPlaying(null);
      return;
    }

    window.speechSynthesis.cancel();
    setPlaying(campaign.id);

    // Use objectives or description, stripping emojis for cleaner speech
    let content = (campaign.objectives || campaign.description || "")
      .replace(/[\u{1F300}-\u{1FAFF}]/gu, '') // remove emojis
      .replace(/[•✅📍📞📅🏆🚫🚗🌧️🔥🧹🏥]/g, '')  // remove special symbols
      .replace(/\n+/g, '. ')  // replace newlines with pauses
      .trim();

    // If language is Tagalog and it's Anti-Drug campaign, use translated content
    if (language === 'tagalog') {
      const isAntiDrugCampaign = campaign.title.toLowerCase().includes('anti-drug') || 
                                  campaign.category?.toLowerCase().includes('anti_drug');
      
      if (isAntiDrugCampaign) {
        const t = translations.tagalog;
        content = `${t.antiDrugAdvisory} ${t.antiDrugAttention} ${t.antiDrugCommitment} ${t.antiDrugDangers} ${t.antiDrugDanger1} ${t.antiDrugDanger2} ${t.antiDrugDanger3} ${t.antiDrugWhatToDo} ${t.antiDrugAction1} ${t.antiDrugAction2} ${t.antiDrugAction3} ${t.antiDrugAction4} ${t.antiDrugSupport} ${t.antiDrugBadac} ${t.antiDrugHotline} ${t.antiDrugTogether}`;
      }
    }

    // Small timeout fixes iOS/Android bug where cancel() blocks the next speak()
    setTimeout(() => {
      const utterance = new SpeechSynthesisUtterance(`${campaign.title}. ${content}`);
      // Use appropriate language for speech
      utterance.lang = language === 'tagalog' ? 'fil-PH' : 'en-US';
      utterance.rate = 0.9;
      
      utterance.onend = () => setPlaying(null);
      utterance.onerror = (e) => {
        console.error("Speech error:", e);
        setPlaying(null);
      };

      // PREVENT GARBAGE COLLECTION BUG ON MOBILE (Crucial for iOS/Android)
      window._activeUtterance = utterance;

      window.speechSynthesis.speak(utterance);
    }, 50);
  };

  if (selected) {
    const contentList = campaignContent[selected.id] || [];
    const t = translations[language];
    
    // Check if this is the Anti-Drug campaign and translate accordingly
    const isAntiDrugCampaign = selected.title.toLowerCase().includes('anti-drug') || 
                                selected.category?.toLowerCase().includes('anti_drug');
    
    const displayTitle = isAntiDrugCampaign && language === 'tagalog' 
      ? t.antiDrugTitle 
      : selected.title;
    
    const displayContent = isAntiDrugCampaign && language === 'tagalog'
      ? `${t.antiDrugAdvisory}\n\n${t.antiDrugAttention}\n${t.antiDrugCommitment}\n\n${t.antiDrugDangers}\n${t.antiDrugDanger1}\n${t.antiDrugDanger2}\n${t.antiDrugDanger3}\n\n${t.antiDrugWhatToDo}\n${t.antiDrugAction1}\n${t.antiDrugAction2}\n${t.antiDrugAction3}\n${t.antiDrugAction4}\n\n${t.antiDrugSupport}\n${t.antiDrugBadac}\n${t.antiDrugHotline}\n\n${t.antiDrugTogether}`
      : (selected.description || selected.objectives || "No additional description provided.");

    return (
      <div className="container py-8">
        <button onClick={() => { stopVoiceOnClick(); setSelected(null); }} className="text-sm text-primary mb-4 flex items-center gap-1 hover:underline">
          {t.backToCampaigns}
        </button>
        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <div className="flex flex-wrap gap-2">
                <Badge variant={priorityVariant[selected.priority] || "secondary"}>{selected.priority} priority</Badge>
                <Badge variant="outline">{selected.category?.replace("_", " ")}</Badge>
              </div>
              {/* Language Toggle */}
              <button
                onClick={() => {
                  setLanguage(language === 'english' ? 'tagalog' : 'english');
                  stopVoiceOnClick();
                }}
                className="flex items-center gap-2 text-sm text-primary hover:underline underline decoration-dotted"
              >
                <Languages className="h-4 w-4" />
                {language === 'english' ? 'Translate to Tagalog' : 'Translate to English'}
              </button>
            </div>
            <CardTitle className="text-2xl">{displayTitle}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm whitespace-pre-line">{displayContent}</p>
            <Button onClick={() => handleListen(selected)} variant="outline">
              {playing === selected.id ? (
                <>
                  <Square className="h-4 w-4 mr-2" />
                  {t.stop}
                </>
              ) : (
                <>
                  <Volume2 className="h-4 w-4 mr-2" />
                  {t.listenVoiceAnnouncement}
                </>
              )}
            </Button>

            {contentList.length > 0 && (
              <div className="mt-6">
                <h3 className="font-semibold mb-3">{t.campaignContent}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {contentList.map((item) => (
                    <div key={item.id} className="rounded-lg overflow-hidden bg-muted">
                      {item.activity_date && (
                        <div className="px-3 py-2 bg-primary/10 text-xs text-primary">
                          {t.activityDate}: {new Date(item.activity_date).toLocaleDateString()}
                        </div>
                      )}
                      {item.content_type === 'video' ? (
                        <video src={item.media_url} className="w-full" controls />
                      ) : (
                        <img src={item.media_url} alt={selected.title} className="w-full" />
                      )}
                      <p className="text-xs text-muted-foreground p-2 capitalize">
                        {item.content_type?.replace('_', ' ')}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-xl sm:text-2xl font-bold flex items-center gap-2">
            <Megaphone className="h-5 w-5 sm:h-6 sm:w-6 text-primary" /> Safety Campaigns
          </h1>
          <p className="text-muted-foreground text-xs sm:text-sm mt-1">Browse and search public safety awareness campaigns from Barangay 178.</p>
        </div>
        {/* Language Toggle */}
        <button
          onClick={() => {
            setLanguage(language === 'english' ? 'tagalog' : 'english');
            stopVoiceOnClick();
          }}
          className="flex items-center gap-2 text-sm text-primary hover:underline underline decoration-dotted"
        >
          <Languages className="h-4 w-4" />
          {language === 'english' ? 'Translate to Tagalog' : 'Translate to English'}
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={translations[language].searchCampaigns}
            className="pl-9"
            value={search}
            onChange={(e) => { stopVoiceOnClick(); setSearch(e.target.value); }}
          />
        </div>
        <select
          className="rounded-md border border-input bg-background px-3 py-2 text-sm"
          value={category}
          onChange={(e) => { stopVoiceOnClick(); setCategory(e.target.value); }}
        >
          {categories.map((c) => <option key={c}>{c}</option>)}
        </select>
        <select
          className="rounded-md border border-input bg-background px-3 py-2 text-sm"
          value={priority}
          onChange={(e) => { stopVoiceOnClick(); setPriority(e.target.value); }}
        >
          {priorities.map((p) => <option key={p}>{p}</option>)}
        </select>
      </div>

      {/* Campaign grid */}
      {loading ? (
        <div className="flex items-center justify-center py-16 text-muted-foreground">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mr-3"></div>
          {translations[language].loadingCampaigns}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayed.map((c) => {
            const contentList = campaignContent[c.id] || [];
            const firstImage = contentList.find(item => item.content_type !== 'video' && item.media_url);
            const firstVideo = contentList.find(item => item.content_type === 'video' && item.media_url);
            const hasContent = contentList.length > 0;
            const t = translations[language];

            return (
              <Card key={c.id} className="hover:shadow-md transition-shadow flex flex-col">
                {hasContent && (
                  <div className="h-40 overflow-hidden bg-muted">
                    {firstVideo ? (
                      <video src={firstVideo.media_url} className="w-full h-full object-cover" />
                    ) : firstImage ? (
                      <img src={firstImage.media_url} alt={c.title} className="w-full h-full object-cover" />
                    ) : null}
                  </div>
                )}
                <CardHeader>
                  <div className="flex items-center justify-between mb-1">
                    <Badge variant={priorityVariant[c.priority] || "secondary"}>{c.priority || "general"}</Badge>
                    <span className="text-xs text-muted-foreground capitalize">
                      {(c.category || c.campaign_type || "community").replace(/_/g, " ")}
                    </span>
                  </div>
                  <CardTitle className="text-base">{c.title}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {(c.objectives || c.description || "View this campaign for more details.")
                      .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '')
                      .replace(/[•✅📍📞📅🏆🚫🚗🧹🏥]/g, '')
                      .replace(/^\s*\n*/,'').trim()
                    }
                  </CardDescription>
                </CardHeader>
                <CardFooter className="justify-center gap-3 mt-auto">
                  <Button variant="default" size="sm" onClick={() => { stopVoiceOnClick(); setSelected(c); }}>
                    {t.readMore} <ArrowRight className="h-3 w-3 ml-1" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleListen(c)}>
                    {playing === c.id ? (
                      <>
                        <Square className="h-4 w-4 mr-1" />
                        {t.stop}
                      </>
                    ) : (
                      <>
                        <Volume2 className="h-4 w-4 mr-1" />
                        {t.listen}
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}

      {!loading && displayed.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <Megaphone className="h-10 w-10 mx-auto mb-2 opacity-30" />
          <p className="font-medium">{translations[language].noPublishedCampaigns}</p>
          <p className="text-xs mt-1">{translations[language].campaignsWillAppear}</p>
        </div>
      )}
    </div>
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
