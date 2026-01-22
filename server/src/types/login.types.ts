export interface ILoginResponse {
  token: string | null;
  success: boolean;
  message: string;
}

export interface IloginRequest {
  username: string;
  password: string;
}
