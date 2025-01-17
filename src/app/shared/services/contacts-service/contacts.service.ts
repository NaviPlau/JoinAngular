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


  BASE_URL: string = 'http://vm.paul-ivan.com/join/contacts/';


  /**
   * Fetches the user's contacts from the server and updates the contacts signal.
   * If the authentication token is not available, this method does nothing.
   */
  async getUserContacts(): Promise<void> {
    if (!this.token) { return; }
    this.httpService.get(this.BASE_URL, this.token).subscribe({
      next: (data) => {
        this.contacts.set((data as Contact[]).map((contact) => this.setUserContactData(contact)));
      },
      error: (error) => {
        console.error('Error fetching contacts:', error);
      },
    });
  }

  /**
   * Creates a new object with the required properties for a user contact, based on the given contact.
   * The properties are: initials, fullname, email, phone, initialsColor and id.
   */
  setUserContactData(contact: Contact) {
    return {
      initials: contact.initials,
      fullname: contact.fullname,
      email: contact.email,
      phone: contact.phone,
      initialsColor: contact.initialsColor,
      id: contact.id,
    }
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
    return Object.keys(groups).sort()
      .map(letter => ({
        letter,
        contacts: groups[letter],
      }));
  });


  /**
   * Adds a new contact to the database for the currently logged-in user.
   * If the user is not logged in, this method does nothing.
   * The contact data is retrieved from the contactForm.
   * If the request is successful, fetches the user contacts again.
   * If the request fails, logs the error to the console.
   */
  async addContactInDB(): Promise<void> {
    if (!this.token) { return }
    const contactData = this.contactForm.value;
    this.httpService.post(this.BASE_URL, contactData, this.token).subscribe({
      next: () => {
        this.getUserContacts();
      },
      error: (error) => {
        console.error('Error adding contact:', error);
      },
    });
  }

  /**
   * Saves a new contact by adding it to the database and updating the user's contact list.
   * Sets the `newContactAdded` flag to true to indicate a successful addition.
   * Waits for 2 seconds before resetting `addingContact` and `newContactAdded` flags.
   * This function is asynchronous and awaits the completion of database operations.
   */
  async saveTheNewContact() {
    await this.addContactInDB();
    this.newContactAdded = true;
    await this.getUserContacts();
    setTimeout(() => {
      this.addingContact = false;
      this.newContactAdded = false;
    }, 2000);
  }

  /**
   * Deletes a contact from the database and updates the user's contact list.
   * Closes the contact form after deletion.
   * If the request fails, logs the error to the console.
   * This function is asynchronous and awaits the completion of the database operation.
   */
  async deleteContact(): Promise<void> {
    if (!this.selectedContact) { return }
    if (!this.token) { return; }
    try {
      await this.httpService.delete(`${this.BASE_URL}${this.selectedContact.id}/`, this.token).toPromise();
      const updatedContacts = this.contacts().filter(contact => contact.id !== this.selectedContact?.id);
      this.contacts.set(updatedContacts);
      this.closeForm();
    } catch (error: any) {
      console.error('Error deleting contact:', error.message || error);
    }
  }

  /**
   * Toggles the selected status of the contact at the given index.
   * Iterates over all the contacts and sets the selected property of each contact to false.
   * Sets the selected property of the contact at the given index to true.
   * Updates the contact form with the selected contact's details.
   * @param groupIndex The index of the group in the grouped contacts.
   * @param contactIndex The index of the contact in the group.
   */
  toggleContactSelection(groupIndex: number, contactIndex: number): void {
    const updatedContacts = this.contacts().map(contact => ({ ...contact, selected: false, }));
    const grouped = this.groupedContacts();
    const selectedContact = grouped[groupIndex].contacts[contactIndex];
    const contactToUpdate = updatedContacts.find(contact => contact.id === selectedContact.id);
    if (contactToUpdate) { contactToUpdate.selected = true }
    this.contacts.set(updatedContacts);
    this.contactForm.patchValue({ fullname: selectedContact.fullname, email: selectedContact.email, phone: selectedContact.phone });
    this.selectedContact = selectedContact;
  }

  /**
   * Resets the selected contact and editingContact state after a successful deletion.
   * Called after a successful deletion to update the UI.
   */
  deleteContactUpdateUI() {
    this.selectedContact = null;
    this.editingContact = false;
  }

  /**
   * Closes the contact form with a smooth transition.
   * Initiates a form closing animation by setting `formIsClosing` to true.
   * After a delay, it resets the form state by:
   * - Clearing `editingContact`, `addingContact`, and `selectedContact`.
   * - Resetting the `contactForm`.
   * - Ending the closing animation by setting `formIsClosing` to false.
   */
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

  /**
   * Calculates the initials of the given full name.
   * Splits the full name into words, takes the first letter of each word, and
   * joins them together into a string.
   * If the full name is empty, returns an empty string.
   * @param fullName The full name to calculate the initials from.
   * @returns A string containing the initials of the full name.
   */
  getInitials(fullName: string): string {
    if (!fullName) { return '' };
    const nameParts = fullName.split(' ');
    const initials = nameParts.map(part => part.charAt(0).toUpperCase()).join('').slice(0, 2);
    return initials;
  }

  /**
   * After a successful update of a contact, this function is called to
   * timeout the editing state of the contact form. It sets the
   * `contactEdited` flag to true, and after a delay of 3 seconds, it
   * resets the `editingContact`, `addingContact`, and `contactEdited`
   * flags, and sets `selectedContact` to null.
   */
  timeOutEditContact() {
    this.contactEdited = true;
    setTimeout(() => {
      this.editingContact = false;
      this.addingContact = false;
      this.contactEdited = false;
      this.selectedContact = null;
    }, 3000);
  }

  /**
   * Updates the selected contact's information with the provided updated contact details.
   * Sets the full name, email, phone, and initials of the selected contact based on the updated contact object.
   * @param updatedContact An object containing the updated contact details.
   * The object should have 'fullName', 'email', and 'phone' properties.
   */
  getUpdatedContact(updatedContact: any): void {
    this.selectedContact!.fullname = updatedContact.fullName;
    this.selectedContact!.email = updatedContact.email;
    this.selectedContact!.phone = updatedContact.phone;
    this.selectedContact!.initials = this.getInitials(updatedContact.fullName);
  }

  /**
   * Refreshes the user's contact list by retrieving the latest contacts from the database.
   * This function is asynchronous and waits for the completion of the contact retrieval operation.
   */
  async refreshContacts(): Promise<void> {
    await this.getUserContacts();
  }

  /**
   * Saves the selected contact's information by sending a PUT request to the server.
   * Validates the contact form before making the request.
   * If the request is successful, it refreshes the user's contact list.
   * If the request fails, it logs an error message to the console.
   * It then times out the editing state of the contact form.
   * @returns A promise that resolves when the operation is complete.
   */
  async saveContact(): Promise<void> {
    if (!this.token) { return };
    if (this.contactForm.valid && this.selectedContact) {
      const payload = this.returnPayladSaveContact();
      try {
        await this.httpService.put(`${this.BASE_URL}${this.selectedContact.id}/`, payload, this.token).toPromise();
        await this.refreshContacts();
      } catch (error: any) {
        console.error('Error updating contact:', error.message || error);
      }
    } else {
      console.warn('Form is invalid or no contact is selected.');
    }
    this.timeOutEditContact();
  }


  /**
   * Creates a payload object with the contact's information
   * and its initials color and initials to be sent to the server
   * for the PUT request to update the contact.
   * @returns An object with the contact's information and its initials and initials color.
   */
  returnPayladSaveContact() {
    if (this.selectedContact) {
      return {
        ...this.contactForm.value,
        initialsColor: this.selectedContact.initialsColor,
        initials: this.selectedContact.initials,
      }
    }
  }

  /**
   * Sets the editing contact flag to true if a contact is selected.
   * This function is called when the user clicks on the edit button in the contacts component.
   */
  editContact(): void {
    if (this.selectedContact) {
      this.editingContact = true;
    }
  }

  /**
   * Resets the contact form to its initial state and sets the adding contact flag to true.
   * This function is called when the user clicks on the add contact button in the contacts component.
   */
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
