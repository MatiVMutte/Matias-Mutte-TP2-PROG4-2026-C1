import { Component, output, signal, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PublicacionesService } from '../../services/publicaciones.service';
import { ToastService } from '../../../../shared/services/toast.service';
import { Publicacion } from '../../models/publicacion.model';

@Component({
  selector: 'app-nueva-publicacion-modal',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './nueva-publicacion-modal.html',
})
export class NuevaPublicacionModal {
  private readonly fb = inject(FormBuilder);
  private readonly publicacionesService = inject(PublicacionesService);
  private readonly toast = inject(ToastService);

  readonly onCreated = output<Publicacion>();
  readonly onClose = output<void>();

  readonly isLoading = signal(false);
  readonly imagePreview = signal<string | null>(null);
  readonly selectedFile = signal<File | null>(null);

  readonly form: FormGroup = this.fb.group({
    titulo: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
    mensaje: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(1000)]],
  });

  get tituloLength(): number { return this.form.get('titulo')?.value?.length ?? 0; }
  get mensajeLength(): number { return this.form.get('mensaje')?.value?.length ?? 0; }

  getError(controlName: string): string {
    const control = this.form.get(controlName);
    if (!control || !control.touched) return '';
    if (control.hasError('required')) return 'Este campo es obligatorio.';
    if (control.hasError('minlength')) {
      return `Mínimo ${control.errors?.['minlength'].requiredLength} caracteres.`;
    }
    if (control.hasError('maxlength')) {
      return `Máximo ${control.errors?.['maxlength'].requiredLength} caracteres.`;
    }
    return '';
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.[0]) {
      const file = input.files[0];
      this.selectedFile.set(file);
      const reader = new FileReader();
      reader.onload = (e) => this.imagePreview.set(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  }

  removeImage(): void {
    this.selectedFile.set(null);
    this.imagePreview.set(null);
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.toast.error('Completá todos los campos correctamente.');
      return;
    }
    this.isLoading.set(true);
    this.publicacionesService.create({
      titulo: this.form.value.titulo,
      mensaje: this.form.value.mensaje,
      imagen: this.selectedFile(),
    }).subscribe({
      next: (pub) => {
        this.isLoading.set(false);
        this.toast.success('Publicación creada.');
        this.onCreated.emit(pub);
      },
      error: (err: Error) => {
        this.isLoading.set(false);
        this.toast.error(err.message);
      },
    });
  }

  close(): void {
    this.onClose.emit();
  }
}
