import { Component, computed, input } from '@angular/core';
import { ChartItem } from './bar-chart';

@Component({
  selector: 'app-line-chart',
  standalone: true,
  template: `
    @if (data().length === 0) {
      <p class="text-blue-300/60 text-sm text-center py-8">Sin datos para el rango seleccionado.</p>
    } @else {
      <svg [attr.viewBox]="'0 0 ' + width + ' ' + height" class="w-full" preserveAspectRatio="none" style="height: 240px;">
        <!-- grid lines -->
        @for (gl of gridLines(); track gl) {
          <line [attr.x1]="padding" [attr.y1]="gl" [attr.x2]="width - padding" [attr.y2]="gl"
            stroke="rgba(255,255,255,0.08)" stroke-width="1" />
        }
        <!-- area -->
        <polygon [attr.points]="areaPoints()" fill="rgba(59,130,246,0.15)" />
        <!-- line -->
        <polyline [attr.points]="linePoints()" fill="none" stroke="#3b82f6" stroke-width="2"
          stroke-linejoin="round" stroke-linecap="round" />
        <!-- points -->
        @for (p of points(); track p.x) {
          <circle [attr.cx]="p.x" [attr.cy]="p.y" r="3" fill="#60a5fa" />
        }
      </svg>
      <div class="flex justify-between mt-2 px-1">
        @for (item of data(); track item.label) {
          <span class="text-blue-300/70 text-[9px]">{{ item.label }}</span>
        }
      </div>
    }
  `,
})
export class LineChart {
  readonly data = input.required<ChartItem[]>();

  readonly width = 600;
  readonly height = 220;
  readonly padding = 20;

  private readonly max = computed(() => Math.max(...this.data().map((d) => d.value), 1));

  readonly points = computed(() => {
    const items = this.data();
    const n = items.length;
    const innerW = this.width - this.padding * 2;
    const innerH = this.height - this.padding * 2;
    const max = this.max();
    return items.map((item, i) => {
      const x = this.padding + (n === 1 ? innerW / 2 : (innerW * i) / (n - 1));
      const y = this.padding + innerH - (item.value / max) * innerH;
      return { x, y, value: item.value };
    });
  });

  readonly linePoints = computed(() =>
    this.points().map((p) => `${p.x},${p.y}`).join(' '),
  );

  readonly areaPoints = computed(() => {
    const pts = this.points();
    if (pts.length === 0) return '';
    const base = this.height - this.padding;
    const first = pts[0];
    const last = pts[pts.length - 1];
    return `${first.x},${base} ${this.linePoints()} ${last.x},${base}`;
  });

  readonly gridLines = computed(() => {
    const innerH = this.height - this.padding * 2;
    return [0, 0.25, 0.5, 0.75, 1].map((f) => this.padding + innerH * f);
  });
}
