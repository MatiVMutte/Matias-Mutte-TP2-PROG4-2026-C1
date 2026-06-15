import { Component, computed, input } from '@angular/core';
import { ChartItem } from './bar-chart';

interface Slice {
  label: string;
  value: number;
  path: string;
  color: string;
  pct: number;
}

const COLORS = ['#3b82f6', '#60a5fa', '#2563eb', '#93c5fd', '#1d4ed8', '#38bdf8', '#818cf8', '#0ea5e9'];

@Component({
  selector: 'app-pie-chart',
  standalone: true,
  template: `
    @if (data().length === 0) {
      <p class="text-blue-300/60 text-sm text-center py-8">Sin datos para el rango seleccionado.</p>
    } @else {
      <div class="flex flex-col sm:flex-row items-center gap-6">
        <svg viewBox="0 0 100 100" class="w-40 h-40 shrink-0">
          @for (slice of slices(); track slice.label) {
            <path [attr.d]="slice.path" [attr.fill]="slice.color" stroke="#24346b" stroke-width="0.5" />
          }
        </svg>
        <div class="space-y-1.5 flex-1 w-full">
          @for (slice of slices(); track slice.label) {
            <div class="flex items-center gap-2 text-xs">
              <span class="w-3 h-3 rounded-sm shrink-0" [style.background-color]="slice.color"></span>
              <span class="text-blue-100 flex-1 truncate" [title]="slice.label">{{ slice.label }}</span>
              <span class="text-blue-300 font-semibold">{{ slice.value }} ({{ slice.pct }}%)</span>
            </div>
          }
        </div>
      </div>
    }
  `,
})
export class PieChart {
  readonly data = input.required<ChartItem[]>();

  readonly slices = computed<Slice[]>(() => {
    const items = this.data();
    const total = items.reduce((acc, i) => acc + i.value, 0) || 1;
    let cumulative = 0;
    const cx = 50;
    const cy = 50;
    const r = 50;

    return items.map((item, idx) => {
      const startAngle = (cumulative / total) * 2 * Math.PI;
      cumulative += item.value;
      const endAngle = (cumulative / total) * 2 * Math.PI;

      const x1 = cx + r * Math.sin(startAngle);
      const y1 = cy - r * Math.cos(startAngle);
      const x2 = cx + r * Math.sin(endAngle);
      const y2 = cy - r * Math.cos(endAngle);
      const largeArc = endAngle - startAngle > Math.PI ? 1 : 0;

      const path = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`;

      return {
        label: item.label,
        value: item.value,
        path,
        color: COLORS[idx % COLORS.length],
        pct: Math.round((item.value / total) * 100),
      };
    });
  });
}
