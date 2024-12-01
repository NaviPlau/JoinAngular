import { Component, inject } from '@angular/core';
import { HeaderComponent } from "../shared/components/header/header.component";
import { SidebarComponent } from "../shared/components/sidebar/sidebar.component";
import { MaterialModule } from '../material/material.module';
import { AuthService } from '../shared/services/auth-service/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-legal-notice',
  imports: [HeaderComponent, SidebarComponent, MaterialModule],
  templateUrl: './legal-notice.component.html',
  styleUrl: './legal-notice.component.scss'
})
export class LegalNoticeComponent {
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
