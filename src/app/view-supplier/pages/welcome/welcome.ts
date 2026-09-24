import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, ElementRef, inject, PLATFORM_ID, QueryList, ViewChildren, AfterViewInit, OnDestroy } from '@angular/core';
import { Router } from "@angular/router";
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-welcome',
  imports: [CommonModule],
  templateUrl: './welcome.html',
  styleUrl: './welcome.scss',
})
export class Welcome implements AfterViewInit, OnDestroy {
  private platformId = inject(PLATFORM_ID);
  private observer?: IntersectionObserver;
  private router = inject(Router);
  private sectionsSub?: Subscription;

  @ViewChildren('revealSection') sections!: QueryList<ElementRef<HTMLElement>>;

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    this.sectionsSub = this.sections.changes.subscribe(() => {
      this.initObserver();
    });

    this.initObserver();
  }

  private initObserver(): void {
    if (!this.sections || this.sections.length === 0) return;

    this.observer?.disconnect();

    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            this.observer?.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    this.sections.forEach((section) => {
      const el = section.nativeElement;
      
      if (el.classList.contains('is-visible')) return;

      const rect = el.getBoundingClientRect();
      const alreadyVisible = rect.top < window.innerHeight && rect.bottom > 0;

      if (alreadyVisible) {
        el.classList.add('is-visible');
      } else {
        this.observer?.observe(el);
      }
    });
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
    this.sectionsSub?.unsubscribe();
  }

  signIn(): void {
    this.router.navigate(['views/auth/sign-in']);
  }

  loadInvoice(): void {
    this.router.navigate(['views-supplier/load-invoice']);
  }

  recoveryTrack(): void {
    this.router.navigate(['views-supplier/recovery-track']);
  }

  bulkUpload(): void {
    this.router.navigate(['views-supplier/bulk-upload']);
  }
}