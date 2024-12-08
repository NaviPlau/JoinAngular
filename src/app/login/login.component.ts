import { CommonModule } from '@angular/common';
import { Component, HostListener, inject } from '@angular/core';
import { MaterialModule } from '../material/material.module';
import { LogoLoginComponent } from "../logo-login/logo-login.component";
import { LinksLoginComponent } from "../links-login/links-login.component";
import { RouterLink, RouterLinkActive } from '@angular/router';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../shared/services/auth-service/auth.service';

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
  showLogo = true;

  get errrormessage() {
    return this.authService.errorMessage();
  }


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

  constructor() {
    this.loginForm.valueChanges.subscribe(() => {
      this.authService.errorMessage.set('');
    });
  }


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
  


  togglePasswordVisibility() {
    this.passwordVisible = !this.passwordVisible;
  }

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


  guestLogin() {
    this.authService.guestLogin();
  }

  @HostListener('window:resize', [])
  onResize() {
    this.checkDeviceHeight();
  }

  checkDeviceHeight() {
    this.isHeightTooSmall = window.innerHeight < 600;
  }


}
