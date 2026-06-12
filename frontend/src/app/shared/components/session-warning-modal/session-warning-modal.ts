import { Component, inject } from '@angular/core';
import { SessionTimerService } from '../../../core/services/session-timer.service';

@Component({
  selector: 'app-session-warning-modal',
  standalone: true,
  templateUrl: './session-warning-modal.html',
})
export class SessionWarningModal {
  readonly timer = inject(SessionTimerService);

  onExtend(): void {
    this.timer.extend();
  }

  onDismiss(): void {
    this.timer.dismiss();
  }
}
