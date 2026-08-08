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
    this.checkCurrentUser().subscribe();
  }

  // Check auth status on app start (reads HttpOnly cookie via /api/auth/me)
  checkCurrentUser(): Observable<User | null> {
    return this.http.get<User>(`${this.apiUrl}/me`, { withCredentials: true }).pipe(
      tap(user => this.currentUser.set(user)),
      catchError(() => {
        this.currentUser.set(null);
        return of(null);
      })
    );
  }

  login(credentials: LoginRequest): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/login`, credentials, { withCredentials: true }).pipe(
      tap(user => {
        this.currentUser.set(user);
        const targetRoute = user.role === 'Admin' ? '/admin' : '/customer';
        this.router.navigate([targetRoute]);
      })
    );
  }

  register(data: RegisterRequest): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(`${this.apiUrl}/register`, data, { withCredentials: true });
  }

  refreshToken(): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/refresh-token`, {}, { withCredentials: true }).pipe(
      tap(user => this.currentUser.set(user)),
      catchError(err => {
        this.currentUser.set(null);
        return throwError(() => err);
      })
    );
  }

  logout(): void {
    this.http.post(`${this.apiUrl}/logout`, {}, { withCredentials: true }).subscribe({
      next: () => this.finalizeLogout(),
      error: () => this.finalizeLogout()
    });
  }

  private finalizeLogout(): void {
    this.currentUser.set(null);
    this.router.navigate(['/login']);
  }
}
