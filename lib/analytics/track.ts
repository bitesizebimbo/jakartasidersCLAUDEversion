import type { AnalyticsEventName, AnalyticsProperties } from "./events";

/**
 * Lightweight analytics abstraction. Logs to the console in development
 * so event coverage is visible without any production analytics service
 * configured. Swap the implementation here (e.g. to PostHog/Amplitude)
 * without touching call sites.
 */
export function track(event: AnalyticsEventName, properties?: AnalyticsProperties): void {
  if (process.env.NODE_ENV !== "production") {
    console.debug(`[analytics] ${event}`, properties ?? {});
  }

  const w = typeof window !== "undefined" ? (window as Window & { __analyticsSink?: typeof track }) : undefined;
  w?.__analyticsSink?.(event, properties);
}
