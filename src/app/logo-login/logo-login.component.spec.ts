import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LogoLoginComponent } from './logo-login.component';

describe('LogoLoginComponent', () => {
  let component: LogoLoginComponent;
  let fixture: ComponentFixture<LogoLoginComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LogoLoginComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LogoLoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
