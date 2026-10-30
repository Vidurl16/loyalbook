import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { brand } from "@/lib/brand";
import { Avatar } from "@/components/ui/Avatar";
import { Stars } from "@/components/ui/Stars";
import { formatRand } from "@/lib/format";

export const dynamic = "force-dynamic";

const SPA_ID = process.env.DEFAULT_SPA_ID ?? "";
const LOCATION_ID = process.env.DEFAULT_LOCATION_ID ?? "";

type CategorySummary = { name: string; count: number; from: number };

async function loadCategories(): Promise<CategorySummary[]> {
  const rows = await prisma.service.groupBy({
    by: ["category"],
    where: { spaId: SPA_ID, isActive: true },
    _count: { _all: true },
    _min: { price: true },
    orderBy: { category: "asc" },
  });
  return rows.map((r) => ({ name: r.category, count: r._count._all, from: r._min.price ?? 0 }));
}

async function loadTeam() {
  const staff = await prisma.staff.findMany({
    where: { spaId: SPA_ID },
    include: {
      user: { select: { name: true, image: true } },
      services: { include: { service: { select: { category: true } } } },
    },
    orderBy: { user: { name: "asc" } },
  });
  return staff.map((s) => ({
    id: s.id,
    name: s.user.name ?? "Therapist",
    image: s.user.image,
    color: s.color,
    bio: s.bio,
    specialities: Array.from(new Set(s.services.map((x) => x.service.category))).slice(0, 3),
  }));
}

