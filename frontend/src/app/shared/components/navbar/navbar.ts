import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { signal } from '@angular/core';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navbar.html',
})
export class Navbar {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly currentUser = this.authService.currentUser;
  readonly showLogoutModal = signal(false);

  logout(): void {
    this.showLogoutModal.set(true);
  }

  confirmLogout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
    this.showLogoutModal.set(false);
  }

  cancelLogout(): void {
    this.showLogoutModal.set(false);
  }
}
