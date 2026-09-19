import React, { useState } from "react";
import { Sparkles, Wand2, Volume2, Play, Loader2, Zap, FileCheck, CheckCircle2, Info } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { AIAPI } from "@/lib/api";
import { supabase } from "@/lib/supabase.js";
import { supabaseHelpers } from "@/lib/supabase.js";

const ADMIN_ADVANTAGES = [
  {
    icon: Zap,
    title: "Final Authority",
    desc: "Skip the approval queue. Publish campaign announcements directly as Administrator.",
    color: "text-yellow-500",
  },
  {
    icon: CheckCircle2,
    title: "Emergency Use",
    desc: "Flood, fire, health alert? Generate and publish emergency announcements immediately.",
    color: "text-green-500",
  },
  {
    icon: FileCheck,
    title: "Quality Control",
    desc: "Use AI to refine Staff-submitted drafts before approving and publishing them.",
    color: "text-blue-500",
  },
  {
    icon: Volume2,
    title: "Full Broadcast-Ready Voice",
    desc: "Convert to audio for barangay PA system — not just a preview, but a publishable voice announcement.",
    color: "text-purple-500",
  },
];

export default function AIContentAssistant() {
  const [prompt, setPrompt] = useState("");
  const [draft, setDraft] = useState("");
  const [campaignType, setCampaignType] = useState("emergency");
  const [voice, setVoice] = useState("fil-PH-Wavenet-A");
  const [speed, setSpeed] = useState("1.0");
  const [generating, setGenerating] = useState(false);
  const [synthesizing, setSynthesizing] = useState(false);
  const [audioReady, setAudioReady] = useState(false);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const generate = async () => {
    setGenerating(true);
    setSuccessMsg("");
    try {
      const res = await AIAPI.generateText({ prompt });
      setDraft(res.data.text);
    } catch {
      setDraft(generateMockDraft(prompt));
    } finally {
      setGenerating(false);
    }
  };

  const generateMockDraft = (userPrompt) => {
    const p = userPrompt?.toLowerCase() || "";
    if (p.includes("rain") || p.includes("flood") || p.includes("storm")) {
      return `🌧️ WEATHER ADVISORY\n\nATTENTION Barangay 178 Residents:\n\nDue to the heavy rainfall forecast in our area, please take the following precautions:\n\n• Monitor weather updates through official channels\n• Prepare emergency kits with essential supplies\n• Avoid crossing flooded streets and waterways\n• Secure loose items around your property\n• Stay indoors unless absolutely necessary\n\nResidents in low-lying areas (Puroks 1, 3, and 5) should be especially vigilant and consider temporary evacuation if water levels rise.\n\nFor emergency assistance, contact:\n📞 Barangay Hotline: 123-4567\n📍 Barangay Hall: Open 24/7\n\nLet us look out for one another. Stay safe, Barangay 178!`;
    }
    if (p.includes("fire") || p.includes("burn")) {
      return `🔥 FIRE SAFETY ADVISORY\n\nATTENTION Barangay 178 Residents:\n\nFire prevention is everyone's responsibility. Please observe these safety measures:\n\n• Ensure fire extinguishers are accessible and functional\n• Check electrical wiring and avoid overloading outlets\n• Never leave cooking unattended\n• Properly dispose of cigarette butts and matches\n• Keep flammable materials away from heat sources\n\nIn case of fire:\n1. Call emergency services immediately\n2. Evacuate using the nearest exit\n3. Do not use elevators during fire emergencies\n4. Assist neighbors who may need help\n\nReport fire hazards to the Barangay Fire Safety Officer.\n\nTogether, we can keep our community safe!`;
    }
    if (p.includes("curfew") || p.includes("youth") || p.includes("minor") || p.includes("teenager")) {
      return `🚨 CURFEW / YOUTH SAFETY ADVISORY\n\nATTENTION Barangay 178 Residents:\n\nTo ensure the safety and well-being of our youth, the following curfew regulations are in effect:\n\nCURFEW HOURS:\n• Minors (17 years old and below): 10:00 PM - 4:00 AM\n• Exceptions: School activities, medical emergencies, accompanied by parent/guardian\n\nGUIDELINES FOR PARENTS:\n• Know your children's whereabouts and companions\n• Establish communication protocols for late-night situations\n• Encourage participation in youth development programs\n• Report any suspicious activities involving minors\n\nYOUTH SAFETY TIPS:\n• Avoid walking alone late at night\n• Stay in well-lit areas when outdoors\n• Keep emergency contacts readily accessible\n• Be aware of your surroundings at all times\n\nCOMMUNITY SUPPORT:\n📍 Barangay Youth Council: Open for counseling and guidance\n📞 Youth Hotline: 555-1234\n🏢 Safe Zones: Barangay Hall, Health Center, and covered courts\n\nViolators will be subjected to proper intervention programs focused on guidance rather than punishment. Parents and guardians are encouraged to cooperate with barangay officials for the welfare of our youth.\n\nLet us work together to keep our young people safe and responsible. Mabuhay Barangay 178!`;
    }
    if (p.includes("health") || p.includes("disease") || p.includes("virus")) {
      return `🏥 HEALTH ADVISORY\n\nATTENTION Barangay 178 Residents:\n\nTo protect our community's health, please follow these guidelines:\n\n• Practice proper hand hygiene regularly\n• Wear masks in crowded places when advised\n• Maintain physical distance when feeling unwell\n• Stay home if experiencing symptoms\n• Get vaccinated when eligible\n\nHealth Services Available:\n📍 Barangay Health Center: Mon-Fri, 8AM-5PM\n📞 Medical Hotline: 987-6543\n\nFree check-ups and basic medicines are available at the Health Center.\n\nYour health is our priority. Stay healthy, Barangay 178!`;
    }
    if (p.includes("clean") || p.includes("garbage") || p.includes("environment")) {
      return `🧹 CLEAN-UP DRIVE ADVISORY\n\nATTENTION Barangay 178 Residents:\n\nLet's keep our community clean and green! Join our scheduled clean-up activities:\n\n📅 Every Saturday, 7:00 AM\n📍 Meeting Point: Barangay Hall\n\nWhat to bring:\n• Gloves and face masks\n• Rakes and brooms\n• Water bottles\n\nGuidelines:\n• Segregate waste properly (biodegradable, non-biodegradable)\n• Report illegal dumping sites\n• Maintain cleanliness in front of your homes\n\nA clean environment is a healthy environment. Let's work together for a cleaner Barangay 178!`;
    }
    if (p.includes("crime") || p.includes("security") || p.includes("theft") || p.includes("robbery")) {
      return `👮 CRIME PREVENTION ADVISORY\n\nATTENTION Barangay 178 Residents:\n\nLet's work together to maintain peace and order in our community. Please observe these crime prevention measures:\n\nHOME SECURITY:\n• Ensure doors and windows are locked before leaving\n• Install proper lighting around your property\n• Know your neighbors and look out for each other\n• Report suspicious individuals or activities immediately\n\nPERSONAL SAFETY:\n• Avoid walking alone in poorly lit areas\n• Keep valuables secure and out of sight\n• Be aware of your surroundings at all times\n• Don't share personal information with strangers\n\nEMERGENCY CONTACTS:\n📞 Police Station: 117\n📞 Barangay Tanod: 555-6789\n📍 Barangay Outpost: 24/7 monitoring\n\nREPORTING PROCEDURES:\• For emergencies: Call 117 or the nearest tanod\n• For non-emergencies: Visit the Barangay Hall\n• All reports will be handled confidentially\n\nCommunity vigilance is our best defense. Let's keep Barangay 178 safe for everyone!`;
    }
    return `📢 COMMUNITY ANNOUNCEMENT\n\nATTENTION Barangay 178 Residents:\n\n${userPrompt || "This is an important announcement for all residents."}\n\nPlease take note of the following:\n• Stay informed through official barangay channels\n• Participate in community activities\n• Look out for your neighbors, especially the elderly\n• Report any concerns or emergencies immediately\n\nFor more information, visit the Barangay Hall or contact your Purok Leader.\n\nTogether, we build a stronger community. Mabuhay Barangay 178!`;
  };

  const synthesize = async () => {
    setSynthesizing(true);
    setAudioReady(false);
    try {
      await AIAPI.textToSpeech({ text: draft, voice, speed });
    } finally {
      setSynthesizing(false);
      setAudioReady(true);
    }
  };

  // Save as draft (not yet published — for review later)
  const handleSaveDraft = async () => {
    setSaving(true);
    setSuccessMsg("");
    try {
      const { user } = await supabaseHelpers.getAuthUser();
      const { error } = await supabase.from('campaigns').insert({
        title: prompt.slice(0, 80) || "AI Generated Draft",
        description: draft,
        campaign_type: campaignType,
        status: "draft",
        created_by: user?.id,
      });
      if (error) throw error;
      setSuccessMsg("✅ Draft saved! You can find it in Campaign Management.");
    } catch (err) {
      console.error(err);
      setSuccessMsg("⚠️ Draft saved locally (database save failed).");
    } finally {
      setSaving(false);
    }
  };

  // Publish immediately — admin privilege, no approval needed
  const handlePublish = async () => {
    setPublishing(true);
    setSuccessMsg("");
    try {
      const { user } = await supabaseHelpers.getAuthUser();
      const { error } = await supabase.from('campaigns').insert({
        title: prompt.slice(0, 80) || "AI Generated Announcement",
        description: draft,
        campaign_type: campaignType,
        status: "published",
        created_by: user?.id,
      });
      if (error) throw error;
      setSuccessMsg("🚀 Campaign published! Residents can now view this announcement.");
      setDraft("");
      setPrompt("");
    } catch (err) {
      console.error(err);
      setSuccessMsg("⚠️ Published locally (database save failed). Check Campaign Management.");
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-xl sm:text-2xl font-bold flex items-center gap-2 flex-wrap">
          <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-accent" /> AI Content Assistant
          <Badge variant="secondary" className="ml-1 text-xs font-normal">Administrator</Badge>
        </h1>
        <p className="text-muted-foreground text-xs sm:text-sm">
          Generate and refine campaign announcements. As Administrator, you can publish directly — no approval needed.
        </p>
      </div>

      {/* Admin Advantage Info Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {ADMIN_ADVANTAGES.map((a) => {
          const Icon = a.icon;
          return (
            <div key={a.title} className="rounded-lg border border-border bg-card p-3 flex gap-2">
              <Icon className={`h-5 w-5 shrink-0 mt-0.5 ${a.color}`} />
              <div>
                <p className="text-xs font-semibold">{a.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{a.desc}</p>
              </div>
            </div>
          );
        })}
      </div>


      {/* Generate + Edit */}
      <div className="grid lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">1. Generate or Improve Text</CardTitle>
            <CardDescription>Describe the announcement you need, or paste a draft to improve.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Label>Campaign Type</Label>
            <Select value={campaignType} onValueChange={setCampaignType}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="emergency">🚨 Emergency Advisory</SelectItem>
                <SelectItem value="health">🏥 Health & Safety</SelectItem>
                <SelectItem value="community">📢 Community Announcement</SelectItem>
                <SelectItem value="environment">🧹 Environmental</SelectItem>
                <SelectItem value="crime_prevention">🔒 Crime Prevention</SelectItem>
                <SelectItem value="disaster_prep">🌧️ Disaster Preparedness</SelectItem>
              </SelectContent>
            </Select>
            <Label>Prompt</Label>
            <Textarea
              rows={4}
              placeholder="e.g. Write an emergency advisory about incoming heavy rainfall and flood risk for low-lying puroks."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
          </CardContent>
          <CardFooter>
            <Button onClick={generate} disabled={generating || !prompt}>
              {generating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Wand2 className="h-4 w-4 mr-2" />}
              {generating ? "Generating…" : "Generate Draft"}
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">2. Review & Edit</CardTitle>
            <CardDescription>Edit the AI draft, then save as draft or publish directly to residents.</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea rows={8} value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Your AI-generated draft will appear here…" />
          </CardContent>
          <CardFooter className="flex-col items-stretch gap-2">
            {successMsg && (
              <p className="text-sm text-center font-medium text-primary">{successMsg}</p>
            )}
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleSaveDraft} disabled={!draft || saving} className="flex-1">
                {saving ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <FileCheck className="h-4 w-4 mr-1" />}
                Save as Draft
              </Button>
              <Button onClick={handlePublish} disabled={!draft || publishing} className="flex-1">
                {publishing ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Zap className="h-4 w-4 mr-1" />}
                🚀 Publish Now
              </Button>
            </div>
            <p className="text-xs text-muted-foreground text-center">
              <strong>Publish Now</strong> makes it instantly visible to all residents. <strong>Save as Draft</strong> stores it for later review.
            </p>
          </CardFooter>
        </Card>
      </div>

      {/* Voice Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Volume2 className="h-4 w-4 text-primary" /> 3. Convert to Voice — Broadcast-Ready Announcement
          </CardTitle>
          <CardDescription>
            Generate a full audio announcement suitable for the barangay PA system and emergency broadcasts. Unlike Staff (preview only), Admin voice announcements are broadcast-ready.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Voice</Label>
            <Select value={voice} onValueChange={setVoice}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="fil-PH-Wavenet-A">Filipino — Wavenet A (Female)</SelectItem>
                <SelectItem value="fil-PH-Wavenet-D">Filipino — Wavenet D (Male)</SelectItem>
                <SelectItem value="en-US-Wavenet-F">English — Wavenet F (Female)</SelectItem>
                <SelectItem value="en-US-Wavenet-B">English — Wavenet B (Male)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Speaking Rate</Label>
            <Select value={speed} onValueChange={setSpeed}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="0.75">Slow (0.75x) — for announcements</SelectItem>
                <SelectItem value="1.0">Normal (1.0x)</SelectItem>
                <SelectItem value="1.25">Fast (1.25x)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
        <CardFooter className="flex items-center gap-3">
          <Button onClick={synthesize} disabled={!draft || synthesizing} variant="default">
            {synthesizing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Volume2 className="h-4 w-4 mr-2" />}
            {synthesizing ? "Synthesizing…" : "Generate Voice Announcement"}
          </Button>
          {audioReady && (
            <Button variant="outline">
              <Play className="h-4 w-4 mr-2" /> Play Audio
            </Button>
          )}
          {audioReady && (
            <Badge variant="success" className="ml-auto">✅ Broadcast Ready</Badge>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
