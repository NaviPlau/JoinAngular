import { Component, computed, HostListener, inject, OnInit } from '@angular/core';
import { HeaderComponent } from "../shared/components/header/header.component";
import { SidebarComponent } from "../shared/components/sidebar/sidebar.component";
import { MaterialModule } from '../material/material.module';
import { Task } from '../shared/interfaces/task';
import { TaskComponent } from "./task/task.component";
import { CommonModule } from '@angular/common';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { AddTaskTemplateComponent } from "../shared/components/templates/add-task-template/add-task-template.component";
import { TaskServiceService } from '../shared/services/task-service/task-service.service';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../shared/services/auth-service/auth.service';

type Column = "awaitingFeedback" | "toDo" | "inProgress" | "done";

@Component({
  selector: 'app-board',
  imports: [CommonModule, FormsModule, HeaderComponent, SidebarComponent, MaterialModule, TaskComponent, AddTaskTemplateComponent, DragDropModule],
  templateUrl: './board.component.html',
  styleUrl: './board.component.scss'
})
export class BoardComponent implements OnInit {
  taskService = inject(TaskServiceService)
  authService = inject(AuthService)
  tasks: Task[] = [];
  searchQuery: string = '';
  selectedColumn: Column = 'toDo';
  addingNewTask: boolean = false;
  dragover: { [key: string]: boolean } = {};

  filteredTasks = computed(() =>
    this.taskService.allTasks().filter((task) => this.taskMatchesQuery(task))
  );

  toDoTasks = computed(() =>
    this.taskService
      .allTasks()
      .filter(
        (task) =>
          task.column === 'toDo'
      )
  );

  inProgressTasks = computed(() =>
    this.taskService
      .allTasks()
      .filter(
        (task) =>
          task.column === 'inProgress'
      )
  );

  awaitingFeedbackTasks = computed(() =>
    this.taskService
      .allTasks()
      .filter(
        (task) =>
          task.column === 'awaitingFeedback'
      )
  );

  doneTasks = computed(() =>
    this.taskService
      .allTasks()
      .filter(
        (task) =>
          task.column === 'done'
      )
  );

  /**
 * @returns true if the user is logged in, false otherwise
 */
  get userIsLoggedIn() {
    return this.authService.userIsLoggedIn();
  }

  /**
   * Returns true if the task matches the search query, false otherwise.
   * A task matches the query if the query is empty, or if the task's title or
   * description (if it has one) contains the query, ignoring case.
   * @param task the task to check
   * @returns whether the task matches the search query
   */
  taskMatchesQuery(task: Task) {
    const query = this.searchQuery.trim().toLowerCase();
    return (
      !query ||
      task.title.toLowerCase().includes(query) ||
      (task.description && task.description.toLowerCase().includes(query))
    );
  }

  /**
   * Filters the tasks based on the current search query.
   * If the query is not empty, filters the tasks using the `taskMatchesQuery` method
   * and updates the task list with the filtered tasks. Otherwise, fetches all tasks
   * from the database.
   */
  applyFilter(): void {
    const query = this.searchQuery.trim().toLowerCase();
    if (query) {
      const filtered = this.taskService
        .allTasks()
        .filter((task) => this.taskMatchesQuery(task));
      this.taskService.allTasks.set(filtered);
    } else {
      this.taskService.getTasksFromDB();
    }
  }

  /**
   * Returns the tasks in the given column.
   * @param column the column name
   * @returns the tasks in the given column
   */
  filterTaskByColumn(column: string): Task[] {
    return this.tasks.filter(task => task.column === column);
  }

  /**
   * Opens the overlay to add a new task.
   * @param event the event that triggered this method
   */
  addTask(event: Event): void {
    event.stopPropagation();
    this.addingNewTask = true;
  }

  /**
   * Closes the overlay to add a new task.
   * If the overlay is found, adds a CSS class to animate it out of view.
   * After the animation is finished (500ms), sets `addingNewTask` to false
   * and fetches all tasks from the database to update the component.
   * If the overlay is not found, just sets `addingNewTask` to false.
   */
  closeOverlay(): void {
    const template = document.querySelector('app-add-task-template');
    if (template) {
      template.classList.add('fade-out-to-left');
      setTimeout(() => {
        this.addingNewTask = false;
        this.taskService.getTasksFromDB();
      }, 500);
    } else {
      this.addingNewTask = false;
    }
  }

  @HostListener('document:click', ['$event'])
  /**
   * Closes the overlay to add a new task when clicking outside of it.
   * @param event the event that triggered this method
   */
  onClickOutside(event: Event): void {
    const target = event.target as HTMLElement;
    if (this.addingNewTask && !target.closest('.overlay')) {
      this.closeOverlay();
    }
  }

  @HostListener('document:keydown', ['$event'])
  /**
   * Closes the overlay to add a new task when pressing the Esc key.
   * @param event the event that triggered this method
   */
  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape' || event.key === 'Esc') {
      this.closeOverlay();
    }
  }

  /**
   * Sets the selected column to the given column.
   * @param column the column to be selected
   */
  setColumn(column: Column): void {
    this.selectedColumn = column;
  }

  /**
   * Fetches all tasks from the database to populate the component with the latest task data.
   */
  ngOnInit() {
    this.taskService.getTasksFromDB();
  }

  /**
   * Handles the drag start event for a task.
   * Serializes the task object into a JSON string and sets it as the drag data.
   * @param event - The drag event that triggered this method.
   * @param task - The task to be serialized and set as drag data.
   */
  onDragStart(event: DragEvent, task: Task): void {
    event.dataTransfer?.setData('text/plain', JSON.stringify(task));
  }

  /**
   * Handles the dragover event for a column.
   * Prevents the default dragover event from happening and sets the dragover flag for the column to true.
   * @param event - The dragover event that triggered this method.
   * @param column - The column that is being dragged over.
   */
  allowDrop(event: DragEvent, column: string): void {
    event.preventDefault();
    this.dragover[column] = true;
  }

  /**
   * Handles the drop event for a column.
   * Deserializes the task from the drag data and updates its column to the target column.
   * @param event - The drop event that triggered this method.
   * @param targetColumn - The target column that the task is being dropped into.
   */
  onDrop(event: DragEvent, targetColumn: string): void {
    event.preventDefault();
    this.dragover[targetColumn] = false;
    const taskData = event.dataTransfer?.getData('text/plain');
    if (taskData) {
      const task = JSON.parse(taskData);
      if (!task.id) { return; }
      task.assignedTo = task.assignedTo.map((contact: any) => contact.id);
      task.column = targetColumn;
      this.taskService.updateTask(task)
    }
  }

  /**
   * Handles the drag leave event for a column.
   * Resets the dragover flag for the column to false.
   * @param event - The drag leave event that triggered this method.
   * @param column - The column from which the drag event has left.
   */
  onDragLeave(event: DragEvent, column: string): void {
    this.dragover[column] = false;
  }

}

