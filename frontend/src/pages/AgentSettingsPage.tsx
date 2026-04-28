import { SyntheticEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft } from "lucide-react";
import PhoneFrame from "../components/PhoneFrame";
import {
  agentSettingsService,
  UpdateAgentSettingsRequest,
} from "../services/agent-settings/agentSettingsService";
import { ApiError } from "../services/api/client";
import type { AgentSettings } from "../types/auth";

export default function AgentSettingsPage() {
  const navigate = useNavigate();

  const [settings, setSettings] = useState<AgentSettings | null>(null);
  const [draft, setDraft] = useState<UpdateAgentSettingsRequest | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const data = await agentSettingsService.getSettings();
        setSettings(data);
        setDraft({
          isEnabled: data.isEnabled,
          dailyLimitKzt: data.dailyLimitKzt,
          perTransactionLimitKzt: data.perTransactionLimitKzt,
          requireConfirmNewSeller: data.requireConfirmNewSeller,
        });
      } catch (err) {
        if (err instanceof ApiError) {
          setLoadError(err.message);
        } else {
          setLoadError("Не удалось загрузить настройки");
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, []);

  const handleSave = async (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!draft) return;

    setSaveError(null);
    setIsSaved(false);
    setIsSaving(true);

    try {
      const updated = await agentSettingsService.updateSettings(draft);
      setSettings(updated);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
    } catch (err) {
      if (err instanceof ApiError) {
        setSaveError(err.message);
      } else {
        setSaveError("Не удалось сохранить");
      }
    } finally {
      setIsSaving(false);
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
            Настройки AI-агента
          </h1>
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

        {draft && !isLoading && !loadError && (
          <form onSubmit={handleSave} className="flex flex-col gap-4">
            {/* Toggle: enabled */}
            <div className="bg-white rounded-2xl shadow-sm px-4 py-4 flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-gray-900">
                  Разрешить AI-агенту тратить
                </div>
                <div className="text-xs text-gray-400 mt-0.5">
                  {draft.isEnabled ? "Включено" : "Выключено"}
                </div>
              </div>
              <button
                type="button"
                onClick={() =>
                  setDraft({ ...draft, isEnabled: !draft.isEnabled })
                }
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  draft.isEnabled ? "bg-violet-500" : "bg-gray-200"
                }`}
              >
                <span
                  className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                    draft.isEnabled ? "translate-x-0.5" : "-translate-x-5.5"
                  }`}
                />
              </button>
            </div>

            {/* Daily limit */}
            <div className="bg-white rounded-2xl shadow-sm px-4 py-4">
              <label className="text-xs text-gray-500 mb-1 block">
                Дневной лимит (₸)
              </label>
              <input
                placeholder="10000"
                type="number"
                min={0}
                value={draft.dailyLimitKzt === 0 ? "" : draft.dailyLimitKzt}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    dailyLimitKzt: Number(e.target.value),
                  })
                }
                className="w-full text-lg font-semibold text-gray-900 outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
            </div>

            {/* Per-transaction limit */}
            <div className="bg-white rounded-2xl shadow-sm px-4 py-4">
              <label className="text-xs text-gray-500 mb-1 block">
                Лимит на транзакцию (₸)
              </label>
              <input
                placeholder="10000"
                type="number"
                min={0}
                value={
                  draft.perTransactionLimitKzt === 0
                    ? ""
                    : draft.perTransactionLimitKzt
                }
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    perTransactionLimitKzt: Number(e.target.value),
                  })
                }
                className="w-full text-lg font-semibold text-gray-900 outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
            </div>

            {/* Toggle: requireConfirmNewSeller */}
            <div className="bg-white rounded-2xl shadow-sm px-4 py-4 flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-gray-900">
                  Подтверждать новых продавцов
                </div>
                <div className="text-xs text-gray-400 mt-0.5">
                  Запрашивать подтверждение при первой оплате
                </div>
              </div>
              <button
                type="button"
                onClick={() =>
                  setDraft({
                    ...draft,
                    requireConfirmNewSeller: !draft.requireConfirmNewSeller,
                  })
                }
                className={`relative w-12 h-6 rounded-full transition-colors shrink-0 ml-3 ${
                  draft.requireConfirmNewSeller
                    ? "bg-violet-500"
                    : "bg-gray-200"
                }`}
              >
                <span
                  className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                    draft.requireConfirmNewSeller
                      ? "translate-x-0.5"
                      : "-translate-x-5.5"
                  }`}
                />
              </button>
            </div>

            {isSaved && (
              <div className="text-sm text-green-700 bg-green-50 rounded-xl px-4 py-3">
                Сохранено
              </div>
            )}

            {saveError && (
              <div className="text-sm text-red-500 bg-red-50 rounded-xl px-4 py-3">
                {saveError}
              </div>
            )}

            <button
              type="submit"
              disabled={isSaving}
              className="w-full bg-violet-600 disabled:bg-gray-300 text-white rounded-2xl py-4 font-semibold text-sm hover:bg-violet-700 transition-colors mt-2"
            >
              {isSaving ? "Сохраняем..." : "Сохранить"}
            </button>
          </form>
        )}
      </div>
    </PhoneFrame>
  );
}
