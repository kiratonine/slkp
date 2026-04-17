import { ArrowUpRight, Plus, ArrowDownLeft, ChevronRight, FileText, BarChart2, Gauge, Edit, Bot } from 'lucide-react';
import { Screen } from '../types';

interface Props {
  onNavigate: (s: Screen) => void;
  agentEnabled: boolean;
}

export default function CardPage({ onNavigate, agentEnabled }: Props) {
  return (
    <div className="pb-8">
      {/* Back */}
      <div className="px-5 pt-2 pb-3">
        <button className="text-gray-500 text-xl">←</button>
      </div>

      {/* Card */}
      <div className="mx-5 mb-4 rounded-2xl p-5 text-white relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg,#00a8e0 0%,#0074b7 100%)', minHeight: 160 }}>
        <div className="text-2xl font-bold tracking-wide mb-6">slk.</div>
        {/* decorative circles */}
        <div className="absolute right-0 top-0 w-48 h-48 bg-white/10 rounded-full translate-x-16 -translate-y-16" />
        <div className="absolute right-8 top-12 w-32 h-32 bg-white/10 rounded-full" />
        <div className="text-2xl font-semibold mb-1">0,00 ₸</div>
        <div className="flex justify-between items-end text-sm">
          <span className="flex items-center gap-1">
            <span className="text-lg">🔴🟠</span> • 1117
          </span>
          <span>06/26</span>
        </div>
      </div>

      {/* Slider dots */}
      <div className="flex justify-center gap-1 mb-4">
        <div className="w-6 h-1 bg-gray-400 rounded-full" />
        <div className="w-2 h-1 bg-gray-200 rounded-full" />
      </div>

      {/* Apple Wallet */}
      <div className="mx-5 mb-6">
        <button className="w-full bg-black text-white rounded-2xl py-3 flex items-center justify-center gap-2 text-sm font-medium">
          <span>🪙</span> Добавить в Apple Wallet
        </button>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-3 mx-5 mb-6">
        <button className="flex flex-col items-center gap-1 text-xs text-sky-500">
          <div className="w-11 h-11 bg-sky-50 rounded-full flex items-center justify-center">
            <ArrowUpRight size={20} className="text-sky-500" />
          </div>
          Отправить
        </button>
        <button className="flex flex-col items-center gap-1 text-xs text-sky-500">
          <div className="w-11 h-11 bg-sky-50 rounded-full flex items-center justify-center">
            <Plus size={20} className="text-sky-500" />
          </div>
          Пополнить
        </button>
        <button className="flex flex-col items-center gap-1 text-xs text-sky-500">
          <div className="w-11 h-11 bg-sky-50 rounded-full flex items-center justify-center">
            <ArrowDownLeft size={20} className="text-sky-500" />
          </div>
          Запросить
        </button>
      </div>

      {/* ИНФОРМАЦИЯ section */}
      <div className="px-5 mb-1 text-xs text-gray-400 uppercase tracking-wider font-semibold">Информация</div>
      <div className="mx-5 bg-white rounded-2xl divide-y divide-gray-100 mb-4 shadow-sm">
        <MenuItem icon={<FileText size={18} className="text-gray-500" />} label="Реквизиты карты" />
        <MenuItem icon={<BarChart2 size={18} className="text-gray-500" />} label="История транзакций" />
        <MenuItem icon={<Gauge size={18} className="text-gray-500" />} label="Тарифы и лимиты" />
      </div>

      {/* ДЕЙСТВИЯ section */}
      <div className="px-5 mb-1 text-xs text-gray-400 uppercase tracking-wider font-semibold">Действия</div>
      <div className="mx-5 bg-white rounded-2xl divide-y divide-gray-100 mb-4 shadow-sm">
        <MenuItem icon={<Edit size={18} className="text-gray-500" />} label="Переименовать карту" />
      </div>

      {/* AI AGENT section */}
      <div className="px-5 mb-1 text-xs text-gray-400 uppercase tracking-wider font-semibold">AI Агент</div>
      <div className="mx-5 bg-white rounded-2xl shadow-sm overflow-hidden">
        <button
          onClick={() => onNavigate('ai-agent')}
          className="w-full flex items-center justify-between px-4 py-4 hover:bg-gray-50 active:bg-gray-100 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-violet-100 rounded-full flex items-center justify-center">
              <Bot size={18} className="text-violet-600" />
            </div>
            <div className="text-left">
              <div className="text-sm font-medium text-gray-900">Разрешение для AI Агента</div>
              <div className="text-xs text-gray-400 mt-0.5">
                {agentEnabled ? (
                  <span className="text-emerald-500 font-medium">● Активно</span>
                ) : (
                  'Настроить автооплату'
                )}
              </div>
            </div>
          </div>
          <ChevronRight size={18} className="text-gray-300" />
        </button>
      </div>
    </div>
  );
}

function MenuItem({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <button className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-gray-50">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-gray-50 rounded-full flex items-center justify-center">{icon}</div>
        <span className="text-sm text-gray-800">{label}</span>
      </div>
      <ChevronRight size={16} className="text-gray-300" />
    </button>
  );
}

import { ReactNode } from 'react';
