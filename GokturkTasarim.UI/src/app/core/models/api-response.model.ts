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

export interface OrderItemDto {
  id?: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice?: number;
  imageUrl?: string;
  isReviewed?: boolean;
  userRating?: number;
}

export interface CustomerOrderDto {
  id: string;
  title: string;
  code: string;
  date: string;
  status: string;
  statusClass: string;
  totalAmount?: number;
  paymentMethod?: string;
  shippingAddress?: string;
  carrier?: string;
  trackingNumber?: string;
  shippingNote?: string;
  shippedDate?: string;
  cancellationReason?: string;
  cancellationNote?: string;
  items?: OrderItemDto[];
}

export interface AdminRequestDto {
  id: string;
  customer: string;
  service: string;
  date: string;
  status: string;
  statusClass: string;
  carrier?: string;
  trackingNumber?: string;
  shippingNote?: string;
  shippedDate?: string;
  cancellationReason?: string;
  cancellationNote?: string;
}

export interface CargoMovementDto {
  date: string;
  time: string;
  location: string;
  description: string;
  status: string;
}

export interface CargoTrackingResultDto {
  carrier: string;
  trackingNumber: string;
  status: string;
  statusText: string;
  progressPercent: number;
  currentStepIndex: number;
  currentLocation: string;
  estimatedDelivery: string;
  lastUpdated: string;
  isLiveApi: boolean;
  isTestCode: boolean;
  movements: CargoMovementDto[];
}
