import { Component, EventEmitter, Input, Output, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../../../material/material.module';
import { FormsModule } from '@angular/forms';
import { Contact } from '../../../interfaces/contact';
import { ContactsService } from '../../../services/contacts-service/contacts.service';
import { HttpRequestService } from '../../../services/http/http-request.service';
import { UserProfile } from '../../../interfaces/user-profile';
import { TaskServiceService } from '../../../services/task-service/task-service.service';



@Component({
  selector: 'app-select-contacts',
  imports: [CommonModule, MaterialModule, FormsModule,],
  templateUrl: './select-contacts.component.html',
  styleUrls: ['./select-contacts.component.scss']
})
export class SelectContactsComponent implements OnInit {
  @Input() selectedContacts: UserProfile[] = [];
  @Output() selectedContactsChange = new EventEmitter<UserProfile[]>();
  contactsService = inject(ContactsService)
  taskService = inject(TaskServiceService)
  contacts: UserProfile[] = this.taskService.userProfiles();
  constructor() { }

  /**
   * Lifecycle hook that is called after Angular has initialized all data-bound properties of a directive.
   * Synchronizes the selected contacts of the component with the selected contacts in the component's input.
   */
  ngOnInit() {
    this.syncSelectedContacts();
  }

  /**
   * Synchronizes the selected contacts of the component with the selected contacts in the component's input.
   * Iterates over all the contacts and sets the selected property of each contact to true if the contact is found in the selectedContacts array.
   * If the contact is not found in the selectedContacts array, it sets the selected property to false.
   */
  syncSelectedContacts() {
    this.contacts.forEach(contact => {
      contact.selected = !!this.selectedContacts.find(selected => selected.fullname === contact.fullname);
    });
  }

  /**
   * Toggles the selected property of the contact at the given index.
   * Emits the new selected contacts to the parent component.
   * @param index The index of the contact in the contacts array.
   */
  toggleContactSelection(index: number) {
    this.contacts[index].selected = !this.contacts[index].selected;
    this.emitSelectedContacts();
  }

  /**
   * Emits the new selected contacts to the parent component.
   * This function is called whenever the selected property of a contact is toggled.
   * It filters the contacts array to get only the contacts that are selected
   * and emits the new selected contacts to the parent component using the selectedContactsChange Output.
   */
  private emitSelectedContacts() {
    const selectedContacts = this.contacts.filter(contact => contact.selected);
    this.selectedContactsChange.emit(selectedContacts);
  }
}
