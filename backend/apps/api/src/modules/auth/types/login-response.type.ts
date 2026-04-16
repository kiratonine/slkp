import { UserPublic } from '../../users/types/user-public.type';

export type LoginResponse = {
  accessToken: string;
  tokenType: 'Bearer';
  expiresIn: string;
  user: UserPublic;
};