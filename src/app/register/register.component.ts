import { Component, HostListener, inject } from '@angular/core';
import { LinksLoginComponent } from "../links-login/links-login.component";
import { LogoLoginComponent } from "../logo-login/logo-login.component";
import { MaterialModule } from '../material/material.module';
import { RouterLink } from '@angular/router';
import { AbstractControl, FormControl, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RegisterData } from '../shared/interfaces/register-data';
import { AuthService } from '../shared/services/auth-service/auth.service';

@Component({
  selector: 'app-register',
  imports: [LinksLoginComponent, LogoLoginComponent, MaterialModule, RouterLink, ReactiveFormsModule, FormsModule, CommonModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
  registerForm: FormGroup;
  authService  = inject(AuthService);
  userRegistered: boolean = false;
  windowTooSmall: boolean = window.innerHeight < 1000;

  /**
   * The error message when a user registration fails, if any.
   * An empty string if the user registration has not yet been attempted,
   * or if the user registration has succeeded.
   */
  get registerError() {
    return this.authService.errorMessage();
  }

  /**
   * A boolean indicating whether the user registration has succeeded.
   * A boolean indicating whether the user registration has succeeded.
   * An empty string if the user registration has not yet been attempted,
   * or if the user registration has failed.
   */
  get registerSuccess() {
    return this.authService.registerSuccess();
  }

  /**
   * Initializes the component.
   * 
   * This creates a new form with the following controls:
   * 
   * * username: a required string with a pattern that matches 2 or more words separated by spaces.
   * * email: a required string with a pattern that matches a valid email address.
   * * password: a required string with a minimum length of 8 characters.
   * * confirmPassword: a required string with a minimum length of 8 characters.
   * * policyAccepted: a boolean that is required to be true.
   * 
   * The form also has a custom validator that checks if the password and confirmPassword match.
   * 
   * It also sets up a subscription to the form's valueChanges observable to clear the error message
   * whenever the user types something in the form.
   */
  constructor() {
    this.registerForm = new FormGroup({
      username: new FormControl('', [Validators.required, Validators.pattern(/^\b\p{L}{1,}\b \b\p{L}{1,}\b$/u)]),
      email: new FormControl('', [Validators.required, Validators.email, Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)]),
      password: new FormControl('', [Validators.required, Validators.minLength(8),]),
      confirmPassword: new FormControl('', [Validators.required, Validators.minLength(8),]),
      policyAccepted: new FormControl(false, [Validators.requiredTrue])
    }, { validators: this.passwordMatchValidator });

    this.registerForm.valueChanges.subscribe(() => {
        this.authService.errorMessage.set(''); 
    });
  }
  
  /**
   * A custom validator that checks if the password and confirmPassword match.
   */
  passwordMatchValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    const password = control.get('password')?.value;
    const repeatPassword = control.get('confirmPassword')?.value;
    return password && repeatPassword && password !== repeatPassword
      ? { mismatch: true }
      : null;
  }

  /**
   * Validates the registration form, and if valid, extracts the form data, 
   * removes the policy acceptance field, and assigns the data to the 
   * authentication service for registration. Initiates the user registration 
   * process and clears any error message after a delay. Logs an error if 
   * the form is invalid.
   */
  createUserJson() {
    if(this.registerForm.valid){
      const formData = { ...this.registerForm.value };
      delete formData.policyAccepted;
      this.authService.registerdata = formData;
      this.authService.registerUser();
      setTimeout(() => {
        this.authService.errorMessage.set('');
      }, 3000);
    }else{
      console.error('Form is invalid');
    }
  }

  @HostListener('window:resize', ['$event'])
  /**
   * Checks if the window height is less than 1000px after a resize event
   * and sets the windowTooSmall flag accordingly.
   * This function is used to show a warning if the window height is too small to display the login form properly.
   */
  onResize() {
    this.windowTooSmall = window.innerHeight < 1000;
  }
}
