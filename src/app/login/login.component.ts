import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MaterialModule } from '../material/material.module';
import { LogoLoginComponent } from "../logo-login/logo-login.component";
import { LinksLoginComponent } from "../links-login/links-login.component";
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, MaterialModule, LogoLoginComponent, LinksLoginComponent, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {

}
