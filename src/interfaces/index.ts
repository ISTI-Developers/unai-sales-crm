import { ReactNode } from "react";

export interface ErrorResponse {
  error: string;
}

export interface ProviderProps {
  children: ReactNode;
}

export interface List {
  id: string;
  value: string;
  label: string;
  disabled?: boolean;
  role?: number;
}

export interface DefaultResponse {
  acknowledged: boolean;
  error?: string;
  token?: string;
}

export interface ClassList {
  [key: string]: string;
  inactive: string;
  "password reset": string;
  new: string;
}
