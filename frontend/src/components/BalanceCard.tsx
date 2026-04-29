import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Plus, History } from "lucide-react";
import { balanceService } from "../services/balance/balanceService";
import { ApiError } from "../services/api/client";
import type { Balance } from "../types/auth";

export default function BalanceCard() {
  const navigate = useNavigate();

  const [balance, setBalance] = useState<Balance | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadBalance = async () => {
      try {
        const data = await balanceService.getBalance();
        setBalance(data);
      } catch (err) {
        if (err instanceof ApiError) {
          setError(err.message);
        } else {
          setError("Не удалось загрузить баланс");
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadBalance();
  }, []);

  return (
    <div
      className="rounded-3xl p-5 text-white relative overflow-hidden"
      style={{
        background:
          "linear-gradient(135deg, #8b5cf6 0%, #6366f1 50%, #3b82f6 100%)",
      }}
    >
      {/* Decorative blobs */}
      <div className="absolute right-0 top-0 w-40 h-40 bg-white/10 rounded-full translate-x-12 -translate-y-12" />
      <div className="absolute right-10 bottom-0 w-32 h-32 bg-white/5 rounded-full translate-y-10" />

      <div className="relative z-10">
        {/* Top row */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-white/80 font-medium">KZT Balance</span>
          <span className="text-[10px] bg-green-400/30 text-green-50 px-2 py-0.5 rounded-full font-medium">
            Available
          </span>
        </div>

        {/* Amount */}
        <div className="mb-4 min-h-[40px]">
          {isLoading && (
            <div className="text-2xl font-semibold text-white/60">
              Загрузка...
            </div>
          )}

          {error && !isLoading && (
            <div className="text-sm text-white/80">{error}</div>
          )}

          {balance && !isLoading && !error && (
            <div className="text-3xl font-bold">
              {balance.amountKzt.toLocaleString("ru-RU")}
              <span className="text-lg font-medium ml-1 text-white/80">₸</span>
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex gap-2">
          <button
            type="button"
            disabled
            className="flex-1 bg-white/20 hover:bg-white/30 disabled:opacity-50 backdrop-blur-sm rounded-xl py-2.5 text-sm font-medium flex items-center justify-center gap-1.5 transition-colors"
          >
            <Plus size={16} />
            Пополнить
          </button>
          <button
            type="button"
            onClick={() => navigate("/ledger")}
            className="flex-1 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl py-2.5 text-sm font-medium flex items-center justify-center gap-1.5 transition-colors"
          >
            <History size={16} />
            История
          </button>
        </div>
      </div>
    </div>
  );
}
