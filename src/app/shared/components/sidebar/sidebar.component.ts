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
export class SidebarComponent  {
    authService = inject(AuthService);

    get isGuestUser() {
        return this.authService.isGuestUser();
      }
    
      get userIsLoggedIn() {
        return this.authService.userIsLoggedIn();
      }
    
}
