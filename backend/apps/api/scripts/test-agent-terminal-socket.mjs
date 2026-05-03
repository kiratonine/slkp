import { io } from 'socket.io-client';

const socket = io('http://localhost:3001/agent-terminal', {
  transports: ['websocket'],
  auth: {
    token: 'demo-agent-terminal-token',
  },
});

socket.on('connect', () => {
  console.log('[test] connected');
  socket.emit('terminal:start');

  setTimeout(() => {
    socket.emit('terminal:input', {
      data: 'test\n',
    });
  }, 3000);

  setTimeout(() => {
    socket.emit('terminal:stop');
  }, 6000);

  setTimeout(() => {
    socket.disconnect();
  }, 8000);
});

socket.on('terminal:output', (payload) => {
  process.stdout.write(`[${payload.stream}] ${payload.data}`);
});

socket.on('terminal:status', (payload) => {
  console.log('[status]', payload);
});

socket.on('connect_error', (error) => {
  console.error('[connect_error]', error.message);
});