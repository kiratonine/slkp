import { ChevronRight, Bot, Zap, Shield, ArrowRight } from "lucide-react";
import { Screen, AgentState } from "../types";

interface Props {
  onNavigate: (s: Screen) => void;
  agent: AgentState;
  onToggle: () => void;
}

export default function AIAgentPage({ onNavigate, agent, onToggle }: Props) {
  return (
    <div className="pb-8">
      {/* Header */}
      <div className="px-5 pt-2 pb-4 flex items-center gap-3">
        <button
          onClick={() => onNavigate("card")}
          className="text-gray-500 text-xl"
        >
          ←
        </button>
        <h1 className="text-lg font-semibold text-gray-900">AI Агент</h1>
      </div>

      {/* Hero banner */}
      <div
        className="mx-5 mb-5 rounded-2xl p-5 text-white relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg,#7c3aed 0%,#4f46e5 100%)",
        }}
      >
        <div className="absolute right-0 top-0 w-40 h-40 bg-white/10 rounded-full translate-x-12 -translate-y-12" />
        <div className="relative z-10">
          <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mb-3">
            <Bot size={24} className="text-white" />
          </div>
          <div className="text-base font-semibold mb-1">
            Разрешение тратить деньги
          </div>
          <div className="text-sm text-violet-200">
            AI Агент может самостоятельно оплачивать API-ключи и сервисы
          </div>
        </div>
      </div>

      {/* Toggle */}
      <div className="mx-5 mb-4 bg-white rounded-2xl shadow-sm px-4 py-4 flex items-center justify-between">
        <div>
          <div className="text-sm font-medium text-gray-900">
            Разрешить AI Агенту тратить
          </div>
          <div className="text-xs text-gray-400 mt-0.5">
            {agent.enabled ? "Активно" : "Выключено"}
          </div>
        </div>
        <button
          onClick={onToggle}
          className={`relative w-12 h-6 rounded-full transition-colors ${agent.enabled ? "bg-violet-500" : "bg-gray-200"}`}
        >
          <span
            className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${agent.enabled ? "translate-x-0.5" : "-translate-x-5.5"}`}
          />
        </button>
      </div>

      {agent.enabled && (
        <>
          {/* Setup steps */}
          <div className="px-5 mb-1 text-xs text-gray-400 uppercase tracking-wider font-semibold">
            Настройка
          </div>
          <div className="mx-5 bg-white rounded-2xl shadow-sm divide-y divide-gray-100 mb-4">
            <button
              onClick={() => onNavigate("set-limit")}
              className="w-full flex items-center justify-between px-4 py-4 hover:bg-gray-50"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-amber-100 rounded-full flex items-center justify-center">
                  <Shield size={17} className="text-amber-600" />
                </div>
                <div className="text-left">
                  <div className="text-sm font-medium text-gray-900">
                    Лимит в день
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5">
                    {agent.dailyLimit > 0
                      ? `${agent.dailyLimit.toLocaleString()} ₸`
                      : "Не установлен"}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {agent.dailyLimit > 0 && (
                  <span className="w-2 h-2 bg-emerald-400 rounded-full" />
                )}
                <ChevronRight size={16} className="text-gray-300" />
              </div>
            </button>

            <button
              onClick={() => onNavigate("link-agent")}
              className="w-full flex items-center justify-between px-4 py-4 hover:bg-gray-50"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-sky-100 rounded-full flex items-center justify-center">
                  <Zap size={17} className="text-sky-600" />
                </div>
                <div className="text-left">
                  <div className="text-sm font-medium text-gray-900">
                    Связать AI Агента
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5">
                    {agent.linked ? agent.agentName : "Не привязан"}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {agent.linked && (
                  <span className="w-2 h-2 bg-emerald-400 rounded-full" />
                )}
                <ChevronRight size={16} className="text-gray-300" />
              </div>
            </button>
          </div>

          {/* Simulate payment button */}
          {agent.linked && agent.dailyLimit > 0 && (
            <div className="mx-5 mt-2">
              <button
                onClick={() => onNavigate("payment-confirm")}
                className="w-full bg-violet-600 text-white rounded-2xl py-4 flex items-center justify-center gap-2 font-medium text-sm hover:bg-violet-700 active:bg-violet-800 transition-colors"
              >
                <Bot size={18} />
                Симулировать оплату агентом
                <ArrowRight size={18} />
              </button>
              <p className="text-center text-xs text-gray-400 mt-2">
                Для демонстрации потока оплаты
              </p>
            </div>
          )}

          {/* Stats */}
          {agent.linked && (
            <div className="mx-5 mt-4 grid grid-cols-2 gap-3">
              <div className="bg-white rounded-2xl p-4 shadow-sm">
                <div className="text-xs text-gray-400 mb-1">
                  Потрачено сегодня
                </div>
                <div className="text-lg font-bold text-gray-900">
                  {agent.spentToday.toLocaleString()} ₸
                </div>
                <div className="text-xs text-gray-400">
                  из {agent.dailyLimit.toLocaleString()} ₸
                </div>
                <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-violet-500 rounded-full transition-all"
                    style={{
                      width: `${Math.min((agent.spentToday / agent.dailyLimit) * 100, 100)}%`,
                    }}
                  />
                </div>
              </div>
              <div className="bg-white rounded-2xl p-4 shadow-sm">
                <div className="text-xs text-gray-400 mb-1">Доступно</div>
                <div className="text-lg font-bold text-emerald-600">
                  {Math.max(
                    agent.dailyLimit - agent.spentToday,
                    0,
                  ).toLocaleString()}{" "}
                  ₸
                </div>
                <div className="text-xs text-gray-400">на сегодня</div>
              </div>
            </div>
          )}
        </>
      )}

      {!agent.enabled && (
        <div className="mx-5 mt-4 bg-gray-50 rounded-2xl p-5 text-center">
          <Bot size={32} className="text-gray-300 mx-auto mb-2" />
          <p className="text-sm text-gray-400">
            Включите разрешение чтобы AI Агент мог автоматически оплачивать
            сервисы
          </p>
        </div>
      )}
    </div>
  );
}
