import Image from "next/image";
import Link from "next/link";

const TREATMENT_CATEGORIES = [
  { icon: "💅", name: "Nails", desc: "Manicures, pedicures, gel polish, nail extensions, Bio Sculpture & nail art" },
  { icon: "🧖‍♀️", name: "Facials", desc: "Nimue, Environ, Placecol & Guinot personalised skin treatments — brightening, anti-aging & corrective" },
  { icon: "🪒", name: "Dermaplaning", desc: "Aesthetic dermaplaning to remove dead skin and peach fuzz for instant radiance" },
  { icon: "👁️", name: "Brows & Lashes", desc: "Lash lifts, brow lamination, henna brows, tints & precision shaping" },
  { icon: "🪷", name: "Waxing", desc: "Smooth, long-lasting hair removal — Brazilian, Hollywood, full leg & more" },
  { icon: "💆", name: "Massage", desc: "Aromatherapy, hot stone, Swedish & full-body massage treatments" },
];

const LOYALTY_TIERS = [
  { tier: "Bronze", pts: "0 – 999 pts", textColor: "#9a3412", bg: "#fde8d8" },
  { tier: "Silver", pts: "1 000 – 4 999 pts", textColor: "#475569", bg: "#f1f5f9" },
  { tier: "Gold", pts: "5 000 – 14 999 pts", textColor: "#92400e", bg: "#fef3c7" },
  { tier: "Platinum", pts: "15 000+ pts", textColor: "#FFFFFF", bg: "#000000" },
];

