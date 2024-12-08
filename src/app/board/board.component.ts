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
    imports: [CommonModule,FormsModule, HeaderComponent, SidebarComponent, MaterialModule, TaskComponent, AddTaskTemplateComponent, DragDropModule],
    templateUrl: './board.component.html',
    styleUrl: './board.component.scss'
})
export class BoardComponent implements OnInit {
  taskService = inject(TaskServiceService)
  authService = inject (AuthService)
  tasks: Task[] = [];
  searchQuery: string = ''; 
  selectedColumn: Column  = 'toDo';
  addingNewTask: boolean = false;
  dragover: { [key: string]: boolean } = {};

  filteredTasks = computed(() =>
    this.taskService.allTasks().filter((task) => this.taskMatchesQuery(task))
  );

  get userIsLoggedIn() {
    return this.authService.userIsLoggedIn();
  } 

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

  taskMatchesQuery(task: Task) {
    const query = this.searchQuery.trim().toLowerCase();
    return (
      !query ||
      task.title.toLowerCase().includes(query) ||
      (task.description && task.description.toLowerCase().includes(query))
    );
  }

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

  filterTaskByColumn(column: string): Task[] {
    return this.tasks.filter(task => task.column === column);
  }

  addTask(event: Event): void {
    event.stopPropagation(); 
    this.addingNewTask = true;
  }

  closeOverlay(): void {
    const template = document.querySelector('app-add-task-template');
    if (template) {
      template.classList.add('fade-out-to-left');
      setTimeout(() => {
        this.addingNewTask = false; 
      }, 500); 
    } else {
      this.addingNewTask = false;
    }
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event): void {
    const target = event.target as HTMLElement;
    if (this.addingNewTask && !target.closest('.overlay')) {
      this.closeOverlay();
    }
  }
  @HostListener('document:keydown', ['$event'])
  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape' || event.key === 'Esc') {
      this.closeOverlay();
    }
  }

  setColumn(column: Column): void {
    this.selectedColumn = column; 
  }

  async ngOnInit(): Promise<void> {
    await this.taskService.getTasksFromDB();
  }

  onDragStart(event: DragEvent, task: Task): void {
    event.dataTransfer?.setData('text/plain', JSON.stringify(task));
  }
  
  allowDrop(event: DragEvent, column: string): void {
    event.preventDefault();
    this.dragover[column] = true;
  }
  
  onDrop(event: DragEvent, targetColumn: string): void {
    event.preventDefault();
    this.dragover[targetColumn] = false;
    const taskData = event.dataTransfer?.getData('text/plain');
    if (taskData) {
      const task = JSON.parse(taskData);
      if (!task.id) {
        console.error('Task ID is undefined!');
        return;
      }
      task.assignedTo = task.assignedTo.map((contact: any) => contact.id);
      task.column = targetColumn;
      this.taskService.updateTask(task).then(() => {
      }).catch((error) => {
        console.error('Failed to update task:', error);
      });
    }
  }

  onDragLeave(event: DragEvent, column: string): void {
    this.dragover[column] = false; 
  }

}

