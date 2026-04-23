export function makeIdempotencyKey(): string {
  return `sdk-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}