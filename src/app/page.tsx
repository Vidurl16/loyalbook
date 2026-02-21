import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-teal-50 to-slate-100">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 bg-white shadow-sm">
        <span className="text-2xl font-bold text-teal-600">LoyalBook</span>
        <div className="flex gap-4">
          <Link href="/login" className="text-slate-600 hover:text-teal-600 transition-colors">Login</Link>
          <Link href="/signup" className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors">Sign Up</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-4xl mx-auto text-center pt-24 pb-16 px-6">
        <h1 className="text-5xl font-bold text-slate-800 mb-6 leading-tight">
          Book your perfect spa experience.<br />
          <span className="text-teal-600">Earn rewards every visit.</span>
        </h1>
        <p className="text-xl text-slate-500 mb-10 max-w-2xl mx-auto">
          LoyalBook connects you with top spas and rewards your loyalty with points, birthday bonuses, and exclusive perks.
        </p>
        <Link
          href="/book"
          className="inline-block bg-teal-600 text-white text-lg px-10 py-4 rounded-xl hover:bg-teal-700 transition-colors shadow-lg"
        >
          Book Now →
        </Link>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 px-6 pb-24">
        {[
          { icon: "✨", title: "Earn Points", desc: "Get loyalty points on every completed appointment — automatically." },
          { icon: "🎂", title: "Birthday Bonus", desc: "Receive bonus points every birthday month, just for being a member." },
          { icon: "🔁", title: "Rebooking Rewards", desc: "Rebook within 8 weeks and earn extra points for your loyalty." },
        ].map((f) => (
          <div key={f.title} className="bg-white rounded-2xl p-8 shadow-sm text-center">
            <div className="text-4xl mb-4">{f.icon}</div>
            <h3 className="text-lg font-semibold text-slate-800 mb-2">{f.title}</h3>
            <p className="text-slate-500 text-sm">{f.desc}</p>
          </div>
        ))}
      </section>
    </main>
  );
}
