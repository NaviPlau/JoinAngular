import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LinksLoginComponent } from './links-login.component';

describe('LinksLoginComponent', () => {
  let component: LinksLoginComponent;
  let fixture: ComponentFixture<LinksLoginComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LinksLoginComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LinksLoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
