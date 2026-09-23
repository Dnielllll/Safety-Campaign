import React, { useEffect } from "react";
import { MapPin, Users, Building2, Phone } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "@/components/ThemeProvider.jsx";

const officials = [
  { name: "Hon. Editha Besmonte Labasbas", position: "Punong Barangay (Captain)", role: "captain" },
  { name: "Hon. Eric Mauyao", position: "Committee on Budget Finance", role: "kagawad" },
  { name: "Hon. Karl Campos", position: "Committee on Education", role: "kagawad" },
  { name: "Hon. Art Asistio", position: "Committee on Housing & Anti Squatting", role: "kagawad" },
  { name: "Hon. Diolito Cevantes", position: "Committee on Infrastructure", role: "kagawad" },
  { name: "Hon. Eddie Arligue", position: "Committee on Livelihood", role: "kagawad" },
  { name: "Hon. Francia Marzol", position: "Committee on Health", role: "kagawad" },
  { name: "Hon. Gil Oro", position: "Committee on Peace and Order", role: "kagawad" },
];

export default function AboutBarangay() {
  const { resetTheme } = useTheme();

  // Force light mode for public pages
  useEffect(() => {
    resetTheme();
  }, [resetTheme]);

  return (
    <div className="container py-8 space-y-8">
      <div>
        <h1 className="font-display text-xl sm:text-2xl font-bold flex items-center gap-2">
          <Building2 className="h-5 w-5 sm:h-6 sm:w-6 text-primary" /> About Barangay 178
        </h1>
        <p className="text-muted-foreground text-xs sm:text-sm mt-1">
          Know your barangay officials and locate the barangay hall in Camarin, North Caloocan City.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Officials Section */}
        <section>
          <h2 className="font-display text-lg font-semibold mb-4 flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" /> Barangay Officials
          </h2>
          <div className="space-y-3">
            {officials.map((official, idx) => (
              <Card key={idx} className={official.role === "captain" ? "border-primary shadow-sm" : ""}>
                <CardContent className="p-4 flex items-center gap-4">
                  <div className={`h-12 w-12 rounded-full flex items-center justify-center font-bold text-lg
                    ${official.role === "captain" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                    {official.name.charAt(official.name.startsWith("Hon. ") ? 5 : 0)}
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{official.name}</p>
                    <p className="text-sm text-muted-foreground">{official.position}</p>
                  </div>
                  {official.role === "captain" && (
                    <Badge className="ml-auto bg-primary/20 text-primary hover:bg-primary/20 border-transparent">
                      Captain
                    </Badge>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Map Section */}
        <section className="space-y-4">
          <div>
            <h2 className="font-display text-lg font-semibold mb-1 flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" /> Location Map
            </h2>
            <p className="text-sm text-muted-foreground">Barangay 178, Camarin, North Caloocan City</p>
          </div>
          
          <Card className="overflow-hidden">
            <div className="aspect-square lg:aspect-auto lg:h-[600px] w-full bg-muted">
              <iframe
                title="Barangay 178 Map"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                allowFullScreen
                src="https://maps.google.com/maps?q=Barangay%20178,%20Camarin,%20North%20Caloocan%20City&t=&z=15&ie=UTF8&iwloc=&output=embed"
              />
            </div>
            <CardContent className="p-4 bg-muted/50 border-t border-border flex items-start gap-3">
              <MapPin className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-sm">Barangay Hall Location</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Visit the Barangay Hall for clearances, blotter reports, and direct assistance from the officials.
                </p>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
