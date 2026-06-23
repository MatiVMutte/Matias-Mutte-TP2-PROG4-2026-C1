import { Component, inject } from '@angular/core';
import { SessionTimerService } from '../../../core/services/session-timer.service';
import { AuthService } from '../../../core/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-session-warning-modal',
  standalone: true,
  templateUrl: './session-warning-modal.html',
})
export class SessionWarningModal {
  readonly timer = inject(SessionTimerService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  onExtend(): void {
    this.timer.extend();
  }

  onDismiss(): void {
    this.timer.dismiss();
    // Cerrar sesión inmediatamente
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
