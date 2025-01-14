import { DefaultResponse } from ".";
import { UserTable } from "./user.interface";

export interface PasswordResetData {
  ID: number;
  email_address: string;
  error?: string;
}
export interface AuthTypes {
  loginUser: (username: string, password: string) => Promise<DefaultResponse>;
  generatePassword: () => string;
  logoutUser: () => void;
  resetPassword: (user: UserTable) => Promise<DefaultResponse>;
  validateEmailAddress: (email_address: string) => Promise<PasswordResetData>;
  validateCode: (code: string, ID: string) => Promise<DefaultResponse>;
}
