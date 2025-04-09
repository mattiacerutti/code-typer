// @ts-expect-error no types are provided for this package
import { RateLimiterMemory } from "rate-limiter-flexible";

export const rateLimiter = new RateLimiterMemory({
  points: 30,
  duration: 60,
});
