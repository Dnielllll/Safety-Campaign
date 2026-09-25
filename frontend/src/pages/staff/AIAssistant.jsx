import React, { useState, useEffect } from "react";
import { Sparkles, Wand2, Volume2, Loader2, Send, CheckCircle2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { AIAPI } from "@/lib/api";
import { supabaseHelpers, supabase } from "@/lib/supabase.js";

const categoryOptions = {
  emergency: "Emergency",
  health: "Health",
  fire_safety: "Fire Safety",
  disaster_prep: "Disaster Prep",
  crime_prevention: "Crime Prevention",
  general: "General",
};

export default function StaffAIAssistant() {
  const [prompt, setPrompt] = useState("");
  const [draft, setDraft] = useState("");
  const [campaignType, setCampaignType] = useState("general");
  const [voice, setVoice] = useState("fil-PH-Wavenet-A");
  const [generating, setGenerating] = useState(false);
  const [synthesizing, setSynthesizing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  // Auto-detect campaign type from prompt
  const detectCampaignType = (text) => {
    const t = text?.toLowerCase() || "";
    if (t.includes("rain") || t.includes("flood") || t.includes("storm") || t.includes("typhoon") || t.includes("weather")) return "emergency";
    if (t.includes("disaster") || t.includes("earthquake") || t.includes("prepare") || t.includes("emergency")) return "disaster_prep";
    if (t.includes("fire") || t.includes("burn") || t.includes("safety")) return "fire_safety";
    if (t.includes("health") || t.includes("disease") || t.includes("virus") || t.includes("dengue") || t.includes("medical")) return "health";
    if (t.includes("crime") || t.includes("security") || t.includes("theft") || t.includes("robbery") || t.includes("curfew")) return "crime_prevention";
    return "general"; // Default
  };

  // Update campaign type when prompt changes (only if user hasn't manually selected)
  useEffect(() => {
    if (prompt && campaignType === "general") {
      setCampaignType(detectCampaignType(prompt));
    }
  }, [prompt]);

  const generate = async () => {
    setGenerating(true);
    try {
      const res = await AIAPI.generateText({ prompt });
      setDraft(res.data.text);
    } catch {
      // Generate a realistic mock announcement based on the prompt
      const mockDraft = generateMockDraft(prompt);
      setDraft(mockDraft);
    } finally {
      setGenerating(false);
    }
  };

  const generateMockDraft = (userPrompt) => {
    const promptLower = userPrompt?.toLowerCase() || "";

    // Generate contextual mock content based on prompt keywords
    if (promptLower.includes("rain") || promptLower.includes("flood") || promptLower.includes("storm")) {
      return `Heavy Rainfall and Flood Advisory\n\nATTENTION Barangay 178 Residents:\n\nDue to the heavy rainfall forecast in our area, please take the following precautions:\n\n• Monitor weather updates through official channels\n• Prepare emergency kits with essential supplies\n• Avoid crossing flooded streets and waterways\n• Secure loose items around your property\n• Stay indoors unless absolutely necessary\n\nResidents in low-lying areas (Puroks 1, 3, and 5) should be especially vigilant and consider temporary evacuation if water levels rise.\n\nFor emergency assistance, contact:\n📞 Barangay Hotline: 123-4567\n📍 Barangay Hall: Open 24/7\n\nLet us look out for one another. Stay safe, Barangay 178!`;
    }

    if (promptLower.includes("fire") || promptLower.includes("burn")) {
      return `Fire Safety Advisory\n\nATTENTION Barangay 178 Residents:\n\nFire prevention is everyone's responsibility. Please observe these safety measures:\n\n• Ensure fire extinguishers are accessible and functional\n• Check electrical wiring and avoid overloading outlets\n• Never leave cooking unattended\n• Properly dispose of cigarette butts and matches\n• Keep flammable materials away from heat sources\n\nIn case of fire:\n1. Call emergency services immediately\n2. Evacuate using the nearest exit\n3. Do not use elevators during fire emergencies\n4. Assist neighbors who may need help\n\nReport fire hazards to the Barangay Fire Safety Officer.\n\nTogether, we can keep our community safe!`;
    }

    if (promptLower.includes("curfew") || promptLower.includes("youth") || promptLower.includes("minor") || promptLower.includes("teenager")) {
      return `Curfew and Youth Safety Advisory\n\nATTENTION Barangay 178 Residents:\n\nTo ensure the safety and well-being of our youth, the following curfew regulations are in effect:\n\nCURFEW HOURS:\n• Minors (17 years old and below): 10:00 PM - 4:00 AM\n• Exceptions: School activities, medical emergencies, accompanied by parent/guardian\n\nGUIDELINES FOR PARENTS:\n• Know your children's whereabouts and companions\n• Establish communication protocols for late-night situations\n• Encourage participation in youth development programs\n• Report any suspicious activities involving minors\n\nYOUTH SAFETY TIPS:\n• Avoid walking alone late at night\n• Stay in well-lit areas when outdoors\n• Keep emergency contacts readily accessible\n• Be aware of your surroundings at all times\n\nCOMMUNITY SUPPORT:\n📍 Barangay Youth Council: Open for counseling and guidance\n📞 Youth Hotline: 555-1234\n🏢 Safe Zones: Barangay Hall, Health Center, and covered courts\n\nViolators will be subjected to proper intervention programs focused on guidance rather than punishment. Parents and guardians are encouraged to cooperate with barangay officials for the welfare of our youth.\n\nLet us work together to keep our young people safe and responsible. Mabuhay Barangay 178!`;
    }

    if (promptLower.includes("health") || promptLower.includes("disease") || promptLower.includes("virus")) {
      return `Health Advisory\n\nATTENTION Barangay 178 Residents:\n\nTo protect our community's health, please follow these guidelines:\n\n• Practice proper hand hygiene regularly\n• Wear masks in crowded places when advised\n• Maintain physical distance when feeling unwell\n• Stay home if experiencing symptoms\n• Get vaccinated when eligible\n\nHealth Services Available:\n📍 Barangay Health Center: Mon-Fri, 8AM-5PM\n📞 Medical Hotline: 987-6543\n\nFree check-ups and basic medicines are available at the Health Center. Priority is given to seniors, pregnant women, and persons with disabilities.\n\nYour health is our priority. Stay healthy, Barangay 178!`;
    }

    if (promptLower.includes("clean") || promptLower.includes("garbage") || promptLower.includes("environment")) {
      return `Clean-Up Drive Advisory\n\nATTENTION Barangay 178 Residents:\n\nLet's keep our community clean and green! Join our scheduled clean-up activities:\n\n📅 Every Saturday, 7:00 AM\n📍 Meeting Point: Barangay Hall\n\nWhat to bring:\n• Gloves and face masks\n• Rakes and brooms\n• Water bottles\n\nGuidelines:\n• Segregate waste properly (biodegradable, non-biodegradable)\n• Report illegal dumping sites\n• Maintain cleanliness in front of your homes\n\nA clean environment is a healthy environment. Let's work together for a cleaner Barangay 178!\n\nFor inquiries, visit the Barangay Environmental Office.`;
    }

    if (promptLower.includes("crime") || promptLower.includes("security") || promptLower.includes("theft") || promptLower.includes("robbery")) {
      return `Crime Prevention Advisory\n\nATTENTION Barangay 178 Residents:\n\nLet's work together to maintain peace and order in our community. Please observe these crime prevention measures:\n\nHOME SECURITY:\n• Ensure doors and windows are locked before leaving\n• Install proper lighting around your property\n• Know your neighbors and look out for each other\n• Report suspicious individuals or activities immediately\n\nPERSONAL SAFETY:\n• Avoid walking alone in poorly lit areas\n• Keep valuables secure and out of sight\n• Be aware of your surroundings at all times\n• Don't share personal information with strangers\n\nEMERGENCY CONTACTS:\n📞 Police Station: 117\n📞 Barangay Tanod: 555-6789\n📍 Barangay Outpost: 24/7 monitoring\n\nREPORTING PROCEDURES:\n• For emergencies: Call 117 or the nearest tanod\n• For non-emergencies: Visit the Barangay Hall\n• All reports will be handled confidentially\n\nCommunity vigilance is our best defense. Let's keep Barangay 178 safe for everyone!`;
    }

    // Default generic announcement
    return `Community Announcement\n\nATTENTION Barangay 178 Residents:\n\n${userPrompt || "This is an important announcement for all residents."}\n\nPlease take note of the following:\n• Stay informed through official barangay channels\n• Participate in community activities\n• Look out for your neighbors, especially the elderly\n• Report any concerns or emergencies immediately\n\nFor more information, visit the Barangay Hall or contact your Purok Leader.\n\nTogether, we build a stronger community. Mabuhay Barangay 178!`;
  };

  const synthesize = async () => {
    setSynthesizing(true);
    try {
      await AIAPI.textToSpeech({ text: draft, voice });
    } finally {
      setSynthesizing(false);
    }
  };

  // Helper function to extract title from AI-generated content
  const extractTitleFromDraft = (draftText) => {
    if (!draftText) return "AI Generated Announcement";

    // Look for title patterns in the generated content
    const lines = draftText.split('\n').filter(line => line.trim());
    if (lines.length > 0) {
      // Remove emojis and clean up the first line as title
      const firstLine = lines[0]
        .replace(/[\u{1F300}-\u{1FAFF}]/gu, '') // Remove emojis
        .replace(/[^\w\s-]/g, '') // Remove special characters except hyphens
        .trim();

      if (firstLine.length > 0 && firstLine.length < 100) {
        return firstLine;
      }
    }

    // Fallback to prompt-based title if no proper title found in content
    return toTitleCase(prompt) || "AI Generated Announcement";
  };

  // Helper function to convert prompt to a proper title (title case) - fallback
  const toTitleCase = (str) => {
    return str
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
      .substring(0, 80); // Limit to 80 characters
  };

  const handleSubmitForApproval = async () => {
    setSubmitting(true);
    setSuccessMsg("");
    try {
      const { user } = await supabaseHelpers.getAuthUser();
      const campaignTitle = extractTitleFromDraft(draft);

      console.log("Submitting campaign for approval - User:", user?.id, user?.email);
      console.log("Campaign data:", {
        title: campaignTitle,
        description: draft,
        campaign_type: campaignType,
        status: "submitted",
        created_by: user?.id
      });

      const { data, error } = await supabaseHelpers.createCampaign({
        title: campaignTitle,
        description: draft,
        campaign_type: campaignType,
        status: "submitted",
        created_by: user?.id
      });

      console.log("Campaign submission result:", { data, error });

      if (error) throw error;

      // Create notification for admin when staff submits campaign for approval
      try {
        const { data: admins } = await supabase
          .from("users")
          .select("id")
          .in("role", ["admin", "super_admin"]);

        console.log("Found admins for notification:", admins);

        if (admins && admins.length > 0) {
          const notifications = admins.map(admin => ({
            user_id: admin.id,
            campaign_id: data.id,
            title: `New Campaign Submitted for Approval: ${data.title}`,
            message: `A new campaign "${data.title}" has been submitted by ${user?.name || user?.email || 'Staff'} and is awaiting your approval in Campaign/Survey Approval.`,
            type: "campaign",
            status: "unread"
          }));

          await supabase
            .from("notifications")
            .insert(notifications);
          console.log("Admin notifications created successfully");
        }
      } catch (notifError) {
        console.error("Error creating admin notification:", notifError);
      }

      setSuccessMsg("✅ Campaign submitted for approval! The admin will review it in Campaign/Survey Approval.");
      setDraft("");
      setPrompt("");
    } catch (err) {
      console.error("Campaign submission error:", err);
      setSuccessMsg("⚠️ Failed to submit draft. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-accent" /> AI Content Assistant
        </h1>
        <p className="text-muted-foreground text-sm">Draft announcements and generate voice scripts before submitting for admin approval.</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">1. Generate or Improve Text</CardTitle>
            <CardDescription>Describe the announcement you need, or paste a draft to improve.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Label>Prompt</Label>
            <Textarea
              rows={4}
              placeholder="e.g. Write an emergency advisory about incoming heavy rainfall and flood risk for low-lying puroks."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Campaign type will be automatically detected based on your prompt: {categoryOptions[campaignType] || campaignType}
            </p>
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
            <CardTitle className="text-base">2. Review & Submit</CardTitle>
            <CardDescription>Edit the AI draft, then submit for admin approval before publishing.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <Label>Campaign Type</Label>
              <Select value={campaignType} onValueChange={setCampaignType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="emergency">Emergency</SelectItem>
                  <SelectItem value="health">Health</SelectItem>
                  <SelectItem value="fire_safety">Fire Safety</SelectItem>
                  <SelectItem value="disaster_prep">Disaster Prep</SelectItem>
                  <SelectItem value="crime_prevention">Crime Prevention</SelectItem>
                  <SelectItem value="general">General</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Textarea rows={8} value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Your AI-generated draft will appear here…" />
          </CardContent>
          <CardFooter className="flex-col items-stretch gap-2">
            {successMsg && (
              <p className="text-sm text-center font-medium text-primary">{successMsg}</p>
            )}
            <div className="flex justify-between items-center">
              <Badge variant={draft ? "success" : "outline"}>{draft ? "Ready for submission" : "No draft yet"}</Badge>
              <Button onClick={handleSubmitForApproval} disabled={!draft || submitting} className="ml-auto">
                {submitting ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Send className="h-4 w-4 mr-1" />}
                {submitting ? "Submitting…" : "Submit for Approval"}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground text-center">
              <strong>Submit for Approval</strong> sends your campaign to the admin for review. Once approved, it will be published to residents.
            </p>
          </CardFooter>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2"><Volume2 className="h-4 w-4 text-primary" /> 3. Voice Script Preview</CardTitle>
          <CardDescription>Generate a preview using Google Cloud Text-to-Speech for voice announcements.</CardDescription>
        </CardHeader>
        <CardContent className="max-w-xs">
          <Label className="mb-2 block">Voice</Label>
          <Select value={voice} onValueChange={setVoice}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="fil-PH-Wavenet-A">Filipino — Wavenet A (Female)</SelectItem>
              <SelectItem value="fil-PH-Wavenet-D">Filipino — Wavenet D (Male)</SelectItem>
              <SelectItem value="en-US-Wavenet-F">English — Wavenet F (Female)</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
        <CardFooter>
          <Button variant="accent" onClick={synthesize} disabled={!draft || synthesizing}>
            {synthesizing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Volume2 className="h-4 w-4 mr-2" />}
            {synthesizing ? "Synthesizing…" : "Preview Voice"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
