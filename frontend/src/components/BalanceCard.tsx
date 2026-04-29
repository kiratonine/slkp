import { useEffect, useState } from "react";
import { balanceService } from "../services/balance/balanceService";
import { ApiError } from "../services/api/client";
import type { Balance } from "../types/auth";

const FAKE_CARD_NUMBER = "8177";
const FAKE_CARD_EXPIRY = "06/29";

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
      className="rounded-3xl p-5 text-white relative overflow-hidden aspect-[1.6/1] max-h-[240px]"
      style={{
        background:
          "linear-gradient(135deg, #8b5cf6 0%, #6366f1 50%, #3b82f6 100%)",
      }}
    >
      {/* Decorative blobs */}
      <div className="absolute right-0 top-0 w-44 h-44 bg-white/10 rounded-full translate-x-12 -translate-y-12" />
      <div className="absolute right-10 bottom-0 w-32 h-32 bg-white/5 rounded-full translate-y-10" />

      <div className="relative z-10 h-full">
        {/* Top: brand + label */}
        <div className="flex items-start justify-between">
          <div>
            <div className="text-xs text-white/80 font-medium mb-1">
              KZT Balance
            </div>
            <div className="text-[10px] bg-green-400/30 text-green-50 px-2 py-0.5 rounded-full font-medium inline-block">
              Available
            </div>
          </div>
          <div className="text-2xl font-bold tracking-tight">silk.</div>
        </div>

        {/* Middle: amount (absolutely centered) */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {isLoading && (
            <div className="text-2xl font-semibold text-white/60">
              Загрузка...
            </div>
          )}

          {error && !isLoading && (
            <div className="text-sm text-white/80">{error}</div>
          )}

          {balance && !isLoading && !error && (
            <div className="text-4xl font-bold tracking-tight">
              {balance.amountKzt.toLocaleString("ru-RU")}
              <span className="text-2xl font-medium ml-2 text-white/80">₸</span>
            </div>
          )}
        </div>

        {/* Bottom: card number + expiry */}
        <div className="absolute bottom-0 left-0 right-0 flex items-end justify-between">
          <div className="flex items-center gap-1.5">
            <div className="flex">
              <div className="w-6 h-6 rounded-full bg-red-500/90" />
              <div className="w-6 h-6 rounded-full bg-amber-400/90 -ml-3" />
            </div>
            <span className="text-sm font-mono tracking-wider text-white/90 ml-1">
              •••• {FAKE_CARD_NUMBER}
            </span>
          </div>
          <div className="text-sm font-mono text-white/80">
            {FAKE_CARD_EXPIRY}
          </div>
        </div>
      </div>
    </div>
  );
}
