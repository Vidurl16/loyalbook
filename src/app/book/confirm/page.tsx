import Link from "next/link";

export default function BookConfirmPage() {
  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-10 text-center max-w-md w-full">
        <div className="text-6xl mb-4">🎉</div>
        <h1 className="text-2xl font-bold text-slate-800 mb-2">Booking Confirmed!</h1>
        <p className="text-slate-500 mb-6">
          A confirmation email has been sent. Points will be credited once your appointment is marked complete.
        </p>
        <div className="flex flex-col gap-3">
          <Link href="/account" className="bg-teal-600 text-white py-3 rounded-xl hover:bg-teal-700 transition-colors">
            View My Bookings
          </Link>
          <Link href="/book" className="text-teal-600 hover:underline text-sm">
            Book another appointment
          </Link>
        </div>
      </div>
    </main>
  );
}
