import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';

type TerminalOutputPayload = {
  stream: 'stdout' | 'stderr' | 'system';
  data: string;
};

type TerminalStatusPayload = {
  running: boolean;
};

const wsUrl = import.meta.env.VITE_AGENT_TERMINAL_WS_URL as string;
const demoToken = import.meta.env.VITE_AGENT_TERMINAL_TOKEN as string;

export default function App() {
  const terminalContainerRef = useRef<HTMLDivElement | null>(null);
  const terminalRef = useRef<Terminal | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const currentLineRef = useRef<string>('');
  const isRunningRef = useRef<boolean>(false);

  const [isConnected, setIsConnected] = useState(false);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    const terminal = new Terminal({
      cursorBlink: true,
      fontSize: 14,
      fontFamily:
        'JetBrains Mono, ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
      theme: {
        background: '#020617',
        foreground: '#e5e7eb',
        cursor: '#7dd3fc',
        selectionBackground: '#334155',
      },
    });

    const fitAddon = new FitAddon();

    terminal.loadAddon(fitAddon);

    if (terminalContainerRef.current !== null) {
      terminal.open(terminalContainerRef.current);
      fitAddon.fit();
      terminal.focus();
    }

    terminal.write('S1lk x402 Agent Terminal\r\n');
    terminal.write('Click "Start" to launch the AI agent CLI.\r\n');
    terminal.write('After launch, click inside the terminal and type commands.\r\n\r\n');

    terminal.onData((data) => {
      handleTerminalInput(data);
    });

    terminalRef.current = terminal;
    fitAddonRef.current = fitAddon;

    const onResize = () => {
      fitAddon.fit();
    };

    const onPaste = (event: ClipboardEvent) => {
      const terminalElement = terminalContainerRef.current;
      const activeElement = document.activeElement;

      if (
        terminalElement === null ||
        activeElement === null ||
        !terminalElement.contains(activeElement)
      ) {
        return;
      }

      const pastedText = event.clipboardData?.getData('text/plain');

      if (pastedText === undefined || pastedText.length === 0) {
        return;
      }

      event.preventDefault();
      handleTerminalInput(pastedText);
    };

    window.addEventListener('resize', onResize);
    document.addEventListener('paste', onPaste);

    return () => {
      window.removeEventListener('resize', onResize);
      document.removeEventListener('paste', onPaste);
      terminal.dispose();
      socketRef.current?.disconnect();
    };
  }, []);

  function connectSocket(): Socket {
    if (socketRef.current !== null) {
      return socketRef.current;
    }

    const socket = io(wsUrl, {
      transports: ['websocket'],
      auth: {
        token: demoToken,
      },
      autoConnect: false,
    });

    socket.on('connect', () => {
      setIsConnected(true);
      writeSystem('[browser] WebSocket connected.\r\n');
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
      updateRunningState(false);
      writeSystem('[browser] WebSocket disconnected.\r\n');
    });

    socket.on('terminal:output', (payload: TerminalOutputPayload) => {
      const data = normalizeNewLines(payload.data);

      if (payload.stream === 'stderr') {
        terminalRef.current?.write(`\x1b[31m${data}\x1b[0m`);
        return;
      }

      if (payload.stream === 'system') {
        terminalRef.current?.write(`\x1b[36m${data}\x1b[0m`);
        return;
      }

      terminalRef.current?.write(data);
    });

    socket.on('terminal:status', (payload: TerminalStatusPayload) => {
      updateRunningState(payload.running);

      if (payload.running) {
        setTimeout(() => {
          terminalRef.current?.focus();
        }, 50);
      }
    });

    socket.on('connect_error', (error: Error) => {
      writeSystem(`[browser] WebSocket connection error: ${error.message}\r\n`);
    });

    socketRef.current = socket;
    socket.connect();

    return socket;
  }

  function updateRunningState(value: boolean): void {
    isRunningRef.current = value;
    setIsRunning(value);
  }

  function handleStart() {
    const socket = connectSocket();

    socket.emit('terminal:start');

    setTimeout(() => {
      terminalRef.current?.focus();
    }, 100);
  }

  function handleStop() {
    socketRef.current?.emit('terminal:stop');
    updateRunningState(false);
  }

  function handleClear() {
    terminalRef.current?.clear();
    terminalRef.current?.write('S1lk x402 Agent Terminal\r\n\r\n');
    terminalRef.current?.focus();
  }

  async function handlePasteFromClipboard() {
    try {
      const text = await navigator.clipboard.readText();

      if (text.length > 0) {
        handleTerminalInput(text);
      }

      terminalRef.current?.focus();
    } catch {
      writeSystem('[browser] Clipboard access denied. Use right click → Paste.\r\n');
    }
  }

  function handleTerminalInput(data: string) {
    if (!isRunningRef.current) {
      terminalRef.current?.focus();
      return;
    }

    const terminal = terminalRef.current;

    if (terminal === null) {
      return;
    }

    if (data === '\r') {
      sendCurrentLine();
      return;
    }

    if (data === '\u007f') {
      handleBackspace(terminal);
      return;
    }

    if (data.includes('\r') || data.includes('\n')) {
      handlePastedMultilineInput(data);
      return;
    }

    currentLineRef.current += data;
    terminal.write(data);
  }

  function sendCurrentLine(): void {
    const terminal = terminalRef.current;

    if (terminal === null) {
      return;
    }

    const command = currentLineRef.current;
    currentLineRef.current = '';

    terminal.write('\r\n');

    socketRef.current?.emit('terminal:input', {
      data: `${command}\n`,
    });
  }

  function handleBackspace(terminal: Terminal): void {
    if (currentLineRef.current.length === 0) {
      return;
    }

    currentLineRef.current = currentLineRef.current.slice(0, -1);
    terminal.write('\b \b');
  }

  function handlePastedMultilineInput(data: string): void {
    const terminal = terminalRef.current;

    if (terminal === null) {
      return;
    }

    const normalized = data.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    const lines = normalized.split('\n');

    for (let index = 0; index < lines.length; index += 1) {
      const line = lines[index];

      if (line.length > 0) {
        currentLineRef.current += line;
        terminal.write(line);
      }

      if (index < lines.length - 1) {
        sendCurrentLine();
      }
    }
  }

  function writeSystem(message: string) {
    terminalRef.current?.write(`\x1b[36m${message}\x1b[0m`);
  }

  function normalizeNewLines(value: string): string {
    return value.replace(/\n/g, '\r\n');
  }

  return (
    <main className="page">
      <section className="terminalPanel">
        <div className="topBar">
          <div>
            <p className="eyebrow">S1lk x402 Bridge Demo</p>
            <h1>AI Agent Terminal</h1>
            <p className="subtitle">
              A browser-based terminal for testing autonomous x402 payments through S1lk Bridge.
            </p>
          </div>

          <div className="actions">
            <button className="startButton" onClick={handleStart} disabled={isRunning}>
              Start
            </button>

            <button className="stopButton" onClick={handleStop} disabled={!isRunning}>
              Stop
            </button>

            <button className="clearButton" onClick={handleClear}>
              Clear
            </button>

            <button className="clearButton" onClick={handlePasteFromClipboard}>
              Paste
            </button>
          </div>
        </div>

        <div className="statusRow">
          <span className={isConnected ? 'dot active' : 'dot'} />
          <span>{isConnected ? 'WebSocket connected' : 'WebSocket disconnected'}</span>

          <span className={isRunning ? 'badge running' : 'badge'}>
            {isRunning ? 'agent-cli running' : 'agent-cli stopped'}
          </span>
        </div>

        <div ref={terminalContainerRef} className="terminal" />
      </section>

      <aside className="helpPanel">
        <div>
          <p className="eyebrow">Help</p>
          <h2>Test commands</h2>
        </div>

        <div className="helpBlock">
          <h3>1. Connect S1lk Bridge</h3>
          <code>Connect s1lk-x402-bridge</code>
          <p>The agent will ask you to paste a session token.</p>
        </div>

        <div className="helpBlock">
          <h3>2. Paste session token</h3>
          <code>eyJhbGciOi...</code>
          <p>
            Create this token in the main S1lkPay UI under the Agent Sessions section.
            Use the Paste button, right click → Paste, or Ctrl + Shift + V.
          </p>
        </div>

        <div className="helpBlock">
          <h3>3. Run x402 payment</h3>
          <code>Get premium sol quote</code>
          <p>
            The agent will receive HTTP 402, call the bridge, pay through x402, retry the seller,
            and receive paid data.
          </p>
        </div>

        <div className="flowBox">
          <h3>What happens inside</h3>
          <ol>
            <li>The agent calls the seller API.</li>
            <li>The seller returns HTTP 402 Payment Required.</li>
            <li>The agent SDK calls S1lk Bridge.</li>
            <li>The bridge creates an x402 PAYMENT-SIGNATURE.</li>
            <li>The seller accepts the Solana payment.</li>
            <li>The bridge confirms the payment and debits KZT.</li>
          </ol>
        </div>
      </aside>
    </main>
  );
}