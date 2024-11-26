import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../../../material/material.module';
import { FormsModule } from '@angular/forms';
import { Contact } from '../../../interfaces/contact';



@Component({
    selector: 'app-select-contacts',
    imports: [CommonModule, MaterialModule, FormsModule,],
    templateUrl: './select-contacts.component.html',
    styleUrls: ['./select-contacts.component.scss']
})
export class SelectContactsComponent implements OnInit {
  @Input() selectedContacts: Contact[] = [];
  @Output() selectedContactsChange = new EventEmitter<Contact[]>();

  contacts: Contact[] = [
  ];

  ngOnInit() {
    this.syncSelectedContacts();
  }

  syncSelectedContacts() {
    this.contacts.forEach(contact => {
      contact.selected = !!this.selectedContacts.find(selected => selected.fullName === contact.fullName);
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
