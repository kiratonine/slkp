import { SessionTokenProvider } from '../types/session-token-provider.type.js';

export async function resolveSessionToken(
  explicitToken: string | null,
  provider?: SessionTokenProvider,
): Promise<string | null> {
  if (explicitToken !== null && explicitToken.length > 0) {
    return explicitToken;
  }

  if (provider !== undefined) {
    return provider();
  }

  return null;
}