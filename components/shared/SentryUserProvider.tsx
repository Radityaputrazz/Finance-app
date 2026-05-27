"use client";

import { useEffect } from "react";
import { setSentryUser } from "@/lib/utils/sentry";

interface SentryUserProviderProps {
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
  };
}

export function SentryUserProvider({ user }: SentryUserProviderProps) {
  useEffect(() => {
    setSentryUser(user);
  }, [user]);

  return null;
}