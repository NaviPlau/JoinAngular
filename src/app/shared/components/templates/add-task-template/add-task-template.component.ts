import { Component, ElementRef, EventEmitter, HostListener, inject, Input, OnInit, Output, Renderer2, signal, ViewChild } from '@angular/core';
import { SelectContactsComponent } from '../select-contacts/select-contacts.component';
import { MaterialModule } from '../../../../material/material.module';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subtask } from '../../../interfaces/subtask';
import { Contact } from '../../../interfaces/contact';
import { TaskServiceService } from '../../../services/task-service/task-service.service';
import { Router } from '@angular/router';
import { UserProfile } from '../../../interfaces/user-profile';

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
  selectedContacts: UserProfile[] = [];
  today: string;
  showPlaceholder: boolean = true;
  subtaskFocus: boolean = false;
  subTasksArray: Subtask[] = [];
  subtaskTitle: string = '';
  description: string = '';
  title: string = '';
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

  /**
   * Closes the overlay and emits a signal to the parent component.
   */
  closeOverlay() {
    this.closeOverlayEvent.emit();
  }

  /**
   * Toggles the dropdown state between open and closed.
   */
  toggleDropdown(): void {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  /**
   * Handles the selection of a category from the dropdown list.
   * @param option The selected category
   * @param event The event that triggered the selection
   */
  selectCategory(option: { label: string; value: string }, event: Event): void {
    event.stopPropagation();
    this.selectedCategory = option.label;
    this.isDropdownOpen = false;
  }

  /**
   * The constructor for the component.
   * It sets up the date string for the due date input and requests the user profiles from the database.
   */
  constructor(private elementRef: ElementRef, private renderer: Renderer2, private router: Router) {
    const currentDate = new Date();
    this.today = currentDate.toISOString().split('T')[0];
  }

  @HostListener('document:click', ['$event'])
  /**
   * Handles a click event on the document to close the category dropdown.
   * If the dropdown is open and the click occurs outside the dropdown element,
   * it will close the dropdown.
   * @param event The event that triggered this method.
   */
  onDocumentClick(event: Event) {
    if (this.isDropdownOpen && !this.elementRef.nativeElement.querySelector('.select-category')?.contains(event.target)) {
      this.isDropdownOpen = false;
    }
  }

  @HostListener('document:mousedown', ['$event'])
  /**
   * Handles a click event outside the select contacts component.
   * If the click occurs outside the select contacts component, it closes the component.
   * If the click occurs inside, it focuses the input field within the component.
   * @param event The event that triggered this method.
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
   * Opens the contacts selection component and sets focus on the contact input field.
   * This function is called when the user clicks on the assigned to field or focuses the input.
   */
  openContacts() {
    this.contactsOpen = true;
    this.focusInput();
  }

  /**
   * Handles the event when the user selects a new set of contacts in the contacts selector component.
   * Updates the task's assignedTo array with the new set of contacts.
   * This function is called when the user selects a new set of contacts in the add task template component.
   */
  onSelectContactsChange(selectedContacts: UserProfile[]) {
    this.selectedContacts = selectedContacts;
  }

  /**
   * Focuses the contact input field if the contacts section is open.
   * This function is called when the user clicks on the assigned to field or focuses the input.
   */
  focusInput() {
    if (this.contactsOpen && this.contactInput) {
      this.renderer.selectRootElement(this.contactInput.nativeElement).focus();
    }
  }

  /**
   * A computed property that returns a string containing the names of the selected contacts separated by commas.
   * This property is used in the template to display the names of the selected contacts.
   */
  get selectedContactsNames(): string {
    return this.selectedContacts.map(contact => contact.fullname).join(', ');
  }

  /**
   * Computes the number of contacts that are not displayed in the contact list.
   * If there are more than 5 contacts, it returns the count of contacts beyond the first 5.
   * Otherwise, it returns 0.
   */
  get remainingContactsCount(): number {
    return this.selectedContacts.length > 5 ? this.selectedContacts.length - 5 : 0;
  }

  /**
   * Sets the selected priority for the task.
   */
  setPriority(priority: 'urgent' | 'medium' | 'low') {
    this.selectedPriority = priority;
  }

  /**
   * Sets the focus on the 'Add Subtask' input field and updates the subtaskFocus flag.
   * This function is triggered when the 'Add' icon is clicked, ensuring the input field is ready for text input.
   */
  focusInputSubtask() {
    this.subtaskFocus = true
    let subtaskInput = document.getElementById('addSubtask')
    subtaskInput?.focus()
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
    this.subTasksArray = [...this.subTasksArray, { ...subtask }];
    this.subtaskTitle = '';
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
   * Clears the input field in the add subtask form.
   */
  clearInput() {
    this.subtaskTitle = ""
  }

  /**
   * Deletes a subtask at the specified index from the subTasksArray.
   * If the index is invalid, it logs an error message.
   */
  deleteSubtask(index: number): void {
    if (index > -1 && index < this.subTasksArray.length) {
      this.subTasksArray.splice(index, 1);
    } else {
      console.error('Invalid index:', index);
    }
  }

  /**
   * Updates the title of a subtask at the specified index.
   * Retrieves the input element by its id and trims its value.
   * If the trimmed value is not empty, updates the subtask's title.
   * Logs an error if the input element is not found or if the title is empty.
   */
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

  /**
   * Called when the user blurs out of a subtask input field.
   * Resets the subtaskInputFocused flag and calls updateSubtask if the index is valid.
   */
  onBlurSubtask(index: number) {
    this.subtaskInputFocused = false;
    if (index) {
      this.updateSubtask(index)
    }
  }

  /**
   * Resets the form to its initial state.
   * Clears all selected options, resets the title and description inputs, and sets the due date to null.
   * Also resets the subtask array and the showPlaceholder flag.
   */
  clearForm() {
    this.subTasksArray = [];
    this.selectedContacts = [];
    this.selectedPriority = 'medium';
    this.selectedCategory = '';
    this.showPlaceholder = true;
    this.description = '';
    this.title = '';
    this.dueDate = null;
  }

  /**
   * If the form is valid, generates a JSON object that represents the task being added
   * with all the form fields and their respective values.
   * Otherwise, returns null.
   */
  generateJSON(form: any) {
    if (form.valid) {
      const formData = {
        title: this.title,
        description: this.description,
        dueDate: this.dueDate,
        priority: this.selectedPriority,
        category: this.selectedCategory,
        assignedTo: this.selectedContacts.map(contact => contact),
        subtasks: this.subTasksArray,
        column: this.column || 'toDo'
      };
      return formData;
    }
    return null
  }


  /**
   * Called when the user clicks on the submit button.
   * If the form is valid, shows a success message and posts the task to the server.
   * If the form is invalid, marks all fields as touched.
   */
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
  }
}



