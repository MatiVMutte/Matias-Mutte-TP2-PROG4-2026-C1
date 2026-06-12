import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import {
  Publicacion,
  PublicacionesResponse,
  CreatePublicacionPayload,
} from '../models/publicacion.model';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class PublicacionesService {
  private readonly http = inject(HttpClient);
  private readonly API_URL = `${environment.apiUrl}/publicaciones`;

  getAll(
    ordenar: 'fecha' | 'likes' = 'fecha',
    offset = 0,
    limit = 10,
    userId?: string,
  ): Observable<PublicacionesResponse> {
    let params = new HttpParams()
      .set('ordenar', ordenar)
      .set('offset', offset.toString())
      .set('limit', limit.toString());
    if (userId) params = params.set('userId', userId);
    return this.http
      .get<PublicacionesResponse>(this.API_URL, { params })
      .pipe(catchError(this.handleError));
  }

  getById(id: string): Observable<{ publicacion: Publicacion }> {
    return this.http
      .get<{ publicacion: Publicacion }>(`${this.API_URL}/${id}`)
      .pipe(catchError(this.handleError));
  }

  create(payload: CreatePublicacionPayload): Observable<Publicacion> {
    const formData = new FormData();
    formData.append('titulo', payload.titulo);
    formData.append('mensaje', payload.mensaje);
    if (payload.imagen) formData.append('imagen', payload.imagen);
    return this.http
      .post<Publicacion>(this.API_URL, formData)
      .pipe(catchError(this.handleError));
  }

  delete(id: string): Observable<void> {
    return this.http
      .delete<void>(`${this.API_URL}/${id}`)
      .pipe(catchError(this.handleError));
  }

  like(id: string): Observable<{ likes: number }> {
    return this.http
      .post<{ likes: number }>(`${this.API_URL}/${id}/like`, {})
      .pipe(catchError(this.handleError));
  }

  unlike(id: string): Observable<{ likes: number }> {
    return this.http
      .delete<{ likes: number }>(`${this.API_URL}/${id}/like`)
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
