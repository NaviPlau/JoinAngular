import { Component, inject, OnInit } from '@angular/core';
import { MaterialModule } from '../../../material/material.module';
import { RouterLink, RouterLinkActive, } from '@angular/router';
import { AuthService } from '../../services/auth-service/auth.service';

@Component({
  selector: 'app-sidebar',
  imports: [MaterialModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {
  authService = inject(AuthService);

  /**
   * @returns true if the user is the guest user
   */
  get isGuestUser() {
    return this.authService.isGuestUser();
  }

  /**
   * @returns true if a user is logged in
   */
  get userIsLoggedIn() {
    return this.authService.userIsLoggedIn();
  }

}
