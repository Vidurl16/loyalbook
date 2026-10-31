"use client";

import { useEffect, useState } from "react";
import { getProviders } from "next-auth/react";

/** True once the server confirms Google OAuth is configured; the button stays hidden otherwise. */
export function useGoogleSignIn() {
  const [available, setAvailable] = useState(false);
  useEffect(() => {
    let cancelled = false;
    getProviders().then((p) => {
      if (!cancelled) setAvailable(!!p?.google);
    });
    return () => {
      cancelled = true;
    };
  }, []);
  return available;
}
