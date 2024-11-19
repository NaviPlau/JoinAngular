import { Component } from '@angular/core';
import { HeaderComponent } from "../shared/components/header/header.component";
import { SidebarComponent } from "../shared/components/sidebar/sidebar.component";
import { MaterialModule } from '../material/material.module';
import { Contact } from '../shared/components/templates/select-contacts/select-contacts.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-contacts',
  standalone: true,
  imports: [HeaderComponent, SidebarComponent, MaterialModule, CommonModule],
  templateUrl: './contacts.component.html',
  styleUrl: './contacts.component.scss'
})
export class ContactsComponent {
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

  selectedContact: Contact | null = null;
  editingContact: boolean = false;
  addingContact: boolean = false;
  groupedContacts: { letter: string; contacts: Contact[] }[] = [];

  constructor() {
    this.groupContacts();
  }

  groupContacts(): void {
    const groups: { [key: string]: Contact[] } = {};

    this.contacts.sort((a, b) => a.fullName.localeCompare(b.fullName)); // Sort alphabetically

    this.contacts.forEach(contact => {
      const firstLetter = contact.fullName[0].toUpperCase(); // Group by the first letter
      if (!groups[firstLetter]) {
        groups[firstLetter] = [];
      }
      groups[firstLetter].push(contact);
    });

    
    this.groupedContacts = Object.keys(groups)
      .sort() 
      .map(letter => ({
        letter,
        contacts: groups[letter]
      }));
  }

  toggleContactSelection(groupIndex: number, contactIndex: number): void {
    this.groupedContacts.forEach(group => {
      group.contacts.forEach(contact => (contact.selected = false));
    });
    const contact = this.groupedContacts[groupIndex].contacts[contactIndex];
    contact.selected = true;
    this.selectedContact = contact;
  
    console.log(this.selectedContact);
  }

  deleteContact(): void {
    if (this.selectedContact) {
      const index = this.contacts.indexOf(this.selectedContact);
      if (index > -1) {
        this.contacts.splice(index, 1);
        this.selectedContact = null;
        this.groupContacts();
      }
    }
  }

  editContact(): void {
    if (this.selectedContact) {
      console.log('Edit contact:', this.selectedContact);
      this.editingContact = true;
    }
  }

  addContact(): void {
    console.log('Add new contact');
    this.addingContact = true;
  }
}
