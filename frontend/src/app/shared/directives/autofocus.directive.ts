import { AfterViewInit, booleanAttribute, Directive, ElementRef, inject, input } from '@angular/core';

@Directive({
  selector: '[appAutofocus]',
  standalone: true,
})
export class AutofocusDirective implements AfterViewInit {
  private readonly el = inject(ElementRef<HTMLElement>);

  readonly appAutofocus = input(true, { transform: booleanAttribute });

  ngAfterViewInit(): void {
    if (this.appAutofocus()) {
      setTimeout(() => this.el.nativeElement.focus(), 0);
    }
  }
}
