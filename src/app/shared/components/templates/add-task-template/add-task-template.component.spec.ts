import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddTaskTemplateComponent } from './add-task-template.component';

describe('AddTaskTemplateComponent', () => {
  let component: AddTaskTemplateComponent;
  let fixture: ComponentFixture<AddTaskTemplateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddTaskTemplateComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddTaskTemplateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
