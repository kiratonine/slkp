import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { ArrowLeft } from "lucide-react";
import PhoneFrame from "../components/PhoneFrame";
import { agentSessionsService } from "../services/agent-sessions/agentSessionsService";
import { ApiError } from "../services/api/client";
import type { AgentSession } from "../types/agent-sessions";
import RevokeSessionModal from "../components/RevokeSessionModal";

type DisplayStatus = "active" | "revoked" | "expired";

const STATUS_LABELS: Record<DisplayStatus, string> = {
  active: "ACTIVE",
  revoked: "REVOKED",
  expired: "EXPIRED",
};

const STATUS_STYLES: Record<DisplayStatus, string> = {
  active: "bg-green-100 text-green-700",
  revoked: "bg-gray-100 text-gray-500",
  expired: "bg-amber-100 text-amber-700",
};

function getDisplayStatus(session: AgentSession): DisplayStatus {
  if (session.status === "REVOKED") return "revoked";
  if (new Date(session.expiresAt) < new Date()) return "expired";
  return "active";
}

export default function AgentSessionDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [session, setSession] = useState<AgentSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isRevoking, setIsRevoking] = useState(false);
  const [showRevokeModal, setShowRevokeModal] = useState(false);

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

  const handleRevoke = async () => {
    if (!session) return;

    setIsRevoking(true);

    try {
      const response = await agentSessionsService.revoke(session.id);
      setSession(response.session);
      setShowRevokeModal(false);
    } catch (err) {
      if (err instanceof ApiError) {
        setLoadError(err.message);
      } else {
        setLoadError("Не удалось отозвать сессию");
      }
    } finally {
      setIsRevoking(false);
    }
  };

  const status = session ? getDisplayStatus(session) : null;
  const expiresDate = session ? new Date(session.expiresAt) : null;
  const daysLeft = expiresDate
    ? Math.ceil(
        (expiresDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24),
      )
    : 0;

  return (
    <PhoneFrame>
      <div className="px-5 pt-4 pb-8 flex flex-col" style={{ minHeight: 720 }}>
        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <button
            type="button"
            onClick={() => navigate("/agent-sessions")}
            className="text-gray-500"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-lg font-semibold text-gray-900 flex-1 truncate">
            {session?.name || "Сессия"}
          </h1>
          {status && (
            <div
              className={`text-[10px] px-2 py-0.5 rounded-full font-semibold shrink-0 ${STATUS_STYLES[status]}`}
            >
              {STATUS_LABELS[status]}
            </div>
          )}
        </div>

        {isLoading && (
          <div className="text-sm text-gray-400 text-center py-8">
            Загрузка...
          </div>
        )}

        {loadError && !isLoading && (
          <div className="text-sm text-red-500 bg-red-50 rounded-xl px-4 py-3">
            {loadError}
          </div>
        )}

        {session && !isLoading && !loadError && (
          <>
            {/* Details card */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-4">
              <div className="px-4 py-3 border-b border-gray-100">
                <div className="text-xs text-gray-500 mb-1">Session ID</div>
                <div className="text-xs font-mono text-gray-900 break-all">
                  {session.id}
                </div>
              </div>

              <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <div className="text-xs text-gray-500 mb-0.5">Created At</div>
                  <div className="text-sm text-gray-900">
                    {new Date(session.createdAt).toLocaleString("ru-RU")}
                  </div>
                </div>
              </div>

              <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-xs text-gray-500 mb-0.5">Expires At</div>
                  <div className="text-sm text-gray-900">
                    {new Date(session.expiresAt).toLocaleString("ru-RU")}
                  </div>
                </div>
                {status === "active" && (
                  <div className="text-[10px] bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full font-semibold shrink-0">
                    {daysLeft} days left
                  </div>
                )}
              </div>

              {session.revokedAt && (
                <div className="px-4 py-3 border-b border-gray-100">
                  <div className="text-xs text-gray-500 mb-0.5">Revoked At</div>
                  <div className="text-sm text-gray-900">
                    {new Date(session.revokedAt).toLocaleString("ru-RU")}
                  </div>
                </div>
              )}

              <div className="px-4 py-3">
                <div className="text-xs text-gray-500 mb-0.5">Permissions</div>
                <div className="text-sm text-gray-900">Pay within limits</div>
              </div>
            </div>

            {/* Spacer */}
            <div className="flex-1" />

            {/* Revoke button (only if active) */}
            {status === "active" && (
              <button
                type="button"
                onClick={() => setShowRevokeModal(true)}
                className="w-full bg-white border border-red-200 text-red-600 rounded-2xl py-3.5 font-semibold text-sm hover:bg-red-50 transition-colors"
              >
                Revoke Session
              </button>
            )}
          </>
        )}
      </div>

      {/* Revoke modal */}
      {showRevokeModal && session && (
        <RevokeSessionModal
          isLoading={isRevoking}
          onCancel={() => setShowRevokeModal(false)}
          onConfirm={handleRevoke}
        />
      )}
    </PhoneFrame>
  );
}
