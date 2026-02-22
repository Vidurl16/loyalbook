import Link from "next/link";

const TREATMENT_CATEGORIES = [
  { icon: "🧖‍♀️", name: "Facials", desc: "Deep cleanse, hydration & anti-ageing treatments tailored to your skin" },
  { icon: "💆", name: "Massage", desc: "Swedish, deep tissue, hot stone & aromatherapy full-body massage" },
  { icon: "🌿", name: "Body Treatments", desc: "Body wraps, scrubs, detox & skin-renewal rituals" },
  { icon: "👁️", name: "Brows & Lashes", desc: "Tinting, lamination, shaping & lash lift services" },
  { icon: "🪷", name: "Waxing", desc: "Smooth, long-lasting hair removal for face & body" },
  { icon: "💅", name: "Nails", desc: "Manicure, pedicure, gel & nail art by expert technicians" },
];

const LOYALTY_TIERS = [
  { tier: "Bronze", pts: "0 – 999 pts", color: "from-orange-200 to-amber-300", icon: "🥉" },
  { tier: "Silver", pts: "1 000 – 4 999 pts", color: "from-slate-200 to-slate-400", icon: "🥈" },
  { tier: "Gold", pts: "5 000 – 14 999 pts", color: "from-yellow-300 to-amber-400", icon: "🥇" },
  { tier: "Platinum", pts: "15 000+ pts", color: "from-teal-300 to-emerald-400", icon: "💎" },
];

