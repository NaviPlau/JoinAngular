import { Component, ElementRef, EventEmitter, HostListener, input, Input, OnInit, Output, Renderer2, ViewChild } from '@angular/core';
import { Task } from '../../shared/interfaces/task';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../material/material.module';
import { FormsModule } from '@angular/forms';
import { SelectContactsComponent } from "../../shared/components/templates/select-contacts/select-contacts.component";
import { Subtask } from '../../shared/interfaces/subtask';

@Component({
    selector: 'app-opened-task',
    imports: [CommonModule, MaterialModule, FormsModule, SelectContactsComponent],
    templateUrl: './opened-task.component.html',
    styleUrl: './opened-task.component.scss'
})
export class OpenedTaskComponent implements OnInit {
  @Input() task!: Task 
  @Output() close = new EventEmitter<void>();
  @Output() editingTaskChange = new EventEmitter<boolean>();
  @ViewChild('contactInput') contactInput!: ElementRef;

  contactsOpen = false
  editingTask: boolean = false;
  selectedPriority = ''
  subtaskFocus: boolean = false;
  subtaskTitle: string = '';
  subtaskInputFocused: boolean = false;

  constructor(private renderer: Renderer2) {
    if(this.task){
      this.selectedPriority = this.task.priority;
    }
  } 

  clearInput(){
    this.subtaskTitle = ""
  }

  ngOnInit(){
    if(this.task){
      this.selectedPriority = this.task.priority;
    }
  }

  closeTask() {
    this.close.emit(); 
    this.editingTaskChange.emit(false);
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

  setPriority(priority: 'urgent' | 'medium' | 'low') {
    this.selectedPriority = priority;
  }

  createSubtask(): void {
    if (this.subtaskTitle.trim() === '') {
      return;
    }
    const subtask: Subtask = {
      title: this.subtaskTitle.trim(),
      completed: false,
    };
    this.task.subtasks = [...this.task.subtasks, { ...subtask }]; 
    this.subtaskTitle = ''; 
  }

  focusInputSubtask(){
    this.subtaskFocus = true
    let subtaskInput = document.getElementById('addSubtask')
    subtaskInput?.focus()
  }

  onBlurSubtask(index:number){
    this.subtaskInputFocused=false; 
    if(index){
      this.updateSubtask(index)
    }
  }
  updateSubtask(index: number): void {
    const inputElement = document.getElementById(`renderedSubtask${index}`) as HTMLInputElement;
    if (inputElement) {
      const newTitle = inputElement.value.trim(); 
      if (newTitle) {
        this.task.subtasks[index].title = newTitle;
        console.log(`Subtask ${index} updated:`, this.task.subtasks[index]);
      } else {
        console.error('Subtask title cannot be empty.');
      }
    } else {
      console.error(`Input element for subtask ${index} not found.`);
    }
  }

  focusRenderedSubtask(index:number){
    let subtaskInput = document.getElementById(`renderedSubtask${index}`)
    subtaskInput?.focus()
    this.subtaskInputFocused = true
  }

  deleteSubtask(index: number): void {
    if (index > -1 && index < this.task.subtasks.length) {
      this.task.subtasks.splice(index, 1); 
      console.log('Subtask deleted:', index, this.task.subtasks);
    } else {
      console.error('Invalid index:', index);
    }
  }

  saveTaskChanges(){
    this.editingTask = false;
    this.editingTaskChange.emit(false);
  }
}
