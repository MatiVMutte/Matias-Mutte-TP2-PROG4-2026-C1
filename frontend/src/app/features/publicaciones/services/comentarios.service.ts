import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ComentariosResponse } from '../models/comentario.model';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ComentariosService {
  private readonly http = inject(HttpClient);
  private readonly API_URL = `${environment.apiUrl}/publicaciones`;

  getByPublicacion(
    publicacionId: string,
    offset = 0,
    limit = 10,
  ): Observable<ComentariosResponse> {
    const params = new HttpParams()
      .set('offset', offset.toString())
      .set('limit', limit.toString());
    return this.http
      .get<ComentariosResponse>(`${this.API_URL}/${publicacionId}/comentarios`, { params })
      .pipe(catchError(this.handleError));
  }

  create(publicacionId: string, mensaje: string): Observable<{ comentario: any }> {
    return this.http
      .post<{ comentario: any }>(`${this.API_URL}/${publicacionId}/comentarios`, { mensaje })
      .pipe(catchError(this.handleError));
  }

  update(publicacionId: string, comentarioId: string, mensaje: string): Observable<{ comentario: any }> {
    return this.http
      .put<{ comentario: any }>(`${this.API_URL}/${publicacionId}/comentarios/${comentarioId}`, { mensaje })
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
