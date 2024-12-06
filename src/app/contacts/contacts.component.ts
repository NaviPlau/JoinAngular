import { Component, ElementRef, HostListener, inject, OnInit } from '@angular/core';
import { HeaderComponent } from "../shared/components/header/header.component";
import { SidebarComponent } from "../shared/components/sidebar/sidebar.component";
import { MaterialModule } from '../material/material.module';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Contact } from '../shared/interfaces/contact';
import { ContactsService } from '../shared/services/contacts-service/contacts.service';

@Component({
  selector: 'app-contacts',
  imports: [HeaderComponent, ReactiveFormsModule, SidebarComponent, MaterialModule, CommonModule, FormsModule],
  templateUrl: './contacts.component.html',
  styleUrls: ['./contacts.component.scss', './contacts-media.scss']
})
export class ContactsComponent implements OnInit {
  contacts: Contact[] = [];
  contactForm: FormGroup;
  contactsService = inject(ContactsService);
  isMobile: boolean;
  
  constructor(private fb: FormBuilder, private elRef: ElementRef) {
    this.contactForm = this.fb.group({
      fullName: [this.contactsService.selectedContact?.fullName || '', [Validators.required, Validators.pattern(/^\b\p{L}{3,}\b \b\p{L}{3,}\b$/u)]],
      email: [this.contactsService.selectedContact?.email || '', [Validators.required, Validators.email, Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)]],
      phone: [this.contactsService.selectedContact?.phone || '', [Validators.required, Validators.pattern('^[0-9]{10,15}$')]]
    });
    this.contactsService.contactForm = this.contactForm;
    this.contacts = this.contactsService.contacts;
    this.isMobile = window.innerWidth <= 800;
    window.addEventListener('resize', () => {
      this.isMobile = window.innerWidth <= 800;
    });
  }

  async ngOnInit() {
    await this.contactsService.getContacts();
    this.contactsService.groupContacts();
    await this.contactsService.deselectAllContacts();
  }

  @HostListener('document:keydown.escape', ['$event'])
  handleEscKey(event: KeyboardEvent): void {
    if (this.contactsService.editingContact || this.contactsService.addingContact) {
      this.contactsService.closeForm();
    }
  }

  @HostListener('document:mousedown', ['$event'])
  handleClickOutside(event: MouseEvent): void {
    const targetElement = event.target as HTMLElement;
    if (!this.elRef.nativeElement.querySelector('.form')?.contains(targetElement)) {
      if (this.contactsService.editingContact || this.contactsService.addingContact) {
        this.contactsService.closeForm();
      }
    }
  }

}
