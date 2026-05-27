import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Performance monitoring
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,

  // Session replay — record user interactions on error
  replaysOnErrorSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,

  integrations: [
    Sentry.replayIntegration({
      // Mask sensitive fields
      maskAllText: false,
      blockAllMedia: false,
      maskAllInputs: true, // Always mask inputs (passwords, amounts)
    }),
  ],

  // Only enable in production
  enabled: process.env.NODE_ENV === "production",

  // Filter out known non-critical errors
  beforeSend(event) {
    // Ignore network errors from user connectivity issues
    if (event.exception?.values?.[0]?.type === "TypeError") {
      const msg = event.exception.values[0].value ?? "";
      if (msg.includes("Failed to fetch") || msg.includes("Network request failed")) {
        return null;
      }
    }
    return event;
  },
});