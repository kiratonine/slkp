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
import AgentSessionDetailPage from "./pages/AgentSessionDetailPage";
import LedgerPage from "./pages/LedgerPage";
import BridgePaymentsPage from "./pages/BridgePaymentsPage";
import BridgePaymentDetailPage from "./pages/BridgePaymentDetailPage";

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
      <Route
        path="/agent-sessions/:id"
        element={
          <ProtectedRoute>
            <AgentSessionDetailPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/ledger"
        element={
          <ProtectedRoute>
            <LedgerPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/bridge-payments"
        element={
          <ProtectedRoute>
            <BridgePaymentsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/bridge-payments/:id"
        element={
          <ProtectedRoute>
            <BridgePaymentDetailPage />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
