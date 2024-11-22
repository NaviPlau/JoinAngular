import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OpenedTaskComponent } from './opened-task.component';

describe('OpenedTaskComponent', () => {
  let component: OpenedTaskComponent;
  let fixture: ComponentFixture<OpenedTaskComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OpenedTaskComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OpenedTaskComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
