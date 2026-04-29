import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { Filter } from "lucide-react";
import PhoneFrame from "../components/PhoneFrame";
import { bridgePaymentsService } from "../services/bridge-payments/bridgePaymentsService";
import { ApiError } from "../services/api/client";
import type {
  BridgePayment,
  BridgePaymentStatus,
} from "../types/bridge-payments";

type TabId = "all" | "succeeded" | "pending" | "failed";

const TABS: { id: TabId; label: string }[] = [
  { id: "all", label: "All" },
  { id: "succeeded", label: "Succeeded" },
  { id: "pending", label: "Pending" },
  { id: "failed", label: "Failed" },
];

const STATUS_LABELS: Record<BridgePaymentStatus, string> = {
  PENDING: "PENDING",
  SUCCEEDED: "SUCCEEDED",
  FAILED: "FAILED",
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
  const [activeTab, setActiveTab] = useState<TabId>("all");

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

  const filteredPayments = useMemo(() => {
    if (!payments) return null;
    if (activeTab === "all") return payments;
    const statusFilter = activeTab.toUpperCase() as BridgePaymentStatus;
    return payments.filter((p) => p.status === statusFilter);
  }, [payments, activeTab]);

  return (
    <PhoneFrame>
      <div className="px-5 pt-4 pb-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h1 className="text-2xl font-semibold text-gray-900">
            Bridge Payments
          </h1>
          <button
            type="button"
            className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
          >
            <Filter size={18} className="text-gray-600" />
          </button>
        </div>

        {/* Tabs */}
        <div className="bg-gray-100 rounded-full p-1 flex mb-5">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-2 rounded-full text-xs font-medium transition-colors ${
                activeTab === tab.id
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500"
              }`}
            >
              {tab.label}
            </button>
          ))}
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
        {filteredPayments && filteredPayments.length === 0 && !isLoading && (
          <div className="text-sm text-gray-400 text-center py-8">
            Нет платежей в этой категории
          </div>
        )}

        {/* Payments list */}
        {filteredPayments && filteredPayments.length > 0 && (
          <div className="flex flex-col gap-3">
            {filteredPayments.map((payment) => (
              <button
                key={payment.id}
                type="button"
                onClick={() => navigate(`/bridge-payments/${payment.id}`)}
                className="bg-white rounded-2xl shadow-sm px-4 py-3.5 text-left hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {/* USDC icon */}
                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                    $
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <div className="text-sm font-medium text-gray-900 truncate">
                        {payment.purpose || payment.sellerUrl}
                      </div>
                      <div
                        className={`text-[10px] px-2 py-0.5 rounded-full font-semibold shrink-0 ${STATUS_STYLES[payment.status]}`}
                      >
                        {STATUS_LABELS[payment.status]}
                      </div>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <div className="text-xs text-gray-400">
                        {new Date(payment.createdAt).toLocaleDateString(
                          "ru-RU",
                        )}{" "}
                        · {payment.network || "—"}
                      </div>
                      {payment.estimatedKztDebit !== null && (
                        <div className="text-sm font-bold text-gray-900 shrink-0">
                          {payment.estimatedKztDebit.toLocaleString("ru-RU")} ₸
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </PhoneFrame>
  );
}
