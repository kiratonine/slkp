import { useEffect, useState } from "react";
import { Link } from "react-router";
import {
  Bell,
  Bot,
  ChevronRight,
  Plus,
  ShoppingBag,
  CreditCard,
  ArrowDownLeft,
} from "lucide-react";
import PhoneFrame from "../components/PhoneFrame";
import BalanceCard from "../components/BalanceCard";
import { ledgerService } from "../services/ledger/ledgerService";
import { ApiError } from "../services/api/client";
import type { LedgerEntry } from "../types/ledger";

const HISTORY_LIMIT = 6;

function getEntryIcon(type: string) {
  if (type === "DEBIT") return ShoppingBag;
  if (type === "CREDIT") return CreditCard;
  return ArrowDownLeft;
}

function getEntryLabel(type: string) {
  if (type === "DEBIT") return "Оплата AI агентом";
  if (type === "CREDIT") return "Пополнение";
  return type;
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

function groupByDate(entries: LedgerEntry[]): Map<string, LedgerEntry[]> {
  const groups = new Map<string, LedgerEntry[]>();

  for (const entry of entries) {
    const groupKey = formatDateGroup(entry.createdAt);
    const existing = groups.get(groupKey);
    if (existing) {
      existing.push(entry);
    } else {
      groups.set(groupKey, [entry]);
    }
  }

  return groups;
}

export default function DashboardPage() {
  const [entries, setEntries] = useState<LedgerEntry[] | null>(null);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const data = await ledgerService.list();
        setEntries(data.entries.slice(0, HISTORY_LIMIT));
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

  const groupedEntries = entries ? groupByDate(entries) : null;

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
            onClick={() => alert("Функция пополнения скоро будет доступна")}
            className="bg-white rounded-2xl shadow-sm py-3 px-2 flex items-center justify-center gap-1.5 text-sm font-semibold text-gray-900 hover:bg-gray-50 transition-colors"
          >
            <Plus size={16} className="text-violet-600 shrink-0" />
            <span className="truncate">Пополнить</span>
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
          <h2 className="text-base font-semibold text-gray-900">История</h2>
          <Link
            to="/ledger"
            className="text-xs text-violet-600 font-medium flex items-center gap-0.5"
          >
            Все операции
            <ChevronRight size={14} />
          </Link>
        </div>

        {isLoadingHistory && (
          <div className="text-sm text-gray-400 text-center py-6">
            Загрузка...
          </div>
        )}

        {entries && entries.length === 0 && !isLoadingHistory && (
          <div className="text-sm text-gray-400 text-center py-6">
            Операций пока нет
          </div>
        )}

        {groupedEntries && entries && entries.length > 0 && (
          <div className="flex flex-col gap-3">
            {Array.from(groupedEntries.entries()).map(([dateLabel, items]) => (
              <div key={dateLabel}>
                <div className="text-xs text-gray-400 uppercase tracking-wider mb-2 px-1">
                  {dateLabel}
                </div>
                <div className="flex flex-col gap-2">
                  {items.map((entry) => {
                    const isDebit = entry.type === "DEBIT";
                    const Icon = getEntryIcon(entry.type);

                    return (
                      <div
                        key={entry.id}
                        className="bg-white rounded-2xl shadow-sm px-4 py-3 flex items-center gap-3"
                      >
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                            isDebit ? "bg-red-50" : "bg-green-50"
                          }`}
                        >
                          <Icon
                            size={16}
                            className={
                              isDebit ? "text-red-500" : "text-green-600"
                            }
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-gray-900 truncate">
                            {getEntryLabel(entry.type)}
                          </div>
                          <div className="text-xs text-gray-400">
                            {new Date(entry.createdAt).toLocaleTimeString(
                              "ru-RU",
                              { hour: "2-digit", minute: "2-digit" },
                            )}
                          </div>
                        </div>
                        <div
                          className={`text-sm font-bold shrink-0 ${
                            isDebit ? "text-red-500" : "text-green-600"
                          }`}
                        >
                          {!isDebit && "+"}
                          {entry.amountKzt.toLocaleString("ru-RU")} ₸
                        </div>
                      </div>
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
