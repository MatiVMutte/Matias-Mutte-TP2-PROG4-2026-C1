import { Component, inject, effect } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Toast } from './shared/components/toast/toast';
import { SessionWarningModal } from './shared/components/session-warning-modal/session-warning-modal';
import { SessionTimerService } from './core/services/session-timer.service';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Toast, SessionWarningModal],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  private readonly timer = inject(SessionTimerService);
  private readonly auth = inject(AuthService);

  constructor() {
    effect(() => {
      const user = this.auth.currentUser();
      if (user) {
        this.timer.start();
      } else {
        this.timer.stop();
      }
    });
  }
}
