import * as Sentry from "@sentry/nextjs";

// Capture an error with extra context
export function captureError(
  error: unknown,
  context?: Record<string, unknown>
) {
  if (process.env.NODE_ENV !== "production") {
    console.error("[Error]", error, context);
    return;
  }

  Sentry.withScope((scope) => {
    if (context) {
      Object.entries(context).forEach(([key, value]) => {
        scope.setExtra(key, value);
      });
    }
    Sentry.captureException(error);
  });
}

// Capture a message (non-fatal)
export function captureMessage(
  message: string,
  level: Sentry.SeverityLevel = "info",
  context?: Record<string, unknown>
) {
  if (process.env.NODE_ENV !== "production") {
    console.log(`[${level}]`, message, context);
    return;
  }

  Sentry.withScope((scope) => {
    if (context) {
      Object.entries(context).forEach(([key, value]) => {
        scope.setExtra(key, value);
      });
    }
    Sentry.captureMessage(message, level);
  });
}

// Set user context (call after login)
export function setSentryUser(user: {
  id: string;
  email?: string | null;
  name?: string | null;
}) {
  Sentry.setUser({
    id: user.id,
    email: user.email ?? undefined,
    username: user.name ?? undefined,
  });
}

// Clear user context (call after logout)
export function clearSentryUser() {
  Sentry.setUser(null);
}

// Track custom events
export function trackEvent(
  name: string,
  data?: Record<string, unknown>
) {
  if (process.env.NODE_ENV !== "production") return;

  Sentry.addBreadcrumb({
    category: "custom",
    message: name,
    data,
    level: "info",
  });
}