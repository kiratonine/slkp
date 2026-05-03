import { NavLink } from "react-router";
import { Home, Key, Settings as SettingsIcon } from "lucide-react";

const NAV_ITEMS = [
  { to: "/dashboard", icon: Home, label: "Home" },
  { to: "/agent-sessions", icon: Key, label: "Sessions" },
  { to: "/settings", icon: SettingsIcon, label: "Settings" },
] as const;

export default function BottomNav() {
  return (
    <nav className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-2 py-2">
      <div className="flex items-center justify-around">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 px-3 py-1 rounded-lg transition-colors ${
                  isActive ? "text-violet-600" : "text-gray-400"
                }`
              }
            >
              <Icon size={20} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
