import { SyntheticEvent, useState } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft } from "lucide-react";
import PhoneFrame from "../components/PhoneFrame";
import { agentSessionsService } from "../services/agent-sessions/agentSessionsService";
import { ApiError } from "../services/api/client";

const MIN_NAME_LENGTH = 2;
const MAX_NAME_LENGTH = 100;
const MIN_EXPIRES_DAYS = 1;
const MAX_EXPIRES_DAYS = 30;
const DEFAULT_EXPIRES_DAYS = 7;

export default function CreateAgentSessionPage() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [expiresInDays, setExpiresInDays] = useState<number | "">(
    DEFAULT_EXPIRES_DAYS,
  );
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const handleSubmit = async (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (expiresInDays === "") {
      setCreateError("Укажите срок действия");
      return;
    }

    setCreateError(null);
    setIsCreating(true);

    try {
      const response = await agentSessionsService.create({
        name,
        expiresInDays,
      });

      navigate("/agent-sessions/created", {
        state: {
          session: response.session,
          sessionToken: response.sessionToken,
        },
      });
    } catch (err) {
      if (err instanceof ApiError) {
        setCreateError(err.message);
      } else {
        setCreateError("Не удалось создать сессию");
      }
      setIsCreating(false);
    }
  };

  return (
    <PhoneFrame hideNav>
      <div className="px-5 pt-4 pb-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate("/agent-sessions")}
            className="text-gray-500"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-lg font-semibold text-gray-900">Новая сессия</h1>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Name */}
          <div className="bg-white rounded-2xl shadow-sm px-4 py-4">
            <label className="text-xs text-gray-500 mb-1 block">
              Имя сессии
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              minLength={MIN_NAME_LENGTH}
              maxLength={MAX_NAME_LENGTH}
              placeholder="Например: Мой CLI агент"
              required
              className="w-full text-base text-gray-900 outline-none"
            />
          </div>

          {/* Expires in days */}
          <div className="bg-white rounded-2xl shadow-sm px-4 py-4">
            <label className="text-xs text-gray-500 mb-1 block">
              Срок действия (дней)
            </label>
            <input
              type="number"
              value={expiresInDays}
              onChange={(e) => {
                const value = e.target.value;
                setExpiresInDays(value === "" ? "" : Number(value));
              }}
              min={MIN_EXPIRES_DAYS}
              max={MAX_EXPIRES_DAYS}
              required
              className="w-full text-lg font-semibold text-gray-900 outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            <div className="text-xs text-gray-400 mt-1">
              От {MIN_EXPIRES_DAYS} до {MAX_EXPIRES_DAYS} дней
            </div>
          </div>

          {/* Error */}
          {createError && (
            <div className="text-sm text-red-500 bg-red-50 rounded-xl px-4 py-3">
              {createError}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={isCreating}
            className="w-full bg-violet-600 disabled:bg-gray-300 text-white rounded-2xl py-4 font-semibold text-sm hover:bg-violet-700 transition-colors mt-2"
          >
            {isCreating ? "Создаём..." : "Создать сессию"}
          </button>
        </form>
      </div>
    </PhoneFrame>
  );
}
