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

export interface DefaultResponse<T = undefined> {
  acknowledged: boolean;
  error?: string;
  token?: string;
  id?: number;
  item?: T;
}

export interface ClassList {
  [key: string]: string;
  inactive: string;
  "password reset": string;
  new: string;
}

export interface Access {
  view: boolean;
  add: boolean;
  edit: boolean;
  delete: boolean;
}

export interface WorkplaceRes<T = unknown> {
  success: boolean;
  data: T;
}
