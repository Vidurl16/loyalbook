import { router } from "@/server/trpc";
import { appointmentsRouter } from "./routers/appointments";
import { loyaltyRouter } from "./routers/loyalty";
import { servicesRouter } from "./routers/services";
import { staffRouter } from "./routers/staff";
import { clientsRouter } from "./routers/clients";
import { analyticsRouter } from "./routers/analytics";

export const appRouter = router({
  appointments: appointmentsRouter,
  loyalty: loyaltyRouter,
  services: servicesRouter,
  staff: staffRouter,
  clients: clientsRouter,
  analytics: analyticsRouter,
});

export type AppRouter = typeof appRouter;
