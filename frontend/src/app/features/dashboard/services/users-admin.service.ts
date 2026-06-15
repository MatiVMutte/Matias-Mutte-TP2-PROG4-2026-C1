import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { User } from '../../../core/models/user.model';
import { environment } from '../../../../environments/environment';

export interface CreateUserPayload {
  nombre: string;
  apellido: string;
  correo: string;
  username: string;
  password: string;
  fechaNacimiento: string;
  descripcion?: string;
  perfil: 'usuario' | 'administrador';
  profileImage?: File | null;
}

@Injectable({ providedIn: 'root' })
export class UsersAdminService {
  private readonly http = inject(HttpClient);
  private readonly API_URL = `${environment.apiUrl}/users`;

  getAll(): Observable<{ users: User[]; total: number }> {
    return this.http
      .get<{ users: User[]; total: number }>(this.API_URL)
      .pipe(catchError(this.handleError));
  }

  create(payload: CreateUserPayload): Observable<{ user: User }> {
    const formData = new FormData();
    formData.append('nombre', payload.nombre);
    formData.append('apellido', payload.apellido);
    formData.append('correo', payload.correo);
    formData.append('username', payload.username);
    formData.append('password', payload.password);
    formData.append('fechaNacimiento', payload.fechaNacimiento);
    if (payload.descripcion) formData.append('descripcion', payload.descripcion);
    formData.append('perfil', payload.perfil);
    if (payload.profileImage) formData.append('profileImage', payload.profileImage);

    return this.http
      .post<{ user: User }>(this.API_URL, formData)
      .pipe(catchError(this.handleError));
  }

  deshabilitar(id: string): Observable<{ user: User }> {
    return this.http
      .delete<{ user: User }>(`${this.API_URL}/${id}`)
      .pipe(catchError(this.handleError));
  }

  habilitar(id: string): Observable<{ user: User }> {
    return this.http
      .post<{ user: User }>(`${this.API_URL}/${id}/habilitar`, {})
      .pipe(catchError(this.handleError));
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
