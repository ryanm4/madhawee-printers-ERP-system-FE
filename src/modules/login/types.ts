import { GET_ALL_USER } from "@/modules/users/types";

export interface LoginForm {
  name: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: GET_ALL_USER;
}
