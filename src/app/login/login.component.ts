import { CommonModule } from '@angular/common';
import { Component, HostListener, inject } from '@angular/core';
import { MaterialModule } from '../material/material.module';
import { LogoLoginComponent } from "../logo-login/logo-login.component";
import { LinksLoginComponent } from "../links-login/links-login.component";
import { RouterLink, RouterLinkActive } from '@angular/router';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../shared/services/auth-service/auth.service';
import { HttpRequestService } from '../shared/services/http/http-request.service';

@Component({
  selector: 'app-login',
  imports: [CommonModule, MaterialModule, LogoLoginComponent, LinksLoginComponent, RouterLink, FormsModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  passwordVisible = false;
  isHeightTooSmall: boolean = false;
  authService = inject(AuthService);
  httpService = inject(HttpRequestService);
  showLogo = true;
  loginForm = new FormGroup({
    email: new FormControl('', [
      Validators.required,
      Validators.email, Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)
    ]),
    password: new FormControl('', [
      Validators.required,
      Validators.minLength(8)
    ]),
  });

  /**
   * Retrieves the error message from the authentication service.
   * This message is typically displayed when login errors occur.
   */
  get errrormessage() {
    return this.authService.errorMessage();
  }

  /**
   * Lifecycle hook that is called after Angular has initialized all data-bound properties of a directive.
   * Resets the error message of the authentication service when the user starts typing in the login form.
   */
  constructor() {
    this.loginForm.valueChanges.subscribe(() => {
      this.authService.errorMessage.set('');
    });
  }


  /**
   * Lifecycle hook that is called after Angular has initialized all data-bound properties of a directive.
   * Initializes the state of the authentication service, checks if the device is a mobile device (based on its height)
   * and shows the logo during the first visit of the user.
   */
  ngOnInit(){
    this.authService.initializeState();
    this.checkDeviceHeight();
    let hasVisited = sessionStorage.getItem('hasVisited');
    if (hasVisited) {
      this.showLogo = false;
    } else {
      sessionStorage.setItem('hasVisited', 'true');
      setTimeout(() => {
        this.showLogo = false;
      }, 1400);
    }
  }
  


  /**
   * Toggles the visibility of the password input field.
   * This function is used to let the user see the password while typing it.
   */
  togglePasswordVisibility() {
    this.passwordVisible = !this.passwordVisible;
  }

  /**
   * Submits the login form and logs the user in if the form is valid.
   * If the form is invalid, an error message is printed to the console.
   */
  async login() {
    if (this.loginForm.valid) {
      const email = this.loginForm.get('email')?.value;
      const password = this.loginForm.get('password')?.value;
      this.authService.loginData = { email, password };
      await this.authService.loginUser();
    } else {
      console.error('Form is invalid');
    }
  }


  /**
   * Logs in the user as a guest.
   * This function is used in the login form to let the user log in as a guest.
   */
  guestLogin() {
    this.authService.guestLoginUser();
  }

  @HostListener('window:resize', [])
  /**
   * Checks if the window height is less than 600px after a resize event
   * and sets the isHeightTooSmall flag accordingly.
   */
  onResize() {
    this.checkDeviceHeight();
  }

  /**
   * Checks if the window height is less than 600px and sets the isHeightTooSmall flag accordingly.
   * This function is used to show a warning if the window height is too small to display the login form properly.
   */
  checkDeviceHeight() {
    this.isHeightTooSmall = window.innerHeight < 600;
  }


}