const SECTION_TILES = [
  { label: "Treatments", href: "/book", image: "/brand/treatments.jpg" },
  { label: "About Us", href: "#rewards", image: "/brand/about-us.jpg" },
  { label: "Locations", href: "#location", image: "/brand/location.jpg" },
  { label: "Contact Us", href: "#contact", image: "/brand/contact.webp" },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Nav — white with black text, red CTA — exactly like perfect10.co.za */}
      <nav className="flex items-center justify-between px-8 py-3 bg-white border-b border-[#D1D2D4] sticky top-0 z-50">
        <Link href="/" className="flex items-center">
          <Image
            src="/brand/perfect10-logo.png"
            alt="Perfect 10 La Lucia"
            width={160}
            height={40}
            className="h-10 w-auto"
            priority
          />
        </Link>
        <div className="hidden md:flex gap-7 text-sm text-[#4A4A4A] font-medium tracking-wide">
          <Link href="/book" className="hover:text-black transition-colors">Book Now</Link>
          <Link href="#treatments" className="hover:text-black transition-colors">Treatments</Link>
          <Link href="#rewards" className="hover:text-black transition-colors">Rewards</Link>
        </div>
        <div className="flex gap-3 items-center">
          <Link href="/login" className="text-[#4A4A4A] hover:text-black transition-colors text-sm font-medium px-3 py-2">Sign In</Link>
          <Link href="/signup" className="text-white px-6 py-2 text-sm font-semibold hover:opacity-90 transition-opacity shadow-sm" style={{ background: "var(--p10-red)", borderRadius: 2 }}>
            Join Free
          </Link>
        </div>
      </nav>

      {/* Hero — full-bleed image with dark overlay, Didot heading */}
      <section className="relative overflow-hidden bg-black" style={{ minHeight: "85vh" }}>
        <div className="absolute inset-0">
          <Image
            src="/brand/hero.jpg"
            alt="Perfect 10 La Lucia salon"
            fill
            className="object-cover object-center opacity-50"
            priority
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/60 pointer-events-none" />
        <div className="relative flex flex-col items-center justify-center text-center px-6 h-full" style={{ minHeight: "85vh" }}>
          <p className="text-white/70 text-xs tracking-[0.4em] uppercase mb-5 font-light">La Lucia Mall · Durban North</p>
          <h1 className="font-display text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Your One-Stop<br />
            <span style={{ color: "var(--p10-red)" }}>Beauty Destination</span>
          </h1>
          <p className="text-white/80 text-lg mb-10 max-w-xl mx-auto leading-relaxed font-light">
            Nail treatments · Skin facials · Waxing · Lash & brow services<br />
            Earn 10 loyalty points for every R100 spent.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/book" className="text-white text-base px-10 py-4 font-semibold hover:opacity-90 transition-opacity shadow-lg" style={{ background: "var(--p10-red)", borderRadius: 2 }}>
              Book a Treatment →
            </Link>
            <Link href="/signup" className="bg-white text-black text-base px-10 py-4 hover:bg-[#EBEBEC] transition-colors font-semibold border border-white" style={{ borderRadius: 2 }}>
              Join Loyalty Club
            </Link>
          </div>
        </div>
      </section>

      {/* Section tiles — exactly like Perfect 10 homepage grid */}
      <section className="grid grid-cols-2 md:grid-cols-4">
        {SECTION_TILES.map((tile) => (
          <Link key={tile.label} href={tile.href} className="relative group overflow-hidden" style={{ aspectRatio: "1/1" }}>
            <Image src={tile.image} alt={tile.label} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/55 transition-colors" />
            <div className="absolute inset-0 flex items-end p-6">
              <span className="font-display text-white text-xl font-bold tracking-wide">{tile.label}</span>
            </div>
          </Link>
        ))}
      </section>

      {/* Red divider strip */}
      <div className="h-1" style={{ background: "var(--p10-red)" }} />

      {/* Treatment Categories */}
      <section id="treatments" className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <p className="text-xs tracking-[0.3em] uppercase text-[#8D8E8F] mb-3">Perfect 10 La Lucia</p>
          <h2 className="font-display text-4xl font-bold text-black mb-3">Our Services</h2>
          <div className="w-12 h-0.5 mx-auto" style={{ background: "var(--p10-red)" }} />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
          {TREATMENT_CATEGORIES.map((cat) => (
            <Link
              key={cat.name}
              href={`/book?category=${encodeURIComponent(cat.name)}`}
              className="group bg-white p-6 border border-[#D1D2D4] hover:border-[#C9262E] hover:shadow-md transition-all text-left"
            >
              <div className="text-3xl mb-3">{cat.icon}</div>
              <h3 className="font-semibold text-black mb-1 group-hover:text-[#C9262E] transition-colors">{cat.name}</h3>
              <p className="text-[#8D8E8F] text-sm leading-relaxed">{cat.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Skincare brands strip */}
      <section className="bg-[#EBEBEC] border-y border-[#D1D2D4] py-14 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-xs tracking-[0.25em] text-[#8D8E8F] uppercase mb-3">Official Stockist & Treatment Salon</p>
          <h2 className="font-display text-3xl font-bold text-black mb-4">Science-backed skincare, tailored to you</h2>
          <p className="text-[#4A4A4A] max-w-2xl mx-auto mb-8">
            Our trained therapists customise every facial to your unique skin profile using South Africa&apos;s leading cosmeceutical brands.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            {["Nimue", "Environ", "Placecol", "Guinot", "Dermalogica"].map((brand) => (
              <span
                key={brand}
                className="border border-[#D1D2D4] px-6 py-2 text-sm font-bold tracking-[0.15em] text-black uppercase bg-white"
              >
                {brand}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* How rewards work */}
      <section id="rewards" className="bg-black py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs tracking-[0.3em] uppercase mb-3" style={{ color: "var(--p10-red)" }}>Members Club</p>
            <h2 className="font-display text-4xl font-bold text-white mb-3">The Perfect 10 Loyalty Club</h2>
            <div className="w-12 h-0.5 mx-auto" style={{ background: "var(--p10-red)" }} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {[
              { icon: "✨", title: "Earn on Every Visit", desc: "10 points for every R100 spent — added automatically after every treatment. No stamps, no cards." },
              { icon: "🎂", title: "Birthday Bonus", desc: "Extra points every birthday month as a thank you for being a Perfect 10 member." },
              { icon: "🔁", title: "Rebooking Bonus", desc: "Rebook within 8 weeks and earn extra points for staying consistent with your skin and nails." },
            ].map((f) => (
              <div key={f.title} className="bg-white/5 p-7 text-white text-center border border-white/10">
                <div className="text-3xl mb-3">{f.icon}</div>
                <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
                <p className="text-[#8D8E8F] text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>

          {/* Tier overview */}
          <div className="bg-white/5 p-6 border border-white/10">
            <h3 className="text-white font-semibold text-center mb-5 text-lg tracking-wide">Loyalty Tiers</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {LOYALTY_TIERS.map((t) => (
                <div key={t.tier} className="p-4 text-center" style={{ background: t.bg }}>
                  <div className="font-bold text-sm mb-1" style={{ color: t.textColor }}>{t.tier}</div>
                  <div className="text-xs" style={{ color: t.textColor, opacity: 0.75 }}>{t.pts}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="max-w-5xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <p className="text-xs tracking-[0.3em] uppercase text-[#8D8E8F] mb-3">Our Clients</p>
          <h2 className="font-display text-4xl font-bold text-black mb-3">What Our Clients Say</h2>
          <div className="w-12 h-0.5 mx-auto" style={{ background: "var(--p10-red)" }} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { quote: "My Nimue facials have transformed my skin. I love earning points towards my next treatment!", name: "Priya N.", tier: "Gold Member" },
            { quote: "The gel manicures last so long and the rebooking bonus means I never let my nails slip. Perfect 10 lives up to its name.", name: "Candice M.", tier: "Silver Member" },
            { quote: "The birthday bonus points were such a lovely surprise. Used them for a Nimue peel — skin was glowing for weeks.", name: "Tanya R.", tier: "Platinum Member" },
          ].map((t) => (
            <div key={t.name} className="bg-white p-7 border border-[#D1D2D4]">
              <p className="text-[#4A4A4A] italic mb-5 leading-relaxed text-sm">&ldquo;{t.quote}&rdquo;</p>
              <div className="font-semibold text-black text-sm">{t.name}</div>
              <div className="text-xs mt-0.5" style={{ color: "var(--p10-red)" }}>{t.tier}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#EBEBEC] border-t border-[#D1D2D4] py-16 px-6 text-center">
        <h2 className="font-display text-3xl font-bold text-black mb-4">Ready for your Perfect 10 moment?</h2>
        <p className="text-[#4A4A4A] mb-8 max-w-md mx-auto">Book online in seconds and start earning loyalty rewards from your very first visit.</p>
        <Link href="/book" className="inline-block text-white px-10 py-4 font-semibold hover:opacity-90 transition-opacity shadow-md" style={{ background: "var(--p10-red)", borderRadius: 2 }}>
          Book Now →
        </Link>
      </section>

      {/* Footer */}
      <footer className="bg-black text-[#8D8E8F] py-10 px-6 text-center text-sm">
        <div className="flex justify-center mb-4">
          <Image
            src="/brand/perfect10-logo.png"
            alt="Perfect 10"
            width={140}
            height={32}
            className="h-8 w-auto brightness-0 invert opacity-60"
          />
        </div>
        <div className="text-xs tracking-[0.2em] text-[#8D8E8F] uppercase mb-4">La Lucia Mall · Durban North</div>
        <p className="text-[#4A4A4A]">© {new Date().getFullYear()} Perfect 10 La Lucia. All rights reserved.</p>
      </footer>
    </main>
  );
}
