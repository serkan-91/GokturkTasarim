export interface ApiResponse<T> {
  data: T;
  isSuccess: boolean;
  message: string;
  errors?: string[];
  timestamp: string;
}

export interface ApiHealthStatus {
  status: string;
  environment: string;
  version: string;
  databaseConnected: boolean;
  serverTime: string;
}

export interface ContactFormRequest {
  name: string;
  phone?: string;
  email: string;
  company?: string;
  service?: string;
  message?: string;
}

export interface CustomerOrderDto {
  id: string;
  title: string;
  code: string;
  date: string;
  status: string;
  statusClass: string;
}

export interface AdminRequestDto {
  id: string;
  customer: string;
  service: string;
  date: string;
  status: string;
  statusClass: string;
}
