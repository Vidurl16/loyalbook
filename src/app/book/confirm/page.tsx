import Link from "next/link";

export default async function BookConfirmPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string; pts?: string }>;
}) {
  const params = await searchParams;
  const earnedPoints = Number(params.pts ?? 0);

  return (
    <main className="min-h-screen flex items-center justify-center px-4" style={{ background: "var(--background)" }}>
      <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-10 text-center max-w-md w-full">
        <div className="text-6xl mb-4">🌸</div>
        <h1 className="font-display text-3xl font-bold text-stone-900 mb-2">Booking Confirmed!</h1>
        <p className="text-stone-500 mb-6 leading-relaxed">
          A confirmation has been sent. We look forward to welcoming you to your treatment.
        </p>

        {earnedPoints > 0 && (
          <div className="bg-teal-50 border border-teal-100 rounded-xl p-4 mb-6 flex items-center gap-3 text-left">
            <span className="text-2xl">✨</span>
            <div>
              <div className="font-semibold text-teal-800 text-sm">You'll earn ~{earnedPoints} loyalty points</div>
              <div className="text-xs text-teal-600">Credited once your treatment is marked complete</div>
            </div>
          </div>
        )}

        <div className="bg-rose-50 border border-rose-100 rounded-xl p-4 mb-6 text-left text-sm text-rose-700">
          <div className="font-medium mb-1">Prepare for your treatment</div>
          <ul className="space-y-1 text-rose-600 text-xs">
            <li>• Arrive 10 minutes early for a relaxed check-in</li>
            <li>• Avoid heavy meals 1–2 hours before your appointment</li>
            <li>• Remove makeup before facial treatments if possible</li>
          </ul>
        </div>

        <div className="flex flex-col gap-3">
          <Link href="/account" className="bg-teal-700 text-white py-3 rounded-xl hover:bg-teal-800 transition-colors font-medium">
            View My Bookings
          </Link>
          <Link href="/book" className="text-teal-600 hover:underline text-sm">
            Book another treatment
          </Link>
          <Link href="/" className="text-stone-400 hover:underline text-xs">
            Return home
          </Link>
        </div>
      </div>
    </main>
  );
}
