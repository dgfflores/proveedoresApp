import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoadInvoice } from './load-invoice';

describe('LoadInvoice', () => {
  let component: LoadInvoice;
  let fixture: ComponentFixture<LoadInvoice>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoadInvoice],
    }).compileComponents();

    fixture = TestBed.createComponent(LoadInvoice);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
