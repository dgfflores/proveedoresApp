import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecoveryTrack } from './recovery-track';

describe('RecoveryTrack', () => {
  let component: RecoveryTrack;
  let fixture: ComponentFixture<RecoveryTrack>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecoveryTrack],
    }).compileComponents();

    fixture = TestBed.createComponent(RecoveryTrack);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
