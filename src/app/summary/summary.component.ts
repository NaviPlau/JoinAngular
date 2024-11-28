import { Component, computed, inject } from '@angular/core';
import { SidebarComponent } from "../shared/components/sidebar/sidebar.component";
import { HeaderComponent } from "../shared/components/header/header.component";
import { MaterialModule } from '../material/material.module';
import { TaskServiceService } from '../shared/services/task-service/task-service.service';

@Component({
    selector: 'app-summary',
    imports: [SidebarComponent, HeaderComponent, MaterialModule],
    templateUrl: './summary.component.html',
    styleUrl: './summary.component.scss'
})
export class SummaryComponent {
    taskService = inject(TaskServiceService)
    toDoTasksLength = computed(() => this.taskService.allTasks().filter((task) => task.column === 'toDo').length)
    inProgressTasksLength = computed(() => this.taskService.allTasks().filter((task) => task.column === 'inProgress').length)
    awaitingFeedbackTasksLength = computed(() => this.taskService.allTasks().filter((task) => task.column === 'awaitingFeedback').length)
    doneTasksLength = computed(() => this.taskService.allTasks().filter((task) => task.column === 'done').length)
    
    urgentTasksLength = computed(() => this.taskService.allTasks().filter((task) => task.priority === 'urgent').length)
    upcomingDeadline = computed(() => {
        const tasksWithDueDates = this.taskService.allTasks().filter((task) => task.dueDate);
        const sortedTasks = tasksWithDueDates.sort(
          (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
        );
        return sortedTasks.length > 0 ? sortedTasks[0].dueDate : null;
      });

    allTasksInBoard = computed(() => this.taskService.allTasks().length);
   
    async ngOnInit(): Promise<void> {
        await this.taskService.getTasksFromDB();
    }


    setResponsebasedOnDaytime() {
        const date = new Date();
        const hours = date.getHours();
        if (hours >= 6 && hours < 12) {
            return 'Good morning';
        } else if (hours >= 12 && hours < 18) {
            return 'Good afternoon';
        } else {
            return 'Good evening';
        }
    }
}

