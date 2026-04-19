import { useEffect, useState } from "react";
import { Wallet } from "lucide-react";
import { balanceService } from "../services/balance/balanceService";
import { ApiError } from "../services/api/client";
import type { Balance } from "../types/auth";

export default function BalanceCard() {
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
      className="rounded-2xl p-5 text-white relative overflow-hidden"
      style={{ background: "linear-gradient(135deg,#7c3aed 0%,#4f46e5 100%)" }}
    >
      <div className="absolute right-0 top-0 w-40 h-40 bg-white/10 rounded-full translate-x-12 -translate-y-12" />

      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-3">
          <Wallet size={18} className="text-white/80" />
          <span className="text-xs text-white/80 uppercase tracking-wider">
            Баланс
          </span>
        </div>

        {isLoading && (
          <div className="text-2xl font-semibold text-white/60">
            Загрузка...
          </div>
        )}

        {error && !isLoading && (
          <div className="text-sm text-white/80">{error}</div>
        )}

        {balance && !isLoading && !error && (
          <>
            <div className="text-3xl font-bold mb-1">
              {balance.amountKzt.toLocaleString("ru-RU")} ₸
            </div>
            <div className="text-xs text-white/60">KZT</div>
          </>
        )}
      </div>
    </div>
  );
}
