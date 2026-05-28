import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { User } from '../models/user.model';
import { LoginPayload, RegisterPayload } from '../../features/auth/models/auth.models';

export type { LoginPayload, RegisterPayload };

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);

  private readonly API_URL = 'http://localhost:3001';

  readonly currentUser = signal<User | null>(null);

  login(payload: LoginPayload): Observable<User> {
    return this.http
      .post<User>(`${this.API_URL}/auth/login`, payload)
      .pipe(
        tap((user) => this.currentUser.set(user)),
        catchError(this.handleError),
      );
  }

  register(payload: RegisterPayload): Observable<User> {
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
      .post<User>(`${this.API_URL}/auth/register`, formData)
      .pipe(catchError(this.handleError));
  }

  logout(): void {
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
