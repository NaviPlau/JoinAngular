import { inject, Injectable } from '@angular/core';
import { Contact } from '../../interfaces/contact';
import { Form, FormGroup } from '@angular/forms';
import { HttpRequestService } from '../http/http-request.service';

@Injectable({
  providedIn: 'root'
})
export class ContactsService {
  contacts: Contact[] = [];
  contactForm!: FormGroup;
  httpService = inject(HttpRequestService);
  editingContact: boolean = false;
  addingContact: boolean = false;
  newContactAdded: boolean = false;
  contactEdited: boolean = false;
  formIsClosing: boolean = false;
  selectedContact: Contact | null = null;
  groupedContacts: { letter: string; contacts: Contact[] }[] = [];
  constructor() {}

  BASE_URL: string = 'http://127.0.0.1:8000/api/join_app/contacts';
  async getContacts() {
    let contacts = await fetch(this.BASE_URL)
    let response = await contacts.json();
    this.contacts = response;
  }

  async addContactInDB(): Promise<void> {
    if (this.contactForm.valid) {
      const formValues = this.contactForm.value;
      const newContact: Contact = this.setDataForNewContactInDb(formValues);
      try {
        const response = await this.httpService.makeHttpRequest(this.BASE_URL, 'POST', newContact);
        if (response.ok) {
          await this.getContacts();
        } else {
          console.error('Failed to add contact. Status:', response.status);
        }
      } catch (error) {
        console.error('Error adding contact:', error);
      }
    }
  }

  setDataForNewContactInDb(formValues: any): Contact {
    return {
      id: this.contacts.length + 1,
      fullName: formValues.fullName,
      email: formValues.email,
      phone: formValues.phone,
      initials: this.getInitials(formValues.fullName),
      initialsColor: this.getRandomColor(),
      selected: false,
    };
  }

  async saveTheNewContact() {
    await this.addContactInDB();
    this.newContactAdded = true;
    await this.getContacts();
    this.groupContacts();
    setTimeout(() => {
      this.addingContact = false;
      this.newContactAdded = false;
    }, 2000);
  }

  async deleteContact(): Promise<void> {
    if (this.selectedContact) {
      try {
        const response = await this.httpService.makeHttpRequest(this.BASE_URL + `/${this.selectedContact.id}`, 'DELETE');
        if (response.ok) {
          console.log('Contact deleted successfully');
          await this.getContacts();
          this.deleteContactUpdateUI()
        } else {
          console.error('Failed to delete contact. Status:', response.status);
        }
      } catch (error) {
        console.error('Error deleting contact:', error);
      }
    }
  }

  groupContacts(): void {
    const groups: { [key: string]: Contact[] } = {};
    this.contacts.sort((a, b) => a.fullName.localeCompare(b.fullName));
    console.log(this.contacts);
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

  deleteContactUpdateUI() {
    this.selectedContact = null;
    this.editingContact = false;
    this.groupContacts();
  }

  async deselectAllContacts(): Promise<void> {
    try {
      await Promise.all(
        this.contacts.map(contact => {
          if (contact.selected) {
            return this.httpService.makeHttpRequest(this.BASE_URL + `/${contact.id}`, 'PUT', { ...contact, selected: false });
          }
          return null;
        })
      );
      this.contacts.forEach(contact => (contact.selected = false));
    } catch (error) {
      console.error('Error deselecting contacts:', error);
    }
  }

  closeForm(): void {
    this.formIsClosing = true;
    setTimeout(async () => {
      this.editingContact = false;
      this.addingContact = false;
      this.selectedContact = null;
      await this.deselectAllContacts();
      this.contactForm.reset();
      this.formIsClosing = false;
    }, 500);
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

  timeOutEditContact() {
    this.contactEdited = true;
    setTimeout(() => {
      this.editingContact = false;
      this.addingContact = false;
      this.contactEdited = false;
    }, 3000);
  }

  getUpdatedContact(updatedContact: any): void {
    this.selectedContact!.fullName = updatedContact.fullName;
    this.selectedContact!.email = updatedContact.email;
    this.selectedContact!.phone = updatedContact.phone;
    this.selectedContact!.initials = this.getInitials(updatedContact.fullName);
  }

  async refreshContacts(): Promise<void> {
    await this.getContacts();
    this.groupContacts();
  }

  async saveContact(): Promise<void> {
    if (this.contactForm.valid && this.selectedContact) {
      const updatedContact = this.contactForm.value;
      this.getUpdatedContact(updatedContact);
      try {
        const response = await this.httpService.makeHttpRequest( this.BASE_URL + `/${this.selectedContact.id}`, 'PUT', this.selectedContact);
        if (response.ok) {
         await this.refreshContacts()
        } else {
          console.error('Failed to update contact. Status:', response.status);
        }
      } catch (error) {
        console.error('Error updating contact:', error);
      }} 
    this.timeOutEditContact();
  }

  getRandomColor(): string {
    const colors = ['#00bcd4', '#ff5722', '#9c27b0', '#3f51b5', '#e91e63', '#4caf50', '#ffeb3b', '#673ab7', '#2196f3', '#ff9800', '#009688', '#795548', '#607d8b'];
    return colors[Math.floor(Math.random() * colors.length)];
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

}
