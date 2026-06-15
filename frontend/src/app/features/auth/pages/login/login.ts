import { Component, signal, inject } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ToastService } from '../../../../shared/services/toast.service';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  readonly isLoading = signal(false);
  readonly showPassword = signal(false);

  private readonly toast = inject(ToastService);
  private readonly title = inject(Title);
  private readonly authService = inject(AuthService);

  readonly form: FormGroup;

  constructor(private readonly fb: FormBuilder, private readonly router: Router) {
    this.title.setTitle('Iniciar sesión | AllUTN');
    this.form = this.fb.group({
      identifier: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required]],
    });
  }

  getError(controlName: string): string {
    const control = this.form.get(controlName);
    if (!control || !control.touched) return '';
    if (control.hasError('required')) return 'Este campo es obligatorio.';
    if (control.hasError('minlength')) {
      const min = control.errors?.['minlength'].requiredLength;
      return `Mínimo ${min} caracteres.`;
    }
    return '';
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.toast.error('Completá todos los campos correctamente.');
      this.form.markAllAsTouched();
      return;
    }
    this.isLoading.set(true);
    this.authService.login(this.form.value).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.toast.success('¡Bienvenido de vuelta!');
        setTimeout(() => this.router.navigate(['/publicaciones']), 800);
      },
      error: (err: Error) => {
        this.isLoading.set(false);
        this.toast.error(err.message);
      },
    });
  }
}
