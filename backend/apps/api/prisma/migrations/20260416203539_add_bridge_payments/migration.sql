-- CreateEnum
CREATE TYPE "BridgePaymentStatus" AS ENUM ('PENDING', 'SUCCEEDED', 'FAILED');

-- CreateEnum
CREATE TYPE "BridgePaymentDecision" AS ENUM ('APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "bridge_payments" (
    "id" TEXT NOT NULL,
    "agentSessionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "idempotencyKey" TEXT NOT NULL,
    "sellerUrl" TEXT NOT NULL,
    "purpose" TEXT,
    "paymentRequiredB64" TEXT NOT NULL,
    "paymentSignatureB64" TEXT,
    "amountAtomic" TEXT,
    "asset" TEXT,
    "network" TEXT,
    "estimatedKztDebit" INTEGER,
    "decision" "BridgePaymentDecision",
    "rejectionReason" TEXT,
    "status" "BridgePaymentStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bridge_payments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "bridge_payments_userId_idx" ON "bridge_payments"("userId");

-- CreateIndex
CREATE INDEX "bridge_payments_status_idx" ON "bridge_payments"("status");

-- CreateIndex
CREATE UNIQUE INDEX "bridge_payments_agentSessionId_idempotencyKey_key" ON "bridge_payments"("agentSessionId", "idempotencyKey");

-- AddForeignKey
ALTER TABLE "bridge_payments" ADD CONSTRAINT "bridge_payments_agentSessionId_fkey" FOREIGN KEY ("agentSessionId") REFERENCES "agent_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
