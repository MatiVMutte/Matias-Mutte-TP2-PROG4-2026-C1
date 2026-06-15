import { Component, computed, input } from '@angular/core';

export interface ChartItem {
  label: string;
  value: number;
}

@Component({
  selector: 'app-bar-chart',
  standalone: true,
  template: `
    @if (data().length === 0) {
      <p class="text-blue-300/60 text-sm text-center py-8">Sin datos para el rango seleccionado.</p>
    } @else {
      <div class="space-y-2.5">
        @for (item of rows(); track item.label) {
          <div class="flex items-center gap-3">
            <span class="text-blue-200 text-xs w-28 truncate text-right shrink-0" [title]="item.label">{{ item.label }}</span>
            <div class="flex-1 bg-white/5 rounded-lg overflow-hidden h-6">
              <div class="h-full bg-blue-500 rounded-lg flex items-center justify-end px-2 transition-all"
                [style.width.%]="item.pct">
                <span class="text-white text-[10px] font-semibold">{{ item.value }}</span>
              </div>
            </div>
          </div>
        }
      </div>
    }
  `,
})
export class BarChart {
  readonly data = input.required<ChartItem[]>();

  readonly rows = computed(() => {
    const items = this.data();
    const max = Math.max(...items.map((i) => i.value), 1);
    return items.map((i) => ({ ...i, pct: Math.max((i.value / max) * 100, 4) }));
  });
}
