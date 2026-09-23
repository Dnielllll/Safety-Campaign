import React, { useEffect, useState } from "react";
import { Siren, Phone, MapPin, AlertTriangle, Heart, Flame, Droplets, ShieldAlert, Ambulance, Building2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase.js";
import { EmergencyAPI } from "@/lib/api.js";
import { useTheme } from "@/components/ThemeProvider.jsx";

const defaultHotlines = [
  { name: "Barangay 178 Hall", number: "0921-463-6835", icon: Phone, color: "text-primary" },
  { name: "Barangay 178 Hotline", number: "0928-497-1332", icon: Siren, color: "text-destructive" },
  { name: "North Caloocan City Hall", number: "(02) 8288-8811", icon: Building2, color: "text-primary" },
  { name: "North Caloocan Police Station (PNP)", number: "(02) 8961-5724", icon: ShieldAlert, color: "text-accent" },
  { name: "Bureau of Fire Protection", number: "(02) 2255-772", icon: Flame, color: "text-orange-600" },
  { name: "Philippine Red Cross", number: "143", icon: Heart, color: "text-red-600" },
  { name: "Department of Health (DOH)", number: "(02) 8651-7800", icon: Ambulance, color: "text-green-600" },
  { name: "NDRRMC Operations Center", number: "(02) 8911-5061", icon: AlertTriangle, color: "text-yellow-600" },
  { name: "Caloocan CDRRMO", number: "0905-547-7817", icon: ShieldAlert, color: "text-yellow-600" },
  { name: "Caloocan 24/7 Emergency", number: "888-25664", icon: Phone, color: "text-primary" },
  { name: "National Emergency", number: "911", icon: Siren, color: "text-destructive" },
];

const evacuationCenters = [
  { name: "Barangay 178 Covered Court", address: "Purok 1, Camarin, North Caloocan City", capacity: "~500 persons" },
  { name: "Camarin National High School", address: "Camarin Road, Caloocan City", capacity: "~1,000 persons" },
  { name: "Novaliches District Hospital", address: "Quirino Highway, Novaliches", capacity: "Medical Facility" },
];

const safetyTips = [
  { category: "Fire Safety", tips: ["Keep fire extinguishers accessible", "Don't overload electrical outlets", "Have an escape plan and practice it", "Never leave candles or stoves unattended"] },
  { category: "Flood Preparedness", tips: ["Prepare a 72-hour emergency kit", "Know your evacuation route", "Move valuable items to higher ground", "Turn off electricity at the main switch"] },
  { category: "Earthquake Safety", tips: ["Drop, Cover, and Hold On", "Stay away from windows and heavy furniture", "After shaking stops, check for injuries", "Expect aftershocks"] },
];

export default function EmergencyInfo() {
  const { resetTheme } = useTheme();
  const [info, setInfo] = useState(null);

  // Force light mode for public pages
  useEffect(() => {
    resetTheme();
  }, [resetTheme]);

  useEffect(() => {
    EmergencyAPI.get().then((res) => setInfo(res.data)).catch(() => {});
  }, []);

  return (
    <div className="container py-8 space-y-8">
      {/* Emergency Alert Banner */}
      <div className="rounded-xl bg-destructive/10 border border-destructive/30 p-4 flex items-start gap-3">
        <Siren className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-destructive text-sm">In case of emergency, call 911 immediately.</p>
          <p className="text-xs text-muted-foreground mt-0.5">For non-emergency inquiries, contact the Barangay 178 hotline.</p>
        </div>
      </div>

      <div>
        <h1 className="font-display text-xl sm:text-2xl font-bold flex items-center gap-2">
          <ShieldAlert className="h-5 w-5 sm:h-6 sm:w-6 text-destructive" /> Emergency Information
        </h1>
        <p className="text-muted-foreground text-xs sm:text-sm mt-1">
          Important contacts, evacuation centers, and safety guidelines for Barangay 178 residents.
        </p>
      </div>

      {/* Emergency Hotlines */}
      <section>
        <h2 className="font-display text-lg font-semibold mb-3 flex items-center gap-2">
          <Phone className="h-5 w-5 text-primary" /> Emergency Hotlines
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {defaultHotlines.map((h) => {
            const Icon = h.icon;
            return (
              <Card key={h.name} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4 flex flex-col items-center text-center gap-2">
                  <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                    <Icon className={`h-5 w-5 ${h.color}`} />
                  </div>
                  <p className="text-xs font-medium leading-tight">{h.name}</p>
                  <a href={`tel:${h.number}`} className="text-lg font-bold font-display text-primary hover:underline">{h.number}</a>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Evacuation Centers */}
      <section>
        <h2 className="font-display text-lg font-semibold mb-3 flex items-center gap-2">
          <MapPin className="h-5 w-5 text-primary" /> Evacuation Centers
        </h2>
        <div className="grid md:grid-cols-3 gap-4">
          {evacuationCenters.map((e) => (
            <Card key={e.name}>
              <CardHeader>
                <CardTitle className="text-base">{e.name}</CardTitle>
                <CardDescription>{e.address}</CardDescription>
              </CardHeader>
              <CardContent>
                <Badge variant="secondary">Capacity: {e.capacity}</Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Safety Tips */}
      <section>
        <h2 className="font-display text-lg font-semibold mb-3 flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-primary" /> Disaster Preparedness Guidelines
        </h2>
        <div className="grid md:grid-cols-3 gap-4">
          {safetyTips.map((s) => (
            <Card key={s.category}>
              <CardHeader>
                <CardTitle className="text-base">{s.category}</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {s.tips.map((tip) => (
                    <li key={tip} className="text-sm flex items-start gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                      {tip}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
