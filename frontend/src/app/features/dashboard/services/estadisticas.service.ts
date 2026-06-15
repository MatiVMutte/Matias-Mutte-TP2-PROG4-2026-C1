import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';

export interface PubPorUsuario {
  usuario: string;
  username: string;
  cantidad: number;
}

export interface ComentPorFecha {
  fecha: string;
  cantidad: number;
}

export interface ComentPorPublicacion {
  titulo: string;
  cantidad: number;
}

@Injectable({ providedIn: 'root' })
export class EstadisticasService {
  private readonly http = inject(HttpClient);
  private readonly API_URL = `${environment.apiUrl}/estadisticas`;

  private buildParams(desde?: string, hasta?: string): HttpParams {
    let params = new HttpParams();
    if (desde) params = params.set('desde', desde);
    if (hasta) params = params.set('hasta', hasta);
    return params;
  }

  publicacionesPorUsuario(desde?: string, hasta?: string): Observable<{ data: PubPorUsuario[] }> {
    return this.http
      .get<{ data: PubPorUsuario[] }>(`${this.API_URL}/publicaciones-por-usuario`, {
        params: this.buildParams(desde, hasta),
      })
      .pipe(catchError(this.handleError));
  }

  comentariosPorFecha(desde?: string, hasta?: string): Observable<{ data: ComentPorFecha[] }> {
    return this.http
      .get<{ data: ComentPorFecha[] }>(`${this.API_URL}/comentarios-por-fecha`, {
        params: this.buildParams(desde, hasta),
      })
      .pipe(catchError(this.handleError));
  }

  comentariosPorPublicacion(desde?: string, hasta?: string): Observable<{ data: ComentPorPublicacion[] }> {
    return this.http
      .get<{ data: ComentPorPublicacion[] }>(`${this.API_URL}/comentarios-por-publicacion`, {
        params: this.buildParams(desde, hasta),
      })
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
