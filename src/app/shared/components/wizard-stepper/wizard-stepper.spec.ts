import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WizardStepper } from './wizard-stepper';

describe('WizardStepper', () => {
  let component: WizardStepper;
  let fixture: ComponentFixture<WizardStepper>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WizardStepper],
    }).compileComponents();

    fixture = TestBed.createComponent(WizardStepper);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
