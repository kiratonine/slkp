# Ledger API

## GET /v1/ledger

Returns current authenticated user's ledger history.

Contains:
- payment reference
- KZT amount
- entry type
- creation timestamp

### Success Response

```json
{
  "entries": [
    {
      "id": "4c810c07-3bd9-4527-a80b-1aff33708464",
      "paymentId": "3a3e36bc-1a7a-4924-8246-66cf544892ff",
      "amountKzt": -75,
      "type": "DEBIT",
      "createdAt": "2026-04-22T11:49:46.400Z"
    }
  ]
}
```