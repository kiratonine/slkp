import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Filter, ShoppingBag } from "lucide-react";
import PhoneFrame from "../components/PhoneFrame";
import { bridgePaymentsService } from "../services/bridge-payments/bridgePaymentsService";
import { balanceService } from "../services/balance/balanceService";
import { ApiError } from "../services/api/client";
import type {
  BridgePayment,
  BridgePaymentStatus,
} from "../types/bridge-payments";
import type { Balance } from "../types/auth";

const STATUS_BADGE_STYLES: Record<BridgePaymentStatus, string> = {
  PENDING: "bg-amber-100 text-amber-700",
  SUCCEEDED: "bg-green-100 text-green-700",
  FAILED: "bg-red-100 text-red-700",
};

const STATUS_BADGE_LABELS: Record<BridgePaymentStatus, string> = {
  PENDING: "В обработке",
  SUCCEEDED: "Успешно",
  FAILED: "Ошибка",
};

function getPaymentLabel(payment: BridgePayment): string {
  if (payment.purpose) return payment.purpose;
  return "Оплата AI агентом";
}

function formatDateGroup(dateString: string): string {
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  const isSameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  if (isSameDay(date, today)) return "Сегодня";
  if (isSameDay(date, yesterday)) return "Вчера";

  return date.toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
  });
}

function groupByDate(payments: BridgePayment[]): Map<string, BridgePayment[]> {
  const groups = new Map<string, BridgePayment[]>();

  for (const payment of payments) {
    const groupKey = formatDateGroup(payment.createdAt);
    const existing = groups.get(groupKey);
    if (existing) {
      existing.push(payment);
    } else {
      groups.set(groupKey, [payment]);
    }
  }

  return groups;
}

export default function LedgerPage() {
  const navigate = useNavigate();
  const [payments, setPayments] = useState<BridgePayment[] | null>(null);
  const [balance, setBalance] = useState<Balance | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [paymentsData, balanceData] = await Promise.all([
          bridgePaymentsService.list(),
          balanceService.getBalance(),
        ]);
        setPayments(paymentsData.payments);
        setBalance(balanceData);
      } catch (err) {
        if (err instanceof ApiError) {
          setLoadError(err.message);
        } else {
          setLoadError("Не удалось загрузить данные");
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const groupedPayments = payments ? groupByDate(payments) : null;

  return (
    <PhoneFrame>
      <div className="px-5 pt-4 pb-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h1 className="text-2xl font-semibold text-gray-900">Ledger</h1>
          <button
            type="button"
            className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
          >
            <Filter size={18} className="text-gray-600" />
          </button>
        </div>

        {/* Total Balance card */}
        <div
          className="rounded-3xl p-5 mb-4 text-white relative overflow-hidden"
          style={{
            background:
              "linear-gradient(135deg, #8b5cf6 0%, #6366f1 50%, #3b82f6 100%)",
          }}
        >
          <div className="absolute right-0 top-0 w-40 h-40 bg-white/10 rounded-full translate-x-12 -translate-y-12" />

          <div className="relative z-10">
            <div className="text-xs text-white/80 font-medium mb-1">
              Total Balance
            </div>
            {balance ? (
              <div className="text-3xl font-bold">
                {balance.amountKzt.toLocaleString("ru-RU")}
                <span className="text-lg font-medium ml-1 text-white/80">
                  ₸
                </span>
              </div>
            ) : (
              <div className="text-2xl font-semibold text-white/60">
                {isLoading ? "Загрузка..." : "—"}
              </div>
            )}
          </div>
        </div>

        {/* Loading */}
        {isLoading && !payments && (
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
            Операций пока нет
          </div>
        )}

        {/* Payments list grouped by date */}
        {groupedPayments && payments && payments.length > 0 && (
          <div className="flex flex-col gap-3">
            {Array.from(groupedPayments.entries()).map(([dateLabel, items]) => (
              <div key={dateLabel}>
                <div className="text-xs text-gray-400 uppercase tracking-wider mb-2 px-1">
                  {dateLabel}
                </div>
                <div className="flex flex-col gap-2">
                  {items.map((payment) => {
                    const isFailed =
                      payment.status === "FAILED" ||
                      payment.decision === "REJECTED";
                    const isPending = payment.status === "PENDING";
                    const isSuccess = payment.status === "SUCCEEDED";

                    return (
                      <button
                        key={payment.id}
                        type="button"
                        onClick={() =>
                          navigate(`/bridge-payments/${payment.id}`)
                        }
                        className="bg-white rounded-2xl shadow-sm px-4 py-3 flex items-center gap-3 text-left hover:bg-gray-50 transition-colors w-full"
                      >
                        <div
                          className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 ${
                            isFailed
                              ? "bg-red-50"
                              : isPending
                                ? "bg-amber-50"
                                : "bg-violet-50"
                          }`}
                        >
                          <ShoppingBag
                            size={18}
                            className={
                              isFailed
                                ? "text-red-500"
                                : isPending
                                  ? "text-amber-600"
                                  : "text-violet-600"
                            }
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-gray-900 truncate mb-0.5">
                            {getPaymentLabel(payment)}
                          </div>
                          <div className="flex items-center gap-1.5">
                            <div className="text-xs text-gray-400">
                              {new Date(payment.createdAt).toLocaleTimeString(
                                "ru-RU",
                                { hour: "2-digit", minute: "2-digit" },
                              )}
                            </div>
                            <span
                              className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${
                                payment.decision === "REJECTED"
                                  ? "bg-red-100 text-red-700"
                                  : STATUS_BADGE_STYLES[payment.status]
                              }`}
                            >
                              {payment.decision === "REJECTED"
                                ? "Отклонён"
                                : STATUS_BADGE_LABELS[payment.status]}
                            </span>
                          </div>
                        </div>
                        {payment.estimatedKztDebit !== null && (
                          <div
                            className={`text-sm font-bold shrink-0 ${
                              isSuccess ? "text-red-500" : "text-gray-400"
                            }`}
                          >
                            {isSuccess && "-"}
                            {payment.estimatedKztDebit.toLocaleString(
                              "ru-RU",
                            )}{" "}
                            ₸
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </PhoneFrame>
  );
}
