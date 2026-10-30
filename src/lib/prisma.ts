import { PrismaClient } from "@prisma/client";
import { createDbAdapter } from "./dbAdapter";

function createPrismaClient() {
  return new PrismaClient({
    adapter: createDbAdapter(),
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
