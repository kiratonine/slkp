export interface AuthConfig {
  jwtAccessSecret: string;
  jwtAccessExpiresIn: string;
}

export const authConfig = (): AuthConfig => ({
  jwtAccessSecret: process.env.JWT_ACCESS_SECRET ?? 'change_me_access_secret',
  jwtAccessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN ?? '7d',
});