import type {
  ILoginUser,
  IRegisterResponse,
  IRegisterUser,
} from '../utils/types/user';
import { api } from './axios';

export const registerUser = async (
  payload: IRegisterUser,
): Promise<IRegisterResponse> => {
  const response = await api.post<IRegisterResponse>('/register', payload);
  return response.data;
};

export const loginUser = async (
  payload: ILoginUser,
): Promise<IRegisterResponse> => {
  const response = await api.post<IRegisterResponse>('/login', payload);
  return response.data;
};

export const googleSignIn = async (
  accessToken: string,
): Promise<IRegisterResponse> => {
  const response = await api.post<IRegisterResponse>('/google', {
    accessToken,
  });
  return response.data;
};
