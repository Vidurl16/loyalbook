import { router } from "@/server/trpc";
import { appointmentsRouter } from "./routers/appointments";
import { loyaltyRouter } from "./routers/loyalty";
import { servicesRouter } from "./routers/services";
import { staffRouter } from "./routers/staff";
import { clientsRouter } from "./routers/clients";
import { analyticsRouter } from "./routers/analytics";
import { galleryRouter } from "./routers/gallery";
import { transformationsRouter } from "./routers/transformations";
import { boutiqueRouter } from "./routers/boutique";
import { spaRouter } from "./routers/spa";
import { mysteryShoppersRouter } from "./routers/mysteryShoppers";
import { mediaRouter } from "./routers/media";
import { reviewsRouter } from "./routers/reviews";

export const appRouter = router({
  appointments: appointmentsRouter,
  loyalty: loyaltyRouter,
  services: servicesRouter,
  staff: staffRouter,
  clients: clientsRouter,
  analytics: analyticsRouter,
  gallery: galleryRouter,
  transformations: transformationsRouter,
  boutique: boutiqueRouter,
  spa: spaRouter,
  mysteryShoppers: mysteryShoppersRouter,
  media: mediaRouter,
  reviews: reviewsRouter,
});

export type AppRouter = typeof appRouter;
