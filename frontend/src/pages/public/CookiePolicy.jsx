import React, { useEffect } from "react";
import { Cookie, CheckCircle, XCircle, Settings, Shield } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTheme } from "@/components/ThemeProvider.jsx";

export default function CookiePolicy() {
  const { resetTheme } = useTheme();

  // Force light mode for public pages
  useEffect(() => {
    resetTheme();
  }, [resetTheme]);

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container max-w-4xl">
        <div className="flex items-center gap-3 mb-8">
          <Cookie className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Cookie Policy</h1>
        </div>

        <div className="space-y-6">
          <Card className="bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Cookie className="h-5 w-5" />
                1. What Are Cookies?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p>
                Cookies are small text files that are stored on your device (computer, tablet, or mobile) when you visit a website. They are widely used to make websites work more efficiently and to provide information to website owners.
              </p>
              <p>
                The Barangay 178 Safety Campaign Management System uses cookies to enhance your experience, improve our services, and ensure the security of our platform.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                2. Types of Cookies We Use
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="space-y-4">
                <div>
                  <p className="font-medium mb-2">Essential Cookies</p>
                  <p className="ml-4">
                    These cookies are necessary for the website to function properly. They enable core functionality such as user authentication, security, and access to secure areas of the website. Without these cookies, the website cannot function correctly.
                  </p>
                </div>
                <div>
                  <p className="font-medium mb-2">Functional Cookies</p>
                  <p className="ml-4">
                    These cookies enable enhanced functionality and personalization, such as remembering your preferences (e.g., language, theme settings) and providing customized content.
                  </p>
                </div>
                <div>
                  <p className="font-medium mb-2">Analytics Cookies</p>
                  <p className="ml-4">
                    These cookies help us understand how visitors use our website by collecting information about pages visited, time spent on pages, and any errors encountered. This data helps us improve our services and user experience.
                  </p>
                </div>
                <div>
                  <p className="font-medium mb-2">Security Cookies</p>
                  <p className="ml-4">
                    These cookies are used for security purposes, such as detecting and preventing fraudulent activity and protecting user accounts from unauthorized access.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                3. How We Use Cookies
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p>We use cookies for the following purposes:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>To keep you logged in to your account</li>
                <li>To remember your preferences and settings</li>
                <li>To analyze website traffic and usage patterns</li>
                <li>To improve website performance and user experience</li>
                <li>To detect and prevent security threats</li>
                <li>To provide personalized content and recommendations</li>
                <li>To remember your language selection (English/Tagalog)</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                4. Managing Cookies
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p>
                You have the right to decide whether to accept or reject cookies. You can set or amend your web browser preferences to accept or refuse cookies. If you choose to reject cookies, you may still use our website, though your access to some functionality and areas may be restricted.
              </p>
              <div className="space-y-2 mt-4">
                <p className="font-medium">To manage cookies in your browser:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li><strong>Chrome:</strong> Settings → Privacy and security → Cookies and other site data</li>
                  <li><strong>Firefox:</strong> Options → Privacy & Security → Cookies and Site Data</li>
                  <li><strong>Safari:</strong> Preferences → Privacy → Manage Website Data</li>
                  <li><strong>Edge:</strong> Settings → Cookies and site permissions → Manage cookies</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <XCircle className="h-5 w-5" />
                5. Disabling Cookies
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p>
                If you choose to disable cookies, please be aware that some features of our website may not function properly. Disabling cookies may affect:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Your ability to log in to your account</li>
                <li>Remembering your preferences and settings</li>
                <li>Access to personalized content</li>
                <li>Language selection functionality</li>
                <li>Website performance and user experience</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                6. Third-Party Cookies
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p>
                We may allow third-party services to place cookies on your device for the following purposes:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Authentication:</strong> Google Sign-In uses cookies for authentication (managed by Google)</li>
                <li><strong>Analytics:</strong> We may use analytics services to understand user behavior</li>
                <li><strong>Security:</strong> Security services may use cookies to detect threats</li>
              </ul>
              <p>
                These third-party cookies are subject to the respective third-party's privacy policies. We do not have control over these cookies and recommend reviewing the third-party's cookie policy.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                7. Cookies and Google Sign-In
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p>
                When you use Google Sign-In, Google places cookies on your device to authenticate your account and remember your sign-in preferences. These cookies are managed by Google and are subject to Google's Privacy Policy and Cookie Policy.
              </p>
              <p>
                For more information about Google's use of cookies, please visit:
                <a href="https://policies.google.com/technologies/cookies" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline ml-2">
                  https://policies.google.com/technologies/cookies
                </a>
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                8. Security of Cookies
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p>
                We implement appropriate security measures to protect cookies from unauthorized access, alteration, or destruction. However, no method of transmission over the internet is 100% secure.
              </p>
              <p>
                We use secure, encrypted connections (HTTPS) to protect cookie data in transit.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Cookie className="h-5 w-5" />
                9. Updates to This Policy
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p>
                We may update this Cookie Policy from time to time to reflect changes in our practices or for other operational, legal, or regulatory reasons. We will notify you of any material changes by posting the new policy on this page and updating the "Last updated" date.
              </p>
              <p>
                Your continued use of the website after such changes constitutes your acceptance of the updated policy.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                10. Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p>
                If you have questions about this Cookie Policy or our use of cookies, please contact us at:
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
