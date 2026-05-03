import { Link, useNavigate } from "react-router";
import {
  Bot,
  Bell,
  ChevronRight,
  Info,
  KeyRound,
  LogOut,
  Shield,
  User as UserIcon,
} from "lucide-react";
import PhoneFrame from "../components/PhoneFrame";
import { useAuth } from "../contexts/AuthContext";
import toast from "react-hot-toast";

const APP_VERSION = "1.0.0";

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <PhoneFrame>
      <div className="px-5 pt-4 pb-8">
        {/* Header */}
        <h1 className="text-2xl font-semibold text-gray-900 mb-5">Settings</h1>

        {/* Profile card (read-only) */}
        <div className="bg-white rounded-2xl shadow-sm p-4 flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-violet-100 rounded-full flex items-center justify-center">
            <UserIcon size={20} className="text-violet-600" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs text-gray-400 mb-0.5">Profile</div>
            <div className="text-sm font-medium text-gray-900 truncate">
              {user?.email}
            </div>
          </div>
        </div>

        {/* Settings list */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-4">
          <Link
            to="/agent-settings"
            className="flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 transition-colors border-b border-gray-100"
          >
            <div className="w-9 h-9 bg-violet-100 rounded-full flex items-center justify-center shrink-0">
              <Bot size={16} className="text-violet-600" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-gray-900">
                Agent Payments
              </div>
              <div className="text-xs text-gray-400 mt-0.5">
                Limits and preferences
              </div>
            </div>
            <ChevronRight size={18} className="text-gray-300 shrink-0" />
          </Link>

          <Link
            to="/agent-sessions"
            className="flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 transition-colors border-b border-gray-100"
          >
            <div className="w-9 h-9 bg-violet-100 rounded-full flex items-center justify-center shrink-0">
              <KeyRound size={16} className="text-violet-600" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-gray-900">Sessions</div>
              <div className="text-xs text-gray-400 mt-0.5">
                Manage agent sessions
              </div>
            </div>
            <ChevronRight size={18} className="text-gray-300 shrink-0" />
          </Link>

          <button
            type="button"
            onClick={() => toast("Coming soon", { icon: "🚧" })}
            className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 transition-colors border-b border-gray-100 text-left"
          >
            <div className="w-9 h-9 bg-violet-100 rounded-full flex items-center justify-center shrink-0">
              <Shield size={16} className="text-violet-600" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-gray-900">Security</div>
              <div className="text-xs text-gray-400 mt-0.5">
                Password & security
              </div>
            </div>
            <ChevronRight size={18} className="text-gray-300 shrink-0" />
          </button>

          <button
            type="button"
            onClick={() => toast("Coming soon", { icon: "🚧" })}
            className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 transition-colors border-b border-gray-100 text-left"
          >
            <div className="w-9 h-9 bg-violet-100 rounded-full flex items-center justify-center shrink-0">
              <Bell size={16} className="text-violet-600" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-gray-900">
                Notifications
              </div>
              <div className="text-xs text-gray-400 mt-0.5">
                Email and push notifications
              </div>
            </div>
            <ChevronRight size={18} className="text-gray-300 shrink-0" />
          </button>

          <div className="flex items-center gap-3 px-4 py-3.5">
            <div className="w-9 h-9 bg-violet-100 rounded-full flex items-center justify-center shrink-0">
              <Info size={16} className="text-violet-600" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-gray-900">About</div>
              <div className="text-xs text-gray-400 mt-0.5">
                Version {APP_VERSION}
              </div>
            </div>
          </div>
        </div>

        {/* Logout */}
        <button
          type="button"
          onClick={handleLogout}
          className="w-full bg-white rounded-2xl shadow-sm py-3.5 flex items-center justify-center gap-2 text-red-600 font-medium text-sm hover:bg-red-50 transition-colors"
        >
          <LogOut size={18} />
          Log Out
        </button>
      </div>
    </PhoneFrame>
  );
}
