import { Injectable, signal, inject } from '@angular/core';
import { AuthService } from './auth.service';

const WARNING_MS = 10 * 60 * 1000; // 10 minutos
const SESSION_MS = 15 * 60 * 1000; // 15 minutos

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
