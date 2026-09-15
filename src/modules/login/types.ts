import { GET_ALL_USER } from "@/modules/users/types";

export interface LoginForm {
  name: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  token?: string; // Legacy fallback
  user: GET_ALL_USER;
  message?: string;
}
