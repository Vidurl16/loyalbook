/**
 * Sets a new password for an existing account, for example after a weak bootstrap password.
 * Run from a normal terminal so the password is never echoed or logged:
 *   read -s -p "New password: " PW && echo && \
 *   DOTENV_CONFIG_PATH=.env.vivacious ADMIN_EMAIL=owner@vivacious.co.za ADMIN_PASSWORD="$PW" \
 *   node node_modules/.bin/jiti scripts/set-owner-password.ts
 */
import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { createDbAdapter } from "../src/lib/dbAdapter";

const prisma = new PrismaClient({ adapter: createDbAdapter(), log: [] });

async function main() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  if (!email) throw new Error("ADMIN_EMAIL is required.");
  if (!password || password.length < 12) throw new Error("ADMIN_PASSWORD must be at least 12 characters.");

  const user = await prisma.user.findUnique({ where: { email }, select: { id: true } });
  if (!user) throw new Error(`No account found for ${email}.`);

  await prisma.user.update({ where: { id: user.id }, data: { passwordHash: await bcrypt.hash(password, 12) } });
  await prisma.session.deleteMany({ where: { userId: user.id } });
  console.log(`Password updated for ${email}. Existing sessions signed out.`);
}

main()
  .catch((e) => { console.error(e instanceof Error ? e.message : e); process.exit(1); })
  .finally(() => prisma.$disconnect());
