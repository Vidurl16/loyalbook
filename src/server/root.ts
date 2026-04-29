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
});

export type AppRouter = typeof appRouter;
