import Link from "next/link";

const TIPS = [
  "Arrive ten minutes early for a relaxed check-in.",
  "Remove makeup before a facial if you can.",
  "Let us know if you're running late. We'll do our best to hold your slot.",
];

export default async function BookConfirmPage({ searchParams }: { searchParams: Promise<{ id?: string; pts?: string }> }) {
  const params = await searchParams;
  const earnedPoints = Number(params.pts ?? 0);

  return (
    <main className="container-x flex max-w-md flex-col items-center py-16 text-center md:py-24">
      <span className="flex h-16 w-16 items-center justify-center rounded-full border border-blush bg-blush-tint">
        <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="#fe329c" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12l5 5L19 7" />
        </svg>
      </span>
      <p className="eyebrow mt-8">Booking received</p>
      <h1 className="display-lg mt-3">See you soon.</h1>
      <p className="mt-4 text-[15px] leading-relaxed text-ink-soft">
        The salon will confirm your time shortly. You&apos;ll find the booking in your account.
      </p>

      {earnedPoints > 0 && (
        <p className="mt-6 w-full rounded-sm border-l-2 border-l-pink bg-shell px-4 py-3 text-left text-[13px] text-ink-soft">
          About <span className="text-ink">{earnedPoints} points</span> will be credited once your treatment is complete.
        </p>
      )}

      <ul className="mt-6 w-full space-y-2 rounded-sm border border-hairline p-5 text-left text-[14px] leading-relaxed text-ink-soft">
        {TIPS.map((t) => (
          <li key={t} className="flex gap-3">
            <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-blush" />
            {t}
          </li>
        ))}
      </ul>

      <div className="mt-8 flex w-full flex-col gap-3">
        <Link href="/account" className="btn-primary">
          Go to my account
        </Link>
        <Link href="/book" className="btn-ghost justify-center">
          Book another treatment
        </Link>
      </div>
    </main>
  );
}
