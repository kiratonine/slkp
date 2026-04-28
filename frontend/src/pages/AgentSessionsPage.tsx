import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, Plus } from "lucide-react";
import PhoneFrame from "../components/PhoneFrame";
import { agentSessionsService } from "../services/agent-sessions/agentSessionsService";
import { ApiError } from "../services/api/client";
import type { AgentSession } from "../types/agent-sessions";

export default function AgentSessionsPage() {
  const navigate = useNavigate();

  const [sessions, setSessions] = useState<AgentSession[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  useEffect(() => {
    const loadSessions = async () => {
      try {
        const data = await agentSessionsService.list();
        setSessions(data.sessions);
      } catch (err) {
        if (err instanceof ApiError) {
          setLoadError(err.message);
        } else {
          setLoadError("Не удалось загрузить сессии");
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadSessions();
  }, []);

  const handleRevoke = async (sessionId: string) => {
    setConfirmingId(null);
    setRevokingId(sessionId);

    try {
      const response = await agentSessionsService.revoke(sessionId);
      setSessions((prev) =>
        prev
          ? prev.map((s) => (s.id === sessionId ? response.session : s))
          : prev,
      );
    } catch (err) {
      if (err instanceof ApiError) {
        setLoadError(err.message);
      } else {
        setLoadError("Не удалось отозвать сессию");
      }
    } finally {
      setRevokingId(null);
    }
  };

  return (
    <PhoneFrame>
      <div className="px-5 pt-4 pb-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate("/dashboard")}
            className="text-gray-500"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-lg font-semibold text-gray-900">
            Сессии AI-агента
          </h1>
        </div>

        {/* Create button */}
        <button
          onClick={() => navigate("/agent-sessions/new")}
          className="w-full bg-violet-600 text-white rounded-2xl py-4 font-semibold text-sm hover:bg-violet-700 transition-colors mb-4 flex items-center justify-center gap-2"
        >
          <Plus size={18} />
          Создать сессию
        </button>

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

        {/* Empty state */}
        {sessions && sessions.length === 0 && !isLoading && (
          <div className="text-sm text-gray-400 text-center py-8">
            У вас пока нет сессий
          </div>
        )}

        {/* Sessions list */}
        {sessions && sessions.length > 0 && (
          <div className="flex flex-col gap-3">
            {sessions.map((session) => (
              <div
                key={session.id}
                className="bg-white rounded-2xl shadow-sm px-4 py-4"
              >
                <div className="flex items-center justify-between mb-2">
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
                <div className="text-xs text-gray-400">
                  Создана:{" "}
                  {new Date(session.createdAt).toLocaleDateString("ru-RU")}
                </div>
                <div className="text-xs text-gray-400">
                  Истекает:{" "}
                  {new Date(session.expiresAt).toLocaleDateString("ru-RU")}
                </div>

                {session.status === "ACTIVE" && confirmingId !== session.id && (
                  <button
                    type="button"
                    onClick={() => setConfirmingId(session.id)}
                    disabled={revokingId === session.id}
                    className="mt-3 w-full bg-red-50 disabled:bg-gray-100 disabled:text-gray-400 text-red-600 rounded-xl py-2 font-medium text-sm transition-colors"
                  >
                    {revokingId === session.id ? "Отзываем..." : "Отозвать"}
                  </button>
                )}

                {session.status === "ACTIVE" && confirmingId === session.id && (
                  <div className="mt-3">
                    <div className="text-xs text-gray-500 text-center mb-2">
                      Отозвать сессию? Это нельзя отменить.
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setConfirmingId(null)}
                        className="flex-1 bg-gray-100 text-gray-700 rounded-xl py-2 font-medium text-sm"
                      >
                        Отмена
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRevoke(session.id)}
                        className="flex-1 bg-red-500 text-white rounded-xl py-2 font-medium text-sm"
                      >
                        Подтвердить
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </PhoneFrame>
  );
}
