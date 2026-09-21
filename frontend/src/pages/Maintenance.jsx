import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, Clock, Mail, Phone, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";

export default function Maintenance() {
  const navigate = useNavigate();
  const [isChecking, setIsChecking] = useState(false);
  
  const handleCheckMaintenance = async () => {
    setIsChecking(true);
    try {
      const { data, error } = await supabase
        .from('system_settings')
        .select('general_settings')
        .maybeSingle();

      if (error || !data) {
        // If the query fails (e.g., due to RLS for guests), alert and redirect back to public view
        alert("The system is still under maintenance.");
        navigate("/");
        return;
      }

      const isStillMaintenance = data.general_settings?.maintenance_mode;
      
      // If we are checking for maintenance mode completion
      if (isStillMaintenance) {
        alert("The system is still under maintenance.");
      } else {
        alert("Thanks for waiting! The maintenance is complete, you can now access the system.");
        localStorage.setItem('maintenance_mode', 'false');
        window.dispatchEvent(new CustomEvent('maintenanceModeChanged', { detail: { maintenanceMode: false } }));
        window.location.href = "/";
      }
    } catch (err) {
      console.error(err);
      alert("Still under maintenance.");
    } finally {
      setIsChecking(false);
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-orange-50 to-amber-50">
      <Card className="max-w-2xl w-full">
        <CardContent className="p-8 space-y-6">
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="h-20 w-20 rounded-full flex items-center justify-center bg-orange-100">
                <AlertTriangle className="h-10 w-10 text-orange-600" />
              </div>
            </div>
            
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-gray-900">
                System Under Maintenance
              </h1>
              <p className="text-gray-600">
                We're currently performing scheduled maintenance to improve our services.
              </p>
            </div>
          </div>

          <div className="bg-orange-50 border-orange-200 border rounded-lg p-4 space-y-3">
            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-orange-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-orange-900">
                  Expected Duration
                </p>
                <p className="text-sm text-orange-700">
                  Maintenance is expected to be completed within a few hours. Thank you for your patience.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h2 className="font-semibold text-gray-900">What's Affected</h2>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-orange-500" />
                Public access to safety campaigns and announcements
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-orange-500" />
                User registration and profile management
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-orange-500" />
                Feedback submission and surveys
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                <span className="text-green-700">Emergency services remain available</span>
              </li>
            </ul>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
            <h2 className="font-semibold text-blue-900">Need Assistance?</h2>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-blue-700">
                <Phone className="h-4 w-4" />
                <span>For emergencies, contact barangay hotline</span>
              </div>
              <div className="flex items-center gap-2 text-blue-700">
                <Mail className="h-4 w-4" />
                <span>Email adminbarangay178@gmail.com for inquiries</span>
              </div>
            </div>
          </div>

          <div className="text-center pt-4 border-t">
            <p className="text-sm text-gray-500 mb-4">
              We apologize for any inconvenience and appreciate your understanding.
            </p>
            <Button 
              onClick={() => navigate('/emergency')}
              variant="destructive"
              className="w-full mb-3"
            >
              <Phone className="mr-2 h-4 w-4" />
              Go to Emergency Services
            </Button>
            <Button 
              onClick={handleCheckMaintenance}
              disabled={isChecking}
              variant="outline"
              className="w-full"
            >
              {isChecking && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Check if Maintenance is Complete
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}