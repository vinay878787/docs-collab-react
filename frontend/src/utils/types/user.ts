export interface IRegisterUser {
  username: string;
  email: string;
  password: string;
}

export interface IAuthResponse {
  message?: string;
  user: {
    id: string;
    username: string;
    email: string;
    avatar: string;
  };
}

export interface ILoginUser {
  email: string;
  password: string;
}
