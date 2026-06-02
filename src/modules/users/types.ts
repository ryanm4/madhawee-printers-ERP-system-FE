export interface GET_ALL_USER {
  id: number;
  name: string;
  email?: string;
  user_role: string;
  created_on: string;
  updated_on: string;
}

export interface CREATE_USER {
  name: string;
  email?: string;
  user_role: string;
  password: string;
}

export interface EDIT_USER {
  name: string;
  email?: string;
  user_role: string;
}
