import Link from "next/link";
import { brand } from "@/lib/brand";

const RULES = [
  { title: "Anyone can enter, once", body: "A real email address, verified with a one-time code. One entry per person." },
  { title: "Staff never know", body: "Only the owner sees who entered. Your visit is treated like any other, so the review stays honest." },
  { title: "Visit, review, reimburse", body: "If you're chosen, book like a normal client, then submit your scored review here. Your treatment is reimbursed." },
  { title: "A fair rotation", body: "Once chosen, there's a cooling-off period before you can be picked again." },
];

export default function MysteryShopperLandingPage() {
  return (
    <main className="container-x max-w-3xl pb-16 pt-10 md:pt-16">
      <header className="max-w-xl">
        <p className="eyebrow mb-3">Mystery shopper programme</p>
        <h1 className="display-xl">
          Experience {brand.name}.
          <br />
          Tell us how it felt.
        </h1>
        <p className="mt-6 text-[16px] leading-relaxed text-ink-soft">
          We&apos;re always raising the bar. Mystery shoppers visit as regular clients, score the full experience, and are
          reimbursed for their treatment.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link href="/mystery-shopper/enter" className="btn-primary">
            Enter the programme
          </Link>
          <Link href="/mystery-shopper/apply" className="btn-ghost justify-center sm:justify-start">
            Already chosen? Register your visit →
          </Link>
        </div>
      </header>

      <section className="mt-16">
        <h2 className="eyebrow mb-6">How it works</h2>
        <ol className="divide-y divide-hairline border-y border-hairline">
          {RULES.map((r, i) => (
            <li key={r.title} className="grid grid-cols-[48px_1fr] gap-4 py-6">
              <span className="font-display text-[22px] text-pink">0{i + 1}</span>
              <div>
                <h3 className="font-display text-[20px] text-ink">{r.title}</h3>
                <p className="mt-1 text-[14px] leading-relaxed text-ink-soft">{r.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="card mt-12 bg-shell p-6 md:p-8">
        <h2 className="eyebrow mb-4">What you&apos;ll score</h2>
        <ul className="grid gap-2 sm:grid-cols-2">
          {["Welcome and first impression", "Cleanliness and ambiance", "Treatment quality", "Staff friendliness", "Product knowledge", "Value for money"].map((x) => (
            <li key={x} className="flex items-center gap-3 font-display text-[17px] text-ink-soft">
              <span className="h-1.5 w-1.5 rounded-full bg-pink" />
              {x}
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
