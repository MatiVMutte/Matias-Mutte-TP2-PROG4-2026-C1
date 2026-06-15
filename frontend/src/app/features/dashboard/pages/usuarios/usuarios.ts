import { Component, inject, signal, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { User } from '../../../../core/models/user.model';
import { UsersAdminService, CreateUserPayload } from '../../services/users-admin.service';
import { ToastService } from '../../../../shared/services/toast.service';
import { InitialsPipe } from '../../../../shared/pipes/initials.pipe';
import { AutofocusDirective } from '../../../../shared/directives/autofocus.directive';

@Component({
  selector: 'app-dashboard-usuarios',
  standalone: true,
  imports: [ReactiveFormsModule, InitialsPipe, AutofocusDirective],
  templateUrl: './usuarios.html',
})
export class DashboardUsuarios implements OnInit {
  private readonly title = inject(Title);
  private readonly fb = inject(FormBuilder);
  private readonly usersService = inject(UsersAdminService);
  private readonly toast = inject(ToastService);

  readonly users = signal<User[]>([]);
  readonly isLoading = signal(false);
  readonly showModal = signal(false);
  readonly isSubmitting = signal(false);
  readonly profileImage = signal<File | null>(null);

  readonly form = this.fb.group({
    nombre: ['', Validators.required],
    apellido: ['', Validators.required],
    correo: ['', [Validators.required, Validators.email]],
    username: ['', Validators.required],
    password: ['', [Validators.required, Validators.pattern(/^(?=.*[A-Z])(?=.*\d).{8,}$/)]],
    fechaNacimiento: ['', Validators.required],
    descripcion: [''],
    perfil: ['usuario' as 'usuario' | 'administrador', Validators.required],
  });

  ngOnInit(): void {
    this.title.setTitle('Usuarios | AllUTN');
    this.load();
  }

  load(): void {
    this.isLoading.set(true);
    this.usersService.getAll().subscribe({
      next: (res) => {
        this.users.set(res.users);
        this.isLoading.set(false);
      },
      error: (err: Error) => {
        this.toast.error(err.message);
        this.isLoading.set(false);
      },
    });
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.profileImage.set(input.files[0]);
    }
  }

  openModal(): void {
    this.form.reset({ perfil: 'usuario' });
    this.profileImage.set(null);
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.isSubmitting.set(true);
    const payload = { ...this.form.getRawValue(), profileImage: this.profileImage() } as CreateUserPayload;

    this.usersService.create(payload).subscribe({
      next: (res) => {
        this.users.update((list) => [res.user, ...list]);
        this.toast.success('Usuario creado correctamente.');
        this.isSubmitting.set(false);
        this.showModal.set(false);
      },
      error: (err: Error) => {
        this.toast.error(err.message);
        this.isSubmitting.set(false);
      },
    });
  }

  toggleActivo(user: User): void {
    const action$ = user.activo
      ? this.usersService.deshabilitar(user._id)
      : this.usersService.habilitar(user._id);

    action$.subscribe({
      next: (res) => {
        this.users.update((list) => list.map((u) => (u._id === user._id ? res.user : u)));
        this.toast.success(user.activo ? 'Usuario deshabilitado.' : 'Usuario habilitado.');
      },
      error: (err: Error) => this.toast.error(err.message),
    });
  }
}
