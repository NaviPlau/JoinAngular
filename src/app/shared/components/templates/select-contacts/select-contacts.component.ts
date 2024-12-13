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
  constructor() {
  }

  

  async ngOnInit() {
    this.syncSelectedContacts();

  }

  syncSelectedContacts() {
    this.contacts.forEach(contact => {
      contact.selected = !!this.selectedContacts.find(selected => selected.fullname === contact.fullname);
    });
  }

  toggleContactSelection(index: number) {
    this.contacts[index].selected = !this.contacts[index].selected;
    this.emitSelectedContacts();
  }

  private emitSelectedContacts() {
    const selectedContacts = this.contacts.filter(contact => contact.selected);
    this.selectedContactsChange.emit(selectedContacts);
  }
}
