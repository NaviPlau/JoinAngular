import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from './shared/services/auth-service/auth.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'AngularJoin';
  authService = inject(AuthService);

  /**
   * Lifecycle hook that is called after Angular has initialized all data-bound properties of a directive.
   * Initializes the state of the authentication service.
   */
  ngOnInit(): void {
    this.authService.initializeState();
  }
}
