import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { Bell, Bot, ChevronRight, Plus, ShoppingBag } from "lucide-react";
import toast from "react-hot-toast";
import PhoneFrame from "../components/PhoneFrame";
import BalanceCard from "../components/BalanceCard";
import { bridgePaymentsService } from "../services/bridge-payments/bridgePaymentsService";
import { ApiError } from "../services/api/client";
import type {
  BridgePayment,
  BridgePaymentStatus,
} from "../types/bridge-payments";

const HISTORY_LIMIT = 6;

function getPaymentLabel(payment: BridgePayment): string {
  if (payment.purpose) return payment.purpose;
  return "AI Agent Payment";
}

const STATUS_BADGE_STYLES: Record<BridgePaymentStatus, string> = {
  PENDING: "bg-amber-100 text-amber-700",
  SUCCEEDED: "bg-green-100 text-green-700",
  FAILED: "bg-red-100 text-red-700",
};

const STATUS_BADGE_LABELS: Record<BridgePaymentStatus, string> = {
  PENDING: "Pending",
  SUCCEEDED: "Success",
  FAILED: "Failed",
};

function formatDateGroup(dateString: string): string {
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  const isSameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  if (isSameDay(date, today)) return "Today";
  if (isSameDay(date, yesterday)) return "Yesterday";

  return date.toLocaleDateString("en-US", {
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

export default function DashboardPage() {
  const navigate = useNavigate();
  const [payments, setPayments] = useState<BridgePayment[] | null>(null);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const data = await bridgePaymentsService.list();
        setPayments(data.payments.slice(0, HISTORY_LIMIT));
      } catch (err) {
        if (err instanceof ApiError) {
          console.error(err.message);
        }
      } finally {
        setIsLoadingHistory(false);
      }
    };

    loadHistory();
  }, []);

  const groupedPayments = payments ? groupByDate(payments) : null;

  return (
    <PhoneFrame>
      <div className="px-5 pt-4 pb-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
          <button
            type="button"
            className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
          >
            <Bell size={18} className="text-gray-600" />
          </button>
        </div>

        {/* Balance Card */}
        <div className="mb-3">
          <BalanceCard />
        </div>

        {/* Action buttons */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <button
            type="button"
            onClick={() => toast("Top-up coming soon", { icon: "🚧" })}
            className="bg-white rounded-2xl shadow-sm py-3 px-2 flex items-center justify-center gap-1.5 text-sm font-semibold text-gray-900 hover:bg-gray-50 transition-colors"
          >
            <Plus size={16} className="text-violet-600 shrink-0" />
            <span className="truncate">Top Up</span>
          </button>
          <Link
            to="/agent-settings"
            className="bg-white rounded-2xl shadow-sm py-3 px-2 flex items-center justify-center gap-1.5 text-sm font-semibold text-gray-900 hover:bg-gray-50 transition-colors"
          >
            <Bot size={16} className="text-violet-600 shrink-0" />
            <span className="truncate">Agent Settings</span>
          </Link>
        </div>

        {/* History section */}
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-900">History</h2>
          <Link
            to="/ledger"
            className="text-xs text-violet-600 font-medium flex items-center gap-0.5"
          >
            All transactions
            <ChevronRight size={14} />
          </Link>
        </div>

        {isLoadingHistory && (
          <div className="text-sm text-gray-400 text-center py-6">
            Loading...
          </div>
        )}

        {payments && payments.length === 0 && !isLoadingHistory && (
          <div className="text-sm text-gray-400 text-center py-6">
            No transactions yet
          </div>
        )}

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
                          className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                            isFailed
                              ? "bg-red-50"
                              : isPending
                                ? "bg-amber-50"
                                : "bg-violet-50"
                          }`}
                        >
                          <ShoppingBag
                            size={16}
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
                          <div className="flex items-center gap-2 mb-0.5">
                            <div className="text-sm font-medium text-gray-900 truncate">
                              {getPaymentLabel(payment)}
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <div className="text-xs text-gray-400">
                              {new Date(payment.createdAt).toLocaleTimeString(
                                "en-US",
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
                                ? "Rejected"
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
                              "en-US",
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
