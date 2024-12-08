import { Component, inject } from '@angular/core';
import { HeaderComponent } from "../shared/components/header/header.component";
import { SidebarComponent } from "../shared/components/sidebar/sidebar.component";
import { AddTaskTemplateComponent } from "../shared/components/templates/add-task-template/add-task-template.component";
import { AuthService } from '../shared/services/auth-service/auth.service';
import { Router } from '@angular/router';

@Component({
    selector: 'app-addtask',
    imports: [HeaderComponent, SidebarComponent, AddTaskTemplateComponent],
    templateUrl: './addtask.component.html',
    styleUrl: './addtask.component.scss'
})
export class AddtaskComponent {
    authService = inject(AuthService);
    router: Router = inject(Router)
    get userLoggedIn() {
        return this.authService.userIsLoggedIn();
    }

    ngOnInit(){
        if(!this.userLoggedIn){
            this.router.navigate(['']);
        }
    }
}
