import { AlertCircle } from "lucide-react";

type Props = {
  isLoading: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

export default function RevokeSessionModal({
  isLoading,
  onCancel,
  onConfirm,
}: Props) {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-5">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50" onClick={onCancel} />

      {/* Dialog */}
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden">
        <button
          type="button"
          onClick={onCancel}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 text-xl leading-none w-7 h-7 flex items-center justify-center"
          aria-label="Закрыть"
        >
          ×
        </button>

        <div className="px-6 py-6 text-center">
          {/* Icon */}
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <AlertCircle size={24} className="text-red-500" />
          </div>

          {/* Title */}
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            Revoke Session?
          </h2>

          {/* Message */}
          <p className="text-sm text-gray-500 mb-1">
            This agent will no longer be able to make payments.
          </p>
          <p className="text-sm text-gray-400 mb-5">
            This action cannot be undone.
          </p>

          {/* Buttons */}
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className="w-full bg-red-500 hover:bg-red-600 disabled:bg-gray-300 text-white rounded-xl py-3 font-semibold text-sm mb-2 transition-colors"
          >
            {isLoading ? "Отзываем..." : "Yes, Revoke"}
          </button>
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="w-full text-gray-600 rounded-xl py-3 font-medium text-sm hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
