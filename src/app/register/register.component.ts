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

  get registerError() {
    return this.authService.errorMessage();
  }

  get registerSuccess() {
    return this.authService.registerSuccess();
  }

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
  

  passwordMatchValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    const password = control.get('password')?.value;
    const repeatPassword = control.get('confirmPassword')?.value;

    return password && repeatPassword && password !== repeatPassword
      ? { mismatch: true }
      : null;
  }

  createUserJson() {
    if(this.registerForm.valid){
      const formData = { ...this.registerForm.value };
      delete formData.policyAccepted;
      this.authService.registerdata = formData;
      this.authService.registerUser();
      setTimeout(() => {
        this.authService.errorMessage.set('');
      }, 1000);
    }else{
      console.error('Form is invalid');
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.windowTooSmall = window.innerHeight < 1000;
  }



}
