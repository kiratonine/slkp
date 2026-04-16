import { useState } from 'react';
import { Bot, Copy, RefreshCw } from 'lucide-react';
import { Screen } from '../types';

interface Props {
  onNavigate: (s: Screen) => void;
  onLink: (name: string, key: string) => void;
  linked: boolean;
  agentName: string;
  agentKey: string;
}

const SAMPLE_AGENTS = [
  { name: 'Claude Sonnet', icon: '🤖', desc: 'Anthropic Claude API' },
  { name: 'GPT-4o', icon: '🧠', desc: 'OpenAI GPT' },
  { name: 'Gemini Pro', icon: '✨', desc: 'Google Gemini' },
  { name: 'Custom Agent', icon: '⚡', desc: 'Свой агент (API Key)' },
];

export default function LinkAgentPage({ onNavigate, onLink, linked, agentName, agentKey }: Props) {
  const [step, setStep] = useState<'choose' | 'key'>(linked ? 'key' : 'choose');
  const [selected, setSelected] = useState(linked ? agentName : '');
  const [key, setKey] = useState(linked ? agentKey : '');
  const [copied, setCopied] = useState(false);

  const accountId = 'slk-acc-7f3a9b2e';

  const handleCopy = () => {
    navigator.clipboard.writeText(accountId).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLink = () => {
    if (key.trim().length < 4) return;
    onLink(selected, key.trim());
    onNavigate('ai-agent');
  };

  return (
    <div className="pb-8">
      <div className="px-5 pt-2 pb-4 flex items-center gap-3">
        <button onClick={() => onNavigate('ai-agent')} className="text-gray-500 text-xl">←</button>
        <h1 className="text-lg font-semibold text-gray-900">Привязать AI Агента</h1>
      </div>

      {step === 'choose' && (
        <>
          <div className="mx-5 mb-4 text-sm text-gray-500">Выберите AI Агента для привязки к аккаунту S1lkPay</div>
          <div className="mx-5 flex flex-col gap-2 mb-6">
            {SAMPLE_AGENTS.map(a => (
              <button key={a.name}
                onClick={() => { setSelected(a.name); setStep('key'); }}
                className="flex items-center gap-3 bg-white rounded-2xl px-4 py-4 shadow-sm hover:bg-gray-50 transition-colors">
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-xl">{a.icon}</div>
                <div className="text-left">
                  <div className="text-sm font-semibold text-gray-900">{a.name}</div>
                  <div className="text-xs text-gray-400">{a.desc}</div>
                </div>
              </button>
            ))}
          </div>
        </>
      )}

      {step === 'key' && (
        <>
          <div className="mx-5 mb-4">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-sky-100 rounded-full flex items-center justify-center">
                <Bot size={16} className="text-sky-600" />
              </div>
              <span className="text-sm font-semibold text-gray-800">{selected}</span>
              <button onClick={() => setStep('choose')} className="ml-auto text-xs text-violet-500">Изменить</button>
            </div>

            {/* Account ID to copy */}
            <div className="bg-violet-50 rounded-xl p-4 mb-4">
              <div className="text-xs text-violet-600 font-medium mb-2">Ваш S1lkPay Account ID</div>
              <div className="flex items-center gap-2">
                <code className="text-xs font-mono text-violet-800 flex-1 break-all">{accountId}</code>
                <button onClick={handleCopy} className="text-violet-500 shrink-0">
                  {copied ? <span className="text-xs text-emerald-500">✓</span> : <Copy size={15} />}
                </button>
              </div>
              <p className="text-xs text-violet-500 mt-2">Скопируйте и вставьте в настройки вашего AI Агента</p>
            </div>

            {/* API Key input */}
            <div className="text-xs text-gray-400 mb-2">API Key агента (для подтверждения)</div>
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-4 py-3 flex items-center gap-2 mb-2">
              <input
                type="password"
                value={key}
                onChange={e => setKey(e.target.value)}
                placeholder="sk-..."
                className="flex-1 text-sm outline-none text-gray-900 font-mono"
              />
              <button onClick={() => setKey('')}>
                <RefreshCw size={14} className="text-gray-300" />
              </button>
            </div>
            <p className="text-xs text-gray-400 mb-6">Ключ хранится зашифровано и нужен только для идентификации агента</p>

            <button
              onClick={handleLink}
              disabled={key.trim().length < 4}
              className="w-full bg-violet-600 disabled:bg-gray-200 disabled:text-gray-400 text-white rounded-2xl py-4 font-semibold text-sm hover:bg-violet-700 active:bg-violet-800 transition-colors">
              Привязать агента
            </button>
          </div>
        </>
      )}
    </div>
  );
}
