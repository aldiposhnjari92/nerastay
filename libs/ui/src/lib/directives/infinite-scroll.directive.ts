import { Directive, ElementRef, output, OnInit, OnDestroy, inject } from '@angular/core';

@Directive({
  selector: '[nsInfiniteScroll]'
})
export class InfiniteScrollDirective implements OnInit, OnDestroy {
  readonly scrolled = output();
  private el = inject(ElementRef<HTMLElement>);
  private observer: IntersectionObserver | null = null;

  ngOnInit(): void {
    this.observer = new IntersectionObserver(
      entries => {
        if (entries[0]?.isIntersecting) this.scrolled.emit();
      },
      { threshold: 0.1 }
    );
    this.observer.observe(this.el.nativeElement);
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }
}
