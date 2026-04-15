import { useState } from 'react';
import PhoneFrame from './components/PhoneFrame';
import CardPage from './pages/CardPage';
import AIAgentPage from './pages/AIAgentPage';
import SetLimitPage from './pages/SetLimitPage';
import LinkAgentPage from './pages/LinkAgentPage';
import PaymentConfirmPage from './pages/PaymentConfirmPage';
import PaymentSuccessPage from './pages/PaymentSuccessPage';
import { Screen, AgentState } from './types';

const INITIAL_AGENT: AgentState = {
  enabled: false,
  dailyLimit: 0,
  agentName: '',
  agentKey: '',
  linked: false,
  spentToday: 0,
};

export default function App() {
  const [screen, setScreen] = useState<Screen>('card');
  const [agent, setAgent] = useState<AgentState>(INITIAL_AGENT);

  const navigate = (s: Screen) => setScreen(s);

  const toggleAgent = () =>
    setAgent(prev => ({ ...prev, enabled: !prev.enabled }));

  const saveLimit = (limit: number) =>
    setAgent(prev => ({ ...prev, dailyLimit: limit }));

  const linkAgent = (name: string, key: string) =>
    setAgent(prev => ({ ...prev, agentName: name, agentKey: key, linked: true }));

  const handlePaymentDone = (amount: number) =>
    setAgent(prev => ({ ...prev, spentToday: prev.spentToday + amount }));

  return (
    <PhoneFrame>
      {screen === 'card' && (
        <CardPage onNavigate={navigate} agentEnabled={agent.enabled && agent.linked} />
      )}
      {screen === 'ai-agent' && (
        <AIAgentPage onNavigate={navigate} agent={agent} onToggle={toggleAgent} />
      )}
      {screen === 'set-limit' && (
        <SetLimitPage onNavigate={navigate} currentLimit={agent.dailyLimit} onSave={saveLimit} />
      )}
      {screen === 'link-agent' && (
        <LinkAgentPage
          onNavigate={navigate}
          onLink={linkAgent}
          linked={agent.linked}
          agentName={agent.agentName}
          agentKey={agent.agentKey}
        />
      )}
      {screen === 'payment-confirm' && (
        <PaymentConfirmPage onNavigate={navigate} agent={agent} onPaymentDone={handlePaymentDone} />
      )}
      {screen === 'payment-success' && (
        <PaymentSuccessPage onNavigate={navigate} agent={agent} />
      )}
    </PhoneFrame>
  );
}
