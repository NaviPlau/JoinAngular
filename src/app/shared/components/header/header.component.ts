import { AfterViewInit, Component, ElementRef, HostListener, inject, OnDestroy, OnInit, Renderer2, ViewChild } from '@angular/core';
import { MaterialModule } from '../../../material/material.module';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth-service/auth.service';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TaskServiceService } from '../../services/task-service/task-service.service';

@Component({
  selector: 'app-header',
  imports: [MaterialModule, CommonModule, RouterLink, FormsModule, ReactiveFormsModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements AfterViewInit, OnDestroy {
  showLinks = false;
  authService = inject(AuthService);
  taskService = inject(TaskServiceService);
  profileForm!: FormGroup;
  profileOpen = false
  profileUpdated = false

  @ViewChild('initials') initials!: ElementRef;
  @ViewChild('links') links!: ElementRef;

  clickListener?: () => void;


  /**
   * @returns true if the user is a guest user, false otherwise.
   */
  get guestUser() {
    return this.authService.isGuestUser();
  }

  /**
   * @constructor
   * @param renderer - an instance of Renderer2 which is used to add an event listener to the document.
   * @param elementRef - an instance of ElementRef which represents the host element of the component.
   * 
   * If the user is logged in, it will create a form group with controls for the user's full name, email and phone.
   * The form controls are validated using the required, pattern and email validators.
   */
  constructor(private renderer: Renderer2, private elementRef: ElementRef) {
    if (this.user) {
      this.profileForm = new FormGroup({
        fullname: new FormControl(this.user.fullname, [
          Validators.required,
          Validators.pattern(/^\b\p{L}{3,}\b \b\p{L}{3,}\b$/u)
        ]),
        email: new FormControl(this.user.email, [
          Validators.required,
          Validators.email,
          Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)
        ]),
        phone: new FormControl(this.user.phone, [
          Validators.required,
          Validators.pattern('^[0-9]{10,15}$')
        ])
      });
    }
  }

  /**
   * Toggles the visibility of the profile section.
   * When this function is called, it switches the state of the profile section
   * between open and closed and ensures that the links section is hidden.
   */
  toggleProfile() {
    this.profileOpen = !this.profileOpen
    this.showLinks = false
  }

  /**
   * Retrieves the data of the currently logged-in user from the authentication service.
   */
  get user() {
    return this.authService.userData();
  }

  /**
   * Checks if the user is logged in as a guest user.
   * This is important as some features are not available to guest users.
   */
  get isGuestUser() {
    return this.authService.isGuestUser();
  }

  /**
   * @returns true if the user is logged in, false otherwise.
   */
  get userIsLoggedIn() {
    return this.authService.userIsLoggedIn();
  }

  /**
   * Listens for any click event on the document and checks if the event target element
   * is a child of the initials or links element. If not, it sets showLinks to false.
   * This is used to automatically hide the links when the user clicks outside of the
   * profile section.
   */
  ngAfterViewInit() {
    this.clickListener = this.renderer.listen('document', 'click', (event: Event) => {
      if (this.initials?.nativeElement && this.links?.nativeElement) {
        if (!this.initials.nativeElement.contains(event.target) &&
          !this.links.nativeElement.contains(event.target)) {
          this.showLinks = false;
        }
      }
    });
  }

  /**
   * Toggles the visibility of the links section in the profile section.
   * This is used when the user clicks on the user initials in the header.
   */
  toggleLinks() {
    this.showLinks = !this.showLinks;
  }

  /**
   * Lifecycle hook that is called when a directive, pipe, or service is destroyed.
   * Removes the click event listener from the document to prevent memory leaks.
   */
  ngOnDestroy() {
    if (this.clickListener) {
      this.clickListener();
    }
  }

  /**
   * Updates the user data in the database with the new data from the profile form.
   * Retrieves the user profiles and tasks from the database after the update.
   * Shows a success message for 2 seconds after the update, then closes the profile section.
   */
  saveChangedUserData() {
    let profileData = {
      ...this.profileForm.value,
      selected: this.user.selected
    };
    this.authService.updateUserData(profileData, this.user.id);
    this.taskService.getUsersProfileFromDb()
    this.taskService.getTasksFromDB();
    this.profileUpdated = true
    setTimeout(() => {
      this.profileOpen = false
      this.profileUpdated = false
    }, 2000);
  }
  
  @HostListener('document:click', ['$event'])
  /**
   * Handles clicks outside of the profile form when it is open.
   * If the profile form is open and the user clicks outside of the form, it will close the form.
   * @param event The click event.
   */
  handleOutsideClick(event: Event) {
    if (!this.profileOpen) {
      return;
    }
    const formElement = this.elementRef.nativeElement.querySelector('form');
    if (formElement && !formElement.contains(event.target)) {
      this.profileOpen = false;
    }
  }

}

