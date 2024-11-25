import { Component } from '@angular/core';
import { LinksLoginComponent } from "../links-login/links-login.component";
import { LogoLoginComponent } from "../logo-login/logo-login.component";
import { MaterialModule } from '../material/material.module';
import { RouterLink } from '@angular/router';
import { AbstractControl, FormControl, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register',
  imports: [LinksLoginComponent, LogoLoginComponent, MaterialModule, RouterLink, ReactiveFormsModule, FormsModule, CommonModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
  registerForm: FormGroup;

  constructor() {
    this.registerForm = new FormGroup({
      username: new FormControl('', [Validators.required, Validators.pattern(/^\b\p{L}{1,}\b \b\p{L}{1,}\b$/u)]),
      email: new FormControl('', [Validators.required, Validators.email, Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)]),
      password: new FormControl('', [Validators.required, Validators.minLength(8)]),
      repeatPassword: new FormControl('', [Validators.required]),
      acceptPolicy: new FormControl(false, [Validators.requiredTrue])
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    const formGroup = control as FormGroup;
    const password = formGroup.get('password');
    const repeatPassword = formGroup.get('repeatPassword');
    if (password && repeatPassword && password.value !== repeatPassword.value) {
      return { mismatch: true };
    }
    return null;
  };

  onSubmit() {
    if (this.registerForm.valid) {
      console.log(this.registerForm.value);
    } else {
      console.log('Form is invalid');
    }
  }

  extractInitials(fullName: string): string {
    const nameParts = fullName.split(' ');
    const initials = nameParts.map(part => part.charAt(0).toUpperCase()).join('');
    return initials;
  }

  generateRandomColor(): string {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }

  getLuminance(hex: string): number {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;
    const a = [r, g, b].map(function (v) {
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });

    return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2];
  }

  isDarkColor(hex: string): boolean {
    const luminance = this.getLuminance(hex);
    return luminance < 0.5;
  }

  setRandomBackgroundColor(): string {
    let randomColor = this.generateRandomColor();
    while (!this.isDarkColor(randomColor)) {
      randomColor = this.generateRandomColor();
    }
    return randomColor;
  }

  createUserJson() {
    const formData = this.registerForm.value;
    const fullName = formData.username;
    const initials = this.extractInitials(fullName);
    const initialsColor = this.generateRandomColor();

    const userJson = {
      ...formData,
      initials: initials,
      initialsColor: initialsColor,
    };
    console.log(userJson);
    return userJson;
  }


}
