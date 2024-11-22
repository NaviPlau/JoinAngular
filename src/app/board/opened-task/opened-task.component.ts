import { Component, ElementRef, EventEmitter, HostListener, input, Input, Output, Renderer2, ViewChild } from '@angular/core';
import { Task } from '../../shared/interfaces/task';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../material/material.module';
import { FormsModule } from '@angular/forms';
import { SelectContactsComponent } from "../../shared/components/templates/select-contacts/select-contacts.component";

@Component({
    selector: 'app-opened-task',
    imports: [CommonModule, MaterialModule, FormsModule, SelectContactsComponent],
    templateUrl: './opened-task.component.html',
    styleUrl: './opened-task.component.scss'
})
export class OpenedTaskComponent {
  @Input() task!: Task;
  @Output() close = new EventEmitter<void>();
  @Output() editingTaskChange = new EventEmitter<boolean>();
  @ViewChild('contactInput') contactInput!: ElementRef;

  contactsOpen = false
  editingTask: boolean = false;

  constructor(private renderer: Renderer2) {

  } 

  closeTask() {
    this.close.emit(); 
  }


  editTask() {
    this.editingTask = true;
    this.editingTaskChange.emit(true); 
  }

  openContacts() {
    this.contactsOpen = true
  }

  @HostListener('document:mousedown', ['$event'])
  onClickOutside(event: Event) {
    const targetElement = event.target as HTMLElement;
    const selectContactsElement = document.querySelector('app-select-contacts');
    const isInsideSelectContacts = selectContactsElement ? selectContactsElement.contains(targetElement) : false;
    if (!isInsideSelectContacts) {
      this.contactsOpen = false;
    } else {
      setTimeout(() => this.focusInput());
    }
  }
  focusInput() {
    if (this.contactsOpen && this.contactInput) {
      this.renderer.selectRootElement(this.contactInput.nativeElement).focus();
    }
  }

  get remainingContactsCount(): number {
    return this.task.contacts.length > 5 ? this.task.contacts.length - 5 : 0;
  }
}
