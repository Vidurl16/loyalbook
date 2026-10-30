import type { Session } from "next-auth";

/** Staff land on the dashboard; clients go back to where they came from. */
export function destinationAfterSignIn(session: Session | null, callbackUrl: string | null) {
  const role = session?.user?.role;
  if (role === "owner" || role === "staff") return "/dashboard";
  if (callbackUrl && callbackUrl.startsWith("/") && !callbackUrl.startsWith("//")) return callbackUrl;
  return "/account";
}
