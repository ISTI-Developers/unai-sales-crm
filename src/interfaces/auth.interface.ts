import { Dispatch, SetStateAction } from "react";
import { User } from "./user.interface";
import { AxiosProgressEvent } from "axios";

export interface PasswordResetData {
  ID: number;
  email_address: string;
  error?: string;
}
export interface AuthTypes {
  user: User | null;
  setUser: Dispatch<SetStateAction<User | null>>;
  logoutUser: () => void;
  advisory: Advisory | undefined;
  setAdvisory: Dispatch<SetStateAction<Advisory | undefined>>;
  progress: AxiosProgressEvent | null;
  setProgress: Dispatch<SetStateAction<AxiosProgressEvent | null>>;
}

export interface Advisory {
  receipient: string;
  title: string;
  content: string;
  created_at?: string;
}
