import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { ArrowLeft, Copy, Check, AlertTriangle } from "lucide-react";
import PhoneFrame from "../components/PhoneFrame";
import type { AgentSession } from "../types/agent-sessions";
import { useBackNavigation } from "../hooks/useBackNavigation";

type LocationState = {
  session: AgentSession;
  sessionToken: string;
};

export default function AgentSessionCreatedPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const goBack = useBackNavigation("/agent-sessions");

  const state = location.state as LocationState | null;

  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (!state) {
      navigate("/agent-sessions", { replace: true });
    }
  }, [state, navigate]);

  if (!state) {
    return null;
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(state.sessionToken);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <PhoneFrame hideNav>
      <div className="px-5 pt-4 pb-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button onClick={goBack} className="text-gray-500">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-lg font-semibold text-gray-900">
            Session Created
          </h1>
        </div>

        {/* Warning */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-4 mb-4 flex gap-3">
          <AlertTriangle size={20} className="text-amber-600 shrink-0 mt-0.5" />
          <div className="text-sm text-amber-800">
            <div className="font-semibold mb-1">Save the token now</div>
            <div className="text-xs">
              This is the only time you'll see this token. It won't be available
              again.
            </div>
          </div>
        </div>

        {/* Session info */}
        <div className="bg-white rounded-2xl shadow-sm px-4 py-4 mb-4">
          <div className="text-xs text-gray-500 mb-1">Session Name</div>
          <div className="text-sm font-medium text-gray-900">
            {state.session.name}
          </div>
        </div>

        {/* Token */}
        <div className="bg-white rounded-2xl shadow-sm px-4 py-4 mb-4">
          <div className="text-xs text-gray-500 mb-2">Session Token</div>
          <div className="text-xs font-mono text-gray-900 break-all bg-gray-50 rounded-xl px-3 py-3 select-all">
            {state.sessionToken}
          </div>
          <button
            type="button"
            onClick={handleCopy}
            className="w-full mt-3 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-xl py-3 font-medium text-sm flex items-center justify-center gap-2 transition-colors"
          >
            {isCopied ? (
              <>
                <Check size={16} />
                Copied
              </>
            ) : (
              <>
                <Copy size={16} />
                Copy
              </>
            )}
          </button>
        </div>

        {/* Done */}
        <button
          type="button"
          onClick={() => navigate("/agent-sessions")}
          className="w-full bg-violet-600 text-white rounded-2xl py-4 font-semibold text-sm hover:bg-violet-700 transition-colors"
        >
          Done
        </button>
      </div>
    </PhoneFrame>
  );
}
