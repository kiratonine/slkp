export interface AppConfig {
  port: number;
  nodeEnv: string;
  appName: string;
  appVersion: string;
  appDescription: string;
}

export const appConfig = (): AppConfig => ({
  port: Number(process.env.PORT ?? 3001),
  nodeEnv: process.env.NODE_ENV ?? 'development',
  appName: process.env.APP_NAME ?? 'S1lk x402 Bridge API',
  appVersion: process.env.APP_VERSION ?? '1.0.0',
  appDescription: process.env.APP_DESCRIPTION ?? 'Backend API for S1lk x402 Bridge',
});