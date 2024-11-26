import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MaterialModule } from '../material/material.module';
import { LogoLoginComponent } from "../logo-login/logo-login.component";
import { LinksLoginComponent } from "../links-login/links-login.component";
import { RouterLink, RouterLinkActive } from '@angular/router';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
    selector: 'app-login',
    imports: [CommonModule, MaterialModule, LogoLoginComponent, LinksLoginComponent, RouterLink, FormsModule, ReactiveFormsModule],
    templateUrl: './login.component.html',
    styleUrl: './login.component.scss'
})
export class LoginComponent {
    passwordVisible = false;




    loginForm = new FormGroup({
        email: new FormControl('', [
          Validators.required, 
          Validators.email, Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)
        ]),
        password: new FormControl('', [
          Validators.required, 
          Validators.minLength(8) 
        ])
      });


      togglePasswordVisibility() {
        this.passwordVisible = !this.passwordVisible;
      }

      login() {
        console.log(this.loginForm.value);
      }
}
