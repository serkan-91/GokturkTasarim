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
