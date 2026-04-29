import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { ArrowLeft, Check, Copy, ExternalLink } from "lucide-react";
import PhoneFrame from "../components/PhoneFrame";
import { bridgePaymentsService } from "../services/bridge-payments/bridgePaymentsService";
import { ApiError } from "../services/api/client";
import type {
  BridgePayment,
  BridgePaymentStatus,
} from "../types/bridge-payments";

const STATUS_HEADER_BG: Record<BridgePaymentStatus, string> = {
  PENDING: "from-amber-400 to-amber-500",
  SUCCEEDED: "from-green-400 to-green-500",
  FAILED: "from-red-400 to-red-500",
};

const STATUS_LABELS: Record<BridgePaymentStatus, string> = {
  PENDING: "PENDING",
  SUCCEEDED: "SUCCEEDED",
  FAILED: "FAILED",
};

type FieldRowProps = {
  label: string;
  value: string;
  copyable?: boolean;
  mono?: boolean;
};

function FieldRow({ label, value, copyable, mono }: FieldRowProps) {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(value);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="flex items-start justify-between gap-3 px-4 py-3 border-b border-gray-100 last:border-b-0">
      <div className="flex-1 min-w-0">
        <div className="text-xs text-gray-500 mb-0.5">{label}</div>
        <div
          className={`text-sm text-gray-900 break-all ${
            mono ? "font-mono text-xs" : ""
          }`}
        >
          {value}
        </div>
      </div>
      {copyable && (
        <button
          type="button"
          onClick={handleCopy}
          className="text-gray-400 hover:text-gray-600 shrink-0 mt-1"
        >
          {isCopied ? <Check size={16} /> : <Copy size={16} />}
        </button>
      )}
    </div>
  );
}

export default function BridgePaymentDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [payment, setPayment] = useState<BridgePayment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const loadPayment = async () => {
      try {
        const data = await bridgePaymentsService.getById(id);
        setPayment(data.payment);
      } catch (err) {
        if (err instanceof ApiError) {
          setLoadError(err.message);
        } else {
          setLoadError("Не удалось загрузить платёж");
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadPayment();
  }, [id]);

  const handleViewOnExplorer = () => {
    if (!payment?.solanaTxSignature) return;
    const url = `https://explorer.solana.com/tx/${payment.solanaTxSignature}?cluster=devnet`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <PhoneFrame>
      <div className="px-5 pt-4 pb-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <button
            type="button"
            onClick={() => navigate("/bridge-payments")}
            className="text-gray-500"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-lg font-semibold text-gray-900">
            Payment Detail
          </h1>
        </div>

        {isLoading && (
          <div className="text-sm text-gray-400 text-center py-8">
            Загрузка...
          </div>
        )}

        {loadError && !isLoading && (
          <div className="text-sm text-red-500 bg-red-50 rounded-xl px-4 py-3">
            {loadError}
          </div>
        )}

        {payment && !isLoading && !loadError && (
          <>
            {/* Status header card */}
            <div
              className={`rounded-3xl p-5 mb-4 text-white relative overflow-hidden bg-gradient-to-br ${STATUS_HEADER_BG[payment.status]}`}
            >
              <div className="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-full translate-x-10 -translate-y-10" />

              <div className="relative z-10 text-center">
                <div className="text-xs font-semibold tracking-wider mb-2 opacity-90">
                  {STATUS_LABELS[payment.status]}
                </div>
                {payment.amountAtomic && payment.asset && (
                  <div className="text-3xl font-bold mb-2">
                    {(Number(payment.amountAtomic) / 1_000_000).toFixed(2)}
                    <span className="text-lg font-medium ml-1 opacity-80">
                      {payment.asset}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-center gap-1.5 text-xs opacity-90">
                  <div className="w-5 h-5 rounded-full bg-white/30 flex items-center justify-center text-[10px] font-bold">
                    $
                  </div>
                  {payment.asset || "USDC"} on {payment.network || "Solana"}
                </div>
              </div>
            </div>

            {/* Rejection reason */}
            {payment.decision === "REJECTED" && payment.rejectionReason && (
              <div className="bg-red-50 border border-red-200 rounded-2xl px-4 py-3 mb-4">
                <div className="text-xs text-red-700 mb-1 font-medium">
                  Rejection Reason
                </div>
                <div className="text-sm text-red-800">
                  {payment.rejectionReason}
                </div>
              </div>
            )}

            {/* Details */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-4">
              <FieldRow label="Payment ID" value={payment.id} mono copyable />
              <FieldRow
                label="Seller (URL)"
                value={payment.sellerUrl}
                copyable
              />
              {payment.asset && (
                <FieldRow label="Asset" value={payment.asset} />
              )}
              {payment.network && (
                <FieldRow label="Network" value={payment.network} />
              )}
              {payment.payToAddress && (
                <FieldRow
                  label="Pay To Address"
                  value={payment.payToAddress}
                  mono
                  copyable
                />
              )}
              {payment.estimatedKztDebit !== null && (
                <FieldRow
                  label="Estimated KZT Debit"
                  value={`${payment.estimatedKztDebit.toLocaleString("ru-RU")} ₸`}
                />
              )}
              {payment.executedAt && (
                <FieldRow
                  label="Executed At"
                  value={new Date(payment.executedAt).toLocaleString("ru-RU")}
                />
              )}
              {payment.solanaTxSignature && (
                <FieldRow
                  label="Tx Signature"
                  value={payment.solanaTxSignature}
                  mono
                  copyable
                />
              )}
            </div>

            {/* View on Explorer (only if has tx signature) */}
            {payment.solanaTxSignature && (
              <button
                type="button"
                onClick={handleViewOnExplorer}
                className="w-full bg-white border border-violet-200 text-violet-600 rounded-2xl py-3.5 font-semibold text-sm hover:bg-violet-50 transition-colors flex items-center justify-center gap-2"
              >
                <ExternalLink size={16} />
                View on Explorer
              </button>
            )}
          </>
        )}
      </div>
    </PhoneFrame>
  );
}
