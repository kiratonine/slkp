import { Bot, CheckCircle, ArrowRight } from 'lucide-react';
import { Screen, AgentState } from '../types';

interface Props {
  onNavigate: (s: Screen) => void;
  agent: AgentState;
}

export default function PaymentSuccessPage({ onNavigate, agent }: Props) {
  const lastTx = 1175; // mocked last payment

  return (
    <div className="pb-8 flex flex-col items-center">
      <div className="w-full px-5 pt-2 pb-4 flex items-center gap-3">
        <div className="w-8" />
        <h1 className="text-lg font-semibold text-gray-900 flex-1 text-center">Оплата прошла</h1>
        <div className="w-8" />
      </div>

      {/* Success animation area */}
      <div className="w-full mx-5 bg-gradient-to-b from-violet-50 to-white rounded-3xl mx-5 py-10 flex flex-col items-center mb-6" style={{width:'calc(100% - 40px)'}}>
        <div className="relative mb-4">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center">
            <CheckCircle size={40} className="text-emerald-500" />
          </div>
          <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-violet-200 rounded-full flex items-center justify-center">
            <Bot size={14} className="text-violet-700" />
          </div>
        </div>
        <div className="text-2xl font-bold text-gray-900 mb-1">{lastTx.toLocaleString()} ₸</div>
        <div className="text-sm text-gray-500">Оплачено AI Агентом</div>
      </div>

      {/* Details */}
      <div className="w-full px-5 mb-4">
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <div className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-3">Транзакция</div>

          <Row label="Агент" value={agent.agentName} />
          <Row label="Сервис" value="Claude API (Anthropic)" />
          <Row label="Сумма" value={`${lastTx.toLocaleString()} ₸`} bold />
          <Row label="Конвертация" value="$2.50 USD → 1 175 ₸" />
          <Row label="Дата" value={new Date().toLocaleDateString('ru-RU', { day:'numeric', month:'long', year:'numeric' })} />
          <Row label="Статус" value="✅ Выполнено" />

          <div className="h-px bg-gray-100 my-3" />
          <div className="flex justify-between text-xs text-gray-400">
            <span>Остаток лимита сегодня</span>
            <span className="text-emerald-600 font-medium">{Math.max(agent.dailyLimit - agent.spentToday, 0).toLocaleString()} ₸</span>
          </div>
        </div>
      </div>

      {/* What the agent received */}
      <div className="w-full px-5 mb-6">
        <div className="bg-violet-50 rounded-2xl p-4">
          <div className="text-xs text-violet-500 font-semibold uppercase tracking-wider mb-2">Агент получил</div>
          <div className="flex items-center gap-3">
            <div className="text-2xl">🔑</div>
            <div>
              <div className="text-sm font-semibold text-violet-900">API Access Token</div>
              <div className="text-xs text-violet-500 font-mono">ant-api3-...e9f2</div>
            </div>
            <ArrowRight size={14} className="text-violet-400 ml-auto" />
          </div>
        </div>
      </div>

      <div className="w-full px-5 flex flex-col gap-3">
        <button onClick={() => onNavigate('ai-agent')}
          className="w-full bg-violet-600 text-white rounded-2xl py-4 font-semibold text-sm hover:bg-violet-700 transition-colors">
          Вернуться к агенту
        </button>
        <button onClick={() => onNavigate('card')}
          className="w-full bg-gray-100 text-gray-700 rounded-2xl py-4 font-semibold text-sm hover:bg-gray-200 transition-colors">
          На главную
        </button>
      </div>
    </div>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex justify-between items-center py-1.5">
      <span className="text-xs text-gray-400">{label}</span>
      <span className={`text-xs ${bold ? 'font-bold text-gray-900' : 'text-gray-700'}`}>{value}</span>
    </div>
  );
}
