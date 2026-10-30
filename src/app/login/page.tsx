"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { getSession, signIn } from "next-auth/react";
import { AuthFrame, GoogleButton, OrDivider } from "@/components/auth/AuthFrame";
import { destinationAfterSignIn } from "@/lib/afterSignIn";
import { brand } from "@/lib/brand";

function LoginForm() {
  const router = useRouter();
  const callbackUrl = useSearchParams().get("callbackUrl");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await signIn("credentials", { email, password, redirect: false });
    if (res?.error) {
      setError("That email and password don't match.");
      setLoading(false);
      return;
    }
    router.push(destinationAfterSignIn(await getSession(), callbackUrl));
  }

  const joinHref = callbackUrl ? `/signup?callbackUrl=${encodeURIComponent(callbackUrl)}` : "/signup";

  return (
    <>
      <GoogleButton label="Continue with Google" onClick={() => signIn("google", { callbackUrl: callbackUrl ?? "/account" })} />
      <OrDivider />
      <form onSubmit={submit} className="flex flex-col gap-3">
        <input type="email" required autoComplete="email" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} className="field" />
        <input type="password" required autoComplete="current-password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="field" />
        {error && <p className="text-[13px] text-pink-dark">{error}</p>}
        <button type="submit" disabled={loading} className="btn-primary mt-2 w-full">
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>
      <p className="mt-6 text-center text-[13px] text-muted">
        New here?{" "}
        <Link href={joinHref} className="text-pink-dark underline-offset-4 hover:underline">
          Join free
        </Link>
      </p>
    </>
  );
}

export default function LoginPage() {
  return (
    <AuthFrame
      title="Welcome back"
      lede="Sign in to manage bookings and rewards."
      aside={
        <>
          <span className="hairline mb-7 block w-8 bg-blush" />
          <blockquote className="font-display text-[26px] leading-snug text-ink">“The ritual of self-care begins with showing up.”</blockquote>
          <p className="mt-5 text-[11px] uppercase tracking-[0.22em] text-blush-deep">{brand.tagline}</p>
        </>
      }
    >
      <Suspense>
        <LoginForm />
      </Suspense>
    </AuthFrame>
  );
}
