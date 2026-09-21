import React from "react";
import { Shield, Lock, Eye, Database, Trash2, Mail } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container max-w-4xl">
        <div className="flex items-center gap-3 mb-8">
          <Shield className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Privacy Policy</h1>
        </div>

        <div className="space-y-6">
          <Card className="bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                1. Introduction
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p>
                Barangay 178 ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use the Barangay 178 Safety Campaign Management System.
              </p>
              <p>
                By using this system, you agree to the collection and use of information in accordance with this policy.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                2. Information We Collect
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p>We collect the following types of information:</p>
              <div className="space-y-2 ml-4">
                <div>
                  <p className="font-medium">Personal Information:</p>
                  <ul className="list-disc list-inside ml-4 mt-1">
                    <li>Name and email address (for account creation)</li>
                    <li>Phone number (if provided)</li>
                    <li>Profile information (if provided)</li>
                  </ul>
                </div>
                <div>
                  <p className="font-medium">Usage Information:</p>
                  <ul className="list-disc list-inside ml-4 mt-1">
                    <li>Pages visited and features used</li>
                    <li>Time and date of access</li>
                    <li>Device information (browser type, operating system)</li>
                  </ul>
                </div>
                <div>
                  <p className="font-medium">User-Generated Content:</p>
                  <ul className="list-disc list-inside ml-4 mt-1">
                    <li>Feedback submissions</li>
                    <li>Survey responses</li>
                    <li>Comments and reports</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                3. How We Use Your Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p>We use your information for the following purposes:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>To provide and maintain the safety campaign system</li>
                <li>To send you notifications about safety campaigns and emergency alerts</li>
                <li>To process and respond to your feedback and survey responses</li>
                <li>To improve our services and user experience</li>
                <li>To analyze usage patterns and system performance</li>
                <li>To comply with legal obligations and protect our rights</li>
                <li>To communicate with you about system updates and important information</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                4. Data Security
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p>
                We implement appropriate technical and organizational measures to protect your information:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Encryption of sensitive data in transit and at rest</li>
                <li>Secure authentication and access controls</li>
                <li>Regular security assessments and updates</li>
                <li>Restricted access to personal data for authorized personnel only</li>
                <li>Secure backup and recovery procedures</li>
              </ul>
              <p>
                However, no method of transmission over the internet is 100% secure. While we strive to protect your information, we cannot guarantee absolute security.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                5. Information Sharing
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p>We do not sell, trade, or rent your personal information to third parties. We may share your information only in the following circumstances:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>With your consent:</strong> When you explicitly authorize us to share your information</li>
                <li><strong>For service providers:</strong> With trusted third parties who assist us in operating the system (subject to confidentiality agreements)</li>
                <li><strong>Legal requirements:</strong> When required by law, court order, or government authority</li>
                <li><strong>Business transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
                <li><strong>To protect rights:</strong> To protect our rights, property, or safety, or that of our users</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                6. Cookies and Tracking
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p>
                We use cookies and similar technologies to enhance your experience, analyze usage, and improve our services. Cookies are small files stored on your device that help us remember your preferences and track usage patterns.
              </p>
              <p>
                You can control cookies through your browser settings. However, disabling cookies may affect the functionality of the system.
              </p>
              <p>
                For more information about cookies, please refer to our Cookie Policy.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trash2 className="h-5 w-5" />
                7. Data Retention and Deletion
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p>
                We retain your information for as long as necessary to provide our services and fulfill the purposes outlined in this policy, unless a longer retention period is required or permitted by law.
              </p>
              <p>
                You may request deletion of your personal information by contacting us. We will process your request in accordance with applicable laws and our retention policies.
              </p>
              <p>
                Please note that some information may be retained for legitimate business purposes, legal obligations, or to protect our rights.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                8. Your Rights
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p>You have the following rights regarding your personal information:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Access:</strong> Request a copy of your personal information</li>
                <li><strong>Correction:</strong> Request correction of inaccurate or incomplete information</li>
                <li><strong>Deletion:</strong> Request deletion of your personal information</li>
                <li><strong>Portability:</strong> Request transfer of your information to another service</li>
                <li><strong>Objection:</strong> Object to processing of your information</li>
                <li><strong>Restriction:</strong> Request restriction of processing of your information</li>
              </ul>
              <p>
                To exercise these rights, please contact us using the information provided below.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                9. Children's Privacy
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p>
                This system is not intended for children under the age of 13. We do not knowingly collect personal information from children under 13. If we become aware that we have collected such information, we will take steps to delete it.
              </p>
              <p>
                Parents and guardians should monitor their children's use of the system.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                10. Changes to This Policy
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p>
                We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new policy on this page and updating the "Last updated" date.
              </p>
              <p>
                Your continued use of the system after such changes constitutes your acceptance of the updated policy.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                11. Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p>
                If you have questions about this Privacy Policy or your personal information, please contact us at:
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
