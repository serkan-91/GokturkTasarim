import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, of, throwError } from 'rxjs';
import { User, UserRole, LoginRequest } from '../models/user.model';

export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
  phone?: string;
}

export interface RegisterResponse {
  message: string;
  verificationUrl?: string;
  emailHtmlPreview?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private readonly apiUrl = '/api/auth';

  currentUser = signal<User | null>(null);
  userRole = computed<UserRole>(() => this.currentUser()?.role || 'Guest');
  isLoggedIn = computed<boolean>(() => this.currentUser() !== null);
  isAdmin = computed<boolean>(() => this.currentUser()?.role === 'Admin');

  constructor() {
    const savedUser = localStorage.getItem('gokturk_user');
    if (savedUser) {
      try {
        this.currentUser.set(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem('gokturk_user');
      }
    }
    this.checkCurrentUser().subscribe();
  }

  // Check auth status on app start (reads HttpOnly cookie via /api/auth/me)
  checkCurrentUser(): Observable<User | null> {
    return this.http.get<User>(`${this.apiUrl}/me`, { withCredentials: true }).pipe(
      tap(user => {
        if (user) {
          this.currentUser.set(user);
          localStorage.setItem('gokturk_user', JSON.stringify(user));
        }
      }),
      catchError(() => {
        // Keep existing stored user in dev/local mode if backend fails
        const current = this.currentUser();
        if (!current) {
          this.currentUser.set(null);
        }
        return of(this.currentUser());
      })
    );
  }

  login(credentials: LoginRequest): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/login`, credentials, { withCredentials: true }).pipe(
      tap(user => {
        this.currentUser.set(user);
        localStorage.setItem('gokturk_user', JSON.stringify(user));
        const targetRoute = user.role === 'Admin' ? '/admin' : '/customer';
        this.router.navigate([targetRoute]);
      }),
      catchError(err => {
        // Fallback for dev mode
        const isDev = location.hostname === 'localhost' || location.hostname === '127.0.0.1';
        if (isDev) {
          const role: UserRole = credentials.email.includes('admin') ? 'Admin' : 'Customer';
          const mockUser: User = {
            id: role === 'Admin' ? '00000000-0000-0000-0000-000000000099' : '00000000-0000-0000-0000-000000000001',
            fullName: role === 'Admin' ? 'Yönetici Admin' : 'Örnek Müşteri',
            email: credentials.email,
            role: role,
            phone: '0532 518 22 34'
          };
          this.currentUser.set(mockUser);
          localStorage.setItem('gokturk_user', JSON.stringify(mockUser));
          const targetRoute = role === 'Admin' ? '/admin' : '/customer';
          this.router.navigate([targetRoute]);
          return of(mockUser);
        }
        return throwError(() => err);
      })
    );
  }

  register(data: RegisterRequest): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(`${this.apiUrl}/register`, data, { withCredentials: true });
  }

  refreshToken(): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/refresh-token`, {}, { withCredentials: true }).pipe(
      tap(user => {
        this.currentUser.set(user);
        localStorage.setItem('gokturk_user', JSON.stringify(user));
      }),
      catchError(err => {
        return throwError(() => err);
      })
    );
  }

  updateUserProfile(updatedData: Partial<User>): User | null {
    const current = this.currentUser();
    if (!current) return null;

    const updatedUser: User = {
      ...current,
      ...updatedData
    };

    this.currentUser.set(updatedUser);
    localStorage.setItem('gokturk_user', JSON.stringify(updatedUser));
    return updatedUser;
  }

  logout(): void {
    this.http.post(`${this.apiUrl}/logout`, {}, { withCredentials: true }).subscribe({
      next: () => this.finalizeLogout(),
      error: () => this.finalizeLogout()
    });
  }

  private finalizeLogout(): void {
    localStorage.removeItem('gokturk_user');
    this.currentUser.set(null);
    this.router.navigate(['/login']);
  }
}
