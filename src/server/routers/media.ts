import { z } from "zod";
import { router, adminProcedure } from "@/server/trpc";
import { createSignedUpload } from "@/lib/storage";
import { TRPCError } from "@trpc/server";

export const mediaRouter = router({
  // Admin: get a one-time signed URL to upload an image directly to storage.
  createUploadUrl: adminProcedure
    .input(
      z.object({
        folder: z.enum(["gallery", "staff", "products", "reviews", "transformations"]),
        contentType: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        return await createSignedUpload(input.folder, input.contentType);
      } catch (e) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: e instanceof Error ? e.message : "Upload could not be prepared.",
        });
      }
    }),
});
