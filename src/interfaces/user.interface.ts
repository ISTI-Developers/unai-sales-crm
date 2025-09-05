import React, { ChangeEvent, FormEvent } from "react";
import { DefaultResponse, List } from ".";
import { Row } from "@tanstack/react-table";
import { Company } from "./company.interface";

export interface User {
  [key: string]:
    | number
    | string
    | Company
    | SalesUnitSummary
    | Role
    | undefined
    | null;
  ID: number | string;
  first_name: string;
  middle_name: string;
  last_name: string;
  email_address: string;
  username: string;
  password?: string;
  company: Company | null;
  sales_unit: SalesUnitSummary | null;
  role: Role;
  status?: string;
  image?: string;
  token?: string;
}
export interface OnlineUser {
  ID: number;
  first_name: string;
  last_name: string;
  last_online: string;
}
export interface UserTable {
  ID: number;
  user: string;
  company: string | null;
  sales_unit: string | null;
  role: string;
  status: string;
}

export interface Permissions {
  m_id: number;
  name: string;
  permissions: number[];
  status: string;
}

export interface Role {
  role_id: number;
  name: string;
  description?: string;
  status_id?: number;
  status?: string;
  access: Permissions[];
}

export interface RoleTypes {
  role: Role[] | null;
  roles: Role[] | null;
  modules: Modules[] | null;
  roleOptions: List[] | [];
  currentUserRole: Role | null;
  setRole: React.Dispatch<React.SetStateAction<Role[] | null>>;
  forceReload: () => void;
  toggleModule: (module: Modules, status: number) => Promise<DefaultResponse>;
  insertModule: (module_name: string) => Promise<DefaultResponse>;
  manageRole: (role: Role, status: number) => Promise<DefaultResponse>;
  insertRole: (role: Role) => Promise<DefaultResponse>;
  updateRolePermissions: (role: Role) => Promise<DefaultResponse>;
  getPermission: (
    module: string,
    permission: "VIEW" | "ADD" | "EDIT" | "DELETE"
  ) => number[];
}

export interface Modules {
  m_id: number;
  name: string;
  status_id?: number;
  status: string;
}

export interface UserFormProps {
  user: User;
  roles?: List[];
  setUser?: (value: React.SetStateAction<User>) => void;
  onSubmit?: (e: FormEvent<HTMLFormElement>) => Promise<void>;
  onInputChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  loading?: boolean;
  isReady?: boolean;
  isEditable?: boolean;
}

export interface RoleEditorProps {
  row: Row<UserTable>;
}

export interface UserTypes {
  users: User[] | null;
  setUsers: React.Dispatch<React.SetStateAction<User[] | null>>;
  getResponseFromUserParamType: (
    type: string,
    id?: string,
    paramLabel?: string
  ) => Promise<unknown>;
  insertUser: (user: User) => Promise<DefaultResponse>;
  changePassword: (user: User, password: string) => Promise<DefaultResponse>;
  changeRole: (
    id: string,
    user: string,
    role: string,
    name: string
  ) => Promise<DefaultResponse>;
  forceReload: () => void;
  updateUser: (id: string, user: User) => Promise<DefaultResponse>;
  updateUserStatus: (
    user: UserTable,
    status: number
  ) => Promise<DefaultResponse>;
  deleteUser: (user: UserTable) => Promise<DefaultResponse>;
}

export interface SalesUnitMember {
  full_name: string;
  user_id?: number;
  sales_unit_name?: string;
  role?: number;
}
export interface UnitBase {
  sales_unit_id: number | null;
  sales_unit_name: string;
}

export interface SalesGroup extends UnitBase {
  company_id: number;
  sales_unit_head: SalesUnitMember | null;
  sales_unit_members: SalesUnitMember[] | null;
}
export interface UnitHead {
  id: string;
  name: string;
}

export interface SalesUnit {
  temp_id: string;
  unit_name: string;
  unit_head: UnitHead;
  unit_members: List[];
}
export interface SalesUnitSummary {
  sales_unit_id: number;
  unit_name: string;
}

export interface SalesUnitResponse {
  sales_unit_id: number;
  unit_name: string;
  company_id: number;
  unit_head_id: number;
}

export interface AvailableUnits {
  user_id: number;
  first_name: string;
  last_name: string;
  role_id: number;
}
