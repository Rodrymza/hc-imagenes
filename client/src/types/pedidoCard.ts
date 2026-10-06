export interface PedidoCardData {
  id: string | number;
  patientName: string;
  dni: string;
  date: string;
  time: string;
  studyType: string;
  studyDescription: string;
  studies?: {
    studyType: string;
    studyDescription: string;
    createdAt?: string;
  }[];
  diagnosis?: string;
  location: string;
  subLocation?: string;
  isUrgent?: boolean;
  hasNotification?: boolean;
  status?: "realizado" | "pendiente";
  createdAt?: string;
  consumoEnviado?: boolean;
}
