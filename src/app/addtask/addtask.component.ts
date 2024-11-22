import { Component } from '@angular/core';
import { HeaderComponent } from "../shared/components/header/header.component";
import { SidebarComponent } from "../shared/components/sidebar/sidebar.component";
import { AddTaskTemplateComponent } from "../shared/components/templates/add-task-template/add-task-template.component";
import { Task } from '../shared/interfaces/task';

@Component({
    selector: 'app-addtask',
    imports: [HeaderComponent, SidebarComponent, AddTaskTemplateComponent],
    templateUrl: './addtask.component.html',
    styleUrl: './addtask.component.scss'
})
export class AddtaskComponent {
  
}
