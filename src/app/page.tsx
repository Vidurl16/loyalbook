import Link from "next/link";

const TREATMENT_CATEGORIES = [
  { icon: "💅", name: "Nails", desc: "Gel manicures, pedicures, nail extensions & nail art by expert technicians" },
  { icon: "🧖‍♀️", name: "Facials", desc: "Nimue personalised skin treatments — brightening, anti-aging & corrective" },
  { icon: "✨", name: "Peels", desc: "Nimue professional-grade peels to resurface, brighten and renew your skin" },
  { icon: "👁️", name: "Brows & Lashes", desc: "Lash lifts, tints, brow lamination & precision shaping" },
  { icon: "🪷", name: "Waxing", desc: "Smooth, long-lasting hair removal for face and body" },
  { icon: "💆", name: "Massage", desc: "Swedish, deep tissue & hot stone full-body massage" },
];

const LOYALTY_TIERS = [
  { tier: "Bronze", pts: "0 – 999 pts", color: "from-orange-200 to-amber-300", icon: "🥉" },
  { tier: "Silver", pts: "1 000 – 4 999 pts", color: "from-slate-200 to-slate-400", icon: "🥈" },
  { tier: "Gold", pts: "5 000 – 14 999 pts", color: "from-yellow-300 to-amber-400", icon: "🥇" },
  { tier: "Platinum", pts: "15 000+ pts", color: "from-stone-800 to-stone-900", icon: "💎" },
];

