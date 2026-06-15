import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { EstadisticasService } from '../../services/estadisticas.service';
import { ToastService } from '../../../../shared/services/toast.service';
import { BarChart, ChartItem } from '../../../../shared/components/charts/bar-chart';
import { LineChart } from '../../../../shared/components/charts/line-chart';
import { PieChart } from '../../../../shared/components/charts/pie-chart';

@Component({
  selector: 'app-dashboard-estadisticas',
  standalone: true,
  imports: [FormsModule, BarChart, LineChart, PieChart],
  templateUrl: './estadisticas.html',
})
export class DashboardEstadisticas implements OnInit {
  private readonly title = inject(Title);
  private readonly estadisticasService = inject(EstadisticasService);
  private readonly toast = inject(ToastService);

  readonly desde = signal('');
  readonly hasta = signal('');
  readonly isLoading = signal(false);

  readonly pubPorUsuario = signal<ChartItem[]>([]);
  readonly comentPorFecha = signal<ChartItem[]>([]);
  readonly comentPorPublicacion = signal<ChartItem[]>([]);

  ngOnInit(): void {
    this.title.setTitle('Estadísticas | AllUTN');
    this.cargar();
  }

  cargar(): void {
    this.isLoading.set(true);
    const desde = this.desde() || undefined;
    const hasta = this.hasta() || undefined;

    this.estadisticasService.publicacionesPorUsuario(desde, hasta).subscribe({
      next: (res) =>
        this.pubPorUsuario.set(
          res.data.map((d) => ({ label: d.usuario || d.username || 'Sin nombre', value: d.cantidad })),
        ),
      error: (err: Error) => this.toast.error(err.message),
    });

    this.estadisticasService.comentariosPorFecha(desde, hasta).subscribe({
      next: (res) =>
        this.comentPorFecha.set(res.data.map((d) => ({ label: d.fecha, value: d.cantidad }))),
      error: (err: Error) => this.toast.error(err.message),
    });

    this.estadisticasService.comentariosPorPublicacion(desde, hasta).subscribe({
      next: (res) => {
        this.comentPorPublicacion.set(
          res.data.map((d) => ({ label: d.titulo || 'Sin título', value: d.cantidad })),
        );
        this.isLoading.set(false);
      },
      error: (err: Error) => {
        this.toast.error(err.message);
        this.isLoading.set(false);
      },
    });
  }

  limpiar(): void {
    this.desde.set('');
    this.hasta.set('');
    this.cargar();
  }
}
