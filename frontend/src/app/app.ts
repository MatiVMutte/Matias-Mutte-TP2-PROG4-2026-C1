import { Component, inject, effect, signal } from '@angular/core';
import {
  RouterOutlet,
  Router,
  NavigationEnd,
  NavigationCancel,
  NavigationError,
} from '@angular/router';
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
  private readonly router = inject(Router);

  readonly initializing = signal(true);

  constructor() {
    effect(() => {
      const user = this.auth.currentUser();
      if (user) {
        this.timer.start();
      } else {
        this.timer.stop();
      }
    });

    const sub = this.router.events.subscribe((event) => {
      if (
        event instanceof NavigationEnd ||
        event instanceof NavigationCancel ||
        event instanceof NavigationError
      ) {
        this.initializing.set(false);
        sub.unsubscribe();
      }
    });
  }
}
