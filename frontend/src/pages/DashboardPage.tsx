import { useNavigate } from "react-router";
import { useAuth } from "../contexts/AuthContext";
import PhoneFrame from "../components/PhoneFrame";
import { LogOut, User as UserIcon } from "lucide-react";
import BalanceCard from "../components/BalanceCard";

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <PhoneFrame>
      <div className="px-5 pt-12 pb-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">Главная</h1>
          <button
            onClick={handleLogout}
            className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
          >
            <LogOut size={18} className="text-gray-600" />
          </button>
        </div>

        {/* User profile block */}
        <div className="bg-white rounded-2xl shadow-sm p-4 mb-6 flex items-center gap-3">
          <div className="w-12 h-12 bg-violet-100 rounded-full flex items-center justify-center">
            <UserIcon size={20} className="text-violet-600" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs text-gray-400 mb-0.5">Аккаунт</div>
            <div className="text-sm font-medium text-gray-900 truncate">
              {user?.email}
            </div>
          </div>
        </div>

        {/* Placeholder sections */}
        <div className="space-y-3">
          <BalanceCard />
          <div className="bg-gray-50 rounded-2xl p-5 border border-dashed border-gray-200 text-center">
            <p className="text-sm text-gray-400">Настройки AI-агента — скоро</p>
          </div>
          <div className="bg-gray-50 rounded-2xl p-5 border border-dashed border-gray-200 text-center">
            <p className="text-sm text-gray-400">Agent Sessions — скоро</p>
          </div>
        </div>
      </div>
    </PhoneFrame>
  );
}
