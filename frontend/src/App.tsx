import { Routes, Route, Navigate } from "react-router";
import { useAuth } from "./contexts/AuthContext";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import ProtectedRoute from "./components/ProtectedRoute";
import AgentSettingsPage from "./pages/AgentSettingsPage";
import AgentSessionsPage from "./pages/AgentSessionsPage";
import CreateAgentSessionPage from "./pages/CreateAgentSessionPage";
import AgentSessionCreatedPage from "./pages/AgentSessionCreatedPage";

export default function App() {
  const { isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Загрузка...</p>
      </div>
    );
  }

  // НЕ ЗАБЫТЬ ВЕРНУТЬ PROTECTEDROUTES

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
          // protec
        }
      />
      <Route
        path="/agent-settings"
        element={
          <ProtectedRoute>
            <AgentSettingsPage />
          </ProtectedRoute>
          // protec
        }
      />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
      <Route
        path="/agent-sessions"
        element={
          <ProtectedRoute>
            <AgentSessionsPage />
          </ProtectedRoute>
          //  protec
        }
      />
      <Route path="/agent-sessions/new" element={<CreateAgentSessionPage />} />
      <Route
        path="/agent-sessions/created"
        element={
          <ProtectedRoute>
            <AgentSessionCreatedPage />
          </ProtectedRoute>
          // protec
        }
      />
    </Routes>
  );
}
