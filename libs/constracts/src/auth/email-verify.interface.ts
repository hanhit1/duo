export interface IEmailVerify {
  code: string;
  email: string;
  password?: string;
  attempts: number;
  createdAt: string;
  ref?: string;
}
