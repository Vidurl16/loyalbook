"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { DashboardSidebar } from "@/components/dashboard/Sidebar";
import { trpc } from "@/lib/trpc";

const SPA_ID = process.env.NEXT_PUBLIC_SPA_ID!;

const TIMEZONES = [
  "Africa/Johannesburg",
  "Africa/Cairo",
  "Africa/Lagos",
  "Europe/London",
  "Europe/Paris",
  "America/New_York",
  "America/Los_Angeles",
  "Asia/Dubai",
  "Asia/Singapore",
  "Australia/Sydney",
];

const CURRENCIES = ["ZAR", "USD", "EUR", "GBP", "AED", "SGD", "AUD"];

export default function SettingsPage() {
  useSession({ required: true });

  const { data: spa, isLoading } = trpc.spa.get.useQuery(
    { spaId: SPA_ID },
    { enabled: !!SPA_ID }
  );

  const updateSpa = trpc.spa.update.useMutation();

  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [timezone, setTimezone] = useState("Africa/Johannesburg");
  const [currency, setCurrency] = useState("ZAR");
  const [saved, setSaved] = useState(false);

  // Populate from DB once loaded
  useEffect(() => {
    if (spa) {
      setName(spa.name ?? "");
      setAddress(spa.address ?? "");
      setTimezone(spa.timezone ?? "Africa/Johannesburg");
      setCurrency(spa.currency ?? "ZAR");
    }
  }, [spa]);

  const handleSave = async () => {
    await updateSpa.mutateAsync({
      spaId: SPA_ID,
      name,
      address,
      timezone,
      currency,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    background: "#0e0c0a",
    border: "1px solid #2a2420",
    borderRadius: "2px",
    padding: "10px 12px",
    fontSize: "14px",
    color: "#f5f0e8",
    fontFamily: "var(--font-dm-sans), DM Sans, sans-serif",
    outline: "none",
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: "11px",
    fontWeight: 500,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    color: "#8a6f3e",
    marginBottom: "8px",
    fontFamily: "var(--font-dm-sans), DM Sans, sans-serif",
  };

  const sectionStyle: React.CSSProperties = {
    background: "#1a1714",
    border: "1px solid #2a2420",
    borderRadius: "2px",
    padding: "24px",
  };

  return (
    <div className="min-h-screen flex" style={{ background: "#0e0c0a" }}>
      <DashboardSidebar />

      <main className="flex-1 p-8 overflow-auto">
        <div className="mb-8">
          <h2
            style={{
              fontFamily: "var(--font-cormorant), Cormorant Garamond, serif",
              fontSize: "28px",
              fontWeight: 300,
              color: "#f5f0e8",
              margin: 0,
            }}
          >
            Settings
          </h2>
          <p
            style={{
              fontFamily: "var(--font-dm-sans), DM Sans, sans-serif",
              fontSize: "13px",
              color: "#4a4540",
              marginTop: "4px",
            }}
          >
            Configure your spa details and preferences
          </p>
        </div>

        {isLoading ? (
          <p style={{ color: "#4a4540", fontFamily: "var(--font-dm-sans), DM Sans, sans-serif", fontSize: "14px" }}>
            Loading…
          </p>
        ) : (
          <div style={{ maxWidth: "640px", display: "flex", flexDirection: "column", gap: "24px" }}>
            {/* Spa Details */}
            <div style={sectionStyle}>
              <h3
                style={{
                  fontFamily: "var(--font-dm-sans), DM Sans, sans-serif",
                  fontSize: "13px",
                  fontWeight: 500,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "#f5f0e8",
                  margin: "0 0 20px",
                }}
              >
                Spa Details
              </h3>

              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div>
                  <label style={labelStyle}>Spa Name</label>
                  <input
                    type="text"
                    style={inputStyle}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onFocus={(e) => (e.target.style.borderColor = "#c9a85c")}
                    onBlur={(e) => (e.target.style.borderColor = "#2a2420")}
                  />
                </div>

                <div>
                  <label style={labelStyle}>Address</label>
                  <textarea
                    style={{ ...inputStyle, resize: "vertical" }}
                    rows={2}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    onFocus={(e) => (e.target.style.borderColor = "#c9a85c")}
                    onBlur={(e) => (e.target.style.borderColor = "#2a2420")}
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <div>
                    <label style={labelStyle}>Timezone</label>
                    <select
                      style={{ ...inputStyle, cursor: "pointer" }}
                      value={timezone}
                      onChange={(e) => setTimezone(e.target.value)}
                    >
                      {TIMEZONES.map((tz) => (
                        <option key={tz} value={tz} style={{ background: "#1a1714" }}>
                          {tz}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={labelStyle}>Currency</label>
                    <select
                      style={{ ...inputStyle, cursor: "pointer" }}
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                    >
                      {CURRENCIES.map((c) => (
                        <option key={c} value={c} style={{ background: "#1a1714" }}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Loyalty link */}
            <div style={sectionStyle}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <p style={{ fontFamily: "var(--font-dm-sans), DM Sans, sans-serif", fontSize: "14px", fontWeight: 500, color: "#f5f0e8", margin: "0 0 4px" }}>
                    Loyalty Programme
                  </p>
                  <p style={{ fontFamily: "var(--font-dm-sans), DM Sans, sans-serif", fontSize: "12px", color: "#4a4540", margin: 0 }}>
                    Configure points rates, tier thresholds, and redemption rules
                  </p>
                </div>
                <a
                  href="/dashboard/loyalty"
                  style={{
                    fontFamily: "var(--font-dm-sans), DM Sans, sans-serif",
                    fontSize: "12px",
                    fontWeight: 500,
                    letterSpacing: "0.06em",
                    color: "#c9a85c",
                    textDecoration: "none",
                    whiteSpace: "nowrap",
                  }}
                >
                  Configure →
                </a>
              </div>
            </div>

            {/* Save */}
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <button
                onClick={handleSave}
                disabled={updateSpa.isPending}
                style={{
                  background: "#c9a85c",
                  color: "#0e0c0a",
                  fontFamily: "var(--font-dm-sans), DM Sans, sans-serif",
                  fontSize: "12px",
                  fontWeight: 500,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  padding: "12px 28px",
                  borderRadius: "2px",
                  border: "none",
                  cursor: updateSpa.isPending ? "not-allowed" : "pointer",
                  opacity: updateSpa.isPending ? 0.6 : 1,
                }}
              >
                {updateSpa.isPending ? "Saving…" : "Save Changes"}
              </button>

              {saved && (
                <span
                  style={{
                    fontFamily: "var(--font-dm-sans), DM Sans, sans-serif",
                    fontSize: "13px",
                    color: "#c9a85c",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  ✓ Saved
                </span>
              )}

              {updateSpa.isError && (
                <span style={{ fontFamily: "var(--font-dm-sans), DM Sans, sans-serif", fontSize: "13px", color: "#ef4444" }}>
                  Failed to save. Try again.
                </span>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
