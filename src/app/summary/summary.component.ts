import { Component, computed, inject } from '@angular/core';
import { SidebarComponent } from "../shared/components/sidebar/sidebar.component";
import { HeaderComponent } from "../shared/components/header/header.component";
import { MaterialModule } from '../material/material.module';
import { TaskServiceService } from '../shared/services/task-service/task-service.service';
import { AuthService } from '../shared/services/auth-service/auth.service';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-summary',
  imports: [SidebarComponent, HeaderComponent, MaterialModule, RouterLink],
  templateUrl: './summary.component.html',
  styleUrl: './summary.component.scss'
})
export class SummaryComponent {
  taskService = inject(TaskServiceService)
  authService = inject(AuthService)
  router: Router = inject(Router);
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



  /**
   * Initializes the component and checks if the user is logged in.
   * If the user is not logged in, it redirects to the home page.
   * It also fetches the tasks from the database.
   */
  async ngOnInit(): Promise<void> {
    await this.taskService.getTasksFromDB();
    if (!this.authService.isGuestUser() && !this.authService.userIsLoggedIn()) {
      this.router.navigate(['/']);
    }
  }

  /**
   * @returns {boolean} - Returns true if the user is logged in as a guest user, false otherwise.
   */
  get isGuestUser() {
    return this.authService.isGuestUser();
  }

  /**
   * @returns {boolean} - Returns true if the user is logged in, false otherwise.
   */
  get userIsLoggedIn() {
    return this.authService.userIsLoggedIn();
  }

  /**
   * Returns the full name of the currently logged-in user, or an empty string if no user is logged in.
   */
  get userName() {
    return this.authService.userData().fullname;
  }


  /**
   * Determines the appropriate greeting based on the current time of day.
   * @returns {string} - Returns 'Good morning' if the time is between 6 AM and 12 PM,
   * 'Good afternoon' if the time is between 12 PM and 6 PM, and 'Good evening' otherwise.
   */
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

