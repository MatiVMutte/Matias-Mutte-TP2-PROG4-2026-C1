import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Navbar } from '../navbar/navbar';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, Navbar],
  template: `
    <div class="min-h-screen" style="background: linear-gradient(135deg, #0d1b3e 0%, #24346b 40%, #1e3a5f 100%);">
      <app-navbar />
      <router-outlet />
    </div>
  `,
})
export class MainLayout {}
