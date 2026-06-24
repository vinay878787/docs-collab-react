import { useMutation } from '@tanstack/react-query';
import { loginUser, registerUser, googleSignIn, logoutUser } from '../api/auth';
import { useAuth } from '../context/AuthContext';

export const useRegister = () => {
  const { setUser } = useAuth();
  return useMutation({
    mutationFn: registerUser,
    onSuccess: (data) => setUser(data.user),
  });
};

export const useLogin = () => {
  const { setUser } = useAuth();
  return useMutation({
    mutationFn: loginUser,
    onSuccess: (data) => setUser(data.user),
  });
};

export const useGoogleSignIn = () => {
  const { setUser } = useAuth();
  return useMutation({
    mutationFn: googleSignIn,
    onSuccess: (data) => setUser(data.user),
  });
};

export const useLogout = () => {
  const { setUser } = useAuth();
  return useMutation({
    mutationFn: logoutUser,
    onSuccess: () => setUser(null),
  });
};
