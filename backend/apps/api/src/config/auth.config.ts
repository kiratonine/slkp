export interface AuthConfig {
  jwtAccessSecret: string;
  jwtAccessExpiresIn: string;
  jwtSessionSecret: string;
}

export const authConfig = (): AuthConfig => ({
  jwtAccessSecret: process.env.JWT_ACCESS_SECRET ?? 'change_me_access_secret',
  jwtAccessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN ?? '7d',
  jwtSessionSecret: process.env.JWT_SESSION_SECRET ?? 'change_me_session_secret',
});