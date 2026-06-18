export interface IUser {
  username: string;
  email: string;
  password?: string;
  provider: 'local' | 'google';
  avatar: string;
}
