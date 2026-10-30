import { Suspense } from "react";
import { BookingFlow } from "@/components/booking/BookingFlow";
import { CardListSkeleton } from "@/components/ui/Skeleton";

export default function BookPage() {
  return (
    <Suspense
      fallback={
        <main className="container-x max-w-3xl pt-12">
          <CardListSkeleton rows={5} />
        </main>
      }
    >
      <BookingFlow />
    </Suspense>
  );
}
