import { Component, inject } from '@angular/core';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  template: `
    <div class="fixed top-5 right-5 z-50 flex flex-col gap-3 pointer-events-none">
      @for (toast of toastService.toasts(); track toast.id) {
        <div
          class="pointer-events-auto flex items-start gap-3 px-4 py-3 rounded-2xl shadow-xl border text-sm font-medium max-w-sm animate-slide-in"
          [class]="toastClasses(toast.type)">
          <span class="text-lg leading-none mt-0.5">{{ toastIcon(toast.type) }}</span>
          <span class="flex-1">{{ toast.message }}</span>
          <button (click)="toastService.dismiss(toast.id)"
            class="opacity-60 hover:opacity-100 transition text-lg leading-none">✕</button>
        </div>
      }
    </div>
  `,
  styles: [`
    @keyframes slide-in {
      from { opacity: 0; transform: translateX(2rem); }
      to   { opacity: 1; transform: translateX(0); }
    }
    .animate-slide-in { animation: slide-in 0.25s ease-out; }
  `],
})
export class Toast {
  readonly toastService = inject(ToastService);

  toastClasses(type: string): string {
    const base = 'bg-white/10 backdrop-blur-md border ';
    if (type === 'success') return base + 'border-green-400/40 text-green-200';
    if (type === 'error')   return base + 'border-red-400/40 text-red-200';
    return base + 'border-blue-400/40 text-blue-100';
  }

  toastIcon(type: string): string {
    if (type === 'success') return '✅';
    if (type === 'error')   return '❌';
    return 'ℹ️';
  }
}
