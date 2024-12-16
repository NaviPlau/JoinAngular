import { Component, inject } from '@angular/core';
import { HeaderComponent } from "../shared/components/header/header.component";
import { SidebarComponent } from "../shared/components/sidebar/sidebar.component";
import { AddTaskTemplateComponent } from "../shared/components/templates/add-task-template/add-task-template.component";
import { AuthService } from '../shared/services/auth-service/auth.service';
import { Router } from '@angular/router';
import { TaskServiceService } from '../shared/services/task-service/task-service.service';

@Component({
    selector: 'app-addtask',
    imports: [HeaderComponent, SidebarComponent, AddTaskTemplateComponent],
    templateUrl: './addtask.component.html',
    styleUrl: './addtask.component.scss'
})
export class AddtaskComponent {
    authService = inject(AuthService);
    taskService = inject(TaskServiceService)
    router: Router = inject(Router)


    /**
     * @returns true if the user is logged in, false otherwise
     */
    get userLoggedIn() {
        return this.authService.userIsLoggedIn();
    }

    /**
     * Initializes the component and checks if the user is logged in.
     * If the user is not logged in, it redirects to the home page.
     */
    ngOnInit() {
        if (!this.userLoggedIn) {
            this.router.navigate(['']);
        }
        this.taskService.getUsersProfileFromDb();
    }
}
