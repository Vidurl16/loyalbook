"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { useState } from "react";

const navItems = [
  { href: "/dashboard", label: "Overview", icon: "🏠" },
  { href: "/dashboard/clients", label: "Guests", icon: "👥" },
  { href: "/dashboard/services", label: "Treatments", icon: "🌿" },
  { href: "/dashboard/staff", label: "Therapists", icon: "🧖‍♀️" },
  { href: "/dashboard/loyalty", label: "Loyalty", icon: "✨" },
  { href: "/dashboard/analytics", label: "Analytics", icon: "📊" },
  { href: "/dashboard/settings", label: "Settings", icon: "⚙️" },
];

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
  const { data: session } = useSession();
  const pathname = usePathname();

  const [spaName, setSpaName] = useState("LoyalBook Spa");
  const [address, setAddress] = useState("1 Wellness Lane, Cape Town");
  const [timezone, setTimezone] = useState("Africa/Johannesburg");
  const [currency, setCurrency] = useState("ZAR");
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    // In a real implementation, this would call a tRPC mutation to update the spa settings
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="min-h-screen bg-stone-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-stone-200 flex flex-col">
        <div className="p-6 border-b border-stone-100">
          <h1 className="font-display text-xl text-stone-800">🌸 LoyalBook</h1>
          <p className="text-xs text-stone-400 mt-1">Spa Management</p>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                pathname === item.href
                  ? "bg-teal-50 text-teal-700"
                  : "text-stone-600 hover:bg-stone-50"
              }`}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-stone-100">
          <p className="text-xs text-stone-500">{session?.user?.name ?? "Staff"}</p>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 p-8 overflow-auto">
        <div className="mb-8">
          <h2 className="text-2xl font-display text-stone-800">Settings</h2>
          <p className="text-stone-500 text-sm mt-1">Configure your spa details and preferences</p>
        </div>

        <div className="max-w-2xl space-y-8">
          {/* Spa Details */}
          <div className="bg-white rounded-xl border border-stone-200 p-6">
            <h3 className="font-semibold text-stone-800 mb-5">Spa Details</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-stone-600 mb-1.5">Spa Name</label>
                <input
                  type="text"
                  className="w-full border border-stone-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-300"
                  value={spaName}
                  onChange={(e) => setSpaName(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-600 mb-1.5">Address</label>
                <textarea
                  className="w-full border border-stone-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-300"
                  rows={2}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-stone-600 mb-1.5">Timezone</label>
                  <select
                    className="w-full border border-stone-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-300"
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                  >
                    {TIMEZONES.map((tz) => (
                      <option key={tz} value={tz}>
                        {tz}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-600 mb-1.5">Currency</label>
                  <select
                    className="w-full border border-stone-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-300"
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                  >
                    {CURRENCIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Loyalty Config link */}
          <div className="bg-white rounded-xl border border-stone-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-stone-800">Loyalty Programme</h3>
                <p className="text-sm text-stone-400 mt-1">
                  Configure points rates, tier thresholds, and redemption rules
                </p>
              </div>
              <Link
                href="/dashboard/loyalty"
                className="text-teal-600 hover:text-teal-800 text-sm font-medium"
              >
                Configure →
              </Link>
            </div>
          </div>

          {/* Booking settings */}
          <div className="bg-white rounded-xl border border-stone-200 p-6">
            <h3 className="font-semibold text-stone-800 mb-5">Booking Settings</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-stone-700">Allow online bookings</p>
                  <p className="text-xs text-stone-400">Clients can book through the website</p>
                </div>
                <div className="w-10 h-5 bg-teal-500 rounded-full relative cursor-pointer">
                  <div className="absolute right-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow" />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-stone-700">Require phone for booking</p>
                  <p className="text-xs text-stone-400">Guests must provide a contact number</p>
                </div>
                <div className="w-10 h-5 bg-teal-500 rounded-full relative cursor-pointer">
                  <div className="absolute right-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow" />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-stone-700">Send confirmation emails</p>
                  <p className="text-xs text-stone-400">Automatic booking confirmations to guests</p>
                </div>
                <div className="w-10 h-5 bg-stone-200 rounded-full relative cursor-pointer">
                  <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow" />
                </div>
              </div>
            </div>
          </div>

          {/* Save button */}
          <div className="flex items-center gap-4">
            <button
              onClick={handleSave}
              className="bg-teal-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-teal-700 transition-colors"
            >
              Save Changes
            </button>
            {saved && (
              <span className="text-sm text-teal-600 font-medium flex items-center gap-1.5">
                <span>✓</span> Saved successfully
              </span>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
