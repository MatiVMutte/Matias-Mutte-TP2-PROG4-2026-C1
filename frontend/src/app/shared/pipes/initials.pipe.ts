import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'initials',
  standalone: true,
})
export class InitialsPipe implements PipeTransform {
  transform(nombre: string | undefined | null, apellido?: string | null): string {
    const n = (nombre ?? '').trim();
    const a = (apellido ?? '').trim();
    const first = n.charAt(0);
    const second = a.charAt(0) || n.charAt(1);
    return (first + second).toUpperCase() || 'U';
  }
}
