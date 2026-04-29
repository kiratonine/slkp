import { Link } from "react-router";
import { Bell, ChevronRight, KeyRound, Receipt, Bot } from "lucide-react";
import PhoneFrame from "../components/PhoneFrame";
import BalanceCard from "../components/BalanceCard";

export default function DashboardPage() {
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
        <div className="mb-4">
          <BalanceCard />
        </div>

        {/* Agent Payments preview card */}
        <Link
          to="/agent-settings"
          className="bg-white rounded-2xl shadow-sm px-4 py-4 flex items-center gap-3 mb-4 hover:bg-gray-50 transition-colors"
        >
          <div className="w-10 h-10 bg-violet-100 rounded-full flex items-center justify-center shrink-0">
            <Bot size={18} className="text-violet-600" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-gray-900">
              Agent Payments
            </div>
            <div className="text-xs text-gray-400 mt-0.5">
              Лимиты и подтверждения
            </div>
          </div>
          <ChevronRight size={18} className="text-gray-300" />
        </Link>

        {/* Quick Actions */}
        <div>
          <div className="text-xs text-gray-400 uppercase tracking-wider mb-2 px-1">
            Quick Actions
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Link
              to="/agent-sessions/new"
              className="bg-white rounded-2xl shadow-sm p-4 flex flex-col gap-2 hover:bg-gray-50 transition-colors"
            >
              <div className="w-10 h-10 bg-violet-100 rounded-full flex items-center justify-center">
                <KeyRound size={18} className="text-violet-600" />
              </div>
              <div>
                <div className="text-sm font-medium text-gray-900">
                  New Session
                </div>
                <div className="text-xs text-gray-400 mt-0.5">Создать ключ</div>
              </div>
            </Link>

            <Link
              to="/bridge-payments"
              className="bg-white rounded-2xl shadow-sm p-4 flex flex-col gap-2 hover:bg-gray-50 transition-colors"
            >
              <div className="w-10 h-10 bg-violet-100 rounded-full flex items-center justify-center">
                <Receipt size={18} className="text-violet-600" />
              </div>
              <div>
                <div className="text-sm font-medium text-gray-900">
                  Payments
                </div>
                <div className="text-xs text-gray-400 mt-0.5">
                  История покупок
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </PhoneFrame>
  );
}
