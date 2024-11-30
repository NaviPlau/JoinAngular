import { Component, ElementRef, EventEmitter, HostListener, inject, Input, OnInit, Output, Renderer2, signal, ViewChild } from '@angular/core';
import {  SelectContactsComponent } from '../select-contacts/select-contacts.component';  
import { MaterialModule } from '../../../../material/material.module';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subtask } from '../../../interfaces/subtask';
import { Contact } from '../../../interfaces/contact';
import { TaskServiceService } from '../../../services/task-service/task-service.service';
import { Router } from '@angular/router';

@Component({
    selector: 'app-add-task-template',
    imports: [SelectContactsComponent, MaterialModule, CommonModule, FormsModule, ReactiveFormsModule],
    templateUrl: './add-task-template.component.html',
    styleUrls: ['./add-task-template.component.scss']
})
export class AddTaskTemplateComponent {
  @ViewChild('contactInput') contactInput!: ElementRef;
  @Input() column!: string;
  @Input() showCloseButton: boolean = false;
  @Output() closeOverlayEvent = new EventEmitter<void>();
  
  taskService = inject(TaskServiceService);
  contactsOpen = false;
  selectedContacts: Contact[] = [];
  today: string;
  showPlaceholder: boolean = true;
  subtaskFocus: boolean = false;
  subTasksArray: Subtask[] = [];
  subtaskTitle: string = '';
  description: string = '';
  title:string = '';
  dueDate: Date | null = null;
  subtaskInputFocused: boolean = false;
  selectedPriority: 'urgent' | 'medium' | 'low' = 'medium';
  isDropdownOpen: boolean = false; 
  selectedCategory: string = '';
  taskCategories = [
    { label: 'Technical Task', value: 'technical-task' },
    { label: 'User Story', value: 'user-story' },
  ];

  response = signal('');

  closeOverlay() {
    this.closeOverlayEvent.emit(); 
  }

  toggleDropdown(): void {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  selectCategory(option: { label: string; value: string }, event: Event): void {
    event.stopPropagation();
    this.selectedCategory = option.label;
    this.isDropdownOpen = false;
  }

  constructor(private elementRef: ElementRef, private renderer: Renderer2, private router : Router) {
      const currentDate = new Date();
      this.today = currentDate.toISOString().split('T')[0]; 
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

  openContacts() {
    this.contactsOpen = true;
    this.focusInput();
  }

  onSelectContactsChange(selectedContacts: Contact[]) {
    this.selectedContacts = selectedContacts;
  }

  focusInput() {
    if (this.contactsOpen && this.contactInput) {
      this.renderer.selectRootElement(this.contactInput.nativeElement).focus();
    }
  }

  get selectedContactsNames(): string {
    return this.selectedContacts.map(contact => contact.fullName).join(', ');
  }
  get remainingContactsCount(): number {
    return this.selectedContacts.length > 5 ? this.selectedContacts.length - 5 : 0;
  }

  setPriority(priority: 'urgent' | 'medium' | 'low') {
    this.selectedPriority = priority;
  }

  focusInputSubtask(){
    this.subtaskFocus = true
    let subtaskInput = document.getElementById('addSubtask')
    subtaskInput?.focus()
  }

  createSubtask(): void {
    if (this.subtaskTitle.trim() === '') {
      return;
    }
    const subtask: Subtask = {
      title: this.subtaskTitle.trim(),
      completed: false,
    };
    this.subTasksArray = [...this.subTasksArray, { ...subtask }]; 
    this.subtaskTitle = ''; 
  }

  focusRenderedSubtask(index:number){
    let subtaskInput = document.getElementById(`renderedSubtask${index}`)
    subtaskInput?.focus()
    this.subtaskInputFocused = true
  }

  clearInput(){
    this.subtaskTitle = ""
  }

  deleteSubtask(index: number): void {
    if (index > -1 && index < this.subTasksArray.length) {
      this.subTasksArray.splice(index, 1); 
    } else {
      console.error('Invalid index:', index);
    }
  }

  updateSubtask(index: number): void {
    const inputElement = document.getElementById(`renderedSubtask${index}`) as HTMLInputElement;
    if (inputElement) {
      const newTitle = inputElement.value.trim(); 
      if (newTitle) {
        this.subTasksArray[index].title = newTitle;
      } else {
        console.error('Subtask title cannot be empty.');
      }
    } else {
      console.error(`Input element for subtask ${index} not found.`);
    }
  }

  onBlurSubtask(index:number){
    this.subtaskInputFocused=false; 
    if(index){
      this.updateSubtask(index)
    }
  }

  clearForm(){
    this.subTasksArray = [];
    this.selectedContacts = [];
    this.selectedPriority = 'medium';
    this.selectedCategory = '';
    this.showPlaceholder = true;
    this.description = '';
    this.title = '';
    this.dueDate = null;
  }

  generateJSON(form: any) {
    if (form.valid) {
    const formData = {
      title: this.title,
      description: this.description,
      dueDate: this.dueDate,
      priority: this.selectedPriority,
      category: this.selectedCategory,
      assignedTo: this.selectedContacts.map(contact => contact.id),
      subtasks: this.subTasksArray,
      column: this.column || 'toDo'
    };
    return formData;
    }
    return null
  }


  submitForm(form: any) {
    form.form.markAllAsTouched();
    if (form.valid) {
      this.response.set(`Task added to ${this.column || 'Board'}`);
      setTimeout(() => {
        const formData = this.generateJSON(form);
        this.taskService.postTask(formData);
        this.closeOverlayEvent.emit();
        this.router.navigate(['board']);
        this.response.set('');
      }, 2000);
    }
    else{
      return
    }
  }
}



