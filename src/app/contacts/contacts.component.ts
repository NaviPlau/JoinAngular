import { Component, ElementRef, HostListener, inject, OnInit } from '@angular/core';
import { HeaderComponent } from "../shared/components/header/header.component";
import { SidebarComponent } from "../shared/components/sidebar/sidebar.component";
import { MaterialModule } from '../material/material.module';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Contact } from '../shared/interfaces/contact';
import { ContactsService } from '../shared/services/contacts-service/contacts.service';
import { AuthService } from '../shared/services/auth-service/auth.service';
import { Router } from '@angular/router';
import {Subscriber} from 'rxjs';

@Component({
  selector: 'app-contacts',
  imports: [HeaderComponent, ReactiveFormsModule, SidebarComponent, MaterialModule, CommonModule, FormsModule],
  templateUrl: './contacts.component.html',
  styleUrls: ['./contacts.component.scss', './contacts-media.scss']
})
export class ContactsComponent implements OnInit {
  contacts: Contact[] = [];
  contactForm: FormGroup;
  authService = inject(AuthService);
  contactsService = inject(ContactsService);
  isMobile: boolean;
  router: Router = inject(Router);
  

  /**
   * Retrieves the data of the currently logged-in user from the authentication service.
   */
  get loggedInUserData(){
    return this.authService.userData();
  }

  /**
   * @returns true if the user is logged in, false otherwise
   */
  get userIsLoggedIn() {
    return this.authService.userIsLoggedIn();
  }

  constructor(private fb: FormBuilder, private elRef: ElementRef) {
    this.contactForm = this.fb.group({
      fullname: [this.contactsService.selectedContact?.fullname || '', [Validators.required, Validators.pattern(/^\b\p{L}{3,}\b \b\p{L}{3,}\b$/u)]],
      email: [this.contactsService.selectedContact?.email || '', [Validators.required, Validators.email, Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)]],
      phone: [this.contactsService.selectedContact?.phone || '', [Validators.required, Validators.pattern('^[0-9]{10,15}$')]]
    });
    this.contactsService.contactForm = this.contactForm;
    this.isMobile = window.innerWidth <= 800;
    window.addEventListener('resize', () => {
      this.isMobile = window.innerWidth <= 800;
    });
  }

  /**
   * Lifecycle hook that is called after Angular has initialized all data-bound properties of a directive.
   * Checks if the user is logged in and if not, redirects to the login page.
   * Retrieves the user's contacts from the database.
   */
  ngOnInit() {
    if (!this.userIsLoggedIn) {
      this.router.navigate(['']);
      return;
    }
    this.contactsService.token = localStorage.getItem('authToken');
    this.contactsService.getUserContacts(); 
  }


  @HostListener('document:keydown.escape', ['$event'])
  /**
   * Closes the contact form when the 'Escape' key is pressed.
   * @param event The KeyboardEvent that triggered this method.
   */
  handleEscKey(event: KeyboardEvent): void {
    if (this.contactsService.editingContact || this.contactsService.addingContact) {
      this.contactsService.closeForm();
    }
  }

  @HostListener('document:mousedown', ['$event'])
  /**
   * Closes the contact form when a click event occurs outside of it.
   * @param event The MouseEvent that triggered this method.
   */
  handleClickOutside(event: MouseEvent): void {
    const targetElement = event.target as HTMLElement;
    if (!this.elRef.nativeElement.querySelector('.form')?.contains(targetElement)) {
      if (this.contactsService.editingContact || this.contactsService.addingContact) {
        this.contactsService.closeForm();
      }
    }
  }

}
