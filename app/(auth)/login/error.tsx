"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <div className="text-center">
      <p className="text-red-500 text-sm mb-4">Terjadi kesalahan saat login.</p>
      <button
        onClick={reset}
        className="text-emerald-600 text-sm font-medium hover:underline"
      >
        Coba lagi
      </button>
    </div>
  );
}