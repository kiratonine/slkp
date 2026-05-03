import { spawn } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';

function loadEnvFile(path) {
  if (!existsSync(path)) {
    console.log(`[render-start] Env file not found, skipping: ${path}`);
    return;
  }

  console.log(`[render-start] Loading env file: ${path}`);

  const content = readFileSync(path, 'utf-8');

  for (const rawLine of content.split('\n')) {
    const line = rawLine.trim();

    if (line.length === 0 || line.startsWith('#')) {
      continue;
    }

    const equalsIndex = line.indexOf('=');

    if (equalsIndex === -1) {
      continue;
    }

    const key = line.slice(0, equalsIndex).trim();
    let value = line.slice(equalsIndex + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

function resolveNodeEntry(candidates) {
  const found = candidates.find((candidate) => existsSync(candidate));

  if (!found) {
    throw new Error(`Cannot find entry file. Checked: ${candidates.join(', ')}`);
  }

  return found;
}

function startProcess(name, command, args, env = {}) {
  const child = spawn(command, args, {
    cwd: process.cwd(),
    shell: false,
    env: {
      ...process.env,
      ...env,
    },
  });

  child.stdout.on('data', (chunk) => {
    process.stdout.write(`[${name}] ${chunk.toString()}`);
  });

  child.stderr.on('data', (chunk) => {
    process.stderr.write(`[${name}:err] ${chunk.toString()}`);
  });

  child.on('error', (error) => {
    console.error(`[${name}] failed:`, error);
  });

  child.on('close', (code) => {
    console.log(`[${name}] exited with code=${code}`);
  });

  return child;
}

// Local Render-like mode.
// On real Render, env variables come from Render dashboard.
// Locally, we load existing app env files for convenience.
loadEnvFile('apps/api/.env');
loadEnvFile('apps/seller/.env');

const sellerEntry = resolveNodeEntry([
  'apps/seller/dist/main.js',
  'apps/seller/dist/src/main.js',
]);

const apiEntry = resolveNodeEntry([
  'apps/api/dist/src/main.js',
  'apps/api/dist/main.js',
]);

console.log('[render-start] Starting seller...');

const seller = startProcess('seller', 'node', [sellerEntry], {
  SELLER_PORT: process.env.SELLER_PORT ?? '3002',
  SELLER_BASE_URL:
    process.env.SELLER_BASE_URL ??
    `http://localhost:${process.env.SELLER_PORT ?? '3002'}`,
});

setTimeout(() => {
  console.log('[render-start] Starting api...');

  const api = startProcess('api', 'node', [apiEntry], {
    AGENT_CLI_CWD: process.env.AGENT_CLI_CWD ?? 'apps/agent-cli',
    AGENT_CLI_COMMAND: process.env.AGENT_CLI_COMMAND ?? 'node',
    AGENT_CLI_ARGS: process.env.AGENT_CLI_ARGS ?? 'dist/main.js',
    AGENT_CLI_BRIDGE_URL:
      process.env.AGENT_CLI_BRIDGE_URL ??
      `http://localhost:${process.env.PORT ?? '3001'}/v1`,
    AGENT_CLI_SELLER_URL:
      process.env.AGENT_CLI_SELLER_URL ??
      `http://localhost:${process.env.SELLER_PORT ?? '3002'}`,
  });

  api.on('close', (code) => {
    console.log('[render-start] API stopped. Shutting down seller...');
    seller.kill('SIGTERM');
    process.exit(code ?? 0);
  });
}, 1500);

function shutdown() {
  console.log('[render-start] Shutdown requested.');
  seller.kill('SIGTERM');
  process.exit(0);
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);