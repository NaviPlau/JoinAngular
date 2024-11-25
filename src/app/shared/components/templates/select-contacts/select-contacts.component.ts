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
    { initials: 'SM', initialsColor: '#00bcd4', fullName: 'Sofia Müller', selected: false, email: '6VtY0@example.com1', phone: '123-456-7890' },
    { initials: 'AM', initialsColor: '#ff5722', fullName: 'Anton Mayer', selected: false, email: '6VtY0@example.com2', phone: '234-567-8901' },
    { initials: 'AS', initialsColor: '#9c27b0', fullName: 'Anja Schulz', selected: false, email: '6VtY0@example.com3', phone: '345-678-9012' },
    { initials: 'BZ', initialsColor: '#3f51b5', fullName: 'Benedikt Ziegler', selected: false, email: '6VtY0@example.com4', phone: '456-789-0123' },
    { initials: 'DE', initialsColor: '#e91e63', fullName: 'David Eisenberg', selected: false, email: '6VtY0@example.com5', phone: '567-890-1234' },
    { initials: 'JB', initialsColor: '#4caf50', fullName: 'Julia Braun', selected: false, email: '6VtY0@example.com6', phone: '678-901-2345' },
    { initials: 'MK', initialsColor: '#ffeb3b', fullName: 'Michawerwerwel Köniewrwerwerg', selected: false, email: '6VtY0@exdfsdfsdfdsfsdfdsfsdfsfsdfample.com7', phone: '789-012-3456' },
    { initials: 'LT', initialsColor: '#673ab7', fullName: 'Lena Thomas', selected: false, email: '6VtY0@example.com8', phone: '890-123-4567' },
    { initials: 'PH', initialsColor: '#2196f3', fullName: 'Paul Hoffmann', selected: false, email: '6VtY0@example.com9', phone: '901-234-5678' },
    { initials: 'RK', initialsColor: '#ff9800', fullName: 'Rita Keller', selected: false, email: '6VtY0@example.com10', phone: '012-345-6789' },
    { initials: 'TS', initialsColor: '#009688', fullName: 'Tom Schneider', selected: false, email: '6VtY0@example.com11', phone: '123-456-7890' },
    { initials: 'WK', initialsColor: '#795548', fullName: 'Werner Klein', selected: false, email: '6VtY0@example.com12', phone: '234-567-8901' },
    { initials: 'SR', initialsColor: '#607d8b', fullName: 'Sandra Richter', selected: false, email: '6VtY0@example.com13', phone: '345-678-9012' },
    { initials: 'FH', initialsColor: '#3f51b5', fullName: 'Franziska Herzog', selected: false, email: '6VtY0@example.com13', phone: '456-789-0123' }
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
