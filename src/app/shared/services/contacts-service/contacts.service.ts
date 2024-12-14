import { computed, inject, Injectable, signal } from '@angular/core';
import { Contact } from '../../interfaces/contact';
import { Form, FormGroup } from '@angular/forms';
import { HttpRequestService } from '../http/http-request.service';
import { AuthService } from '../auth-service/auth.service';



@Injectable({
  providedIn: 'root'
})
export class ContactsService {
  contacts = signal<Contact[]>([])
  contactForm!: FormGroup;
  httpService = inject(HttpRequestService);
  authService = inject(AuthService);
  editingContact: boolean = false;
  addingContact: boolean = false;
  newContactAdded: boolean = false;
  contactEdited: boolean = false;
  formIsClosing: boolean = false;
  selectedContact: Contact | null = null;
  token = localStorage.getItem('authToken');
  isMobile: boolean = window.innerWidth < 800 ? true : false;
  

  BASE_URL: string = 'http://127.0.0.1:8000/join/contacts/';
  async getContacts() {
    
    this.getUserContacts()
  }

  async getUserContacts(): Promise<void> {
    if (!this.token) {
      console.error('Token is null or undefined. Unable to fetch contacts.');
      return;
    }
    this.httpService.get(this.BASE_URL, this.token).subscribe({
      next: (data) => {
        this.contacts.set((data as Contact[]).map(contact => ({
          initials: contact.initials,
          fullname: contact.fullname,
          email: contact.email,
          phone: contact.phone,
          initialsColor: contact.initialsColor,
          id: contact.id,
        })));
        console.log('Contacts fetched successfully:', this.contacts());
      },
      error: (error) => {
        console.error('Error fetching contacts:', error);
      },
    });
  }

  groupedContacts = computed(() => {
    const groups: { [key: string]: Contact[] } = {};
    const currentContacts = this.contacts();
    currentContacts.sort((a, b) => a.fullname.localeCompare(b.fullname));

    currentContacts.forEach(contact => {
      const firstLetter = contact.fullname[0].toUpperCase();
      if (!groups[firstLetter]) {
        groups[firstLetter] = [];
      }
      groups[firstLetter].push(contact);
    });

    return Object.keys(groups)
      .sort()
      .map(letter => ({
        letter,
        contacts: groups[letter],
      }));
  });
 

  async addContactInDB(): Promise<void> {
    if (!this.token) {
      console.error('Token is null or undefined. Unable to add contact.');
      return; 
    }
    const contactData = this.contactForm.value;
    console.log('Contact form data:', contactData)
    this.httpService.post('http://127.0.0.1:8000/join/contacts/', contactData, this.token).subscribe({
      next: (response) => {
        console.log('Contact added successfully:', response);
        this.getUserContacts();
      },
      error: (error) => {
        console.error('Error adding contact:', error);
      },
    });
  }

  async saveTheNewContact() {
    await this.addContactInDB();
    this.newContactAdded = true;
    await this.getContacts();
    setTimeout(() => {
      this.addingContact = false;
      this.newContactAdded = false;
    }, 2000);
  }

  async deleteContact(): Promise<void> {
    if (!this.selectedContact) {
      console.warn('No contact selected for deletion.');
      return;
    }
  
    if (!this.token) {
      console.error('Token is missing. Unable to delete contact.');
      return;
    }
  
    try {
      await this.httpService.delete(
        `${this.BASE_URL}${this.selectedContact.id}/`,
        this.token
      ).toPromise();
      const updatedContacts = this.contacts()
        .filter(contact => contact.id !== this.selectedContact?.id);
      this.contacts.set(updatedContacts);
      this.closeForm();
      console.log('Contact deleted successfully.');
    } catch (error: any) {
      console.error('Error deleting contact:', error.message || error);
    }
  }

  

  toggleContactSelection(groupIndex: number, contactIndex: number): void {
    const updatedContacts = this.contacts().map(contact => ({
      ...contact,
      selected: false, 
    }));
    const grouped = this.groupedContacts();
    const selectedContact = grouped[groupIndex].contacts[contactIndex];
    const contactToUpdate = updatedContacts.find(
      contact => contact.id === selectedContact.id
    );
    if (contactToUpdate) {
      contactToUpdate.selected = true; 
    }
    this.contacts.set(updatedContacts);
    this.contactForm.patchValue({
      fullname: selectedContact.fullname,
      email: selectedContact.email,
      phone: selectedContact.phone,
    });
    this.selectedContact = selectedContact;
  }
  

  deleteContactUpdateUI() {
    this.selectedContact = null;
    this.editingContact = false;
  }



  closeForm(): void {
    this.formIsClosing = true;
    setTimeout(async () => {
      this.editingContact = false;
      this.addingContact = false;
      this.selectedContact = null;
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
      this.selectedContact = null;
    }, 3000);
  }

  getUpdatedContact(updatedContact: any): void {
    this.selectedContact!.fullname = updatedContact.fullName;
    this.selectedContact!.email = updatedContact.email;
    this.selectedContact!.phone = updatedContact.phone;
    this.selectedContact!.initials = this.getInitials(updatedContact.fullName);
  }

  async refreshContacts(): Promise<void> {
    await this.getContacts();
  }

  async saveContact(): Promise<void> {
    if (!this.token) {
      console.error('Token is missing. Unable to update contact.');
      return;
    }
    if (this.contactForm.valid && this.selectedContact) {
      const payload = this.returnPayladSaveContact();
      try {
        await this.httpService.put(`${this.BASE_URL}${this.selectedContact.id}/`, payload, this.token
        ).toPromise();
        await this.refreshContacts();
      } catch (error: any) {
        console.error('Error updating contact:', error.message || error);
      }
    } else {
      console.warn('Form is invalid or no contact is selected.');
    }
  
    this.timeOutEditContact();
  }


  returnPayladSaveContact(){
    if(this.selectedContact){
      return {
        ...this.contactForm.value,
        initialsColor: this.selectedContact.initialsColor,
        initials: this.selectedContact.initials,
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
}
