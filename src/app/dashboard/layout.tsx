import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login?callbackUrl=/dashboard");
  }

  const role = (session.user as any)?.role;
  if (role !== "owner" && role !== "staff") {
    // Regular clients get sent to their account page
    redirect("/account");
  }

  return <>{children}</>;
}
