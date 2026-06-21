import type {
  IAuthResponse,
  ILoginUser,
  IRegisterUser,
} from '../utils/types/user';
import { api } from './axios';

export const registerUser = async (
  payload: IRegisterUser,
): Promise<IAuthResponse> => {
  const response = await api.post<IAuthResponse>('/register', payload);
  return response.data;
};

export const loginUser = async (
  payload: ILoginUser,
): Promise<IAuthResponse> => {
  const response = await api.post<IAuthResponse>('/login', payload);
  return response.data;
};

export const googleSignIn = async (
  accessToken: string,
): Promise<IAuthResponse> => {
  const response = await api.post<IAuthResponse>('/google', { accessToken });
  return response.data;
};

export const logoutUser = async (): Promise<void> => {
  await api.post('/logout');
};
