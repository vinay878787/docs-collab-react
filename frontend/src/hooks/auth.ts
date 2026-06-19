import { useMutation } from '@tanstack/react-query';
import { loginUser, registerUser, googleSignIn } from '../api/auth';

export const useRegister = () => {
  return useMutation({
    mutationFn: registerUser,
  });
};

export const useLogin = () => {
  return useMutation({
    mutationFn: loginUser,
  });
};

export const useGoogleSignIn = () => {
  return useMutation({
    mutationFn: googleSignIn,
  });
};
