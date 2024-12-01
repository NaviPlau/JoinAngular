import { Component, inject } from '@angular/core';
import { HeaderComponent } from "../shared/components/header/header.component";
import { SidebarComponent } from "../shared/components/sidebar/sidebar.component";
import { AuthService } from '../shared/services/auth-service/auth.service';
import { Router } from '@angular/router';
import { MaterialModule } from '../material/material.module';

@Component({
  selector: 'app-privacy-policy',
  imports: [HeaderComponent, SidebarComponent, MaterialModule],
  templateUrl: './privacy-policy.component.html',
  styleUrl: './privacy-policy.component.scss'
})
export class PrivacyPolicyComponent {
  authService = inject(AuthService);
  router = inject(Router);
  goBack() {
    if(!this.authService.userIsLoggedIn() && !this.authService.isGuestUser()){ 
      this.router.navigate(['']);
    }
    else if (window.history.length > 10) {
      this.router.navigate(['/summary']);
    }
    else {
      window.history.back();
    }
  }
}