async function loadReviews() {
  if (!LOCATION_ID) return [];
  return prisma.review.findMany({
    where: { locationId: LOCATION_ID, isPublished: true, consentToPublish: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    take: 3,
  });
}

async function loadLocation() {
  if (!LOCATION_ID) return null;
  return prisma.location.findUnique({ where: { id: LOCATION_ID }, select: { address: true, phone: true, email: true } });
}

export default async function HomePage() {
  const [categories, team, reviews, location] = await Promise.all([loadCategories(), loadTeam(), loadReviews(), loadLocation()]);

  return (
    <main>
      <Hero />
      <Treatments categories={categories} />
      <Team team={team} />
      {reviews.length > 0 && <Reviews reviews={reviews} />}
      <MembersBand />
      <Visit address={location?.address} phone={location?.phone} />
    </main>
  );
}

function Hero() {
  return (
    <section className="container-x grid gap-10 py-10 md:min-h-[calc(100dvh-64px)] md:grid-cols-2 md:items-center md:py-16">
      <div className="order-2 md:order-1">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={brand.logoUrl} alt={brand.name} className="mb-10 h-auto w-[200px] md:w-[240px]" />
        <p className="eyebrow mb-5">Durban North · KwaZulu-Natal</p>
        <h1 className="display-xl">
          Where beauty
          <br />
          comes alive.
        </h1>
        <p className="mt-6 max-w-md text-[16px] leading-relaxed text-ink-soft">
          Nails, skin, brows and body treatments by a team who know your name. Browse the full menu, pick your
          therapist, choose a time, and earn points on every visit.
        </p>
        <div className="mt-9 flex flex-col gap-3 sm:flex-row">
          <Link href="/book" className="btn-primary">
            Book a treatment
          </Link>
          <Link href="/gallery" className="btn-outline">
            See the gallery
          </Link>
        </div>
        <p className="mt-7 text-[13px] text-muted">
          Members earn points on every visit.{" "}
          <Link href="/signup" className="text-pink-dark underline-offset-4 hover:underline">
            Join free
          </Link>
        </p>
      </div>
      <div className="order-1 md:order-2">
        <div className="relative aspect-[4/5] overflow-hidden rounded-sm bg-shell md:aspect-[4/5]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/about-us.jpg" alt="" className="h-full w-full object-cover" />
        </div>
      </div>
    </section>
  );
}

function SectionHeading({ eyebrow, title, action }: { eyebrow: string; title: string; action?: React.ReactNode }) {
  return (
    <div className="mb-8 flex items-end justify-between gap-6">
      <div>
        <p className="eyebrow mb-3">{eyebrow}</p>
        <h2 className="display-lg">{title}</h2>
      </div>
      {action}
    </div>
  );
}

function Treatments({ categories }: { categories: CategorySummary[] }) {
  if (categories.length === 0) return null;
  return (
    <section className="border-t border-hairline bg-shell">
      <div className="container-x py-16 md:py-24">
        <SectionHeading
          eyebrow="The menu"
          title="Every treatment, every price."
          action={
            <Link href="/book" className="btn-ghost hidden sm:inline-flex">
              Full menu →
            </Link>
          }
        />
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
          {categories.map((c, i) => (
            <Link
              key={c.name}
              href={`/book?category=${encodeURIComponent(c.name)}`}
              className="card-interactive rise flex flex-col justify-between gap-6 p-5"
              style={{ "--i": i } as React.CSSProperties}
            >
              <span className="font-display text-[20px] leading-tight text-ink">{c.name}</span>
              <span className="text-[11px] uppercase tracking-[0.18em] text-muted">
                {c.count} treatments · from {formatRand(c.from)}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function Team({ team }: { team: Awaited<ReturnType<typeof loadTeam>> }) {
  if (team.length === 0) return null;
  return (
    <section id="team" className="container-x scroll-mt-20 py-16 md:py-24">
      <SectionHeading eyebrow="The team" title="Choose who looks after you." />
      <div className="no-scrollbar -mx-5 flex snap-x gap-4 overflow-x-auto px-5 pb-2 md:mx-0 md:grid md:grid-cols-3 md:px-0 lg:grid-cols-4">
        {team.map((t, i) => (
          <article
            key={t.id}
            className="card rise flex w-[260px] shrink-0 snap-start flex-col p-6 md:w-auto"
            style={{ "--i": i } as React.CSSProperties}
          >
            <Avatar name={t.name} imageUrl={t.image} color={t.color} size="lg" />
            <h3 className="mt-5 font-display text-[22px] text-ink">{t.name}</h3>
            {t.specialities.length > 0 && (
              <p className="mt-1 text-[11px] uppercase tracking-[0.18em] text-blush-deep">{t.specialities.join(" · ")}</p>
            )}
            {t.bio && <p className="mt-3 line-clamp-3 text-[14px] leading-relaxed text-ink-soft">{t.bio}</p>}
            <Link href={`/book?staff=${t.id}`} className="btn-ghost mt-auto pt-5 text-pink-dark hover:text-pink">
              Book with {t.name.split(" ")[0]} →
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}

function Reviews({ reviews }: { reviews: Awaited<ReturnType<typeof loadReviews>> }) {
  return (
    <section className="border-t border-hairline bg-shell">
      <div className="container-x py-16 md:py-24">
        <SectionHeading eyebrow="Kind words" title="What clients say." />
        <div className="grid gap-4 md:grid-cols-3">
          {reviews.map((r, i) => (
            <figure key={r.id} className="card rise flex flex-col p-6" style={{ "--i": i } as React.CSSProperties}>
              <Stars rating={r.rating} />
              <blockquote className="mt-4 font-display text-[19px] leading-snug text-ink">“{r.body}”</blockquote>
              <figcaption className="mt-auto pt-5 text-[11px] uppercase tracking-[0.18em] text-muted">
                {r.authorName}
                {r.serviceName ? ` · ${r.serviceName}` : ""}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

function MembersBand() {
  return (
    <section className="container-x py-16 md:py-24">
      <div className="grid items-center gap-8 rounded-sm bg-ink px-7 py-12 text-paper md:grid-cols-[1.2fr_1fr] md:px-14 md:py-16">
        <div>
          <p className="eyebrow mb-4 text-blush">Loyalty</p>
          <h2 className="font-display text-[clamp(28px,4vw,40px)] leading-[1.1]">
            Points on every visit.
            <br />
            Vouchers at the till.
          </h2>
          <p className="mt-5 max-w-md text-[15px] leading-relaxed text-paper/75">
            Join free, earn automatically when a treatment is completed, and turn points into a Rand-value voucher
            code to show in the salon. No app to download.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row md:justify-end">
          <Link href="/signup" className="btn border-paper bg-paper text-ink hover:bg-blush hover:border-blush">
            Join free
          </Link>
          <Link href="/account/rewards" className="btn border-paper/40 text-paper hover:border-paper">
            My rewards
          </Link>
        </div>
      </div>
    </section>
  );
}

function Visit({ address, phone }: { address?: string | null; phone?: string | null }) {
  const shownAddress = address ?? "34 Beachway Place, Durban North";
  const mapsHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${brand.name} ${shownAddress}`)}`;
  return (
    <section className="border-t border-hairline">
      <div className="container-x grid gap-10 py-16 md:grid-cols-2 md:py-24">
        <div>
          <p className="eyebrow mb-3">Visit</p>
          <h2 className="display-lg">Find us in Durban North.</h2>
          <address className="mt-6 text-[16px] not-italic leading-relaxed text-ink-soft">
            {shownAddress}
            {phone && (
              <>
                <br />
                <a href={`tel:${phone.replace(/\s+/g, "")}`} className="hover:text-ink">
                  {phone}
                </a>
              </>
            )}
          </address>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <a href={mapsHref} target="_blank" rel="noreferrer" className="btn-outline">
              Open in Maps
            </a>
            <Link href="/book" className="btn-primary">
              Book a treatment
            </Link>
          </div>
        </div>
        <div className="aspect-[4/3] overflow-hidden rounded-sm bg-shell">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/location.jpg" alt="" className="h-full w-full object-cover" />
        </div>
      </div>
    </section>
  );
}
