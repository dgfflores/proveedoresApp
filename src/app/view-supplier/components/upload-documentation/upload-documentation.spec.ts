import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UploadDocumentation } from './upload-documentation';

describe('UploadDocumentation', () => {
  let component: UploadDocumentation;
  let fixture: ComponentFixture<UploadDocumentation>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UploadDocumentation],
    }).compileComponents();

    fixture = TestBed.createComponent(UploadDocumentation);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
