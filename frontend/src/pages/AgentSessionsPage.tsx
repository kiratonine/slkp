import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router";
import { Plus, KeyRound } from "lucide-react";
import PhoneFrame from "../components/PhoneFrame";
import { agentSessionsService } from "../services/agent-sessions/agentSessionsService";
import { ApiError } from "../services/api/client";
import type { AgentSession } from "../types/agent-sessions";

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

const TABS: { id: DisplayStatus; label: string }[] = [
  { id: "active", label: "Active" },
  { id: "revoked", label: "Revoked" },
  { id: "expired", label: "Expired" },
];

function getDisplayStatus(session: AgentSession): DisplayStatus {
  if (session.status === "REVOKED") return "revoked";
  if (new Date(session.expiresAt) < new Date()) return "expired";
  return "active";
}

export default function AgentSessionsPage() {
  const navigate = useNavigate();

  const [sessions, setSessions] = useState<AgentSession[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<DisplayStatus>("active");

  useEffect(() => {
    const loadSessions = async () => {
      try {
        const data = await agentSessionsService.list();
        setSessions(data.sessions);
      } catch (err) {
        if (err instanceof ApiError) {
          setLoadError(err.message);
        } else {
          setLoadError("Failed to load sessions");
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadSessions();
  }, []);

  const filteredSessions = useMemo(() => {
    if (!sessions) return null;
    return sessions.filter((s) => getDisplayStatus(s) === activeTab);
  }, [sessions, activeTab]);

  return (
    <PhoneFrame>
      <div className="px-5 pt-4 pb-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h1 className="text-2xl font-semibold text-gray-900">
            Agent Sessions
          </h1>
          <button
            type="button"
            onClick={() => navigate("/agent-sessions/new")}
            className="w-10 h-10 bg-violet-600 hover:bg-violet-700 rounded-full flex items-center justify-center transition-colors"
          >
            <Plus size={20} className="text-white" />
          </button>
        </div>

        {/* Tabs */}
        <div className="bg-gray-100 rounded-full p-1 flex mb-5">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-2 rounded-full text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="text-sm text-gray-400 text-center py-8">
            Loading...
          </div>
        )}

        {/* Error */}
        {loadError && !isLoading && (
          <div className="text-sm text-red-500 bg-red-50 rounded-xl px-4 py-3">
            {loadError}
          </div>
        )}

        {/* Empty state */}
        {filteredSessions && filteredSessions.length === 0 && !isLoading && (
          <div className="text-sm text-gray-400 text-center py-8">
            No sessions in this category
          </div>
        )}

        {/* Sessions list */}
        {filteredSessions && filteredSessions.length > 0 && (
          <div className="flex flex-col gap-3">
            {filteredSessions.map((session) => {
              const status = getDisplayStatus(session);
              const expiresDate = new Date(session.expiresAt);
              const now = new Date();
              const daysLeft = Math.ceil(
                (expiresDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
              );

              return (
                <button
                  key={session.id}
                  type="button"
                  onClick={() => navigate(`/agent-sessions/${session.id}`)}
                  className="bg-white rounded-2xl shadow-sm px-4 py-4 flex items-center gap-3 text-left hover:bg-gray-50 transition-colors"
                >
                  <div className="w-11 h-11 bg-violet-100 rounded-full flex items-center justify-center shrink-0">
                    <KeyRound size={18} className="text-violet-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-0.5">
                      <div className="text-sm font-medium text-gray-900 truncate">
                        {session.name}
                      </div>
                      <div
                        className={`text-[10px] px-2 py-0.5 rounded-full font-semibold shrink-0 ${STATUS_STYLES[status]}`}
                      >
                        {STATUS_LABELS[status]}
                      </div>
                    </div>
                    <div className="text-xs text-gray-400 truncate">
                      {session.id.slice(0, 12)}...
                    </div>
                    <div className="flex items-center justify-between mt-1.5">
                      <div className="text-xs text-gray-400">
                        {status === "expired"
                          ? `Expired on ${expiresDate.toLocaleDateString("en-US")}`
                          : `Expires ${expiresDate.toLocaleDateString("en-US")}`}
                      </div>
                      {status === "active" && (
                        <div className="text-xs text-gray-500 font-medium">
                          {daysLeft} days left
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </PhoneFrame>
  );
}
