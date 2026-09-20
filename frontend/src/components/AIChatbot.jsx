import React, { useState, useEffect, useRef } from "react";
import { MessageSquare, X, Send, Bot, User, Settings, Brain, Upload, Save, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { generateAIResponse } from "@/lib/ai.js";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase.js";
import { useLanguage } from "@/components/LanguageToggle.jsx";

export default function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const language = useLanguage();
  const [messages, setMessages] = useState([
    { 
      role: "assistant", 
      content: language === 'tl' 
        ? "Kumusta! Ako ang iyong Barangay 178 Assistant. Paano kita makatulong sa paghahanda o pagiging ligtas ngayon?" 
        : "Hello! I am your Barangay 178 Assistant. How can I help you prepare or stay safe today?"
    }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Update initial message when language changes
  useEffect(() => {
    setMessages([
      { 
        role: "assistant", 
        content: language === 'tl' 
          ? "Kumusta! Ako ang iyong Barangay 178 Assistant. Paano kita makatulong sa paghahanda o pagiging ligtas ngayon?" 
          : "Hello! I am your Barangay 178 Assistant. How can I help you prepare or stay safe today?"
      }
    ]);
  }, [language]);

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMsg = { role: "user", content: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    try {
      const history = messages.map(m => `${m.role}: ${m.content}`).join("\n");
      const prompt = `${history}\nuser: ${userMsg.content}`;

      // Language-specific system prompt
      const systemPrompt = language === 'tl' 
        ? "Ikaw ay isang mabuti, maikli, at tumpak na katulong sa kaligtasan para sa Barangay 178 Public Safety Campaign System. MGA BILIS NG IMPORMASYON: Ang kasalukuyang Punong Barangay (Barangay Captain) ng Barangay 178 sa Caloocan City ay si Editha Labasbas. TUNGKOL SA SISTEMA: Ang Barangay 178 Safety Campaign System ay isang online portal para sa mga residente na tingnan ang mga public safety campaigns (kaligtasan sa sunog, kalusugan, paghahanda sa disaster, anti-drug, etc.), basahin ang emergency info, makinig sa AI voice announcements ng safety content, kumuha ng community surveys, tumanggap ng real-time notifications, at mag-submit ng feedback/complaints nang direkta sa mga barangay officials. Kasama rito ang offline mode na nagpapahintulot sa mga residente na ma-access ang mga na-save na campaigns kahit walang internet. MGA KATITIKAN: 1) Maaari kang SAGOT LANG ng mga katanungan tungkol sa Public Safety Campaign system at basic Barangay 178 official info. 2) Kung magtanong ang user ng hindi kaugnay na katanungan, KAILANGAN mong tumanggi nang maayos at sabihin: 'Paumanhin po, pero makakatulong lang ako sa mga katanungan tungkol sa Public Safety Campaign system at Barangay 178.' 3) Kung lang mag-greet ang user ('Kumusta', 'Hello'), sumagot nang normal, ipakilala ang iyong sarili bilang Public Safety Campaign Assistant, at mag-alok ng tulong. 4) Kung magtanong sila kung paano magsumit ng concerns, complaints, feedback, o suggestions, KAILANGAN mong sabihin sa kanila: 'Mangyaring mag-sign up o mag-log in sa iyong Resident account, pagkatapos ay pumunta sa Feedback section para magsumit ng iyong concern.' Panatilihin ang mga sagot na hindi aabot sa 3 maikling parapo."
        : "You are a helpful, brief, and accurate safety assistant for the Barangay 178 Public Safety Campaign System. FAST FACTS: The current Punong Barangay (Barangay Captain) of Barangay 178 in Caloocan City is Editha Labasbas. ABOUT THE SYSTEM: The Barangay 178 Safety Campaign System is an online portal for residents to view public safety campaigns (fire safety, health, disaster preparedness, anti-drug, etc.), read emergency info, hear AI voice announcements of safety content, take community surveys, receive real-time notifications, and submit feedback/complaints directly to the barangay officials. It also includes an offline mode that allows residents to access previously saved campaigns even without internet. STRICT RULES: 1) You may ONLY answer questions related to the Public Safety Campaign system and basic Barangay 178 official info. 2) If a user asks an unrelated question, you MUST politely refuse and say: 'I'm sorry, but I can only assist with questions related to the Public Safety Campaign system and Barangay 178.' 3) If a user simply greets you ('Hi', 'Hello'), respond normally, introduce yourself as the Public Safety Campaign Assistant, and offer help. 4) If they ask how to submit concerns, complaints, feedback, or suggestions, you MUST tell them: 'Please sign up or log in to your Resident account, then go to the Feedback section to submit your concern.' Keep answers under 3 short paragraphs.";

      const response = await generateAIResponse(systemPrompt, prompt);

      setMessages((prev) => [...prev, { role: "assistant", content: response }]);
    } catch (error) {
      console.error("Chatbot error:", error);
      const errorStr = error.message?.toLowerCase() || "";
      const isKeyMissing = errorStr.includes("api key is not configured") || errorStr.includes("api_key");
      const isRateLimit = errorStr.includes("429") || errorStr.includes("quota") || errorStr.includes("too many requests");

      let errMsg = language === 'tl'
        ? "Paumanhin, may problema sa koneksyon ngayon. Mangyaring subukan ulit mamaya."
        : "Sorry, I am having trouble connecting right now. Please try again later.";
      
      if (isKeyMissing) {
        errMsg = language === 'tl'
          ? "Ang Gemini API key ay nawawala. Mangyaring magdagdag ng VITE_GEMINI_API_KEY sa iyong environment variables."
          : "The Gemini API key is missing. Please add VITE_GEMINI_API_KEY to your environment variables.";
      } else if (isRateLimit) {
        errMsg = language === 'tl'
          ? "Masyadong mabilis ang iyong pagtatanong at naabot natin ang API rate limit. Mangyaring maghintay ng isang minuto at subukang magtanong ulit!"
          : "You are asking questions a bit too quickly and we have hit the API rate limit. Please wait about a minute and try asking again!";
      }
      setMessages((prev) => [...prev, { role: "assistant", content: errMsg }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={cn(
          "fixed bottom-6 right-6 h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:bg-primary/90 transition-all z-50 animate-bobbing",
          isOpen && "scale-0 opacity-0"
        )}
      >
        <MessageSquare className="h-6 w-6" />
      </button>

      {/* Chat Window */}
      <div
        className={cn(
          "fixed bottom-6 right-6 w-[350px] sm:w-[400px] h-[600px] max-h-[85vh] bg-white rounded-2xl shadow-2xl border border-border flex flex-col transition-all z-50 origin-bottom-right duration-300",
          isOpen ? "scale-100 opacity-100" : "scale-50 opacity-0 pointer-events-none"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border bg-primary/5 rounded-t-2xl">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary">
              <Bot className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">Barangay 178 Assistant</h3>
              <p className="text-xs text-muted-foreground">Public Safety Campaign</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="h-8 w-8 rounded-full flex items-center justify-center text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
              aria-label="Close chatbot"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, i) => (
            <div key={i} className={cn("flex gap-2 max-w-[85%]", msg.role === "user" ? "ml-auto flex-row-reverse" : "")}>
              <div className={cn("h-6 w-6 shrink-0 rounded-full flex items-center justify-center text-xs", 
                msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              )}>
                {msg.role === "user" ? <User className="h-3 w-3" /> : <Bot className="h-3 w-3" />}
              </div>
              <div className={cn("rounded-2xl px-3 py-2 text-sm whitespace-pre-line", 
                msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
              )}>
                {msg.content.replace(/\*/g, '')}
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex gap-2 max-w-[85%]">
              <div className="h-6 w-6 shrink-0 rounded-full bg-muted text-muted-foreground flex items-center justify-center">
                <Bot className="h-3 w-3" />
              </div>
              <div className="rounded-2xl px-3 py-2 text-sm bg-muted text-foreground flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" />
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSend} className="p-3 border-t border-border flex gap-2">
          <Input 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a safety question..."
            className="flex-1 rounded-full"
            disabled={isTyping}
          />
          <Button
            type="submit"
            size="icon"
            className="rounded-full shrink-0"
            disabled={!input.trim() || isTyping}
            loading={isTyping}
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </>
  );
}
