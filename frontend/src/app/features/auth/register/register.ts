import { Component, signal, OnInit, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

function passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password');
  const repeatPassword = control.get('repeatPassword');
  if (password && repeatPassword && password.value !== repeatPassword.value) {
    repeatPassword.setErrors({ mismatch: true });
    return { mismatch: true };
  }
  return null;
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
  ],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register implements OnInit {
  private readonly destroyRef = inject(DestroyRef);

  readonly profileImagePreview = signal<string | null>(null);
  readonly isLoading = signal(false);

  readonly passwordChecks = signal({ minLength: false, hasUppercase: false, hasNumber: false });
  readonly showPassword = signal(false);
  readonly showRepeatPassword = signal(false);

  readonly form: FormGroup;

  constructor(private readonly fb: FormBuilder, private readonly router: Router) {
    this.form = this.fb.group(
      {
        nombre: ['', [Validators.required, Validators.minLength(2), Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/)]],
        apellido: ['', [Validators.required, Validators.minLength(2), Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/)]],
        correo: ['', [Validators.required, Validators.email]],
        username: ['', [Validators.required, Validators.minLength(3), Validators.pattern(/^(?=.*[a-zA-Z])[a-zA-Z0-9_]+$/)]],
        password: ['', [Validators.required]],
        repeatPassword: ['', Validators.required],
        fechaNacimiento: [null, Validators.required],
        descripcion: ['', [Validators.maxLength(300)]],
        perfil: ['usuario'],
        profileImage: [null],
      },
      { validators: passwordMatchValidator },
    );
  }

  get descripcionLength(): number {
    return this.form.get('descripcion')?.value?.length ?? 0;
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

  onlyLetters(event: KeyboardEvent): void {
    const char = event.key;
    if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]$/.test(char) && !['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(char)) {
      event.preventDefault();
    }
  }

  onDescripcionInput(event: Event): void {
    const textarea = event.target as HTMLTextAreaElement;
    if (textarea.value.length > 300) {
      textarea.value = textarea.value.substring(0, 300);
      this.form.get('descripcion')?.setValue(textarea.value, { emitEvent: false });
    }
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      this.form.patchValue({ profileImage: file });
      const reader = new FileReader();
      reader.onload = (e) => this.profileImagePreview.set(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  }

  getError(controlName: string): string {
    const control = this.form.get(controlName);
    if (!control || !control.touched) return '';
    if (control.hasError('required')) return 'Este campo es obligatorio.';
    if (control.hasError('email')) return 'Ingresá un correo válido.';
    if (control.hasError('minlength')) {
      const min = control.errors?.['minlength'].requiredLength;
      return `Mínimo ${min} caracteres.`;
    }
    if (control.hasError('pattern')) {
      if (controlName === 'nombre' || controlName === 'apellido') return 'Solo se permiten letras.';
      if (controlName === 'username') return 'Solo letras, números y guion bajo. Debe contener al menos una letra.';
    }
    if (control.hasError('mismatch')) return 'Las contraseñas no coinciden.';
    return '';
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.isLoading.set(true);
    console.log(this.form.value);
  }
}
