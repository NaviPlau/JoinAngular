import { Component, HostListener } from '@angular/core';
import { HeaderComponent } from "../shared/components/header/header.component";
import { SidebarComponent } from "../shared/components/sidebar/sidebar.component";
import { MaterialModule } from '../material/material.module';
import { CommonModule } from '@angular/common';
import {  FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Contact } from '../shared/interfaces/contact';

@Component({
    selector: 'app-contacts',
    imports: [HeaderComponent, ReactiveFormsModule, SidebarComponent, MaterialModule, CommonModule, FormsModule],
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
  newContactAdded: boolean = false;
  contactEdited: boolean = false;
  groupedContacts: { letter: string; contacts: Contact[] }[] = [];
  contactForm: FormGroup;
  constructor(private fb: FormBuilder) {
    this.groupContacts();
    this.contactForm = this.fb.group({
      fullName: [this.selectedContact?.fullName || '', [Validators.required, Validators.pattern(/^\b\p{L}{3,}\b \b\p{L}{3,}\b$/u)]],
      email: [this.selectedContact?.email || '', [Validators.required, Validators.email, Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)]],
      phone: [this.selectedContact?.phone || '', [Validators.required, Validators.pattern(/^\d{3}-\d{3}-\d{4}$/)]]
    });
  }

  groupContacts(): void {
    const groups: { [key: string]: Contact[] } = {};
    this.contacts.sort((a, b) => a.fullName.localeCompare(b.fullName));
    this.contacts.forEach(contact => {
      const firstLetter = contact.fullName[0].toUpperCase(); 
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
    this.contactForm.patchValue({
      fullName: contact.fullName,
      email: contact.email,
      phone: contact.phone,
    });
  }

  deleteContact(): void {
    if (this.selectedContact) {
      const index = this.contacts.indexOf(this.selectedContact);
      if (index > -1) {
        this.contacts.splice(index, 1);
        this.selectedContact = null;
        this.editingContact = false;
        this.groupContacts();
      }
    }
  }

  editContact(): void {
    if (this.selectedContact) {
      this.editingContact = true;
    }
  }

  addContact(): void {
    this.addingContact = true;
    this.selectedContact = null;
    this.contactForm.reset();
    this.contactForm.patchValue({
      fullName: '',
      email: '',
      phone: '',
    });
  }

  saveTheNewContact(): void {
    if (this.contactForm.valid) {
      const formValues = this.contactForm.value;
      const newContact: Contact = {
        fullName: formValues.fullName,
        email: formValues.email,
        phone: formValues.phone,
        initials: this.getInitials(formValues.fullName),
        initialsColor: this.getRandomColor(),
        selected: false,
      };
      this.contacts.push(newContact);
      this.newContactAdded = true;
      setTimeout(() => {
        this.addingContact = false;
        this.newContactAdded = false;
      }, 2000);
      this.groupContacts();
    }
  }

  getRandomColor(): string {
    const colors = ['#00bcd4', '#ff5722', '#9c27b0', '#3f51b5', '#e91e63', '#4caf50', '#ffeb3b', '#673ab7', '#2196f3', '#ff9800', '#009688', '#795548', '#607d8b'];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  saveContact(): void {
    if (this.contactForm.valid) {
      const updatedContact = this.contactForm.value;
      if (this.selectedContact) {
        this.selectedContact.fullName = updatedContact.fullName;
        this.selectedContact.email = updatedContact.email;
        this.selectedContact.phone = updatedContact.phone;
        this.selectedContact.initials = this.getInitials(this.selectedContact.fullName);
        const index = this.contacts.findIndex(contact => contact.email === this.selectedContact!.email);
        if (index !== -1) {
          this.contacts[index] = { ...this.selectedContact };
        } else {
          console.error('Selected contact not found in the contacts array');
        }
      }
      this.contactEdited = true;
      setTimeout(() => {
        this.editingContact = false;
        this.addingContact = false;
        this.contactEdited = false;
      }, 2000);

      this.groupContacts(); 
    } else {
      console.error('Form is invalid');
    }
  }

  getInitials(fullName: string): string {
    if (!fullName) return '';
    const nameParts = fullName.split(' ');
    const initials = nameParts
      .map(part => part.charAt(0).toUpperCase())
      .join('')
      .slice(0, 2); 
    return initials;
  }

  closeForm(): void {
    this.editingContact = false;
    this.addingContact = false;
    this.selectedContact = null;
    this.contactForm.reset();
    this.groupedContacts.forEach(group => {
      group.contacts.forEach(contact => {
        contact.selected = false;
      });
    });
  }

  @HostListener('document:keydown.escape', ['$event'])
  handleEscKey(event: KeyboardEvent): void {
    if (this.editingContact || this.addingContact) {
      this.closeForm();
    }
  }


}
