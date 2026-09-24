import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface WizardStepDef {
  label: string;
} 

@Component({
  selector: 'app-wizard-stepper',
  imports: [CommonModule],
  templateUrl: './wizard-stepper.html',
  styleUrl: './wizard-stepper.scss',
})
export class WizardStepper {
  public steps = input.required<WizardStepDef[]>();
  public current = input.required<number>();

  public stepClick = output<number>();

  isActive(index: number): boolean {
    return this.current() === index + 1;
  }

  isComplete(index: number): boolean {
    return this.current() > index + 1;
  }

  trackFillWidth(index: number): number {
    return this.current() > index + 1 ? 100 : 0;
  }

  onStepClick(index: number): void {
    this.stepClick.emit(index + 1);
  }
}