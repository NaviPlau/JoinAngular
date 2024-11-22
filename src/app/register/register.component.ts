import { Component } from '@angular/core';
import { LinksLoginComponent } from "../links-login/links-login.component";
import { LogoLoginComponent } from "../logo-login/logo-login.component";
import { MaterialModule } from '../material/material.module';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-register',
    imports: [LinksLoginComponent, LogoLoginComponent, MaterialModule, RouterLink],
    templateUrl: './register.component.html',
    styleUrl: './register.component.scss'
})
export class RegisterComponent {

}
