export interface IServiceResponse<T = null> {
  success: boolean;
  message: string;
  data?: T;
}
