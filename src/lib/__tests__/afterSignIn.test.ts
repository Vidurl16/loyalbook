import { describe, expect, it } from "vitest";
import type { Session } from "next-auth";
import { destinationAfterSignIn } from "../afterSignIn";

const session = (role: "owner" | "staff" | "client"): Session => ({ user: { id: "u1", role }, expires: "" });

describe("destinationAfterSignIn", () => {
  it("sends owners and staff to the dashboard regardless of callback", () => {
    expect(destinationAfterSignIn(session("owner"), "/book?step=details")).toBe("/dashboard");
    expect(destinationAfterSignIn(session("staff"), null)).toBe("/dashboard");
  });

  it("returns clients to a same-site callback, otherwise their account", () => {
    expect(destinationAfterSignIn(session("client"), "/book?service=x&step=details")).toBe("/book?service=x&step=details");
    expect(destinationAfterSignIn(session("client"), null)).toBe("/account");
    expect(destinationAfterSignIn(session("client"), "https://evil.example")).toBe("/account");
    expect(destinationAfterSignIn(session("client"), "//evil.example")).toBe("/account");
  });
});
