import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, of } from 'rxjs';
import { ApiHealthStatus, ApiResponse, ContactFormRequest, CustomerOrderDto, AdminRequestDto } from '../models/api-response.model';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private http = inject(HttpClient);
  private readonly baseUrl = '/api';

  get<T>(endpoint: string, params?: HttpParams): Observable<T> {
    return this.http.get<T>(`${this.baseUrl}/${endpoint}`, { params });
  }

  post<T>(endpoint: string, body: any): Observable<T> {
    return this.http.post<T>(`${this.baseUrl}/${endpoint}`, body);
  }

  put<T>(endpoint: string, body: any): Observable<T> {
    return this.http.put<T>(`${this.baseUrl}/${endpoint}`, body);
  }

  delete<T>(endpoint: string): Observable<T> {
    return this.http.delete<T>(`${this.baseUrl}/${endpoint}`);
  }

  checkHealth(): Observable<ApiHealthStatus> {
    return this.http.get<ApiHealthStatus>(`${this.baseUrl}/health`).pipe(
      catchError(() => of({
        status: 'Offline',
        environment: 'Development',
        version: '1.0.0',
        databaseConnected: false,
        serverTime: new Date().toISOString()
      }))
    );
  }

  // Contact form submission
  submitContactForm(form: ContactFormRequest): Observable<ApiResponse<null>> {
    return this.http.post<ApiResponse<null>>(`${this.baseUrl}/contact`, form).pipe(
      catchError(() => of({
        data: null,
        isSuccess: false,
        message: 'Bağlantı hatası. Lütfen daha sonra tekrar deneyin.',
        timestamp: new Date().toISOString()
      }))
    );
  }

  // Customer orders
  getCustomerOrders(): Observable<CustomerOrderDto[]> {
    return this.http.get<CustomerOrderDto[]>(`${this.baseUrl}/customer/orders`, { withCredentials: true }).pipe(
      catchError(() => of([]))
    );
  }

  // Admin requests
  getAdminRequests(): Observable<AdminRequestDto[]> {
    return this.http.get<AdminRequestDto[]>(`${this.baseUrl}/admin/requests`, { withCredentials: true }).pipe(
      catchError(() => of([]))
    );
  }

  // Admin stats
  getAdminStats(): Observable<{ totalCustomers: number; pendingRequests: number }> {
    return this.http.get<{ totalCustomers: number; pendingRequests: number }>(
      `${this.baseUrl}/admin/stats`, { withCredentials: true }
    ).pipe(
      catchError(() => of({ totalCustomers: 0, pendingRequests: 0 }))
    );
  }
}
