import { Injectable, signal, inject } from '@angular/core';
import { AuthService } from './auth.service';

// TESTING MODE: Modal aparece a los 30 segundos
const WARNING_MS = 30 * 1000; // 30 segundos (cambiar a 10 * 60 * 1000 para producción)
const SESSION_MS = 60 * 1000; // 60 segundos (cambiar a 15 * 60 * 1000 para producción)

@Injectable({ providedIn: 'root' })
export class SessionTimerService {
  private readonly authService = inject(AuthService);

  readonly showWarning = signal(false);

  private timerId: ReturnType<typeof setTimeout> | null = null;

  start(): void {
    this.stop();
    this.showWarning.set(false);
    this.timerId = setTimeout(() => {
      this.showWarning.set(true);
    }, WARNING_MS);
  }

  stop(): void {
    if (this.timerId) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
    this.showWarning.set(false);
  }

  extend(): void {
    this.authService.refrescar().subscribe({
      next: () => {
        this.showWarning.set(false);
        this.start();
      },
      error: () => {
        this.showWarning.set(false);
        this.authService.logout();
      },
    });
  }

  dismiss(): void {
    this.showWarning.set(false);
  }
}
