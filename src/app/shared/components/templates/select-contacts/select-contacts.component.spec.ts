import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectContactsComponent } from './select-contacts.component';

describe('SelectContactsComponent', () => {
  let component: SelectContactsComponent;
  let fixture: ComponentFixture<SelectContactsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SelectContactsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SelectContactsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
