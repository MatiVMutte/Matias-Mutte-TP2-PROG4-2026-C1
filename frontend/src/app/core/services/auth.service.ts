import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { User } from '../models/user.model';
import { LoginPayload, RegisterPayload } from '../../features/auth/models/auth.models';

export type { LoginPayload, RegisterPayload };

export interface AuthResponse {
  token: string;
  user: User;
}

const TOKEN_KEY = 'allutn_token';
const USER_KEY = 'allutn_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly API_URL = 'http://localhost:3001';

  readonly currentUser = signal<User | null>(this.loadUser());

  private loadUser(): User | null {
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? (JSON.parse(raw) as User) : null;
    } catch {
      return null;
    }
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  private saveSession(response: AuthResponse): void {
    localStorage.setItem(TOKEN_KEY, response.token);
    localStorage.setItem(USER_KEY, JSON.stringify(response.user));
    this.currentUser.set(response.user);
  }

  login(payload: LoginPayload): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.API_URL}/auth/login`, payload)
      .pipe(
        tap((res) => this.saveSession(res)),
        catchError(this.handleError),
      );
  }

  register(payload: RegisterPayload): Observable<AuthResponse> {
    const formData = new FormData();
    formData.append('nombre', payload.nombre);
    formData.append('apellido', payload.apellido);
    formData.append('correo', payload.correo);
    formData.append('username', payload.username);
    formData.append('password', payload.password);
    formData.append('fechaNacimiento', payload.fechaNacimiento);
    if (payload.descripcion) formData.append('descripcion', payload.descripcion);
    if (payload.perfil) formData.append('perfil', payload.perfil);
    if (payload.profileImage) formData.append('profileImage', payload.profileImage);

    return this.http
      .post<AuthResponse>(`${this.API_URL}/auth/register`, formData)
      .pipe(
        tap((res) => this.saveSession(res)),
        catchError(this.handleError),
      );
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this.currentUser.set(null);
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let message = 'Ocurrió un error inesperado.';
    if (error.error?.message) {
      message = Array.isArray(error.error.message)
        ? error.error.message.join(', ')
        : error.error.message;
    }
    return throwError(() => new Error(message));
  }
}
