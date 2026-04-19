export type User = {
  id: string;
  email: string;
  createdAt: string;
};

export type Balance = {
  amountKzt: number;
  updatedAt: string;
};

export type AgentSettings = {
  isEnabled: boolean;
  dailyLimitKzt: number;
  perTransactionLimitKzt: number;
  requireConfirmNewSeller: boolean;
  updatedAt: string;
};

export type RegisterRequest = {
  email: string;
  password: string;
};

export type RegisterResponse = {
  user: User;
  balance: Balance;
  agentSettings: AgentSettings;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type LoginResponse = {
  accessToken: string;
  tokenType: string;
  expiresIn: string;
  user: User;
};
