import { apiGet, apiPost, tokenStorage } from "../api/client";
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  User,
} from "../../types/auth";

export const authService = {
  register: (data: RegisterRequest): Promise<RegisterResponse> =>
    apiPost<RegisterResponse>("/auth/register", data),

  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await apiPost<LoginResponse>("/auth/login", data);
    tokenStorage.set(response.accessToken);
    return response;
  },

  logout: (): void => {
    tokenStorage.remove();
  },

  getMe: (): Promise<User> => apiGet<User>("/users/me"),
};