export default function HomePage() {
  return (
    <main className="min-h-screen" style={{ background: "var(--background)" }}>
      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-5 bg-white/95 backdrop-blur border-b border-stone-100 sticky top-0 z-50">
        <div className="flex flex-col leading-none">
          <span className="font-display text-xl font-bold text-stone-900 tracking-wide">PERFECT 10</span>
          <span className="text-[10px] tracking-[0.2em] text-stone-400 uppercase">La Lucia · Durban</span>
        </div>
        <div className="hidden md:flex gap-6 text-sm text-stone-500 font-medium">
          <Link href="/book" className="hover:text-stone-900 transition-colors">Book Now</Link>
          <Link href="#treatments" className="hover:text-stone-900 transition-colors">Treatments</Link>
          <Link href="#rewards" className="hover:text-stone-900 transition-colors">Rewards</Link>
        </div>
        <div className="flex gap-3">
          <Link href="/login" className="text-stone-600 hover:text-stone-900 transition-colors text-sm font-medium px-3 py-2">Sign In</Link>
          <Link href="/signup" className="bg-stone-900 text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-stone-700 transition-colors shadow-sm">Join Free</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden bg-stone-900 pt-28 pb-24 px-6 text-center">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(196,168,130,0.15)_0%,_transparent_70%)] pointer-events-none" />
        <div className="relative max-w-3xl mx-auto">
          <span className="inline-block border border-amber-400/40 text-amber-300 text-xs font-semibold px-4 py-1.5 rounded-full mb-6 tracking-[0.2em] uppercase">La Lucia Mall · Durban North</span>
          <h1 className="font-display text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
            Nail it. Treat it.<br />
            <span style={{ color: "var(--accent-gold)" }}>Reward it.</span>
          </h1>
          <p className="text-lg text-stone-400 mb-10 max-w-xl mx-auto leading-relaxed">
            Book Nimue skin treatments, nail services & more — then earn loyalty rewards for every visit at Perfect 10.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/book" className="inline-block text-stone-900 text-base px-10 py-4 rounded-full font-semibold transition-colors shadow-lg" style={{ background: "var(--accent-gold)" }}>
              Book a Treatment →
            </Link>
            <Link href="/signup" className="inline-block bg-white/10 text-white text-base px-10 py-4 rounded-full hover:bg-white/20 transition-colors font-medium border border-white/20">
              Create Free Account
            </Link>
          </div>
        </div>
      </section>

      {/* Gold divider */}
      <div className="h-px" style={{ background: "linear-gradient(90deg, transparent, var(--accent-gold), transparent)" }} />

      {/* Treatment Categories */}
      <section id="treatments" className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="font-display text-4xl font-bold text-stone-900 mb-3">Our Services</h2>
          <p className="text-stone-400 text-lg">Nimue skincare · Nail artistry · Waxing · Lashes</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
          {TREATMENT_CATEGORIES.map((cat) => (
            <Link
              key={cat.name}
              href={`/book?category=${encodeURIComponent(cat.name)}`}
              className="group bg-white rounded-2xl p-6 border border-stone-100 hover:border-stone-300 hover:shadow-lg transition-all text-left"
            >
              <div className="text-3xl mb-3">{cat.icon}</div>
              <h3 className="font-semibold text-stone-800 mb-1 group-hover:text-stone-900 transition-colors">{cat.name}</h3>
              <p className="text-stone-400 text-sm leading-relaxed">{cat.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Nimue feature strip */}
      <section className="bg-stone-50 border-y border-stone-100 py-14 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-xs tracking-[0.25em] text-stone-400 uppercase mb-3">Official Nimue Stockist & Treatment Salon</p>
          <h2 className="font-display text-3xl font-bold text-stone-900 mb-4">Science-backed skincare, tailored to you</h2>
          <p className="text-stone-500 max-w-2xl mx-auto">
            Nimue is South Africa's leading cosmeceutical brand — formulated with advanced actives to deliver real, visible results. Our trained therapists customise every treatment to your unique skin profile.
          </p>
        </div>
      </section>

      {/* How rewards work */}
      <section id="rewards" className="bg-stone-900 py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-display text-4xl font-bold text-white mb-3">The Perfect 10 Loyalty Club</h2>
            <p className="text-stone-400 text-lg">Earn rewards every time you visit</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {[
              { icon: "✨", title: "Earn on Every Visit", desc: "Points are added automatically after every treatment. No stamps, no cards — just rewards." },
              { icon: "🎂", title: "Birthday Bonus", desc: "Extra points every birthday month as a thank you for being a Perfect 10 member." },
              { icon: "🔁", title: "Rebooking Bonus", desc: "Rebook within 8 weeks and earn extra points for staying consistent with your skin and nails." },
            ].map((f) => (
              <div key={f.title} className="bg-white/5 rounded-2xl p-7 text-white text-center border border-white/10">
                <div className="text-3xl mb-3">{f.icon}</div>
                <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
                <p className="text-stone-400 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>

          {/* Tier overview */}
          <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
            <h3 className="text-white font-semibold text-center mb-5 text-lg">Loyalty Tiers</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {LOYALTY_TIERS.map((t) => (
                <div key={t.tier} className={`rounded-xl p-4 text-center bg-gradient-to-b ${t.color}`}>
                  <div className="text-2xl mb-1">{t.icon}</div>
                  <div className={`font-bold text-sm ${t.tier === "Platinum" ? "text-amber-300" : "text-stone-800"}`}>{t.tier}</div>
                  <div className={`text-xs mt-0.5 ${t.tier === "Platinum" ? "text-stone-400" : "text-stone-600"}`}>{t.pts}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="max-w-5xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="font-display text-4xl font-bold text-stone-900 mb-3">What Our Clients Say</h2>
          <p className="text-stone-400 text-lg">Real experiences from Perfect 10 members</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { quote: "My Nimue facials have transformed my skin. I look forward to every visit and love earning points towards my next treatment!", name: "Priya N.", tier: "Gold Member" },
            { quote: "The gel manicures last so long and the rebooking bonus means I never let my nails slip. Perfect 10 lives up to its name.", name: "Candice M.", tier: "Silver Member" },
            { quote: "The birthday bonus points were such a lovely surprise. Used them for a Nimue peel — skin was glowing for weeks.", name: "Tanya R.", tier: "Platinum Member" },
          ].map((t) => (
            <div key={t.name} className="bg-white rounded-2xl p-7 border border-stone-100 shadow-sm">
              <p className="text-stone-600 italic mb-5 leading-relaxed text-sm">"{t.quote}"</p>
              <div className="font-semibold text-stone-800 text-sm">{t.name}</div>
              <div className="text-xs mt-0.5" style={{ color: "var(--accent-gold-dark)" }}>{t.tier}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-stone-100 py-16 px-6 text-center" style={{ background: "var(--background)" }}>
        <h2 className="font-display text-3xl font-bold text-stone-900 mb-4">Ready for your Perfect 10 moment?</h2>
        <p className="text-stone-400 mb-8 max-w-md mx-auto">Book online in seconds and start earning loyalty rewards from your very first visit.</p>
        <Link href="/book" className="inline-block text-stone-900 px-10 py-4 rounded-full font-semibold hover:opacity-90 transition-opacity shadow-lg" style={{ background: "var(--accent-gold)" }}>
          Book Now →
        </Link>
      </section>

      {/* Footer */}
      <footer className="bg-stone-900 text-stone-400 py-10 px-6 text-center text-sm">
        <div className="font-display font-bold text-white text-xl tracking-wide mb-1">PERFECT 10</div>
        <div className="text-xs tracking-[0.2em] text-stone-500 uppercase mb-4">La Lucia Mall · Durban North</div>
        <p>© {new Date().getFullYear()} Perfect 10 La Lucia. All rights reserved.</p>
      </footer>
    </main>
  );
}
