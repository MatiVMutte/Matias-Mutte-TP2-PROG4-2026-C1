import { Component, signal, OnInit, DestroyRef, inject } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
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
export class Login implements OnInit {
  private readonly destroyRef = inject(DestroyRef);

  readonly isLoading = signal(false);
  readonly showPassword = signal(false);
  readonly passwordChecks = signal({ minLength: false, hasUppercase: false, hasNumber: false });

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

  ngOnInit(): void {
    this.form.get('password')!.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((val: string) => {
        this.passwordChecks.set({
          minLength: val.length >= 8,
          hasUppercase: /[A-Z]/.test(val),
          hasNumber: /[0-9]/.test(val),
        });
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

  get passwordValid(): boolean {
    const checks = this.passwordChecks();
    return checks.minLength && checks.hasUppercase && checks.hasNumber;
  }

  onSubmit(): void {
    if (!this.passwordValid) {
      this.toast.error('La contraseña no cumple los requisitos.');
      this.form.markAllAsTouched();
      return;
    }
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
