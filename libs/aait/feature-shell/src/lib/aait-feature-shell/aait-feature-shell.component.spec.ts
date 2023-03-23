import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AaitFeatureShellComponent } from './aait-feature-shell.component';

describe('AaitFeatureShellComponent', () => {
  let component: AaitFeatureShellComponent;
  let fixture: ComponentFixture<AaitFeatureShellComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AaitFeatureShellComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AaitFeatureShellComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
