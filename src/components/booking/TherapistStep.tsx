"use client";

import { Avatar } from "@/components/ui/Avatar";
import { CardListSkeleton } from "@/components/ui/Skeleton";
import { ANY_THERAPIST } from "./useBookingDraft";
import { BackButton, StepHeading } from "./StepHeading";

export type TherapistRow = {
  id: string;
  bio: string | null;
  color: string;
  user: { name: string | null; image: string | null };
  services: { service: { category: string } }[];
};

function Option({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <li>
      <button type="button" onClick={onClick} className="card-interactive flex w-full items-center gap-4 p-4 text-left">
        {children}
      </button>
    </li>
  );
}

export function TherapistStep({
  therapists,
  loading,
  onSelect,
  onBack,
}: {
  therapists: TherapistRow[];
  loading: boolean;
  onSelect: (staffId: string) => void;
  onBack: () => void;
}) {
  return (
    <section>
      <StepHeading
        step={2}
        title="Choose your therapist"
        lede={therapists.length > 0 ? "Everyone listed is trained for this treatment." : "We'll match you with the right person for this treatment."}
      />

      {loading ? (
        <CardListSkeleton rows={3} />
      ) : (
        <ul className="flex flex-col gap-3">
          <Option onClick={() => onSelect(ANY_THERAPIST)}>
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-hairline bg-shell">
              <span className="h-2 w-2 rounded-full bg-pink" />
            </span>
            <span>
              <span className="block font-display text-[18px] text-ink">Any available therapist</span>
              <span className="block text-[13px] text-muted">First available at your chosen time</span>
            </span>
          </Option>

          {therapists.map((t) => {
            const name = t.user.name ?? "Therapist";
            const specialities = Array.from(new Set(t.services.map((s) => s.service.category))).slice(0, 3);
            return (
              <Option key={t.id} onClick={() => onSelect(t.id)}>
                <Avatar name={name} imageUrl={t.user.image} color={t.color} />
                <span className="min-w-0">
                  <span className="block font-display text-[18px] text-ink">{name}</span>
                  {specialities.length > 0 && (
                    <span className="block text-[10px] uppercase tracking-[0.18em] text-blush-deep">{specialities.join(" · ")}</span>
                  )}
                  {t.bio && <span className="mt-1 line-clamp-2 block text-[13px] leading-relaxed text-muted">{t.bio}</span>}
                </span>
              </Option>
            );
          })}
        </ul>
      )}

      <BackButton onClick={onBack}>Change treatment</BackButton>
    </section>
  );
}
