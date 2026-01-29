import { AxiosError } from "axios";

export function getErrorMessage(err: unknown): string {
  if (err instanceof AxiosError && err.response?.data) {
    return (
      err.response.data.detail ||
      err.response.data.message ||
      "Error desconocido"
    );
  }
  if (err instanceof Error && err.message) {
    return err.message;
  }

  return "Ocurrió un error inesperado";
}
