import {  Component, ElementRef, EventEmitter, HostListener, inject, input, Input, OnInit, Output, Renderer2, ViewChild } from '@angular/core';
import { Task } from '../../shared/interfaces/task';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../material/material.module';
import { FormsModule } from '@angular/forms';
import { SelectContactsComponent } from "../../shared/components/templates/select-contacts/select-contacts.component";
import { Subtask } from '../../shared/interfaces/subtask';
import { TaskServiceService } from '../../shared/services/task-service/task-service.service';
import { Contact } from '../../shared/interfaces/contact';

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

  taskService = inject(TaskServiceService)
  today = new Date().toISOString().split('T')[0];
  contactsOpen = false
  editingTask: boolean = false;
  selectedPriority = ''
  subtaskFocus: boolean = false;
  subtaskTitle: string = '';
  subtaskInputFocused: boolean = false;
  isClosing: boolean = false;
  selectedContacts: Contact[] = [];
  dueDate = new Date().toISOString().split('T')[0];

  constructor(private renderer: Renderer2, private elRef: ElementRef) {
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
    this.isClosing = true;
    setTimeout(() => {
      this.close.emit(); 
      this.isClosing = false; 
    }, 400); 
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
    return this.task.assignedTo.length > 5 ? this.task.assignedTo.length - 5 : 0;
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

  onSelectContactsChange(selectedContacts: Contact[]) {
    this.task.assignedTo = selectedContacts; 
  }

  deleteSubtask(index: number): void {
    if (index > -1 && index < this.task.subtasks.length) {
      this.task.subtasks.splice(index, 1); 
    } else {
      console.error('Invalid index:', index);
    }
  }

  async saveTaskChanges() {
    this.isClosing = true;
    try {
      const updatedAssignedTo = this.selectedContacts.length? this.selectedContacts : this.task.assignedTo;
      const taskToSave = {
        ...this.task,
        assignedTo: updatedAssignedTo.map((contact: Contact) => contact.id),
        priority: this.selectedPriority,
        dueDate: this.dueDate
      };
      await this.taskService.updateTask(taskToSave);
      await this.taskService.getTasksFromDB();
      this.editingTaskChange.emit(false);
    } catch (error) {
      console.error('Error updating task:', error);
    } finally {
      this.closeAfterChanges();
    }
  }
  
  closeAfterChanges(){
    this.isClosing = false;
    this.editingTask = false;
    this.close.emit();
  }

  @HostListener('document:click', ['$event'])
  handleClickOutside(event: Event) {
    const target = event.target as HTMLElement;
    if (!this.elRef.nativeElement.querySelector('.task')?.contains(target)) {
      this.closeTask(); 
    }
  }

  @HostListener('document:keydown', ['$event'])
  handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape' || event.key === 'Esc') {
      if (this.editingTask) {
        this.saveTaskChanges(); 
      } else {
        this.closeTask(); 
      }
    }
  }

  async deleteTask() {
    await this.taskService.deleteTask(this.task);
    await this.taskService.getTasksFromDB();
    this.closeTask();
  }

  async updateSubtaskCompletion(index: number): Promise<void> {
    try {
      const updatedTask = this.prepareUpdatedTask();
      await this.taskService.updateTask(updatedTask);
    } catch (error) {
      console.error('Failed to update subtask completion:', error);
    }
  }

  prepareUpdatedTask(){
    return {
      ...this.task,
      assignedTo: this.task.assignedTo.map(contact => contact.id),

      
      priority: this.selectedPriority
    };
  }
}
