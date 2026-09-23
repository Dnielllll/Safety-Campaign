import React, { useEffect } from "react";
import { FileText, Shield, AlertTriangle, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTheme } from "@/components/ThemeProvider.jsx";

export default function TermsOfService() {
  const { resetTheme } = useTheme();

  // Force light mode for public pages
  useEffect(() => {
    resetTheme();
  }, [resetTheme]);

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container max-w-4xl">
        <div className="flex items-center gap-3 mb-8">
          <FileText className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Terms of Service</h1>
        </div>

        <div className="space-y-6">
          <Card className="bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                1. Acceptance of Terms
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p>
                By accessing and using the Barangay 178 Safety Campaign Management System, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use this system.
              </p>
              <p>
                Barangay 178 reserves the right to modify these terms at any time. Continued use of the system after changes constitutes acceptance of the updated terms.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                2. User Responsibilities
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p>As a user of this system, you agree to:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Provide accurate and truthful information when creating an account</li>
                <li>Maintain the confidentiality of your account credentials</li>
                <li>Use the system for its intended purpose - safety campaign management and community engagement</li>
                <li>Not attempt to circumvent security measures or access unauthorized areas</li>
                <li>Not use the system for illegal, harmful, or inappropriate purposes</li>
                <li>Respect other users and refrain from harassment or abusive behavior</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                3. Prohibited Activities
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p>The following activities are strictly prohibited:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Submitting false information or impersonating others</li>
                <li>Posting or transmitting harmful, threatening, or inappropriate content</li>
                <li>Attempting to gain unauthorized access to the system or user accounts</li>
                <li>Interfering with the operation of the system or its security features</li>
                <li>Using the system to solicit or distribute spam or unsolicited messages</li>
                <li>Reverse engineering or attempting to extract source code from the system</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                4. Privacy and Data Protection
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p>
                Your privacy is important to us. Please refer to our Privacy Policy for detailed information about how we collect, use, and protect your personal information.
              </p>
              <p>
                By using this system, you consent to the collection and use of your information as described in our Privacy Policy.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                5. Content and User Submissions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p>
                Any content you submit to the system, including feedback, survey responses, and comments, becomes the property of Barangay 178 for the purpose of improving safety campaigns and community services.
              </p>
              <p>
                You represent that you have the right to submit such content and that it does not violate any laws or the rights of any third party.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                6. System Availability
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p>
                Barangay 178 strives to maintain the system's availability and reliability. However, we do not guarantee uninterrupted access or that the system will be free from errors or interruptions.
              </p>
              <p>
                We reserve the right to suspend or terminate the system for maintenance, updates, or other necessary reasons without prior notice.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                7. Limitation of Liability
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p>
                Barangay 178 shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the system, including but not limited to loss of data, loss of profits, or business interruption.
              </p>
              <p>
                In no event shall Barangay 178's total liability exceed the amount you paid, if any, to access the system.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                8. Termination
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p>
                Barangay 178 reserves the right to suspend or terminate your access to the system at any time, with or without cause, with or without notice.
              </p>
              <p>
                Upon termination, your right to use the system will immediately cease. All provisions of these Terms shall survive termination.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                9. Governing Law
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p>
                These Terms of Service shall be governed by and construed in accordance with the laws of the Republic of the Philippines. Any disputes arising from these terms shall be subject to the exclusive jurisdiction of the courts in Caloocan City.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                10. Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p>
                If you have questions about these Terms of Service, please contact us at:
              </p>
              <div className="space-y-1 mt-2">
                <p><strong>Email:</strong> <a href="mailto:brgy178caloocan@gmail.com" className="text-primary hover:underline">brgy178caloocan@gmail.com</a></p>
                <p><strong>Phone:</strong> 0921-463-6835 / 0928-497-1332</p>
                <p><strong>Address:</strong> Camarin Road, Barangay 178, Caloocan, 1400 Metro Manila</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
