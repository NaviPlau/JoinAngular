import { Component, ElementRef, EventEmitter, HostListener, inject, input, Input, OnInit, Output, Renderer2, ViewChild } from '@angular/core';
import { Task } from '../../shared/interfaces/task';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../material/material.module';
import { FormsModule } from '@angular/forms';
import { SelectContactsComponent } from "../../shared/components/templates/select-contacts/select-contacts.component";
import { Subtask } from '../../shared/interfaces/subtask';
import { TaskServiceService } from '../../shared/services/task-service/task-service.service';
import { Contact } from '../../shared/interfaces/contact';
import { UserProfile } from '../../shared/interfaces/user-profile';

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
  selectedContacts: UserProfile[] = [];
  dueDate = new Date().toISOString().split('T')[0];

  constructor(private renderer: Renderer2, private elRef: ElementRef) {
    if (this.task) {
      this.selectedPriority = this.task.priority;
    }
  }

  /**
   * Clear the input field in the add subtask form.
   */
  clearInput() {
    this.subtaskTitle = ""
  }

  /**
   * If the component is given a task, it will set the selected priority and contacts to the task's priority and contacts.
   * It will also request the user profiles from the database.
   */
  ngOnInit() {
    if (this.task) {
      this.selectedPriority = this.task.priority;
      this.selectedContacts = this.task.assignedTo
      this.taskService.getUsersProfileFromDb();
    }
  }

  /**
   * Closes the task component and emits an event to the parent. After a short delay, it fetches the tasks from the database.
   * The short delay is so that the animation of the task component closing has time to finish before the parent component is updated.
   */
  closeTask() {
    this.isClosing = true;
    setTimeout(() => {
      this.close.emit();
      this.isClosing = false;
      this.taskService.getTasksFromDB();
    }, 400);
  }


  /**
   * Sets the editing task flag to true and emits an event to the parent so that it knows the task is being edited.
   * This function is called when the user clicks on the edit button in the opened task component.
   */
  editTask() {
    this.editingTask = true;
    this.editingTaskChange.emit(true);
  }

  /**
   * Opens the contacts selector component when the user clicks on the assigned to field.
   * This function is called when the user clicks on the assigned to field in the opened task component.
   */
  openContacts() {
    this.contactsOpen = true
  }

  @HostListener('document:mousedown', ['$event'])
  /**
   * Handles the event when the user clicks outside of the select contacts component.
   * If the user clicks outside of the select contacts component, it closes the component.
   * If the user clicks inside the select contacts component, it focuses the input field in the component.
   * This function is called when the user clicks outside of the opened task component.
   */
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

  /**
   * Focuses the contact input field if the contacts section is open.
   */
  focusInput() {
    if (this.contactsOpen && this.contactInput) {
      this.renderer.selectRootElement(this.contactInput.nativeElement).focus();
    }
  }

  /**
   * The number of assigned contacts that are not displayed in the contacts list.
   * If there are 5 or fewer contacts assigned to the task, this is 0.
   */
  get remainingContactsCount(): number {
    return this.task.assignedTo.length > 5 ? this.task.assignedTo.length - 5 : 0;
  }

  /**
   * Sets the selected priority for the task.
   * @param priority The priority for the task. Can be 'urgent', 'medium', or 'low'.
   */
  setPriority(priority: 'urgent' | 'medium' | 'low') {
    this.selectedPriority = priority;
  }

  /**
   * Creates a new subtask and adds it to the task's subtasks array.
   * Does nothing if the input field is empty.
   * Trims the input field after adding the subtask.
   */
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

  /**
   * Sets the focus on the subtask input field.
   * This function is called when the user clicks on the 'Add subtask' button.
   */
  focusInputSubtask() {
    this.subtaskFocus = true
    let subtaskInput = document.getElementById('addSubtask')
    subtaskInput?.focus()
  }

  /**
   * Called when the user blurs out of a subtask input field.
   */
  onBlurSubtask(index: number) {
    this.subtaskInputFocused = false;
    if (index) {
      this.updateSubtask(index)
    }
  }
  /**
   * Updates the title of a subtask with the given index.
   * Retrieves the element by its id, trims the input value, and checks if it's not empty.
   * If the input element is not found, it logs an error message.
   */
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

  /**
   * Sets the focus on a subtask input field with the given index.
   * Retrieves the element by its id, and checks if it's not null before focusing on it.
   * Also sets the flag subtaskInputFocused to true.
   */
  focusRenderedSubtask(index: number) {
    let subtaskInput = document.getElementById(`renderedSubtask${index}`)
    subtaskInput?.focus()
    this.subtaskInputFocused = true
  }

  /**
   * Handles the event when the user selects a new set of contacts in the contacts selector component.
   * Updates the task's assignedTo array with the new set of contacts.
   * Also updates the selectedContacts array with the new set of contacts.
   * This function is called when the user selects a new set of contacts in the opened task component.
   */
  onSelectContactsChange(selectedContacts: UserProfile[]) {
    this.task.assignedTo = selectedContacts;
    this.selectedContacts = selectedContacts;
  }

  /**
   * Deletes a subtask at the given index from the task's subtasks array.
   * If the index is invalid, it logs an error message.
   */
  deleteSubtask(index: number): void {
    if (index > -1 && index < this.task.subtasks.length) {
      this.task.subtasks.splice(index, 1);
    } else {
      console.error('Invalid index:', index);
    }
  }

  /**
   * Saves the changes made to the task to the database.
   * If the contacts selector was opened, it uses the selectedContacts array.
   * Otherwise, it uses the task's assignedTo array.
   * Emits the editingTaskChange event with false after saving the task.
   * Closes the task after saving.
   */
  async saveTaskChanges() {
    this.isClosing = true;
    try {
      const updatedAssignedTo = this.selectedContacts.length ? this.selectedContacts : this.task.assignedTo;
      const taskToSave = this.setTaskChangesToBeSaved(updatedAssignedTo);
      await this.taskService.updateTask(taskToSave);
      await this.taskService.getTasksFromDB();
      this.editingTaskChange.emit(false);
    } catch (error) {
      console.error('Error updating task:', error);
    } finally {
      this.closeAfterChanges();
    }
  }

  /**
   * Returns a new task object with the changes made in the opened task component.
   */
  setTaskChangesToBeSaved(updatedAssignedTo: UserProfile[]) {
    return {
      ...this.task,
      assignedTo: updatedAssignedTo.map((contact: UserProfile) => contact.id),
      priority: this.selectedPriority,
    };
  }

  /**
   * Closes the opened task component after changes have been made to the task.
   * Sets isClosing to false and editingTask to false.
   * Emits the close event.
   */
  closeAfterChanges() {
    this.isClosing = false;
    this.editingTask = false;
    this.close.emit();
  }

  @HostListener('document:click', ['$event'])
  /**
   * Closes the opened task component when a click event occurs outside of it.
   * @param event the event that triggered this method
   */
  handleClickOutside(event: Event) {
    const target = event.target as HTMLElement;
    if (!this.elRef.nativeElement.querySelector('.task')?.contains(target)) {
      this.closeTask();
    }
  }

  @HostListener('document:keydown', ['$event'])
  /**
   * Handles the keydown event for the component.
   * If the 'Escape' key is pressed, it will either save the task changes if the task is being edited,
   * or close the task if it is not being edited.
   */
  handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape' || event.key === 'Esc') {
      if (this.editingTask) {
        this.saveTaskChanges();
      } else {
        this.closeTask();
      }
    }
  }

  /**
   * Deletes the task from the database and closes the component after a delay of 300ms.
   * This is to prevent the component from closing immediately after the user clicks the delete button,
   * which could cause the 'undo' button to not appear.
   */
  deleteTask() {
    this.taskService.deleteTask(this.task);
    setTimeout(() => {
      this.closeTask();
    }, 300);

  }

/**
 * Updates the completion status of a subtask at the given index.
 * Prepares an updated task object and sends it to the task service to be updated in the database.
 * Logs an error message if the update fails.
 */
  async updateSubtaskCompletion(index: number): Promise<void> {
    try {
      const updatedTask = this.prepareUpdatedTask();
      await this.taskService.updateTask(updatedTask);
    } catch (error) {
      console.error('Failed to update subtask completion:', error);
    }
  }

  /**
   * Prepares an updated task object by copying the existing task object and
   * replacing its 'assignedTo' property with an array of contact IDs.
   */
  prepareUpdatedTask() {
    return {
      ...this.task,
      assignedTo: this.task.assignedTo.map(contact => contact.id),
      priority: this.selectedPriority
    };
  }
}
