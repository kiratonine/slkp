import { useState } from 'react';
import { Screen } from '../types';

interface Props {
  onNavigate: (s: Screen) => void;
  currentLimit: number;
  onSave: (limit: number) => void;
}

const PRESETS = [1000, 5000, 10000, 25000, 50000];

export default function SetLimitPage({ onNavigate, currentLimit, onSave }: Props) {
  const [value, setValue] = useState(currentLimit > 0 ? currentLimit : 5000);
  const [input, setInput] = useState(currentLimit > 0 ? String(currentLimit) : '5000');

  const handleSlider = (v: number) => {
    setValue(v);
    setInput(String(v));
  };

  const handleInput = (s: string) => {
    setInput(s);
    const n = parseInt(s, 10);
    if (!isNaN(n) && n >= 100 && n <= 500000) setValue(n);
  };

  const handleSave = () => {
    onSave(value);
    onNavigate('ai-agent');
  };

  return (
    <div className="pb-8">
      <div className="px-5 pt-2 pb-4 flex items-center gap-3">
        <button onClick={() => onNavigate('ai-agent')} className="text-gray-500 text-xl">←</button>
        <h1 className="text-lg font-semibold text-gray-900">Лимит в день</h1>
      </div>

      <div className="mx-5 mb-6 text-sm text-gray-500">
        Максимальная сумма, которую AI Агент может потратить за один день.
      </div>

      {/* Amount display */}
      <div className="mx-5 mb-6 bg-white rounded-2xl shadow-sm p-6 text-center">
        <div className="text-4xl font-bold text-gray-900 mb-1">
          {value.toLocaleString()} ₸
        </div>
        <div className="text-xs text-gray-400">в день</div>
      </div>

      {/* Slider */}
      <div className="mx-5 mb-4">
        <input
          type="range" min={100} max={500000} step={100}
          value={value}
          onChange={e => handleSlider(Number(e.target.value))}
          className="w-full accent-violet-500"
        />
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>100 ₸</span>
          <span>500 000 ₸</span>
        </div>
      </div>

      {/* Presets */}
      <div className="mx-5 mb-6">
        <div className="text-xs text-gray-400 mb-2">Быстрый выбор</div>
        <div className="flex gap-2 flex-wrap">
          {PRESETS.map(p => (
            <button key={p} onClick={() => handleSlider(p)}
              className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-colors ${
                value === p
                  ? 'bg-violet-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}>
              {p.toLocaleString()} ₸
            </button>
          ))}
        </div>
      </div>

      {/* Manual input */}
      <div className="mx-5 mb-8">
        <div className="text-xs text-gray-400 mb-2">Или введите вручную</div>
        <div className="flex items-center bg-white rounded-xl shadow-sm border border-gray-100 px-4 py-3 gap-2">
          <input
            type="number" min={100} max={500000}
            value={input}
            onChange={e => handleInput(e.target.value)}
            className="flex-1 text-sm outline-none text-gray-900"
            placeholder="Сумма"
          />
          <span className="text-gray-400 text-sm">₸</span>
        </div>
      </div>

      {/* Warning */}
      <div className="mx-5 mb-6 bg-amber-50 rounded-xl p-4 flex gap-3">
        <span className="text-lg">⚠️</span>
        <p className="text-xs text-amber-700">
          После достижения лимита AI Агент не сможет производить платежи до следующего дня.
          Все транзакции записываются в историю.
        </p>
      </div>

      <div className="mx-5">
        <button onClick={handleSave}
          className="w-full bg-violet-600 text-white rounded-2xl py-4 font-semibold text-sm hover:bg-violet-700 active:bg-violet-800 transition-colors">
          Сохранить лимит
        </button>
      </div>
    </div>
  );
}
