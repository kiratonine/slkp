# S1lk x402 Agent SDK

## Purpose

S1lk x402 Agent SDK is a client library that allows AI agents to pay x402-protected APIs through S1lk x402 Bridge.

The SDK hides payment flow complexity from the agent and provides a simple payment-aware request interface.

## Core Idea

The agent does not execute blockchain payments directly.

Instead, the agent:
1. receives `402 Payment Required`
2. extracts payment requirements
3. sends them to S1lk x402 Bridge
4. receives `PAYMENT-SIGNATURE`
5. retries the original seller request
6. gets the paid response

## Why This Exists

Without SDK integration, every AI agent would need to manually implement:
- x402 response parsing
- bridge request formatting
- idempotency handling
- payment retry logic
- session token management

The SDK standardizes this flow.

## Security Model

S1lk x402 Agent SDK does not expose user funds to the agent.

Security principles:
- no wallet access on agent side
- no direct card access
- no direct balance mutation by agent
- only delegated session token
- session token is limited and revocable
- payment execution happens only in backend bridge
- Solana is used as execution and settlement layer

## High-Level Flow

1. User enables agent payments in S1lkPay UI
2. User creates agent session
3. User gets delegated `sessionToken`
4. User provides `sessionToken` to AI agent
5. Agent requests paid API
6. Seller returns `402`
7. SDK calls bridge
8. Bridge validates limits and performs payment
9. SDK retries seller request
10. Seller returns final response

## Public API Design

### Main entrypoint

```ts
import { createS1lkX402Client } from '@s1lk/x402-agent-sdk';
```

### Client creation

```ts
const client = createS1lkX402Client({
  bridgeBaseUrl: 'https://bridge.example.com/v1',
  sessionTokenProvider: async () => {
    return await askUserForSessionToken();
  },
});
```

### Main method

```ts
const response = await client.fetch('https://seller.example.com/paid/sol');
```

## Proposed Public API

### `createS1lkX402Client(options)`

Creates SDK client instance.

### `client.fetch(input, init?)`

Performs payment-aware request:
- sends original request
- detects `402`
- calls bridge
- retries with `PAYMENT-SIGNATURE`

### `client.setSessionToken(token)`

Sets runtime session token manually.

### `client.clearSessionToken()`

Clears current session token from runtime memory.

## Client Options

```ts
export type CreateS1lkX402ClientOptions = {
  bridgeBaseUrl: string;
  sessionTokenProvider?: () => Promise<string>;
  fetchImpl?: typeof fetch;
  onLog?: (message: string, meta?: Record<string, unknown>) => void;
  onPaymentRequired?: (sellerUrl: string) => Promise<void>;
  onPaymentApproved?: (paymentId: string) => Promise<void>;
  onPaymentRejected?: (reason: string) => Promise<void>;
};
```

## Internal Responsibilities

The SDK should handle:
- x402 `402` detection
- `paymentRequiredB64` extraction
- bridge request creation
- `idempotencyKey` generation
- payment retry with `PAYMENT-SIGNATURE`
- runtime session token access
- basic structured logging

## Session Token Strategy

For MVP:
- user copies session token from UI
- user pastes token into agent runtime
- token is stored in memory only

For production:
- agent platform may provide secure runtime token storage
- token provider may request token from user on demand
- token provider may refresh token after revoke/expiration

## Error Model

SDK should expose typed errors:

- `S1lkX402Error`
- `S1lkX402PaymentRejectedError`
- `S1lkX402SessionTokenMissingError`
- `S1lkX402Invalid402ResponseError`
- `S1lkX402BridgeRequestError`

## Example Usage

```ts
const client = createS1lkX402Client({
  bridgeBaseUrl: 'http://localhost:3001/v1',
  sessionTokenProvider: async () => runtimeToken,
});

const response = await client.fetch('http://localhost:3002/paid/sol');

const data = await response.json();
console.log(data);
```

## MVP vs Production

### MVP
Already implemented in project:
- interactive demo agent
- runtime session token input
- seller `402 -> bridge -> retry -> 200`
- bridge validation
- KZT debit and ledger
- Solana devnet payment execution

### Production
Planned:
- publishable npm package
- real x402 middleware compatibility
- more robust request adapters
- session token provider integrations
- broader agent platform support
- richer typed errors and observability

## Positioning for Judges

S1lk x402 Agent SDK is the developer-facing layer that turns S1lk x402 Bridge into an embeddable payment capability for AI agents.

This is how the system evolves from a hackathon demo into real agent payment infrastructure.