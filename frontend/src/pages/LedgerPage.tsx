import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, ArrowDownLeft, ArrowUpRight } from "lucide-react";
import PhoneFrame from "../components/PhoneFrame";
import { ledgerService } from "../services/ledger/ledgerService";
import { ApiError } from "../services/api/client";
import type { LedgerEntry } from "../types/ledger";

export default function LedgerPage() {
  const navigate = useNavigate();

  const [entries, setEntries] = useState<LedgerEntry[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    const loadEntries = async () => {
      try {
        const data = await ledgerService.list();
        setEntries(data.entries);
      } catch (err) {
        if (err instanceof ApiError) {
          setLoadError(err.message);
        } else {
          setLoadError("Не удалось загрузить историю");
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadEntries();
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
            История операций
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
                    {isDebit ? (
                      <ArrowUpRight size={18} className="text-red-500" />
                    ) : (
                      <ArrowDownLeft size={18} className="text-green-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900">
                      {isDebit ? "Списание" : "Пополнение"}
                    </div>
                    <div className="text-xs text-gray-400 truncate">
                      {new Date(entry.createdAt).toLocaleString("ru-RU")}
                    </div>
                  </div>
                  <div
                    className={`text-sm font-semibold shrink-0 ${
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
