import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CheckCircle, Loader2, Eye, EyeOff } from "lucide-react";
import { supabaseHelpers } from "@/lib/supabase.js";
import { notificationApi } from "@/lib/apiGateway.js";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/components/ThemeProvider.jsx";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";

// Success Screen after registration
function SuccessScreen({ name, email, onContinue }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-white to-secondary p-6">
      <div className="w-full max-w-sm text-center">
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="h-24 w-24 rounded-full bg-green-100 flex items-center justify-center animate-[scaleIn_0.4s_ease-out]">
              <CheckCircle className="h-12 w-12 text-green-600" strokeWidth={1.5} />
            </div>
            <div className="absolute inset-0 rounded-full border-4 border-green-400 animate-ping opacity-20" />
          </div>
        </div>

        <h2 className="font-display text-2xl font-bold text-foreground mb-2">
          Account Created!
        </h2>
        <p className="text-muted-foreground text-sm mb-1">
          Welcome to Barangay 178, <span className="font-semibold text-foreground">{name}</span>!
        </p>
        <p className="text-muted-foreground text-sm mb-4">
          Your resident account has been successfully created and is ready to use.
        </p>



        <Button className="w-full" onClick={onContinue}>
          Go to Login →
        </Button>
      </div>
    </div>
  );
}

// Loading Overlay
function LoadingOverlay() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/90 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="h-16 w-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
          <img
            src="/logo.png"
            alt="Barangay 178"
            className="absolute inset-0 m-auto h-8 w-8 rounded-full object-contain"
          />
        </div>
        <p className="font-display font-semibold text-foreground">Creating your account…</p>
        <p className="text-sm text-muted-foreground">Please wait while we set up your account…</p>
      </div>
    </div>
  );
}

// Main Register Page
export default function Register() {
  const navigate = useNavigate();
  const { validatePassword } = useAuth();
  const { resetTheme } = useTheme();
  const [form, setForm] = useState({ name: "", email: "", phone: "", address: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Force light mode on register page
  useEffect(() => {
    resetTheme();
  }, [resetTheme]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.name.trim()) {
      setError("Please enter your full name.");
      return;
    }
    // Validate full name - only letters and spaces allowed
    if (!/^[a-zA-Z\s]+$/.test(form.name.trim())) {
      setError("Full name should only contain letters and spaces. No symbols or special characters.");
      return;
    }
    // Validate phone number - max 11 digits only, no symbols
    if (form.phone && (!/^\d+$/.test(form.phone) || form.phone.length > 11)) {
      setError("Phone number should be maximum 11 digits only. No symbols or special characters.");
      return;
    }

    // Validate password using configurable requirements
    const passwordValidation = validatePassword(form.password);
    if (!passwordValidation.isValid) {
      setError(passwordValidation.errors.join(' '));
      return;
    }

    setLoading(true);
    try {
      // Use Supabase Auth signUp without database insertion
      // Only creates auth user, no public.users record
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: {
            name: form.name.trim(),
            phone: form.phone.trim(),
            address: form.address.trim(),
            role: "citizen",
          },
          emailRedirectTo: undefined, // Disable email confirmation
        }
      });

      if (signUpError) {
        if (signUpError.message?.includes("already registered") || signUpError.message?.includes("already been registered")) {
          throw new Error("This email is already registered. Please log in instead.");
        }
        if (signUpError.message?.includes("Password should be at least")) {
          throw new Error("Password must be at least 6 characters.");
        }
        throw new Error(signUpError.message || "Registration failed. Please try again.");
      }

      if (!data?.user) {
        throw new Error("Registration failed. Please try again.");
      }

      // Send welcome email via notification-service (your custom welcome email)
      try {
        console.log('Sending welcome email to:', form.email, 'for user:', form.name.trim());
        await notificationApi.sendWelcome({ email: form.email, name: form.name.trim() });
        console.log('Welcome email sent successfully');
      } catch (mailErr) {
        // Don't block registration if email fails — just log it
        console.warn('Welcome email failed to send:', mailErr.message);
      }

      setLoading(false);
      setSuccess(true);
    } catch (err) {
      setLoading(false);
      setError(err.message || "Registration failed. Please try again.");
    }
  };

  if (success) {
    return (
      <SuccessScreen
        name={form.name}
        email={form.email}
        onContinue={() => navigate("/login")}
      />
    );
  }

  return (
    <>
      {loading && <LoadingOverlay />}

      <div className="min-h-screen flex bg-barangay">
        {/* Left overlay panel */}
        <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 bg-gradient-to-br from-black/70 via-black/50 to-primary/30 text-white">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <img src="/logo.png" alt="Barangay 178 Seal" className="h-14 w-14 rounded-full object-contain bg-white/10 p-1" />
              <div className="text-left">
                <p className="font-display font-bold text-lg leading-tight text-white">Barangay 178</p>
                <p className="text-xs text-white/70">Camarin, North Caloocan City</p>
              </div>
            </Link>
          </div>
          <div>
            <h2 className="font-display text-4xl font-bold mb-4 leading-tight">
              Join Our Community.<br />Stay Safe Together.
            </h2>
            <p className="text-white/80 text-sm leading-relaxed max-w-sm">
              Register as a resident of Barangay 178 to receive real-time safety campaigns, emergency alerts, AI voice announcements, and community updates.
            </p>
            <div className="flex gap-2 mt-6 flex-wrap">
              {["Campaign Planning", "Public Awareness", "Emergency Alerts"].map((v) => (
                <span key={v} className="px-3 py-1 rounded-full bg-white/15 text-xs font-semibold backdrop-blur-sm border border-white/20">{v}</span>
              ))}
            </div>
          </div>
          <p className="text-xs text-white/50">© {new Date().getFullYear()} Barangay 178 · Safety Campaign Management System</p>
        </div>

        {/* Right register form */}
        <div className="flex-1 flex items-center justify-center p-6 bg-white/90 backdrop-blur-md lg:bg-white/95 overflow-y-auto">
          <div className="w-full max-w-sm py-4">
            <div className="flex flex-col items-center mb-6 text-center">
              <img src="/logo.png" alt="Barangay 178 Seal" className="h-16 w-16 rounded-full object-contain mb-3 shadow-lg" />
              <h1 className="font-display text-xl font-bold">Resident Sign-Up Portal</h1>
              <p className="text-sm text-muted-foreground">Barangay 178, Camarin, North Caloocan City</p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Create Resident Account</CardTitle>
                <CardDescription>
                  Get safety alerts and campaign updates.
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      required
                      placeholder="Your full name"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      required
                      placeholder="you@example.com"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      placeholder="09XX XXX XXXX"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      placeholder="e.g. Purok 4, Camarin Road"
                      value={form.address}
                      onChange={(e) => setForm({ ...form, address: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        required
                        placeholder="Min. 6 characters"
                        value={form.password}
                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((s) => !s)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  {error && (
                    <p className="text-sm text-destructive bg-destructive/10 rounded-md px-3 py-2">{error}</p>
                  )}
                </CardContent>
                <CardFooter className="flex flex-col gap-3">
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? (
                      <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Creating account…</>
                    ) : (
                      "Create Account"
                    )}
                  </Button>
                  <p className="text-xs text-muted-foreground text-center w-full">
                    Already have an account?{" "}
                    <Link to="/login" className="text-primary font-medium hover:underline">Log in</Link>
                  </p>
                </CardFooter>
              </form>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
