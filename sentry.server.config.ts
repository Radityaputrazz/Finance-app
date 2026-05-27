import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,

  // Lower sample rate in production to save quota
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,

  enabled: process.env.NODE_ENV === "production",

  // Capture unhandled promise rejections
  beforeSend(event) {
    // Don't send events for expected errors
    if (event.exception?.values?.[0]?.type === "NotFoundError") {
      return null;
    }
    return event;
  },
});