export default function HomePage() {
  return (
    <main className="min-h-screen" style={{ background: "var(--background)" }}>
      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-5 bg-white/90 backdrop-blur border-b border-stone-100 sticky top-0 z-50">
        <span className="font-display text-2xl font-bold text-teal-700 tracking-tight">LoyalBook</span>
        <div className="hidden md:flex gap-6 text-sm text-stone-500 font-medium">
          <Link href="/book" className="hover:text-teal-700 transition-colors">Book Now</Link>
          <Link href="#treatments" className="hover:text-teal-700 transition-colors">Treatments</Link>
          <Link href="#rewards" className="hover:text-teal-700 transition-colors">Rewards</Link>
        </div>
        <div className="flex gap-3">
          <Link href="/login" className="text-stone-600 hover:text-teal-700 transition-colors text-sm font-medium px-3 py-2">Sign In</Link>
          <Link href="/signup" className="bg-teal-700 text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-teal-800 transition-colors shadow-sm">Join Free</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-stone-100 via-rose-50 to-teal-50 pt-28 pb-24 px-6 text-center">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-rose-100/40 via-transparent to-transparent pointer-events-none" />
        <div className="relative max-w-3xl mx-auto">
          <span className="inline-block bg-teal-100 text-teal-800 text-xs font-semibold px-4 py-1.5 rounded-full mb-6 tracking-wider uppercase">Spa & Wellness Booking</span>
          <h1 className="font-display text-5xl md:text-6xl font-bold text-stone-900 mb-6 leading-tight">
            Indulge in the<br />
            <span className="text-teal-700">ritual of self-care.</span>
          </h1>
          <p className="text-lg text-stone-500 mb-10 max-w-xl mx-auto leading-relaxed">
            Book facials, massages & treatments with expert therapists — and earn luxury rewards for every visit.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/book" className="inline-block bg-teal-700 text-white text-base px-10 py-4 rounded-full hover:bg-teal-800 transition-colors shadow-lg font-medium">
              Book a Treatment →
            </Link>
            <Link href="/signup" className="inline-block bg-white text-stone-700 text-base px-10 py-4 rounded-full hover:bg-stone-50 transition-colors shadow-sm font-medium border border-stone-200">
              Create Free Account
            </Link>
          </div>
        </div>
      </section>

      {/* Treatment Categories */}
      <section id="treatments" className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="font-display text-4xl font-bold text-stone-900 mb-3">Our Treatments</h2>
          <p className="text-stone-500 text-lg">Expert care for every part of you</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
          {TREATMENT_CATEGORIES.map((cat) => (
            <Link
              key={cat.name}
              href={`/book?category=${encodeURIComponent(cat.name)}`}
              className="group bg-white rounded-2xl p-6 border border-stone-100 hover:border-teal-300 hover:shadow-lg transition-all text-left"
            >
              <div className="text-3xl mb-3">{cat.icon}</div>
              <h3 className="font-semibold text-stone-800 mb-1 group-hover:text-teal-700 transition-colors">{cat.name}</h3>
              <p className="text-stone-400 text-sm leading-relaxed">{cat.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* How rewards work */}
      <section id="rewards" className="bg-gradient-to-br from-teal-700 to-teal-900 py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-display text-4xl font-bold text-white mb-3">Earn as You Glow</h2>
            <p className="text-teal-200 text-lg">A loyalty programme built for spa lovers</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {[
              { icon: "✨", title: "Earn Points", desc: "Collect points automatically after every completed treatment, no check-ins needed." },
              { icon: "🎂", title: "Birthday Bonus", desc: "We celebrate you! Receive bonus points every birthday month, just for being a member." },
              { icon: "🔁", title: "Rebooking Rewards", desc: "Rebook within 8 weeks and earn extra loyalty points for staying consistent with your skin." },
            ].map((f) => (
              <div key={f.title} className="bg-white/10 rounded-2xl p-7 text-white text-center backdrop-blur-sm border border-white/10">
                <div className="text-3xl mb-3">{f.icon}</div>
                <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
                <p className="text-teal-100 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>

          {/* Tier overview */}
          <div className="bg-white/10 rounded-2xl p-6 border border-white/10">
            <h3 className="text-white font-semibold text-center mb-5 text-lg">Loyalty Tiers</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {LOYALTY_TIERS.map((t) => (
                <div key={t.tier} className={`rounded-xl p-4 text-center bg-gradient-to-b ${t.color}`}>
                  <div className="text-2xl mb-1">{t.icon}</div>
                  <div className="font-bold text-stone-800 text-sm">{t.tier}</div>
                  <div className="text-stone-600 text-xs mt-0.5">{t.pts}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="max-w-5xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="font-display text-4xl font-bold text-stone-900 mb-3">Loved by Members</h2>
          <p className="text-stone-500 text-lg">Real experiences from our community</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { quote: "The booking experience is so smooth. I earned enough points for a free facial in just 3 months!", name: "Aisha M.", tier: "Gold Member" },
            { quote: "I love that I get a birthday bonus without even having to ask. Such a thoughtful touch.", name: "Priya K.", tier: "Silver Member" },
            { quote: "My skin has never looked better. Consistent facials + the rebooking bonus keeps me coming back.", name: "Lerato D.", tier: "Platinum Member" },
          ].map((t) => (
            <div key={t.name} className="bg-white rounded-2xl p-7 border border-stone-100 shadow-sm">
              <p className="text-stone-600 italic mb-5 leading-relaxed text-sm">"{t.quote}"</p>
              <div className="font-semibold text-stone-800 text-sm">{t.name}</div>
              <div className="text-teal-600 text-xs">{t.tier}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-rose-50 border-t border-rose-100 py-16 px-6 text-center">
        <h2 className="font-display text-3xl font-bold text-stone-900 mb-4">Ready for your next ritual?</h2>
        <p className="text-stone-500 mb-8 max-w-md mx-auto">Join thousands of members earning rewards while they unwind.</p>
        <Link href="/book" className="inline-block bg-teal-700 text-white px-10 py-4 rounded-full font-medium hover:bg-teal-800 transition-colors shadow-lg">
          Book Now — It's Free →
        </Link>
      </section>

      {/* Footer */}
      <footer className="bg-stone-900 text-stone-400 py-8 px-6 text-center text-sm">
        <span className="font-display font-bold text-white text-lg">LoyalBook</span>
        <p className="mt-2">© {new Date().getFullYear()} LoyalBook. Spa & Wellness Booking Platform.</p>
      </footer>
    </main>
  );
}
