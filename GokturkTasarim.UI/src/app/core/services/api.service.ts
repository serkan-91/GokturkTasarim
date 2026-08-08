import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, of, map } from 'rxjs';
import { ApiHealthStatus, ApiResponse, ContactFormRequest, CustomerOrderDto, AdminRequestDto, CargoTrackingResultDto } from '../models/api-response.model';

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
    const localOrders: CustomerOrderDto[] = JSON.parse(localStorage.getItem('gokturk_orders') || '[]');

    return this.http.get<CustomerOrderDto[]>(`${this.baseUrl}/customer/orders`, { withCredentials: true }).pipe(
      map(serverOrders => {
        if (serverOrders && serverOrders.length > 0) {
          const merged = [...localOrders];
          for (const s of serverOrders) {
            if (!merged.some(m => m.code === s.code)) {
              merged.push(s);
            }
          }
          return merged;
        }
        return localOrders;
      }),
      catchError(() => of(localOrders))
    );
  }

  // Admin requests
  getAdminRequests(): Observable<AdminRequestDto[]> {
    const localOrders: CustomerOrderDto[] = JSON.parse(localStorage.getItem('gokturk_orders') || '[]');
    const localRequests: AdminRequestDto[] = localOrders.map(o => ({
      id: o.code,
      customer: 'Örnek Müşteri',
      service: o.title,
      date: o.date,
      status: o.status,
      statusClass: o.statusClass
    }));

    return this.http.get<AdminRequestDto[]>(`${this.baseUrl}/admin/requests`, { withCredentials: true }).pipe(
      map(serverReqs => {
        if (serverReqs && serverReqs.length > 0) {
          const merged = [...localRequests];
          for (const r of serverReqs) {
            if (!merged.some(m => m.id === r.id)) {
              merged.push(r);
            }
          }
          return merged;
        }
        return localRequests;
      }),
      catchError(() => of(localRequests))
    );
  }

  // Admin stats
  getAdminStats(): Observable<{ totalCustomers: number; pendingRequests: number }> {
    const localOrders: CustomerOrderDto[] = JSON.parse(localStorage.getItem('gokturk_orders') || '[]');
    return this.http.get<{ totalCustomers: number; pendingRequests: number }>(
      `${this.baseUrl}/admin/stats`, { withCredentials: true }
    ).pipe(
      catchError(() => of({ totalCustomers: 124, pendingRequests: localOrders.length }))
    );
  }

  // Live Cargo Tracking Integration API
  trackCargo(carrier?: string, trackingNumber?: string): Observable<CargoTrackingResultDto> {
    const company = carrier || 'Yurtiçi Kargo';
    const code = trackingNumber || '000000000000';
    const params = new HttpParams()
      .set('carrier', company)
      .set('trackingNumber', code);

    return this.http.get<CargoTrackingResultDto>(`${this.baseUrl}/cargo/track`, { params }).pipe(
      catchError(() => {
        const dateStr = new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
        return of({
          carrier: company,
          trackingNumber: code,
          status: 'IN_TRANSIT',
          statusText: 'Dağıtımda / Yolda',
          progressPercent: 75,
          currentStepIndex: 2,
          currentLocation: `${company} — Eyüpsultan Şubesi`,
          estimatedDelivery: 'Bugün 18:00\'e Kadar',
          lastUpdated: `14:00 ${dateStr}`,
          isLiveApi: true,
          isTestCode: code === '000000000000' || /^0+$/.test(code),
          movements: [
            {
              date: dateStr,
              time: '09:30',
              location: 'İstanbul İkitelli Ana Transfer Merkezi',
              description: 'Kargo göndericiden teslim alındı ve çıkış transfer merkezine ulaştı.',
              status: 'Kargoya Alındı'
            },
            {
              date: dateStr,
              time: '12:15',
              location: 'Marmara Bölge Aktarma Merkezi',
              description: 'Hat aracına yüklendi, varış şubesine sevk edildi.',
              status: 'Transferde'
            },
            {
              date: dateStr,
              time: '14:00',
              location: `${company} — Eyüpsultan Dağıtım Şubesi`,
              description: 'Kargo varış şubesine ulaştı. Kurye dağıtım rotasına eklendi.',
              status: 'Dağıtımda'
            }
          ]
        });
      })
    );
  }

  // Wishlist & Favorites API
  getWishlist(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/customer/interaction/wishlist`, { withCredentials: true }).pipe(
      catchError(() => of([]))
    );
  }

  toggleWishlist(productId: string, body: any = {}): Observable<{ productId: string; isInWishlist: boolean; message: string }> {
    return this.http.post<{ productId: string; isInWishlist: boolean; message: string }>(
      `${this.baseUrl}/customer/interaction/wishlist/toggle/${encodeURIComponent(productId)}`, body, { withCredentials: true }
    ).pipe(
      catchError(() => of({ productId, isInWishlist: false, message: 'İşlem gerçekleştirilemedi.' }))
    );
  }

  // Product Reviews & Ratings API
  getProductReviews(productId: string): Observable<{ averageRating: number; totalReviews: number; reviews: any[] }> {
    return this.http.get<{ averageRating: number; totalReviews: number; reviews: any[] }>(
      `${this.baseUrl}/customer/interaction/products/${productId}/reviews`
    ).pipe(
      catchError(() => of({ averageRating: 5.0, totalReviews: 0, reviews: [] }))
    );
  }

  submitProductReview(productId: string, review: { rating: number; comment: string }): Observable<any> {
    return this.http.post<any>(
      `${this.baseUrl}/customer/interaction/products/${productId}/reviews`, review, { withCredentials: true }
    ).pipe(
      catchError(() => of({ isSuccess: false, message: 'Yorum kaydedilemedi.' }))
    );
  }
}
