import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { ArrowLeft, Check, Copy } from "lucide-react";
import PhoneFrame from "../components/PhoneFrame";
import { bridgePaymentsService } from "../services/bridge-payments/bridgePaymentsService";
import { ApiError } from "../services/api/client";
import type {
  BridgePayment,
  BridgePaymentStatus,
} from "../types/bridge-payments";

const STATUS_LABELS: Record<BridgePaymentStatus, string> = {
  PENDING: "В обработке",
  SUCCEEDED: "Успешно",
  FAILED: "Ошибка",
};

const STATUS_STYLES: Record<BridgePaymentStatus, string> = {
  PENDING: "bg-amber-100 text-amber-700",
  SUCCEEDED: "bg-green-100 text-green-700",
  FAILED: "bg-red-100 text-red-700",
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
    <div className="flex items-start justify-between gap-3 py-2">
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

  return (
    <PhoneFrame>
      <div className="px-5 pt-4 pb-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate("/bridge-payments")}
            className="text-gray-500"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-lg font-semibold text-gray-900">Платёж</h1>
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
          <div className="flex flex-col gap-3">
            {/* Header card: status + amount */}
            <div className="bg-white rounded-2xl shadow-sm px-4 py-4">
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm font-medium text-gray-900 flex-1 min-w-0 truncate mr-2">
                  {payment.purpose || "Без описания"}
                </div>
                <div
                  className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${
                    payment.decision === "REJECTED"
                      ? "bg-red-100 text-red-700"
                      : STATUS_STYLES[payment.status]
                  }`}
                >
                  {payment.decision === "REJECTED"
                    ? "Отклонён"
                    : STATUS_LABELS[payment.status]}
                </div>
              </div>
              {payment.estimatedKztDebit !== null && (
                <div className="text-2xl font-semibold text-gray-900">
                  {payment.estimatedKztDebit.toLocaleString("ru-RU")} ₸
                </div>
              )}
            </div>

            {/* Rejection reason (only if rejected) */}
            {payment.decision === "REJECTED" && payment.rejectionReason && (
              <div className="bg-red-50 border border-red-200 rounded-2xl px-4 py-3">
                <div className="text-xs text-red-700 mb-1 font-medium">
                  Причина отказа
                </div>
                <div className="text-sm text-red-800">
                  {payment.rejectionReason}
                </div>
              </div>
            )}

            {/* Payment details */}
            <div className="bg-white rounded-2xl shadow-sm px-4 py-2">
              <FieldRow label="Продавец" value={payment.sellerUrl} copyable />
              {payment.asset && (
                <FieldRow label="Актив" value={payment.asset} />
              )}
              {payment.network && (
                <FieldRow label="Сеть" value={payment.network} />
              )}
              {payment.amountAtomic && (
                <FieldRow
                  label="Сумма (atomic)"
                  value={payment.amountAtomic}
                  mono
                />
              )}
            </div>

            {/* Blockchain details */}
            {(payment.solanaTxSignature || payment.payToAddress) && (
              <div className="bg-white rounded-2xl shadow-sm px-4 py-2">
                {payment.solanaTxSignature && (
                  <FieldRow
                    label="Tx Signature"
                    value={payment.solanaTxSignature}
                    copyable
                    mono
                  />
                )}
                {payment.payToAddress && (
                  <FieldRow
                    label="Адрес получателя"
                    value={payment.payToAddress}
                    copyable
                    mono
                  />
                )}
              </div>
            )}

            {/* Timing */}
            <div className="bg-white rounded-2xl shadow-sm px-4 py-2">
              <FieldRow
                label="Создан"
                value={new Date(payment.createdAt).toLocaleString("ru-RU")}
              />
              {payment.executedAt && (
                <FieldRow
                  label="Выполнен"
                  value={new Date(payment.executedAt).toLocaleString("ru-RU")}
                />
              )}
            </div>

            {/* ID */}
            <div className="bg-white rounded-2xl shadow-sm px-4 py-2">
              <FieldRow label="ID платежа" value={payment.id} copyable mono />
            </div>
          </div>
        )}
      </div>
    </PhoneFrame>
  );
}
