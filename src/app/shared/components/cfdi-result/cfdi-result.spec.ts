import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CfdiResult } from './cfdi-result';

describe('CfdiResult', () => {
  let component: CfdiResult;
  let fixture: ComponentFixture<CfdiResult>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CfdiResult],
    }).compileComponents();

    fixture = TestBed.createComponent(CfdiResult);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
