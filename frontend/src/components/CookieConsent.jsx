import React, { useState, useEffect } from "react";
import { Cookie, Shield, X, CheckCircle } from "lucide-react";

const COOKIE_KEY = "barangay178_cookie_consent";

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_KEY);
    if (!consent) {
      // Slight delay so the page loads first
      const t = setTimeout(() => setVisible(true), 800);
      return () => clearTimeout(t);
    }
  }, []);

  const dismiss = (accepted) => {
    setLeaving(true);
    setTimeout(() => {
      localStorage.setItem(COOKIE_KEY, accepted ? "accepted" : "declined");
      setVisible(false);
      setLeaving(false);
    }, 400);
  };

  if (!visible) return null;

  return (
    <>
      {/* Backdrop overlay */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.35)",
          zIndex: 9998,
          opacity: leaving ? 0 : 1,
          transition: "opacity 0.4s ease",
        }}
        onClick={() => dismiss(false)}
      />

      {/* Banner */}
      <div
        style={{
          position: "fixed",
          bottom: leaving ? "-100%" : "24px",
          left: "50%",
          transform: "translateX(-50%)",
          width: "min(680px, calc(100vw - 32px))",
          background: "#fff",
          borderRadius: "16px",
          boxShadow: "0 20px 60px rgba(0,0,0,0.18), 0 4px 16px rgba(0,0,0,0.08)",
          zIndex: 9999,
          overflow: "hidden",
          transition: "bottom 0.4s cubic-bezier(0.34,1.56,0.64,1), opacity 0.4s ease",
          opacity: leaving ? 0 : 1,
          border: "1px solid #f3f4f6",
        }}
      >
        {/* Top accent bar */}
        <div style={{ height: "4px", background: "linear-gradient(90deg, #ea580c, #f97316, #fb923c)" }} />

        <div style={{ padding: "24px 24px 20px" }}>
          {/* Header */}
          <div style={{ display: "flex", alignItems: "flex-start", gap: "14px", marginBottom: "14px" }}>
            <div style={{
              width: "44px", height: "44px", borderRadius: "12px",
              background: "linear-gradient(135deg, #ea580c, #f97316)",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}>
              <Cookie size={22} color="#fff" />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 700, color: "#111827" }}>
                  🍪 We Use Cookies
                </h3>
                <button
                  onClick={() => dismiss(false)}
                  style={{ background: "none", border: "none", cursor: "pointer", padding: "4px", color: "#9ca3af", borderRadius: "6px", lineHeight: 0 }}
                >
                  <X size={18} />
                </button>
              </div>
              <p style={{ margin: "6px 0 0", fontSize: "13px", color: "#6b7280", lineHeight: "1.6" }}>
                Barangay 178 uses cookies to improve your experience, keep you logged in, and provide personalized safety campaign notifications.
              </p>
            </div>
          </div>



          {/* Privacy note */}
          <p style={{ margin: "0 0 18px", fontSize: "12px", color: "#9ca3af", lineHeight: "1.5" }}>
            <Shield size={12} style={{ marginRight: "4px", verticalAlign: "middle" }} />
            Your data is handled in accordance with our{" "}
            <a href="/privacy-policy" style={{ color: "#ea580c", textDecoration: "none", fontWeight: 500 }}>
              Privacy Policy
            </a>{" "}
            and{" "}
            <a href="/cookie-policy" style={{ color: "#ea580c", textDecoration: "none", fontWeight: 500 }}>
              Cookie Policy
            </a>
            . We do not sell your personal information.
          </p>

          {/* Buttons */}
          <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
            <button
              onClick={() => dismiss(false)}
              style={{
                padding: "10px 20px",
                borderRadius: "8px",
                border: "1px solid #e5e7eb",
                background: "#f9fafb",
                color: "#374151",
                fontSize: "13px",
                fontWeight: 600,
                cursor: "pointer",
                transition: "background 0.2s",
              }}
              onMouseEnter={(e) => e.target.style.background = "#f3f4f6"}
              onMouseLeave={(e) => e.target.style.background = "#f9fafb"}
            >
              Decline
            </button>
            <button
              onClick={() => dismiss(true)}
              style={{
                padding: "10px 24px",
                borderRadius: "8px",
                border: "none",
                background: "linear-gradient(135deg, #ea580c, #f97316)",
                color: "#fff",
                fontSize: "13px",
                fontWeight: 600,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                boxShadow: "0 2px 8px rgba(234,88,12,0.35)",
                transition: "opacity 0.2s",
              }}
              onMouseEnter={(e) => e.target.style.opacity = "0.9"}
              onMouseLeave={(e) => e.target.style.opacity = "1"}
            >
              <CheckCircle size={14} />
              Accept All Cookies
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
