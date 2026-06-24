import { useMutation } from '@tanstack/react-query';
import { loginUser, registerUser, googleSignIn, logoutUser } from '../api/auth';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from '@tanstack/react-router';

export const useRegister = () => {
  const { setUser } = useAuth();
  const navigate = useNavigate();
  return useMutation({
    mutationFn: registerUser,
    onSuccess: (data) => {
      setUser(data.user);
      navigate({ to: '/dashboard' });
    },
  });
};

export const useLogin = () => {
  const { setUser } = useAuth();
  const navigate = useNavigate();
  return useMutation({
    mutationFn: loginUser,
    onSuccess: (data) => {
      setUser(data.user);
      navigate({ to: '/dashboard' });
    },
  });
};

export const useGoogleSignIn = () => {
  const { setUser } = useAuth();
  const navigate = useNavigate();
  return useMutation({
    mutationFn: googleSignIn,
    onSuccess: (data) => {
      setUser(data.user);
      navigate({ to: '/dashboard' });
    },
  });
};

export const useLogout = () => {
  const { setUser } = useAuth();
  return useMutation({
    mutationFn: logoutUser,
    onSuccess: () => setUser(null),
  });
};
