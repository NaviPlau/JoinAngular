import { Component } from '@angular/core';
import { HeaderComponent } from "../shared/components/header/header.component";
import { SidebarComponent } from "../shared/components/sidebar/sidebar.component";
import { AddTaskTemplateComponent } from "../shared/components/templates/add-task-template/add-task-template.component";

@Component({
  selector: 'app-addtask',
  standalone: true,
  imports: [HeaderComponent, SidebarComponent, AddTaskTemplateComponent],
  templateUrl: './addtask.component.html',
  styleUrl: './addtask.component.scss'
})
export class AddtaskComponent {

}
