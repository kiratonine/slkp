import { Routes, Route, Navigate } from "react-router";
import { useAuth } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import SplashPage from "./pages/SplashPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import AgentSettingsPage from "./pages/AgentSettingsPage";
import AgentSessionsPage from "./pages/AgentSessionsPage";
import CreateAgentSessionPage from "./pages/CreateAgentSessionPage";
import AgentSessionCreatedPage from "./pages/AgentSessionCreatedPage";
import AgentSessionDetailPage from "./pages/AgentSessionDetailPage";
import BridgePaymentsPage from "./pages/BridgePaymentsPage";
import BridgePaymentDetailPage from "./pages/BridgePaymentDetailPage";
import LedgerPage from "./pages/LedgerPage";
import SettingsPage from "./pages/SettingsPage";

export default function App() {
  const { isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Загрузка...</p>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<SplashPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Protected routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/agent-settings"
        element={
          <ProtectedRoute>
            <AgentSettingsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/agent-sessions"
        element={
          <ProtectedRoute>
            <AgentSessionsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/agent-sessions/new"
        element={
          <ProtectedRoute>
            <CreateAgentSessionPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/agent-sessions/created"
        element={
          <ProtectedRoute>
            <AgentSessionCreatedPage />
          </ProtectedRoute>
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
      <Route
        path="/ledger"
        element={
          <ProtectedRoute>
            <LedgerPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <SettingsPage />
          </ProtectedRoute>
        }
      />

      {/* Catch-all: redirect unknown URLs to splash */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
