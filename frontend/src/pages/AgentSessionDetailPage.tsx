import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { ArrowLeft } from "lucide-react";
import PhoneFrame from "../components/PhoneFrame";
import { agentSessionsService } from "../services/agent-sessions/agentSessionsService";
import { ApiError } from "../services/api/client";
import type { AgentSession } from "../types/agent-sessions";

export default function AgentSessionDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [session, setSession] = useState<AgentSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const loadSession = async () => {
      try {
        const data = await agentSessionsService.getById(id);
        setSession(data.session);
      } catch (err) {
        if (err instanceof ApiError) {
          setLoadError(err.message);
        } else {
          setLoadError("Не удалось загрузить сессию");
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadSession();
  }, [id]);

  return (
    <PhoneFrame>
      <div className="px-5 pt-4 pb-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate("/agent-sessions")}
            className="text-gray-500"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-lg font-semibold text-gray-900">Сессия</h1>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="text-sm text-gray-400 text-center py-8">
            Загрузка...
          </div>
        )}

        {/* Error */}
        {loadError && !isLoading && (
          <div className="text-sm text-red-500 bg-red-50 rounded-xl px-4 py-3">
            {loadError}
          </div>
        )}

        {/* Session details */}
        {session && !isLoading && !loadError && (
          <div className="flex flex-col gap-3">
            {/* Name & status */}
            <div className="bg-white rounded-2xl shadow-sm px-4 py-4">
              <div className="flex items-center justify-between mb-1">
                <div className="text-sm font-medium text-gray-900">
                  {session.name}
                </div>
                <div
                  className={`text-xs px-2 py-0.5 rounded-full ${
                    session.status === "ACTIVE"
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {session.status === "ACTIVE" ? "Активна" : "Отозвана"}
                </div>
              </div>
            </div>

            {/* ID */}
            <div className="bg-white rounded-2xl shadow-sm px-4 py-4">
              <div className="text-xs text-gray-500 mb-1">ID</div>
              <div className="text-xs font-mono text-gray-900 break-all select-all">
                {session.id}
              </div>
            </div>

            {/* Created */}
            <div className="bg-white rounded-2xl shadow-sm px-4 py-4">
              <div className="text-xs text-gray-500 mb-1">Создана</div>
              <div className="text-sm text-gray-900">
                {new Date(session.createdAt).toLocaleString("ru-RU")}
              </div>
            </div>

            {/* Expires */}
            <div className="bg-white rounded-2xl shadow-sm px-4 py-4">
              <div className="text-xs text-gray-500 mb-1">Истекает</div>
              <div className="text-sm text-gray-900">
                {new Date(session.expiresAt).toLocaleString("ru-RU")}
              </div>
            </div>

            {/* Revoked (only if revoked) */}
            {session.revokedAt && (
              <div className="bg-white rounded-2xl shadow-sm px-4 py-4">
                <div className="text-xs text-gray-500 mb-1">Отозвана</div>
                <div className="text-sm text-gray-900">
                  {new Date(session.revokedAt).toLocaleString("ru-RU")}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </PhoneFrame>
  );
}
