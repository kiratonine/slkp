import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft } from "lucide-react";
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

export default function BridgePaymentsPage() {
  const navigate = useNavigate();

  const [payments, setPayments] = useState<BridgePayment[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    const loadPayments = async () => {
      try {
        const data = await bridgePaymentsService.list();
        setPayments(data.payments);
      } catch (err) {
        if (err instanceof ApiError) {
          setLoadError(err.message);
        } else {
          setLoadError("Не удалось загрузить платежи");
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadPayments();
  }, []);

  return (
    <PhoneFrame>
      <div className="px-5 pt-4 pb-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate("/dashboard")}
            className="text-gray-500"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-lg font-semibold text-gray-900">
            Платежи агента
          </h1>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="text-sm text-gray-400 text-center py-8">
            Загрузка...
          </div>
        )}

        {/* Error */}
        {loadError && !isLoading && (
          <div className="text-sm text-red-500 bg-red-50 rounded-xl px-4 py-3">
            {loadError}
          </div>
        )}

        {/* Empty state */}
        {payments && payments.length === 0 && !isLoading && (
          <div className="text-sm text-gray-400 text-center py-8">
            Платежей пока нет
          </div>
        )}

        {/* Payments list */}
        {payments && payments.length > 0 && (
          <div className="flex flex-col gap-3">
            {payments.map((payment) => {
              const isRejected = payment.decision === "REJECTED";

              return (
                <button
                  key={payment.id}
                  type="button"
                  onClick={() => navigate(`/bridge-payments/${payment.id}`)}
                  className="bg-white rounded-2xl shadow-sm px-4 py-4 text-left hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm font-medium text-gray-900 truncate flex-1 min-w-0 mr-2">
                      {payment.purpose || payment.sellerUrl}
                    </div>
                    <div
                      className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${
                        isRejected
                          ? "bg-red-100 text-red-700"
                          : STATUS_STYLES[payment.status]
                      }`}
                    >
                      {isRejected ? "Отклонён" : STATUS_LABELS[payment.status]}
                    </div>
                  </div>

                  {payment.estimatedKztDebit !== null && (
                    <div className="text-sm font-semibold text-gray-900 mb-1">
                      {payment.estimatedKztDebit.toLocaleString("ru-RU")} ₸
                    </div>
                  )}

                  <div className="text-xs text-gray-400">
                    {new Date(payment.createdAt).toLocaleString("ru-RU")}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </PhoneFrame>
  );
}
