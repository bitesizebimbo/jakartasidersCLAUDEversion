import "server-only";
import type { SocialTrendProvider } from "./SocialTrendProvider";
import { MockSocialTrendProvider } from "./MockSocialTrendProvider";

let cached: SocialTrendProvider | null = null;

/**
 * Returns the active social trend provider. Currently always the seeded
 * mock — swap this for a `TikTokProvider` or `SocialListeningProvider`
 * once a compliant data source is under contract, gated by an env var
 * the same way `services/google` gates the live Places provider.
 */
export function getSocialTrendProvider(): SocialTrendProvider {
  if (cached) return cached;
  cached = new MockSocialTrendProvider();
  return cached;
}

export type { SocialTrendProvider } from "./SocialTrendProvider";
