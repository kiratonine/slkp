import { useEffect, useState } from "react";
import {
  Filter,
  ArrowDownLeft,
  ArrowUpRight,
  CreditCard,
  ShoppingBag,
} from "lucide-react";
import PhoneFrame from "../components/PhoneFrame";
import { ledgerService } from "../services/ledger/ledgerService";
import { balanceService } from "../services/balance/balanceService";
import { ApiError } from "../services/api/client";
import type { LedgerEntry } from "../types/ledger";
import type { Balance } from "../types/auth";

function getEntryIcon(type: string) {
  if (type === "DEBIT") return ShoppingBag;
  if (type === "CREDIT") return CreditCard;
  return ArrowDownLeft;
}

function getEntryLabel(type: string) {
  if (type === "DEBIT") return "Списание";
  if (type === "CREDIT") return "Пополнение";
  return type;
}

export default function LedgerPage() {
  const [entries, setEntries] = useState<LedgerEntry[] | null>(null);
  const [balance, setBalance] = useState<Balance | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [ledgerData, balanceData] = await Promise.all([
          ledgerService.list(),
          balanceService.getBalance(),
        ]);
        setEntries(ledgerData.entries);
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
        {isLoading && !entries && (
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
        {entries && entries.length === 0 && !isLoading && (
          <div className="text-sm text-gray-400 text-center py-8">
            Операций пока нет
          </div>
        )}

        {/* Entries list */}
        {entries && entries.length > 0 && (
          <div className="flex flex-col gap-2">
            {entries.map((entry) => {
              const isDebit = entry.type === "DEBIT";
              const Icon = getEntryIcon(entry.type);

              return (
                <div
                  key={entry.id}
                  className="bg-white rounded-2xl shadow-sm px-4 py-3 flex items-center gap-3"
                >
                  <div
                    className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 ${
                      isDebit ? "bg-red-50" : "bg-green-50"
                    }`}
                  >
                    {isDebit ? (
                      <Icon size={18} className="text-red-500" />
                    ) : (
                      <Icon size={18} className="text-green-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">
                      {getEntryLabel(entry.type)}
                    </div>
                    <div className="text-xs text-gray-400 truncate">
                      {new Date(entry.createdAt).toLocaleString("ru-RU")}
                    </div>
                  </div>
                  <div
                    className={`text-sm font-bold shrink-0 ${
                      isDebit ? "text-red-500" : "text-green-600"
                    }`}
                  >
                    {isDebit ? "-" : "+"}
                    {entry.amountKzt.toLocaleString("ru-RU")} ₸
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </PhoneFrame>
  );
}
