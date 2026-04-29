import { Link } from "react-router";
import { Bell, Bot, Plus } from "lucide-react";
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
        <div className="mb-3">
          <BalanceCard />
        </div>

        {/* Action buttons under card */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <button
            type="button"
            onClick={() => alert("Функция пополнения скоро будет доступна")}
            className="bg-white rounded-2xl shadow-sm py-3 flex items-center justify-center gap-1.5 text-sm font-semibold text-gray-900 hover:bg-gray-50 transition-colors"
          >
            <Plus size={16} className="text-violet-600" />
            Пополнить
          </button>
          <Link
            to="/agent-settings"
            className="bg-white rounded-2xl shadow-sm py-3 flex items-center justify-center gap-1.5 text-sm font-semibold text-gray-900 hover:bg-gray-50 transition-colors"
          >
            <Bot size={16} className="text-violet-600" />
            Agent Settings
          </Link>
        </div>
      </div>
    </PhoneFrame>
  );
}
