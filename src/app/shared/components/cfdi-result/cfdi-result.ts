import { Component, computed, effect, ElementRef, input, output, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CfdiInfo } from '../../interfaces/status-view-invoice-interface';
import JsBarcode from 'jsbarcode';

interface BarcodeBar {
  x: number;
  width: number;
}

@Component({
  selector: 'app-cfdi-result',
  imports: [CommonModule],
  templateUrl: './cfdi-result.html',
  styleUrl: './cfdi-result.scss',
})
export class CfdiResult {
  public trackId = input.required<string>();
  public division = input<string | null>(null);
  public cfdiInfo = input<CfdiInfo | null>(null);
  public successMessage = input<string>('El CFDI fue procesado correctamente. Se ha generado el siguiente Track ID:');

  public download = output<void>();
  private readonly barcodeEl = viewChild<ElementRef<SVGSVGElement>>('barcode');

  constructor() {
    effect(() => {
      const el = this.barcodeEl()?.nativeElement;
      const value = this.trackId();
      if (!el || !value) return;

      JsBarcode(el, value, {
        format: 'CODE39',
        width: 1,
        height: 40,
        displayValue: false,
        margin: 0,
      });
    });
  }

  public barcodeBars = computed<BarcodeBar[]>(() => {
    const value = this.trackId() ?? '';
    const bars: BarcodeBar[] = [];
    let x = 0;
    const gap = 2;
    for (const char of value) {
      const code = char.charCodeAt(0);
      const width = (code % 4) + 1;
      bars.push({ x, width });
      x += width + gap;
    }
    return bars;
  });

  public barcodeWidth = computed<number>(() => {
    const bars = this.barcodeBars();
    if (!bars.length) return 0;
    const last = bars[bars.length - 1];
    return last.x + last.width;
  });

  copyTrackId(): void {
    navigator.clipboard?.writeText(this.trackId());
  }

  onDownload(): void {
    this.download.emit();
  }
}