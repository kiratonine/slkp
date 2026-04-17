import { useState } from 'react';
import { Bot, ArrowRight, Shield, Zap } from 'lucide-react';
import { Screen, AgentState } from '../types';

interface Props {
  onNavigate: (s: Screen) => void;
  agent: AgentState;
  onPaymentDone: (amount: number) => void;
}

const MOCK_PAYMENT = {
  service: 'Claude API (Anthropic)',
  description: 'API запросы: 850 токенов',
  amountUSD: 2.5,
  kztRate: 470,
};

export default function PaymentConfirmPage({ onNavigate, agent, onPaymentDone }: Props) {
  const [loading, setLoading] = useState(false);
  const amountKZT = Math.round(MOCK_PAYMENT.amountUSD * MOCK_PAYMENT.kztRate);

  const handleApprove = () => {
    setLoading(true);
    setTimeout(() => {
      onPaymentDone(amountKZT);
      onNavigate('payment-success');
    }, 1800);
  };

  return (
    <div className="pb-8">
      <div className="px-5 pt-2 pb-4 flex items-center gap-3">
        <button onClick={() => onNavigate('ai-agent')} className="text-gray-500 text-xl">←</button>
        <h1 className="text-lg font-semibold text-gray-900">Запрос на оплату</h1>
      </div>

      {/* Agent badge */}
      <div className="mx-5 mb-5 flex items-center gap-3 bg-violet-50 rounded-2xl px-4 py-3">
        <div className="w-10 h-10 bg-violet-200 rounded-full flex items-center justify-center">
          <Bot size={20} className="text-violet-700" />
        </div>
        <div>
          <div className="text-xs text-violet-500 font-medium">Запрос от AI Агента</div>
          <div className="text-sm font-semibold text-violet-800">{agent.agentName}</div>
        </div>
        <Zap size={16} className="text-violet-400 ml-auto" />
      </div>

      {/* Payment details */}
      <div className="mx-5 bg-white rounded-2xl shadow-sm p-5 mb-4">
        <div className="text-xs text-gray-400 mb-3 uppercase tracking-wider font-semibold">Детали платежа</div>

        <div className="flex justify-between items-start mb-3">
          <span className="text-sm text-gray-500">Сервис</span>
          <span className="text-sm font-medium text-gray-900 text-right max-w-[55%]">{MOCK_PAYMENT.service}</span>
        </div>
        <div className="flex justify-between items-start mb-3">
          <span className="text-sm text-gray-500">Описание</span>
          <span className="text-sm text-gray-700 text-right max-w-[55%]">{MOCK_PAYMENT.description}</span>
        </div>

        <div className="h-px bg-gray-100 my-3" />

        {/* Conversion */}
        <div className="bg-gray-50 rounded-xl p-3 mb-3">
          <div className="text-xs text-gray-400 mb-2">Конвертация валюты</div>
          <div className="flex items-center gap-2">
            <div className="text-center flex-1">
              <div className="text-base font-bold text-gray-900">${MOCK_PAYMENT.amountUSD}</div>
              <div className="text-xs text-gray-400">USD</div>
            </div>
            <ArrowRight size={16} className="text-gray-400 shrink-0" />
            <div className="text-center flex-1">
              <div className="text-base font-bold text-violet-700">{amountKZT.toLocaleString()} ₸</div>
              <div className="text-xs text-gray-400">KZT</div>
            </div>
          </div>
          <div className="text-xs text-gray-400 text-center mt-1">1 USD = {MOCK_PAYMENT.kztRate} ₸</div>
        </div>

        <div className="flex justify-between font-semibold">
          <span className="text-gray-700">Итого</span>
          <span className="text-violet-700 text-lg">{amountKZT.toLocaleString()} ₸</span>
        </div>
      </div>

      {/* Limit check */}
      <div className="mx-5 mb-5 bg-emerald-50 rounded-xl p-3 flex items-center gap-2">
        <Shield size={16} className="text-emerald-600 shrink-0" />
        <div className="text-xs text-emerald-700">
          Дневной лимит: <span className="font-semibold">{agent.dailyLimit.toLocaleString()} ₸</span>.
          После оплаты остаток: <span className="font-semibold">{Math.max(agent.dailyLimit - agent.spentToday - amountKZT, 0).toLocaleString()} ₸</span>
        </div>
      </div>

      <div className="mx-5 flex flex-col gap-3">
        <button
          onClick={handleApprove}
          disabled={loading}
          className="w-full bg-violet-600 text-white rounded-2xl py-4 font-semibold text-sm hover:bg-violet-700 active:bg-violet-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-70">
          {loading ? (
            <><span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full" /> Обработка...</>
          ) : (
            <>Подтвердить {amountKZT.toLocaleString()} ₸</>
          )}
        </button>
        <button onClick={() => onNavigate('ai-agent')}
          className="w-full bg-gray-100 text-gray-700 rounded-2xl py-4 font-semibold text-sm hover:bg-gray-200 transition-colors">
          Отклонить
        </button>
      </div>
    </div>
  );
}
